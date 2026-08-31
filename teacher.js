/* =========================================================
   teacher.js · 教师端主逻辑（学术专业风）
   由 app.js 在 role==='teacher' 时调用：
     renderTeacherNav()  /  teacherNavigate(key)
   所有数据读写经 api.js（当前 localStorage，未来可换后端）
   ========================================================= */

const TEACHER_NAV = [
  { key: "overview", icon: "bar-chart", label: "学情概览" },
  { key: "courses", icon: "book-open", label: "课程管理" },
  { key: "chapters", icon: "layers", label: "章节作业" },
  { key: "grade", icon: "clipboard", label: "批改打分" },
  { key: "roster", icon: "users", label: "学生名单" },
  { key: "announce", icon: "bell", label: "公告管理" },
];
let tCurCourse = null; // 教师端当前选中的课程

function renderTeacherNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = TEACHER_NAV.map(n =>
    `<div class="nav-item" data-key="${n.key}" onclick="teacherNavigate('${n.key}')"><span class="ic" data-icon="${n.icon}"></span>${n.label}</div>`
  ).join("");
  paintIcons(nav);
}
function teacherNavigate(key) {
  closeMenus();
  document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.key === key));
  const v = document.getElementById("view"); v.innerHTML = "";
  ({
    overview: renderTeacherOverview, courses: renderTeacherCourses,
    chapters: renderTeacherChapters, grade: renderTeacherGrade,
    roster: renderTeacherRoster, announce: renderTeacherAnnounce,
  }[key])(v);
  paintIcons(v); window.scrollTo(0, 0);
}

/* ---------- 学情概览 ---------- */
async function renderTeacherOverview(v) {
  const ov = await api.getTeacherOverview();
  const t = ov.totals;
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">学情概览</span></div>
    <div class="h-title">学情概览</div>
    <div class="h-sub">${esc(cur.name)} · 本学期任教通识课总体情况</div>
    <div class="stat-grid">
      <div class="stat"><div class="ic"><span class="ic" data-icon="book-open"></span></div><div class="num">${t.courses}</div><div class="lbl">任教课程</div></div>
      <div class="stat"><div class="ic g"><span class="ic" data-icon="users"></span></div><div class="num">${t.students}</div><div class="lbl">选课学生</div></div>
      <div class="stat"><div class="ic s"><span class="ic" data-icon="clipboard"></span></div><div class="num">${t.pending}</div><div class="lbl">待批改</div></div>
      <div class="stat"><div class="ic a"><span class="ic" data-icon="trending-up"></span></div><div class="num">${t.active}</div><div class="lbl">活跃学生</div></div>
    </div>
    <div class="h-title2">课程学情</div>
    <div class="tgrid">${ov.courses.map(c => {
      const s = c.tStats || {};
      return `<div class="tcard">
        <div class="tt" style="font-weight:800">${esc(c.title)}</div>
        <div class="tm muted">${esc(c.teacher)}</div>
        <div class="row" style="margin-top:10px;gap:10px">
          <span class="tag blue">签到率 ${s.attendance ?? "—"}%</span>
          <span class="tag green">提交率 ${s.submitRate ?? "—"}%</span>
          <span class="tag amber">活跃 ${s.active ?? "—"} 人</span>
        </div>
        <div class="hbar" style="margin-top:12px"><span class="lab">完成度</span><span class="track"><span style="width:${c.progress}%"></span></span><span class="val">${c.progress}%</span></div>
      </div>`;
    }).join("")}</div>`;
}

/* ---------- 课程管理 ---------- */
async function renderTeacherCourses(v) {
  const courses = await api.getCourses();
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">课程管理</span></div>
    <div class="h-title">课程管理</div>
    <div class="h-sub">管理你任教的课程（演示：新建课程保存在本地）</div>
    <div class="toolbar">
      <button class="btn" onclick="newCourse()"><span class="ic" data-icon="plus" style="vertical-align:-3px"></span> 新建课程</button>
    </div>
    <div class="tbl"><table><thead><tr><th>课程</th><th>教师</th><th>分类</th><th>进度</th><th>操作</th></tr></thead><tbody>
      ${courses.map(c => `<tr><td style="font-weight:700">${esc(c.title)}</td><td>${esc(c.teacher)}</td><td>${esc(c.category)}</td>
        <td><div class="progress" style="width:90px"><span style="width:${c.progress}%"></span></div></td>
        <td><span class="link" onclick="teacherNavigate('chapters');tCurCourse=${c.id};renderTeacherChapters(document.getElementById('view'))">编辑章节</span> · <span class="link" onclick="tCurCourse=${c.id};teacherNavigate('grade')">批改</span></td></tr>`).join("")}
    </tbody></table></div>`;
  paintIcons(v);
}
function newCourse() {
  const title = prompt("课程名称："); if (!title) return;
  toast("新建课程已记录（演示）");
}

