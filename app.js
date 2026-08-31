/* =========================================================
   app.js · 学生端主逻辑（学术专业风）
   所有数据读写均经 api.js（当前 localStorage，未来可换后端）
   ========================================================= */

let cur = null;      // 当前登录用户
let role = "student";
let curCourse = null;
let curSection = 0;
let searchQ = "";

/* ---------- 工具 ---------- */
function paintIcons(root) {
  (root || document).querySelectorAll("[data-icon]").forEach(el => {
    el.innerHTML = icon(el.getAttribute("data-icon"));
  });
}
function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove("show"), 1800);
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function closeMenus() { document.getElementById("avatarMenu")?.classList.remove("show"); document.getElementById("notifyPanel")?.classList.remove("show"); }
function $(id) { return document.getElementById(id); }

/* ---------- 登录 ---------- */
function pickRole(r) {
  role = r;
  $("rsStudent").classList.toggle("on", r === "student");
  $("rsTeacher").classList.toggle("on", r === "teacher");
  $("li-user").placeholder = r === "student" ? "请输入 8 位学号" : "请输入教师用户名";
  $("demoHint").textContent = r === "student" ? "演示账号：2023110001 / 123456" : "演示账号：teacher01 / 123456";
}
function showRegister() { $("loginForm").style.display = "none"; $("regForm").style.display = "block"; }
function showLogin() { $("regForm").style.display = "none"; $("loginForm").style.display = "block"; }
function togglePwd() { const i = $("li-pass"); i.type = i.type === "password" ? "text" : "password"; }
function togglePwdReg() { const i = $("reg-pass"); i.type = i.type === "password" ? "text" : "password"; }
function togglePwdReg2() { const i = $("reg-pass2"); i.type = i.type === "password" ? "text" : "password"; }

async function doLogin() {
  const u = $("li-user").value.trim(), p = $("li-pass").value;
  if (!u || !p) { $("li-err").textContent = "请输入账号和密码"; return; }
  try {
    const user = await api.login(u, p);
    if (user.role !== role) { $("li-err").textContent = "该账号不是" + (role === "student" ? "学生" : "教师") + "身份"; return; }
    if ($("li-remember").checked) localStorage.setItem("gep:remember", u);
    enterApp(user);
  } catch (e) { $("li-err").textContent = e.message; }
}
async function doRegister() {
  const u = $("reg-user").value.trim(), p = $("reg-pass").value, p2 = $("reg-pass2").value;
  if (!/^\d{8}$/.test(u)) { $("reg-msg").textContent = "学号需为 8 位数字"; return; }
  if (p.length < 6) { $("reg-msg").textContent = "密码至少 6 位"; return; }
  if (p !== p2) { $("reg-msg").textContent = "两次密码不一致"; return; }
  try {
    const user = await api.register({ username: u, password: p });
    enterApp(user);
    toast("注册成功，已自动登录");
  } catch (e) { $("reg-msg").textContent = e.message; }
}

function enterApp(user) {
  cur = user; role = user.role;
  $("login").style.display = "none";
  $("app").style.display = "flex";
  $("sidebarSub").textContent = role === "student" ? "学生端" : "教师端";
  $("aiCard").style.display = role === "student" ? "block" : "none";
  const initial = (user.name || user.username).slice(0, 1);
  $("topAvatar").textContent = initial;
  $("topAvatar").style.background = `linear-gradient(135deg, ${user.color || "#2563EB"}, #7C3AED)`;
  renderNav();
  if (role === "teacher") window.teacherNavigate("overview");
  else navigate("home");
  paintIcons();
}
function logout() {
  closeMenus(); cur = null;
  $("app").style.display = "none"; $("login").style.display = "flex";
  pickRole("student"); paintIcons();
}

