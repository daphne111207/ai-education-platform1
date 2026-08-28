"""教师端路由：课程/章节管理、文件上传、作业布置与批改、公告、班级学情。

所有接口均要求 teacher 或 admin 角色（见 require_role）。
"""
import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from core.database import get_db, UPLOAD_DIR
from core.security import require_role
from models import (
    User, Course, Section, Homework, Submission, SignIn, Discussion,
    Announcement,
)

router = APIRouter(prefix="/api/teacher", tags=["teacher"])


# ---------- 请求体 ----------
class CourseIn(BaseModel):
    title: str
    teacher: str = ""
    cover: str = "📘"
    category: str = "通识课"
    desc: str = ""


class CourseEditIn(BaseModel):
    title: str = None
    teacher: str = None
    cover: str = None
    category: str = None
    desc: str = None


class SectionIn(BaseModel):
    title: str
    stype: str = "video"   # video / doc / quiz
    content: str = ""


class HomeworkIn(BaseModel):
    title: str
    desc: str = ""
    due: str = ""


class AnnounceIn(BaseModel):
    title: str
    content: str
    course_id: int = None


class GradeIn(BaseModel):
    score: str


# ---------- 工具 ----------
def _owned_course(db, cid, user):
    c = db.query(Course).filter(Course.id == cid).first()
    if not c:
        raise HTTPException(404, "课程不存在")
    if user.role != "admin" and c.teacher_id != user.id:
        raise HTTPException(403, "你不是该课程的负责教师")
    return c


def _course_out(c: Course):
    return {
        "id": c.id, "title": c.title, "teacher": c.teacher,
        "cover": c.cover, "category": c.category, "desc": c.desc,
        "teacher_id": c.teacher_id,
    }


# ---------- 课程 CRUD ----------
@router.get("/courses")
def list_my_courses(db: Session = Depends(get_db),
                    user: User = Depends(require_role("teacher", "admin"))):
    q = db.query(Course)
    if user.role != "admin":
        q = q.filter(Course.teacher_id == user.id)
    courses = q.all()
    return [_course_out(c) for c in courses]