/* ---------- 章节 / 作业管理 ---------- */
async function renderTeacherChapters(v) {
  const courses = await api.getCourses();
  if (tCurCourse == null) tCurCourse = courses[0].id;
  const c = courses.find(x => x.id === tCurCourse);
  const secs = await api.getSections(tCurCourse);
  v.innerHTML = `
    <div class="crumb"><span class="c-item" onclick="teacherNavigate('courses')">课程管理</span><span class="sep">/</span><span class="c-item cur">章节作业</span></div>
    <div class="h-title">章节 / 作业管理</div>
    <div class="h-sub">${esc(c.title)} · 共 ${secs.length} 个章节资源</div>
    <div class="toolbar">
      <select id="chCourse" class="score-input" style="width:auto" onchange="tCurCourse=+this.value;renderTeacherChapters(document.getElementById('view'))">
        ${courses.map(x => `<option value="${x.id}" ${x.id === tCurCourse ? "selected" : ""}>${esc(x.title)}</option>`).join("")}
      </select>
      <button class="btn" onclick="addSection()"><span class="ic" data-icon="plus" style="vertical-align:-3px"></span> 新增章节</button>
    </div>
    <div class="card">${secs.length ? secs.map((s, i) => `<div class="sec-item"><span class="ic" data-icon="${secIcon(s.stype)}"></span>
      <div class="st"><b>${esc(s.title)}</b> <span class="badge">${esc(s.stype)}</span></div>
      <button class="btn ghost sm" onclick="rmSection(${i})">删除</button></div>`).join("") : '<p class="muted">暂无章节，点击"新增章节"添加。</p>'}</div>`;
  paintIcons(v);
}
async function addSection() {
  const title = prompt("章节标题："); if (!title) return;
  const type = prompt("类型（video / doc / quiz）：", "video") || "video";
  const content = prompt("内容地址（视频/课件链接，可留空）：", "") || "";
  await api.addSection(tCurCourse, { stype: type, title, content });
  toast("已新增章节"); renderTeacherChapters(document.getElementById("view"));
}
async function rmSection(i) {
  await api.removeSection(tCurCourse, i); toast("已删除"); renderTeacherChapters(document.getElementById("view"));
}