/* ---------- 导航 ---------- */
const STUDENT_NAV = [
  { key: "home", icon: "home", label: "学习概览" },
  { key: "course", icon: "book-open", label: "课程中心" },
  { key: "aichat", icon: "bot", label: "AI 互动课堂" },
  { key: "discuss", icon: "message", label: "课程讨论" },
  { key: "group", icon: "users", label: "班级群聊" },
  { key: "study", icon: "users", label: "学习小组" },
  { key: "signin", icon: "map-pin", label: "课堂签到" },
  { key: "dashboard", icon: "bar-chart", label: "学情看板" },
];
function renderNav() {
  if (role === "teacher") { window.renderTeacherNav(); return; }
  const nav = $("nav");
  nav.innerHTML = STUDENT_NAV.map(n =>
    `<div class="nav-item" data-key="${n.key}" onclick="navigate('${n.key}')"><span class="ic" data-icon="${n.icon}"></span>${n.label}</div>`
  ).join("");
  paintIcons(nav);
}
const PAGES = ["home", "course", "aichat", "discuss", "group", "study", "signin", "dashboard"];
function navigate(key) {
  if (role === "teacher") { closeMenus(); window.teacherNavigate(key); return; }
  closeMenus();
  document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.key === key));
  const v = $("view"); v.innerHTML = "";
  ({ home: renderHome, course: renderCourseCenter, aichat: renderAIChat,
     discuss: renderDiscussion, group: renderGroups, study: renderStudyGroups,
     signin: renderSignin, dashboard: renderDashboard }[key])(v);
  paintIcons(v);
  window.scrollTo(0, 0);
}

/* ---------- 学习概览（首页） ---------- */
async function renderHome(v) {
  const d = await api.getDashboard();
  const courses = await api.getCourses();
  const anns = await api.getAnnouncements();
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">学习概览</span></div>
    <div class="h-title">学习概览</div>
    <div class="h-sub">欢迎回来，${esc(cur.name)} · 本学期通识课学习一览</div>
    <div class="stat-grid">
      <div class="stat"><div class="ic"><span class="ic" data-icon="book-open"></span></div><div class="num">${courses.length}</div><div class="lbl">在学课程</div></div>
      <div class="stat"><div class="ic g"><span class="ic" data-icon="clock"></span></div><div class="num">${d.totalHours}h</div><div class="lbl">累计学习时长</div></div>
      <div class="stat"><div class="ic s"><span class="ic" data-icon="trending-up"></span></div><div class="num">${d.avgVideo}%</div><div class="lbl">平均视频完成</div></div>
      <div class="stat"><div class="ic a"><span class="ic" data-icon="check-circle"></span></div><div class="num">${d.signRate}%</div><div class="lbl">签到率</div></div>
    </div>
    <div class="ai-banner">
      <div class="emoji">🤖</div>
      <div style="flex:1"><h3>AI 互动课堂 · 多智能体伴学</h3><p>讲师 / 助教 / 学伴三类智能体协同答疑，基于 OpenMAIC 多智能体框架。</p></div>
      <button class="btn ai" onclick="navigate('aichat')">进入对话</button>
    </div>
    <div class="h-title2">我的课程</div>
    <div class="course-grid">${courses.map(courseCard).join("")}</div>
    <div class="h-title2 mt">通知公告</div>
    <div class="ann-list">${anns.slice(0, 4).map(annItem).join("")}</div>
  `;
  bindCourseCards(v);
}
function courseCard(c) {
  return `<div class="course-card" data-id="${c.id}">
    <div class="course-cover" style="background:linear-gradient(135deg,${c.coverColor},${shade(c.coverColor)})">${c.coverText}</div>
    <div class="course-body">
      <h4>${esc(c.title)}</h4>
      <div class="course-meta">${esc(c.teacher)} · ${esc(c.category)}</div>
      <div class="progress"><span style="width:${c.progress}%"></span></div>
      <p>已完成 ${c.progress}%</p>
    </div></div>`;
}
function annItem(a) {
  return `<div class="ann-item">
    <div class="ann-title"><span>${esc(a.title)}</span><span class="ann-course">${esc(a.course_title)}</span></div>
    <div class="ann-content">${esc(a.content)}</div>
    <div class="ann-date">${esc(a.created_at)}</div></div>`;
}
function shade(hex) { // 简单加深
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - 30), g = Math.max(0, ((n >> 8) & 255) - 30), b = Math.max(0, (n & 255) - 30);
  return `rgb(${r},${g},${b})`;
}
function bindCourseCards(v) {
  v.querySelectorAll(".course-card").forEach(el => el.onclick = () => openCourse(+el.dataset.id));
}

/* ---------- 课程中心 ---------- */
async function renderCourseCenter(v) {
  const courses = await api.getCourses();
  const cats = ["全部", ...new Set(courses.map(c => c.category))];
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">课程中心</span></div>
    <div class="h-title">课程中心</div>
    <div class="h-sub">共 ${courses.length} 门通识课 · 点击进入学习</div>
    <div class="filter" id="catFilter">${cats.map((c, i) => `<button class="${i === 0 ? "active" : ""}" data-cat="${esc(c)}" onclick="filterCat('${esc(c)}')">${esc(c)}</button>`).join("")}</div>
    <div class="course-grid" id="courseGrid">${courses.map(courseCard).join("")}</div>`;
  bindCourseCards(v);
}
function filterCat(cat) {
  document.querySelectorAll("#catFilter button").forEach(b => b.classList.toggle("active", b.dataset.cat === cat));
  const grid = $("courseGrid");
  api.getCourses().then(courses => {
    const list = cat === "全部" ? courses : courses.filter(c => c.category === cat);
    grid.innerHTML = list.map(courseCard).join("") || `<p class="muted">该分类暂无课程</p>`;
    bindCourseCards(grid);
  });
}