@router.post("/courses")
def create_course(body: CourseIn, db: Session = Depends(get_db),
                 user: User = Depends(require_role("teacher", "admin"))):
    c = Course(
        title=body.title, teacher=body.teacher or user.name,
        cover=body.cover, category=body.category, desc=body.desc,
        teacher_id=user.id,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _course_out(c)


@router.put("/courses/{cid}")
def edit_course(cid: int, body: CourseEditIn, db: Session = Depends(get_db),
               user: User = Depends(require_role("teacher", "admin"))):
    c = _owned_course(db, cid, user)
    for f in ("title", "teacher", "cover", "category", "desc"):
        v = getattr(body, f)
        if v is not None:
            setattr(c, f, v)
    db.commit()
    return _course_out(c)


@router.delete("/courses/{cid}")
def delete_course(cid: int, db: Session = Depends(get_db),
                 user: User = Depends(require_role("teacher", "admin"))):
    c = _owned_course(db, cid, user)
    db.query(Section).filter(Section.course_id == cid).delete()
    db.query(Homework).filter(Homework.course_id == cid).delete()
    db.query(Discussion).filter(Discussion.course_id == cid).delete()
    db.query(Announcement).filter(Announcement.course_id == cid).delete()
    db.delete(c)
    db.commit()
    return {"ok": True}


# ---------- 章节 CRUD ----------
@router.post("/courses/{cid}/sections")
def add_section(cid: int, body: SectionIn, db: Session = Depends(get_db),
                user: User = Depends(require_role("teacher", "admin"))):
    _owned_course(db, cid, user)
    pos = db.query(Section).filter(Section.course_id == cid).count() + 1
    s = Section(course_id=cid, title=body.title, stype=body.stype,
                content=body.content, position=pos)
    db.add(s)
    db.commit()
    db.refresh(s)
    return {"id": s.id, "title": s.title, "stype": s.stype, "content": s.content}


@router.put("/courses/{cid}/sections/{sid}")
def edit_section(cid: int, sid: int, body: SectionIn,
                 db: Session = Depends(get_db),
                 user: User = Depends(require_role("teacher", "admin"))):
    _owned_course(db, cid, user)
    s = db.query(Section).filter(Section.id == sid, Section.course_id == cid).first()
    if not s:
        raise HTTPException(404, "章节不存在")
    s.title = body.title
    s.stype = body.stype
    s.content = body.content
    db.commit()
    return {"ok": True}


@router.delete("/courses/{cid}/sections/{sid}")
def delete_section(cid: int, sid: int, db: Session = Depends(get_db),
                  user: User = Depends(require_role("teacher", "admin"))):
    _owned_course(db, cid, user)
    db.query(Section).filter(Section.id == sid, Section.course_id == cid).delete()
    db.commit()
    return {"ok": True}


# ---------- 文件上传 ----------
@router.post("/upload")
async def upload_file(file: UploadFile = File(...),
                      user: User = Depends(require_role("teacher", "admin"))):
    fn = file.filename or "file"
    # 防目录穿越：仅保留文件名
    fn = os.path.basename(fn)
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    dest = os.path.join(UPLOAD_DIR, fn)
    data = await file.read()
    with open(dest, "wb") as f:
        f.write(data)
    return {"url": f"/files/{fn}"}


# ---------- 作业布置与批改 ----------
@router.get("/courses/{cid}/homeworks")
def list_homeworks(cid: int, db: Session = Depends(get_db),
                   user: User = Depends(require_role("teacher", "admin"))):
    _owned_course(db, cid, user)
    hws = db.query(Homework).filter(Homework.course_id == cid).all()
    out = []
    for h in hws:
        cnt = db.query(Submission).filter(Submission.homework_id == h.id).count()
        graded = db.query(Submission).filter(
            Submission.homework_id == h.id, Submission.score != None).count()
        out.append({"id": h.id, "title": h.title, "desc": h.desc, "due": h.due,
                    "submissions": cnt, "graded": graded})
    return out


@router.post("/courses/{cid}/homeworks")
def create_homework(cid: int, body: HomeworkIn, db: Session = Depends(get_db),
                    user: User = Depends(require_role("teacher", "admin"))):
    _owned_course(db, cid, user)
    h = Homework(course_id=cid, title=body.title, desc=body.desc, due=body.due)
    db.add(h)
    db.commit()
    db.refresh(h)
    return {"id": h.id, "title": h.title}


@router.delete("/homeworks/{hid}")
def delete_homework(hid: int, db: Session = Depends(get_db),
                    user: User = Depends(require_role("teacher", "admin"))):
    h = db.query(Homework).filter(Homework.id == hid).first()
    if not h:
        raise HTTPException(404, "作业不存在")
    _owned_course(db, h.course_id, user)
    db.query(Submission).filter(Submission.homework_id == hid).delete()
    db.delete(h)
    db.commit()
    return {"ok": True}


@router.get("/homeworks/{hid}/submissions")
def list_submissions(hid: int, db: Session = Depends(get_db),
                     user: User = Depends(require_role("teacher", "admin"))):
    h = db.query(Homework).filter(Homework.id == hid).first()
    if not h:
        raise HTTPException(404, "作业不存在")
    _owned_course(db, h.course_id, user)
    subs = db.query(Submission).filter(Submission.homework_id == hid).all()
    out = []
    for s in subs:
        stu = db.query(User).filter(User.id == s.user_id).first()
        out.append({
            "id": s.id, "user_id": s.user_id,
            "student": stu.name if stu else "未知",
            "answer": s.answer, "score": s.score,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
        })
    return out


@router.post("/submissions/{sid}/grade")
def grade_submission(sid: int, body: GradeIn, db: Session = Depends(get_db),
                     user: User = Depends(require_role("teacher", "admin"))):
    s = db.query(Submission).filter(Submission.id == sid).first()
    if not s:
        raise HTTPException(404, "提交记录不存在")
    h = db.query(Homework).filter(Homework.id == s.homework_id).first()
    _owned_course(db, h.course_id, user)
    s.score = body.score
    db.commit()
    return {"ok": True}


# ---------- 公告 ----------
@router.post("/announcements")
def create_announcement(body: AnnounceIn, db: Session = Depends(get_db),
                        user: User = Depends(require_role("teacher", "admin"))):
    if body.course_id:
        _owned_course(db, body.course_id, user)
    a = Announcement(course_id=body.course_id, author_id=user.id,
                     title=body.title, content=body.content,
                     created_at=datetime.utcnow())
    db.add(a)
    db.commit()
    db.refresh(a)
    return {"id": a.id, "title": a.title}


# ---------- 班级学情 ----------
@router.get("/courses/{cid}/analytics")
def course_analytics(cid: int, db: Session = Depends(get_db),
                     user: User = Depends(require_role("teacher", "admin"))):
    _owned_course(db, cid, user)
    students = db.query(User).filter(User.role == "student").all()
    total = len(students)
    signin_rows = db.query(SignIn).filter(SignIn.course_id == cid).all()
    signed_ids = {r.user_id for r in signin_rows}
    hws = db.query(Homework).filter(Homework.course_id == cid).all()
    hw_ids = [h.id for h in hws]
    subs = db.query(Submission).filter(Submission.homework_id.in_(hw_ids)).all() if hw_ids else []
    submitted_ids = {s.user_id for s in subs}
    graded = sum(1 for s in subs if s.score)
    active_ids = signed_ids | submitted_ids
    return {
        "total_students": total,
        "signin_count": len(signed_ids),
        "signin_rate": round(len(signed_ids) / total * 100, 1) if total else 0,
        "homework_count": len(hws),
        "submission_count": len(submitted_ids),
        "submission_rate": round(len(submitted_ids) / total * 100, 1) if total else 0,
        "graded_count": graded,
        "active_students": len(active_ids),
        "students": [
            {
                "id": s.id, "name": s.name,
                "signed": s.id in signed_ids,
                "submitted": s.id in submitted_ids,
            } for s in students
        ],
    }


@router.get("/students")
def list_students(db: Session = Depends(get_db),
                 user: User = Depends(require_role("teacher", "admin"))):
    students = db.query(User).filter(User.role == "student").all()
    return [{"id": s.id, "username": s.username, "name": s.name,
             "email": s.email} for s in students]