/* ---------- 批改打分 ---------- */
async function renderTeacherGrade(v) {
  const courses = await api.getCourses();
  if (tCurCourse == null) tCurCourse = courses[0].id;
  const c = courses.find(x => x.id === tCurCourse);
  const list = await api.getRoster(tCurCourse);
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">批改打分</span></div>
    <div class="h-title">批改打分</div>
    <div class="h-sub">${esc(c.title)} · 录入并提交成绩（演示：保存在本地）</div>
    <div class="toolbar">
      <select id="gCourse" class="score-input" style="width:auto" onchange="tCurCourse=+this.value;renderTeacherGrade(document.getElementById('view'))">
        ${courses.map(x => `<option value="${x.id}" ${x.id === tCurCourse ? "selected" : ""}>${esc(x.title)}</option>`).join("")}
      </select>
    </div>
    <div class="tbl"><table><thead><tr><th>学生</th><th>签到</th><th>提交</th><th>成绩</th><th>操作</th></tr></thead><tbody>
      ${list.map(r => `<tr><td style="font-weight:700">${esc(r.name)}</td><td>${esc(r.signin)}</td><td class="${r.submit === "已交" ? "tag-ok" : "tag-no"}">${esc(r.submit)}</td>
        <td><input class="score-input" id="sc_${r.id}" value="${esc(r.score)}" /></td>
        <td><button class="btn sm" onclick="saveScore(${tCurCourse},${r.id})">保存</button></td></tr>`).join("")}
    </tbody></table></div>`;
  paintIcons(v);
}
async function saveScore(cid, sid) {
  const val = document.getElementById("sc_" + sid).value.trim();
  await api.saveScore(cid, sid, val); toast("成绩已保存");
}

/* ---------- 学生名单 ---------- */
async function renderTeacherRoster(v) {
  const courses = await api.getCourses();
  if (tCurCourse == null) tCurCourse = courses[0].id;
  const c = courses.find(x => x.id === tCurCourse);
  const list = await api.getRoster(tCurCourse);
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">学生名单</span></div>
    <div class="h-title">学生名单</div>
    <div class="h-sub">${esc(c.title)} · 共 ${list.length} 名学生</div>
    <div class="toolbar">
      <select id="rCourse" class="score-input" style="width:auto" onchange="tCurCourse=+this.value;renderTeacherRoster(document.getElementById('view'))">
        ${courses.map(x => `<option value="${x.id}" ${x.id === tCurCourse ? "selected" : ""}>${esc(x.title)}</option>`).join("")}
      </select>
    </div>
    <div class="tbl"><table><thead><tr><th>姓名</th><th>签到情况</th><th>作业提交</th><th>成绩</th></tr></thead><tbody>
      ${list.map(r => `<tr><td style="font-weight:700">${esc(r.name)}</td><td>${esc(r.signin)}</td>
        <td class="${r.submit === "已交" ? "tag-ok" : "tag-no"}">${esc(r.submit)}</td><td>${esc(r.score)}</td></tr>`).join("")}
    </tbody></table></div>`;
  paintIcons(v);
}

/* ---------- 公告管理 ---------- */
async function renderTeacherAnnounce(v) {
  const list = await api.getAnnouncements();
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">公告管理</span></div>
    <div class="h-title">公告管理</div>
    <div class="h-sub">发布全校或课程通知（演示：保存在本地）</div>
    <div class="card" style="margin-bottom:16px">
      <div class="h-title2">发布新公告</div>
      <div class="field-row">
        <div class="field"><label>范围</label><select id="anScope" class="score-input" style="width:100%">
          <option value="全校">全校</option>
          ${ (await api.getCourses()).map(c => `<option value="${esc(c.title)}">${esc(c.title)}</option>`).join("") }
        </select></div>
        <div class="field"><label>标题</label><input id="anTitle" placeholder="公告标题" /></div>
      </div>
      <div class="field"><label>内容</label><textarea id="anContent" class="note" rows="3" placeholder="公告内容…"></textarea></div>
      <div class="actions" style="text-align:right"><button class="btn" onclick="publishAn()">发布</button></div>
    </div>
    <div class="ann-list">${list.map(a => `<div class="ann-item"><div class="ann-title"><span>${esc(a.title)}</span><span class="ann-course">${esc(a.course_title)}</span></div>
      <div class="ann-content">${esc(a.content)}</div><div class="ann-date">${esc(a.created_at)}</div></div>`).join("")}</div>`;
  paintIcons(v);
}
async function publishAn() {
  const scope = document.getElementById("anScope").value;
  const title = document.getElementById("anTitle").value.trim();
  const content = document.getElementById("anContent").value.trim();
  if (!title || !content) { toast("请填写标题和内容"); return; }
  await api.publishAnnouncement({ course_title: scope, title, content });
  toast("公告已发布"); renderTeacherAnnounce(document.getElementById("view"));
}