/* ---------- 课程详情（学习页） ---------- */
async function openCourse(id) {
  const c = await api.getCourse(id); curCourse = c; curSection = 0;
  document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.key === "course"));
  const v = $("view"); renderLearn(v, c); paintIcons(v);
}
async function renderLearn(v, c) {
  if (!c) c = curCourse;
  const secs = await api.getSections(c.id);
  const hasSec = secs.length > 0;
  const sec = secs[curSection] || {};
  const note = await api.getNote(c.id, curSection);
  v.innerHTML = `
    <div class="crumb">
      <span class="c-item" onclick="navigate('course')">课程中心</span><span class="sep">/</span>
      <span class="c-item cur">${esc(c.title)}</span>
    </div>
    <div class="h-title">${esc(c.title)}</div>
    <div class="h-sub">${esc(c.teacher)} · ${esc(c.category)} · ${esc(c.desc)}</div>
    ${hasSec ? `<div class="learn">
      <div class="chapter">
        <div class="ch">章节目录</div>
        ${secs.map((s, i) => `<div class="item ${i === curSection ? "active" : ""}" onclick="gotoSection(${i})"><span class="ic" data-icon="${secIcon(s.stype)}"></span>${esc(s.title)}</div>`).join("")}
      </div>
      <div>
        ${secHtml(sec)}
        <div class="learn-tabs">
          <button class="active" onclick="showLearnTab(this,'doc')">课件资料</button>
          <button onclick="showLearnTab(this,'talk')">讨论</button>
          <button onclick="showLearnTab(this,'hw')">作业</button>
        </div>
        <div id="learnTab" style="margin-top:14px"></div>
      </div>
      <div>
        <div class="side-block card"><div class="h-title2">随堂笔记</div>
          <textarea class="note" id="noteArea" rows="7" placeholder="记录这一节的重点…">${esc(note)}</textarea>
          <button class="btn sm" style="margin-top:8px" onclick="saveNoteNow(${c.id},${curSection})">保存笔记</button>
        </div>
        <div class="side-block card"><div class="h-title2">学习进度</div>
          <div class="progress"><span style="width:${c.progress}%"></span></div>
          <p class="muted" style="margin-top:8px;font-size:12px">已完成 ${c.progress}%</p>
          <button class="btn ghost sm" style="margin-top:8px" onclick="bumpProgress(${c.id})">标记本节完成 +10%</button>
        </div>
      </div>
    </div>` :
    `<div class="card" style="text-align:center;padding:48px;color:var(--text-2)">
      <div style="font-size:40px;margin-bottom:10px">📭</div>
      <div style="font-weight:700;font-size:16px">老师暂未上传内容</div>
      <div class="muted" style="margin-top:6px">本课程章节资料正在准备中，敬请期待。</div>
    </div>`}
  `;
  if (hasSec) showLearnTab(document.querySelector(".learn-tabs button"), "doc");
}
function secIcon(t) { return t === "video" ? "video" : t === "doc" ? "file-text" : "clipboard"; }
function secHtml(s) {
  if (s.stype === "video") return `<div class="video"><div style="text-align:center"><div class="play" data-icon="video"></div><div style="margin-top:12px;opacity:.85">${esc(s.title)}</div></div></div>`;
  if (s.stype === "doc") return `<div class="doc-frame"><iframe src="${esc(s.content)}"></iframe></div>`;
  if (s.stype === "quiz") return `<div class="quiz-box"><div class="h-title2">${esc(s.title)}</div><p class="muted">${esc(s.content)}</p><div style="margin-top:14px"><button class="btn" onclick="toast('测验已开始（演示）')">开始测验</button></div></div>`;
  return `<div class="card">${esc(s.title)}</div>`;
}
function gotoSection(i) { curSection = i; renderLearn($("view"), curCourse); paintIcons($("view")); }
async function saveNoteNow(cid, sec) {
  await api.saveNote(cid, sec, $("noteArea").value);
  toast("笔记已保存");
}
async function bumpProgress(cid) {
  const c = await api.getCourse(cid);
  const nv = Math.min(100, (c.progress || 0) + 10);
  await api.setProgress(cid, nv); curCourse.progress = nv;
  toast("进度已更新 " + nv + "%");
  renderLearn($("view"), curCourse); paintIcons($("view"));
}
async function showLearnTab(btn, tab) {
  document.querySelectorAll(".learn-tabs button").forEach(b => b.classList.toggle("active", b === btn));
  const box = $("learnTab"); const c = curCourse;
  if (tab === "doc") {
    const secs = await api.getSections(c.id);
    box.innerHTML = `<div class="list-item"><div class="li-ic"><span class="ic" data-icon="file-text"></span></div><div class="li-body"><h4>课程课件合集</h4><p>共 ${secs.filter(s => s.stype === "doc").length} 份课件</p></div></div>`;
  } else if (tab === "talk") {
    box.innerHTML = `<div id="discBox"></div>`;
    renderDiscussionInto(box, c.id);
  } else {
    const c2 = await api.getCourse(c.id);
    box.innerHTML = (c2.homeworks.length ? c2.homeworks.map(h => `<div class="list-item"><div class="li-ic"><span class="ic" data-icon="clipboard"></span></div><div class="li-body"><h4>${esc(h.title)}</h4><p>截止 ${esc(h.due)} · ${esc(h.desc)}</p></div><button class="btn sm" onclick="toast('作业提交（演示）')">去提交</button></div>`).join("") : `<p class="muted">本课程暂无作业</p>`);
  }
  paintIcons(box);
}

