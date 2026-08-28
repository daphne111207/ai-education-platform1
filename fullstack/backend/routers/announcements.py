"""公告路由：学生端查看自己课程 + 全局公告。"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from models import User, Announcement, Course

router = APIRouter(prefix="/api", tags=["announcements"])


@router.get("/announcements")
def list_announcements(db: Session = Depends(get_db),
                       user: User = Depends(get_current_user)):
    """返回当前用户可见公告：全局公告 + 其课程相关公告，按时间倒序。"""
    # 学生能看到自己课程的公告；老师看到自己负责的课程公告
    if user.role == "student":
        my_course_ids = [c.id for c in db.query(Course).all()]  # 演示：全部课程可见
    else:
        my_course_ids = [c.id for c in db.query(Course).filter(
            Course.teacher_id == user.id).all()]
    ann = db.query(Announcement).filter(
        (Announcement.course_id == None) |
        (Announcement.course_id.in_(my_course_ids))
    ).order_by(Announcement.created_at.desc()).all()
    out = []
    for a in ann:
        course = db.query(Course).filter(Course.id == a.course_id).first() if a.course_id else None
        out.append({
            "id": a.id, "title": a.title, "content": a.content,
            "course_id": a.course_id,
            "course_title": course.title if course else "全校公告",
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })
    return out