/* ---------- 课程讨论 ---------- */
async function renderDiscussion(v) {
  const courses = await api.getCourses();
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">课程讨论</span></div>
    <div class="h-title">课程讨论</div>
    <div class="h-sub">选择课程，查看或发起讨论</div>
    <div class="filter" id="discFilter">${courses.map((c, i) => `<button class="${i === 0 ? "active" : ""}" data-id="${c.id}" onclick="switchDisc(${c.id})">${esc(c.title)}</button>`).join("")}</div>
    <div id="discBox" class="card"></div>`;
  renderDiscussionInto($("discBox"), courses[0].id);
  paintIcons(v);
}
async function switchDisc(id) {
  document.querySelectorAll("#discFilter button").forEach(b => b.classList.toggle("active", +b.dataset.id === id));
  renderDiscussionInto($("discBox"), id);
}
async function renderDiscussionInto(box, courseId) {
  const list = await api.getDiscussion(courseId);
  box.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:14px">
      ${list.map(m => `<div class="chat-msg ${m.role === "teacher" ? "ai" : ""}" style="align-self:flex-start;max-width:88%">
        <div class="meta"><b>${esc(m.user)}</b>${m.role === "teacher" ? '<span class="badge-teacher">教师</span>' : ""}<span>${esc(m.ts)}</span></div>
        <div>${esc(m.content)}</div></div>`).join("")}
    </div>
    <div class="composer">
      <input id="discInput" placeholder="发表你的观点…" onkeydown="if(event.key==='Enter')postDisc(${courseId})" />
      <button class="btn" onclick="postDisc(${courseId})">发送</button>
    </div>`;
  paintIcons(box);
}
async function postDisc(courseId) {
  const inp = $("discInput"); const t = inp.value.trim(); if (!t) return;
  await api.postDiscussion(courseId, { user: cur.name, content: t });
  renderDiscussionInto($("discBox"), courseId);
}

/* ---------- 班级群聊 ---------- */
async function renderGroups(v) {
  const groups = await api.getGroups();
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">班级群聊</span></div>
    <div class="h-title">班级群聊</div>
    <div class="h-sub">与同学、助教实时交流（演示：消息保存在本地）</div>
    <div class="chat-layout">
      <div class="group-list">${groups.map((g, i) => `<div class="g ${i === 0 ? "active" : ""}" data-id="${g.id}" onclick="switchGroup('${g.id}',this)">
        <div class="g-ava ${g.warm ? "warm" : ""}">${g.emoji}</div>
        <div><div style="font-weight:700;font-size:13.5px">${esc(g.name)}</div></div></div>`).join("")}</div>
      <div class="chat-panel"><div class="chat-head"><span class="ic" data-icon="users"></span><span id="grpTitle">${esc(groups[0].name)}</span></div>
        <div class="chat-msgs" id="grpMsgs"></div>
        <div class="composer"><input id="grpInput" placeholder="输入消息…" onkeydown="if(event.key==='Enter')sendGroup()" /><button class="btn" onclick="sendGroup()">发送</button></div>
      </div>
    </div>`;
  paintIcons(v);
  loadGroupMsgs(groups[0].id);
}
function switchGroup(id, el) {
  document.querySelectorAll(".group-list .g").forEach(g => g.classList.toggle("active", g === el));
  $("grpTitle").textContent = el.querySelector("div:last-child>div").textContent;
  loadGroupMsgs(id);
}
async function loadGroupMsgs(id) {
  const list = await api.getGroupMessages(id);
  const box = $("grpMsgs");
  box.innerHTML = list.length ? list.map(m => `<div class="chat-msg ${m.role === "teacher" ? "ai" : ""}" style="align-self:${m.role === "me" ? "flex-end" : "flex-start"};max-width:78%">
    <div class="meta"><b>${esc(m.user)}</b>${m.role === "teacher" ? '<span class="badge-teacher">教师</span>' : ""}<span>${esc(m.ts)}</span></div>
    <div>${esc(m.content)}</div></div>`).join("")
    : `<div class="sys-msg">暂无消息，打个招呼吧 👋</div>`;
  box.scrollTop = box.scrollHeight; paintIcons(box);
}
async function sendGroup() {
  const inp = $("grpInput"); const t = inp.value.trim(); if (!t) return;
  const id = document.querySelector(".group-list .g.active")?.dataset.id;
  await api.sendGroupMessage(id, { user: cur.name, role: "student", content: t });
  inp.value = ""; loadGroupMsgs(id);
}

/* ---------- 学习小组 ---------- */
async function renderStudyGroups(v) {
  const groups = await api.getStudyGroups();
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">学习小组</span></div>
    <div class="h-title">学习小组</div>
    <div class="h-sub">加入志同道合的同学，互助共学</div>
    <div class="tgrid">${groups.map(g => `<div class="tcourse">
      <div class="g-ava" style="width:40px;height:40px;font-size:18px">👥</div>
      <div class="tt">${esc(g.name)}</div>
      <div class="tm">所属课程：${esc(g.course)} · ${g.members} 人</div>
      <div class="muted" style="margin:8px 0;font-size:12.5px">${esc(g.desc)}</div>
      <button class="btn sm" onclick="joinGroup('${g.id}')">加入小组</button>
    </div>`).join("")}</div>`;
  paintIcons(v);
}
async function joinGroup(id) {
  await api.joinStudyGroup(id); toast("已申请加入，等待组长确认（演示）"); renderStudyGroups($("view")); paintIcons($("view"));
}

/* ---------- 课堂签到 ---------- */
async function renderSignin(v) {
  const tasks = await api.getSignIns();
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">课堂签到</span></div>
    <div class="h-title">课堂签到</div>
    <div class="h-sub">${tasks.filter(t => t.done).length}/${tasks.length} 已完成签到</div>
    <div class="signin-grid">${tasks.map(t => `<div class="signin-card" onclick="openSignin('${t.id}')">
      <div class="sc-ic">${t.done ? "✅" : iconName(t.mode)}</div>
      <h4>${esc(t.course)}</h4><p>${t.mode} · 截止 ${esc(t.deadline)}</p>
      <p style="color:${t.done ? "var(--success)" : "var(--text-3)"};font-weight:700">${t.done ? "已签到" : "待签到"}</p></div>`).join("")}</div>
    <div id="signinDetail"></div>`;
  paintIcons(v);
}
function iconName(mode) { return mode === "定位" ? "📍" : mode === "二维码" ? "🔳" : "✋"; }
async function openSignin(id) {
  const tasks = await api.getSignIns(); const t = tasks.find(x => x.id === id);
  const box = $("signinDetail");
  if (t.done) {
    box.innerHTML = `<div class="signin-panel"><div class="sp-done">✅ 你已于 ${esc(t.at || "")} 完成签到（${esc(t.mode)}）</div></div>`;
    paintIcons(box); return;
  }
  box.innerHTML = `
    <div class="signin-panel">
      <div class="h-title2">${esc(t.course)} · ${esc(t.mode)}签到</div>
      <div class="row" style="align-items:stretch">
        <div style="flex:1;min-width:240px">
          <div class="sp-map"><span class="sp-pin">📍</span>正在获取你的位置…（演示）</div>
          <div class="sp-info">请在 ${esc(t.deadline)} 前完成签到。</div>
          <div class="sp-action"><button class="btn" onclick="confirmSignin('${t.id}','定位')">确认定位签到</button></div>
        </div>
        <div style="flex:1;min-width:240px">
          <div class="sp-qr"><span class="ic" data-icon="users"></span>扫码签到<br>打开手机相机扫描</div>
          <div class="sp-action"><button class="btn ghost" onclick="confirmSignin('${t.id}','二维码')">模拟扫码</button></div>
        </div>
      </div>
    </div>`;
  paintIcons(box);
}
async function confirmSignin(id, method) {
  await api.doSignIn(id, method, { ts: Date.now() }); toast("签到成功"); renderSignin($("view")); paintIcons($("view"));
}

/* ---------- 学情看板 ---------- */
async function renderDashboard(v) {
  const d = await api.getDashboard();
  const maxV = Math.max(1, ...d.weekly.map(w => w.val));
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">学情看板</span></div>
    <div class="h-title">学情看板</div>
    <div class="h-sub">${esc(cur.name)} 的个人学习数据</div>
    <div class="stat-grid">
      <div class="stat"><div class="ic"><span class="ic" data-icon="clock"></span></div><div class="num">${d.totalHours}h</div><div class="lbl">本周学习时长</div></div>
      <div class="stat"><div class="ic g"><span class="ic" data-icon="trending-up"></span></div><div class="num">${d.avgVideo}%</div><div class="lbl">视频完成率</div></div>
      <div class="stat"><div class="ic s"><span class="ic" data-icon="award"></span></div><div class="num">${d.avgScore}</div><div class="lbl">平均成绩</div></div>
      <div class="stat"><div class="ic a"><span class="ic" data-icon="check-circle"></span></div><div class="num">${d.signRate}%</div><div class="lbl">签到率</div></div>
    </div>
    <div class="row" style="align-items:stretch">
      <div class="chart-card" style="flex:1.4;min-width:320px">
        <div class="h-title2">本周每日学习时长</div>
        <div class="bars">${d.weekly.map(w => `<div class="bar"><div class="col" style="height:${Math.round(w.val / maxV * 100)}%"></div><span class="lab">${esc(w.label)}</span></div>`).join("")}</div>
      </div>
      <div class="chart-card" style="flex:1;min-width:240px">
        <div class="h-title2">视频完成率</div>
        <div style="display:flex;align-items:center;gap:18px;margin-top:10px">
          <div class="donut" style="background:conic-gradient(var(--primary) 0 ${d.avgVideo}%,var(--surface-3) ${d.avgVideo}% 100%)"><span>${d.avgVideo}%</span></div>
          <div class="muted">按所选课程平均计算</div>
        </div>
      </div>
    </div>
    <div class="chart-card mt">
      <div class="h-title2">各课程进度</div>
      ${d.courses.map(c => `<div class="hbar"><span class="lab">${esc(c.title)}</span><span class="track"><span style="width:${c.progress}%"></span></span><span class="val">${c.progress}%</span></div>`).join("")}
    </div>`;
  paintIcons(v);
}

/* ---------- AI 互动课堂 ---------- */
const AGENTS = [
  { face: "🧑‍🏫", role: "讲师智能体", name: "授课讲师", desc: "讲解知识点、梳理课程脉络与重点难点。" },
  { face: "🤖", role: "助教智能体", name: "AI 助教", desc: "答疑解惑、推荐资料、批改与练习反馈。" },
  { face: "🐾", role: "学伴智能体", name: "学习伙伴", desc: "陪伴讨论、启发思考、制定学习计划。" },
];
async function renderAIChat(v) {
  v.innerHTML = `
    <div class="crumb"><span class="c-item cur">AI 互动课堂</span></div>
    <div class="h-title">AI 互动课堂 · 多智能体</div>
    <div class="h-sub">基于 OpenMAIC 多智能体框架 · 讲师 / 助教 / 学伴协同伴学</div>
    <div class="ai-agent">${AGENTS.map(a => `<div class="agent"><div class="face">${a.face}</div><div class="role">${a.role}</div><h4>${a.name}</h4><p>${a.desc}</p></div>`).join("")}</div>
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap">
      <button class="btn ai" onclick="openMAIC()">🌐 在新窗口打开 OpenMAIC 真实课堂</button>
      <span class="muted" style="align-self:center;font-size:12px">（open.maic.chat 不支持内嵌，已用新窗口方式打开）</span>
    </div>
    <div class="chat-box">
      <div class="chat-head"><span class="ic" data-icon="bot"></span><span>与 AI 助教对话（演示）</span></div>
      <div class="chat-msgs" id="aiMsgs">
        <div class="msg ai">你好 ${esc(cur.name)}！我是 AI 助教，有任何课程问题都可以问我 🤖</div>
      </div>
      <div class="chat-input"><input id="aiInput" placeholder="问问 AI 助教…" onkeydown="if(event.key==='Enter')sendAI()" /><button class="btn ai" onclick="sendAI()">发送</button></div>
    </div>`;
  paintIcons(v);
}
function openMAIC() { window.open(AI_CLASSROOM_URL, "_blank", "noopener"); }
function sendAI() {
  const inp = $("aiInput"); const t = inp.value.trim(); if (!t) return;
  const box = $("aiMsgs");
  box.insertAdjacentHTML("beforeend", `<div class="msg me">${esc(t)}</div>`);
  inp.value = "";
  setTimeout(() => {
    box.insertAdjacentHTML("beforeend", `<div class="msg ai">收到～关于「${esc(t.slice(0, 12))}」，建议先回顾课程对应章节，并参考课件中的示例。需要我展开讲解某个知识点吗？</div>`);
    box.scrollTop = box.scrollHeight;
  }, 600);
  box.scrollTop = box.scrollHeight;
}

/* ---------- 通知 / 头像菜单 ---------- */
async function toggleNotify() {
  const p = $("notifyPanel"); const show = !p.classList.contains("show");
  p.classList.toggle("show", show);
  if (show) {
    const anns = await api.getAnnouncements();
    p.innerHTML = `<div class="nt-head"><span>通知公告</span><span class="muted">${anns.length} 条</span></div>` +
      anns.slice(0, 6).map(a => `<div class="nt-item"><div class="nt-ic"><span class="ic" data-icon="bell"></span></div><div class="nt-body"><b>${esc(a.title)}</b><p>${esc(a.course_title)} · ${esc(a.created_at)}</p></div></div>`).join("");
    paintIcons(p);
  }
}
function toggleAvatarMenu() {
  const m = $("avatarMenu"); const show = !m.classList.contains("show");
  m.classList.toggle("show", show);
  if (show) { $("menuWho").innerHTML = `<b>${esc(cur.name)}</b><br>${esc(cur.username)} · ${cur.role === "student" ? "学生" : "教师"}`; }
}

/* ---------- 账号管理 ---------- */
function openProfile() { closeMenus(); $("profileMask").style.display = "flex"; renderProfileTab("info"); bindProfileTabs(); }
function closeProfile() { $("profileMask").style.display = "none"; }
function bindProfileTabs() {
  document.querySelectorAll("#profileTabs .tab").forEach(t => t.onclick = () => { renderProfileTab(t.dataset.tab); document.querySelectorAll("#profileTabs .tab").forEach(x => x.classList.toggle("cur", x === t)); });
}
function renderProfileTab(tab) {
  const b = $("profileBody");
  if (tab === "info") {
    b.innerHTML = `<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
      <div class="avatar lg" style="background:linear-gradient(135deg,${cur.color},#7C3AED)">${(cur.name || cur.username).slice(0,1)}</div>
      <div><div style="font-weight:800;font-size:16px">${esc(cur.name)}</div><div class="muted">${esc(cur.username)}</div></div></div>
      <div class="info-list">
        <div class="info-row"><span class="info-label">身份</span><span class="info-val">${cur.role === "student" ? "学生" : "教师"}</span></div>
        <div class="info-row"><span class="info-label">学院 / 专业</span><span class="info-val">${esc(cur.major)}</span></div>
        <div class="info-row"><span class="info-label">学号</span><span class="info-val">${esc(cur.studentId)}</span></div>
      </div>`;
  } else if (tab === "nick") {
    b.innerHTML = `<div class="field"><label>新昵称</label><input id="nickInput" value="${esc(cur.name)}" /></div>
      <div class="actions"><button class="btn" onclick="saveNick()">保存</button></div>`;
  } else if (tab === "avatar") {
    const colors = ["#2563EB", "#7C3AED", "#0EA5E9", "#16A34A", "#D97706", "#DC2626"];
    b.innerHTML = `<p class="muted" style="margin-bottom:10px">选择头像底色</p><div class="swatches">${colors.map(c => `<div class="sw ${cur.color === c ? "sel" : ""}" style="background:${c}" onclick="pickColor('${c}')"></div>`).join("")}</div>`;
  } else if (tab === "pwd") {
    b.innerHTML = `<div class="field"><label>当前密码</label><input id="pwdOld" type="password" /></div>
      <div class="field"><label>新密码（至少 6 位）</label><input id="pwdNew" type="password" /></div>
      <div class="actions"><button class="btn" onclick="savePwd()">更新密码</button></div>`;
  }
}
async function saveNick() {
  const n = $("nickInput").value.trim(); if (!n) return;
  cur = await api.updateProfile(cur.username, { name: n });
  $("topAvatar").textContent = n.slice(0, 1);
  toast("昵称已更新"); renderProfileTab("info");
}
function pickColor(c) {
  api.updateProfile(cur.username, { color: c }).then(u => {
    cur = u;
    $("topAvatar").style.background = `linear-gradient(135deg,${c},#7C3AED)`;
    renderProfileTab("avatar"); toast("头像已更新");
  });
}
async function savePwd() {
  const old = $("pwdOld").value, nw = $("pwdNew").value;
  if (old !== cur.password) { toast("当前密码错误"); return; }
  if (nw.length < 6) { toast("新密码至少 6 位"); return; }
  cur = await api.updateProfile(cur.username, { password: nw });
  toast("密码已更新"); closeProfile();
}

/* ---------- 搜索 ---------- */
function onSearch(q) {
  searchQ = q.trim();
  if (searchQ && role === "student") { navigate("course"); }
}

/* ---------- 启动 ---------- */
window.addEventListener("click", e => {
  if (!e.target.closest(".avatar-wrap")) $("avatarMenu")?.classList.remove("show");
  if (!e.target.closest(".bell")) $("notifyPanel")?.classList.remove("show");
});
document.addEventListener("DOMContentLoaded", () => {
  paintIcons();
  const r = localStorage.getItem("gep:remember");
  if (r) { $("li-user").value = r; $("li-remember").checked = true; }
});
