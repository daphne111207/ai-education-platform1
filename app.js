/* =========================================================
   研究生通识课 AI 教育平台 · 学生端（静态展示版 · 图标化重构）
   纯前端：登录用 localStorage，数据来自 data.js，无后端请求。
   ========================================================= */

const $ = (s) => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const NF = (n) => Number(n);

let currentUser = null;
let activeNav = "home";
let searchTerm = "";

/* ---------------- 图标初始化 ---------------- */
function initIcons(root) {
  (root || document).querySelectorAll("[data-icon]").forEach((node) => {
    node.innerHTML = icon(node.getAttribute("data-icon"));
  });
}

/* ---------------- 密码显示切换 ---------------- */
function togglePwd() {
  const inp = $("#li-pass");
  const eye = $("#eyeBtn");
  if (inp.type === "password") { inp.type = "text"; eye.innerHTML = icon("eye-off"); }
  else { inp.type = "password"; eye.innerHTML = icon("eye"); }
}

/* ---------------- toast ---------------- */
function toast(msg) {
  let t = $("#toast");
  if (!t) { t = el("div", "toast"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------------- 登录 / 退出 ---------------- */
function doLogin() {
  const u = $("#li-user").value.trim();
  const p = $("#li-pass").value;
  const user = getAllUsers().find((x) => x.username === u);
  if (!user || !checkPass(u, p)) {
    showErr("账号或密码错误");
    return;
  }
  const prof = getProfile(u);
  currentUser = { username:  user.username, name: prof.name || user.name || user.username, sid: user.studentId || user.username, major: prof.major || user.major || "—", specialty: prof.specialty || "", cls: prof.cls || "", contact: prof.contact || "", nickname: prof.nickname || prof.name || user.name || user.username, role: user.role || "student" };
  if ($("#li-remember").checked) storeUser();
  showApp();
}
function showErr(m) {
  const e = $("#li-err");
  e.textContent = m;
  setTimeout(() => { if (e.textContent === m) e.textContent = ""; }, 3000);
}
function storeUser() { try { localStorage.setItem("static_user", JSON.stringify(currentUser)); } catch (e) {} }

function getAllUsers() {
  let reg = [];
  try { reg = JSON.parse(localStorage.getItem("reg_users") || "[]"); } catch (e) {}
  return USERS.concat(reg);
}

function showRegister() {
  $("#loginForm").style.display = "none";
  $("#regForm").style.display = "block";
  $("#li-err").textContent = "";
}
function showLogin() {
  $("#regForm").style.display = "none";
  $("#loginForm").style.display = "block";
  $("#reg-msg").textContent = "";
}
function togglePwdReg() {
  const inp = $("#reg-pass");
  const eye = $("#eyeBtn2");
  if (inp.type === "password") { inp.type = "text"; eye.innerHTML = icon("eye-off"); }
  else { inp.type = "password"; eye.innerHTML = icon("eye"); }
}
function togglePwdReg2() {
  const inp = $("#reg-pass2");
  const eye = $("#eyeBtn3");
  if (inp.type === "password") { inp.type = "text"; eye.innerHTML = icon("eye-off"); }
  else { inp.type = "password"; eye.innerHTML = icon("eye"); }
}
function doRegister() {
  const sid = $("#reg-user").value.trim();
  const p1 = $("#reg-pass").value;
  const p2 = $("#reg-pass2").value;
  const msg = $("#reg-msg");
  if (!/^\d{8}$/.test(sid)) { msg.style.color = "var(--danger)"; msg.textContent = "学号必须为 8 位数字"; return; }
  if (p1.length < 6) { msg.style.color = "var(--danger)"; msg.textContent = "密码至少 6 位"; return; }
  if (p1 !== p2) { msg.style.color = "var(--danger)"; msg.textContent = "两次输入的密码不一致"; return; }
  if (getAllUsers().some((x) => x.username === sid)) { msg.style.color = "var(--danger)"; msg.textContent = "该学号已注册，请直接登录"; return; }
  const reg = [];
  try { reg.push.apply(reg, JSON.parse(localStorage.getItem("reg_users") || "[]")); } catch (e) {}
  reg.push({ username: sid, password: p1, name: sid, studentId: sid, major: "—" });
  localStorage.setItem("reg_users", JSON.stringify(reg));
  msg.style.color = "var(--ok, #16a34a)";
  msg.textContent = "✓ 注册成功，请点击下方返回登录";
}

function logout() {
  localStorage.removeItem("static_user");
  currentUser = null;
  $("#li-user").value = "";
  $("#li-pass").value = "";
  $("#li-remember").checked = false;
  $("#app").style.display = "none";
  $("#login").style.display = "flex";
}

function showApp() {
  $("#login").style.display = "none";
  $("#app").style.display = "flex";
  applyAvatar();
  const isT = currentUser.role === "teacher";
  $("#aiCard").style.display = isT ? "none" : "block";
  renderNav();
  navigate(isT ? "t-dashboard" : "home");
}

/* ---------------- 个人资料存储 ---------------- */
function getProfile(u) {
  let map = {};
  try { map = JSON.parse(localStorage.getItem("profiles") || "{}"); } catch (e) {}
  return map[u] || {};
}
function setProfile(u, patch) {
  let map = {};
  try { map = JSON.parse(localStorage.getItem("profiles") || "{}"); } catch (e) {}
  map[u] = Object.assign(map[u] || {}, patch);
  localStorage.setItem("profiles", JSON.stringify(map));
}
function checkPass(u, p) {
  const ov = {};
  try { Object.assign(ov, JSON.parse(localStorage.getItem("pwd_override") || "{}")); } catch (e) {}
  if (ov[u] != null) return ov[u] === p;
  const base = getAllUsers().find((x) => x.username === u);
  return base && base.password === p;
}
function applyAvatar() {
  const av = $("#topAvatar");
  if (!av || !currentUser) return;
  const prof = getProfile(currentUser.username);
  const text = (prof.avatarText && prof.avatarText.trim()) || currentUser.nickname || currentUser.name || currentUser.username;
  if (prof.avatarImg) {
    av.textContent = "";
    av.style.background = "center/cover no-repeat url(" + prof.avatarImg + ")";
  } else {
    av.textContent = text.slice(0, 8);
    av.style.background = prof.avatarColor || "linear-gradient(135deg,var(--accent),var(--primary))";
  }
}

/* ---------------- 头像菜单 ---------------- */
function toggleAvatarMenu() {
  $("#avatarMenu").classList.toggle("show");
}
function openProfile() {
  $("#avatarMenu").classList.remove("show");
  const m = $("#menuWho");
  m.innerHTML = '<div style="font-size:13px;color:var(--text-2)">学号 ' + currentUser.sid + '</div>' +
    '<div style="font-size:15px;color:var(--text);font-weight:800;margin-top:2px">' + esc(currentUser.nickname || currentUser.name) + '</div>';
  $("#profileMask").style.display = "flex";
  renderProfileTab("info");
}
function closeProfile() { $("#profileMask").style.display = "none"; }

function renderProfileTab(tab) {
  document.querySelectorAll("#profileTabs .tab").forEach((t) => t.classList.toggle("cur", t.getAttribute("data-tab") === tab));
  const body = $("#profileBody");
  const prof = getProfile(currentUser.username);
  if (tab === "info") {
    const infoBg = prof.avatarImg ? ("center/cover no-repeat url(" + prof.avatarImg + ")") : (prof.avatarColor || "linear-gradient( 135deg,var(--accent),var(--primary))");
    const infoText = prof.avatarImg ? "" : ((prof.avatarText || currentUser.name || currentUser.username).slice(0, 2));
    const nm = (currentUser.name && currentUser.name !== currentUser.sid) ? currentUser.name : "未填写";
    let html =
      '<div style="display:flex;align-items:center;gap:14px;padding:6px 4px 16px">' +
        '<div class="avatar lg" style="width:64px;height:64px;font-size:20px;background:' + infoBg + '">' + infoText + '</div>' +
        '<div><div style="font-size:17px;font-weight:800">' + esc(nm) + '</div>' +
        '<div style="font-size:12px;color:var(--text-2);margin-top:3px">学号 ' + currentUser.sid + '</div></div>' +
      '</div>' +
      '<div class="info-list">' +
        '<div class="info-row"><span class="info-label">姓名</span><span class="info-val">' + esc(nm) + '</span></div>' +
        '<div class="info-row"><span class="info-label">学号</span><span class="info-val">' + currentUser.sid + '</span></div>' +
        '<div class="info-row"><span class="info-label">学院</span><span class="info-val">' + (currentUser.major && currentUser.major !== "—" ? esc(currentUser.major) : "未填写") + '</span></div>' +
        '<div class="info-row"><span class="info-label">专业</span><span class="info-val">' + (currentUser.specialty ? esc(currentUser.specialty) : "未填写") + '</span></div>' +
        '<div class="info-row"><span class="info-label">班级</span><span class="info-val">' + (currentUser.cls ? esc(currentUser.cls) : "未填写") + '</span></div>' +
        '<div class="info-row"><span class="info-label">联系方式</span><span class="info-val">' + (currentUser.contact ? esc(currentUser.contact) : "未填写") + '</span></div>' +
      '</div>' +
      '<button class="btn ghost" style="margin-top:14px;width:100%" onclick="editInfo()">编辑资料</button>';
    body.innerHTML = html;
  } else if (tab === "nick") {
    body.innerHTML =
      '<div class="field"><label>当前昵称</label><div class="muted" style="padding:4px 0">' + esc(currentUser.nickname || currentUser.name) + '</div></div>' +
      '<div class="field"><label>新昵称</label><input id="nf-nick" placeholder="输入新的昵称" value="' + esc(currentUser.nickname || "") + '" /></div>' +
      '<button class="btn" style="margin-top:10px" onclick="saveNick()">保存昵称</button>' +
      '<p id="nick-msg" class="muted" style="min-height:16px;font-size:12px;margin-top:8px;color:var(--success)"></p>';
  } else if (tab === "avatar") {
    const colors = ["linear-gradient(135deg,#8AA9F0,#5E82D8)", "linear-gradient(135deg,#FFB49E,#FF8C7A)", "linear-gradient(135deg,#A99CF5,#7C6FD6)", "linear-gradient(135deg,#62CBA0,#3FA98A)", "linear-gradient(135deg,#F5C26B,#E0A23C)", "linear-gradient(135deg,#69B7E8,#4A93C9)"];
    const cur = prof.avatarImg || "";
    const prevBg = cur ? ("center/cover no-repeat url(" + cur + ")") : (prof.avatarColor || colors[0]);
    const prevText = cur ? "" : ((prof.avatarText || currentUser.nickname || currentUser.name || currentUser.username).slice(0, 2));
    let html = '<div style="text-align:center;padding:8px 0 14px"><div class="avatar lg" id="av-prev" style="width:72px;height:72px;font-size:22px;margin:0 auto;background:' + prevBg + '" data-img="' + cur + '">' + prevText + '</div></div>';
    html += '<div class="field"><label>上传头像图片（不超过 2MB）</label><input type="file" id="av-file" accept="image/*" onchange="uploadAvatar(this)" /></div>';
    html += '<div class="field"><label>头像文字（无图片时生效，最多 2 字）</label><input id="av-text" maxlength="2" placeholder="留空则用昵称" value="' + esc(prof.avatarText || "") + '" oninput="updAvPrev()" /></div>';
    html += '<div style="font-size:12px;color:var(--text-3);margin:6px 0 8px">选择底色（无图片时生效）</div><div class="swatches">';
    colors.forEach((c) => { html += '<span class="sw" style="background:' + c + '" onclick="pickColor(\'' + c + '\')"></span>'; });
    html += '</div>';
    if (cur) html += '<button class="btn ghost" style="margin-top:10px" onclick="removeAvatar()">移除图片，使用文字头像</button>';
    html += '<button class="btn" style="margin-top:14px" onclick="saveAvatar()">保存头像</button>';
    body.innerHTML = html;
  } else if (tab === "pwd") {
    body.innerHTML =
      '<div class="field"><label>当前密码</label><input id="pw-old" type="password" placeholder="请输入当前密码" /></div>' +
      '<div class="field"><label>新密码</label><input id="pw-new" type="password" placeholder="至少 6 位" /></div>' +
      '<div class="field"><label>确认新密码</label><input id="pw-new2" type="password" placeholder="再次输入新密码" /></div>' +
      '<button class="btn" style="margin-top:10px" onclick="savePwd()">修改密码</button>' +
      '<p id="pw-msg" class="muted" style="min-height:16px;font-size:12px;margin-top:8px;color:var(--danger)"></p>';
  }
}
function updAvPrev() {
  const t = $("#av-text").value.trim() || currentUser.nickname || currentUser.name || currentUser.username;
  const prev = $("#av-prev");
  if (!prev.getAttribute("data-img")) prev.textContent = t.slice(0, 2);
}
function pickColor(c) { $("#av-prev").style.background = c; $("#av-prev").setAttribute("data-c", c); }
function uploadAvatar(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { toast("图片过大，请选择 2MB 以内的图片"); return; }
  const reader = new FileReader();
  reader.onload = function () {
    const url = reader.result;
    const prev = $("#av-prev");
    prev.style.background = "center/cover no-repeat url(" + url + ")";
    prev.setAttribute("data-img", url);
    prev.textContent = "";
  };
  reader.readAsDataURL(file);
}
function removeAvatar() {
  const prev = $("#av-prev");
  const prof = getProfile(currentUser.username);
  prev.setAttribute("data-img", "");
  prev.style.background = prof.avatarColor || "linear-gradient(135deg,#8AA9F0,#5E82D8)";
  prev.textContent = (prof.avatarText || currentUser.nickname || currentUser.name || currentUser.username).slice(0, 2);
}
function saveNick() {
  const v = $("#nf-nick").value.trim();
  if (!v) { $("#nick-msg").style.color = "var(--danger)"; $("#nick-msg").textContent = "昵称不能为空"; return; }
  setProfile(currentUser.username, { avatarText: "", nickname: v });
  currentUser.nickname = v;
  applyAvatar();
  $("#nick-msg").textContent = "✓ 昵称已更新";
  setTimeout(() => { $("#nick-msg").textContent = ""; }, 1500);
}
function saveAvatar() {
  const img = $("#av-prev").getAttribute("data-img") || "";
  const c = $("#av-prev").getAttribute("data-c") || getProfile(currentUser.username).avatarColor || "linear-gradient(135deg,#8AA9F0,#5E82D8)";
  const t = $("#av-text").value.trim();
  setProfile(currentUser.username, { avatarColor: c, avatarText: t, avatarImg: img });
  applyAvatar();
  toast("✓ 头像已更新");
  renderProfileTab("info");
}
function editInfo() {
  const body = $("#profileBody");
  body.innerHTML =
    '<div class="field"><label>姓名</label><input id="inf-name" value="' + esc(currentUser.name || "") + '" placeholder="请输入姓名" /></div>' +
    '<div class="field"><label>学号</label><input value="' + currentUser.sid + '" disabled style="opacity:.7" /></div>' +
    '<div class="field"><label>学院</label><input id="inf-major" value="' + esc(currentUser.major && currentUser.major !== "—" ? currentUser.major : "") + '" placeholder="如 计算机学院" /></div>' +
    '<div class="field"><label>专业</label><input id="inf-spec" value="' + esc(currentUser.specialty || "") + '" placeholder="如 计算机科学与技术" /></div>' +
    '<div class="field"><label>班级</label><input id="inf-class" value="' + esc(currentUser.cls || "") + '" placeholder="如 计科2301班" /></div>' +
    '<div class="field"><label>联系方式</label><input id="inf-contact" value="' + esc(currentUser.contact || "") + '" placeholder="手机或邮箱" /></div>' +
    '<div style="display:flex;gap:10px;margin-top:14px">' +
      '<button class="btn" onclick="saveInfo()">保存</button>' +
      '<button class="btn ghost" onclick="renderProfileTab(\'info\')">取消</button>' +
    '</div>';
}
function saveInfo() {
  const name = $("#inf-name").value.trim();
  const major = $("#inf-major").value.trim();
  const spec = $("#inf-spec").value.trim();
  const cls = $("#inf-class").value.trim();
  const contact = $("#inf-contact").value.trim();
  if (!name) { toast("姓名不能为空"); return; }
  currentUser.name = name;
  currentUser.major = major || "—";
  currentUser.specialty = spec;
  currentUser.cls = cls;
  currentUser.contact = contact;
  setProfile(currentUser.username, { name: name, major: currentUser.major, specialty: spec, cls: cls, contact: contact });
  applyAvatar();
  toast("✓ 资料已更新");
  renderProfileTab("info");
}
function savePwd() {
  const oldP = $("#pw-old").value, newP = $("#pw-new").value, newP2 = $("#pw-new2").value;
  const msg = $("#pw-msg");
  if (!checkPass(currentUser.username, oldP)) { msg.textContent = "当前密码错误"; return; }
  if (newP.length < 6) { msg.textContent = "新密码至少 6 位"; return; }
  if (newP !== newP2) { msg.textContent = "两次输入的新密码不一致"; return; }
  const reg = [];
  try { reg.push.apply(reg, JSON.parse(localStorage.getItem("reg_users") || "[]")); } catch (e) {}
  const i = reg.findIndex((x) => x.username === currentUser.username);
  if (i >= 0) { reg[i].password = newP; localStorage.setItem("reg_users", JSON.stringify(reg)); }
  else { const ov = {}; try { Object.assign(ov, JSON.parse(localStorage.getItem("pwd_override") || "{}")); } catch (e) {} ov[currentUser.username] = newP; localStorage.setItem("pwd_override", JSON.stringify(ov)); }
  msg.style.color = "var(--success)"; msg.textContent = "✓ 密码已修改";
  $("#pw-old").value = ""; $("#pw-new").value = ""; $("#pw-new2").value = "";
}

/* ---------------- 顶部通知 ---------------- */
const NOTIFS = [
  { ic: "clipboard", title: "新作业发布", desc: "《学术写作与规范》第三次随笔", time: "10 分钟前", to: "learn:1" },
  { ic: "map-pin", title: "课堂签到提醒", desc: "数据科学导论 第 5 讲 10:00 开始", time: "1 小时前", to: "signin" },
  { ic: "message", title: "教师回复了你", desc: "王怀安：方差与标准差的区别已补充", time: "昨天", to: "learn:1" },
];

function renderNotif() {
  const box = $("#notifyPanel");
  box.innerHTML = '<div class="nt-head"><span>通知</span><span class="muted">共 ' + NOTIFS.length + ' 条</span></div>';
  if (!NOTIFS.length) { box.innerHTML += '<div class="nt-empty">暂无通知</div>'; return; }
  NOTIFS.forEach((n) => {
    const item = el("div", "nt-item");
    const icBox = el("div", "nt-ic"); icBox.innerHTML = icon(n.ic, 18);
    const body = el("div"); body.style.flex = "1";
    body.innerHTML = '<div style="font-weight:700">' + esc(n.title) + '</div><div class="nt-body">' + esc(n.desc) + '</div>';
    const t = el("div", "muted"); t.style.fontSize = "11px"; t.style.whiteSpace = "nowrap"; t.textContent = n.time;
    item.appendChild(icBox); item.appendChild(body); item.appendChild(t);
    item.onclick = () => { box.classList.remove("show"); const [k, cid] = n.to.split(":"); navigate(k); if (cid) openCourse(+cid, true); };
    box.appendChild(item);
  });
}

/* ---------------- 导航 ---------------- */
const NAV = [
  { key: "home", ic: "book-open", label: "课程中心" },
  { key: "aichat", ic: "bot", label: "AI 课堂" },
  { key: "dashboard", ic: "bar-chart", label: "学情看板" },
  { key: "signin", ic: "check-circle", label: "课堂签到" },
];
const NAV_TEACHER = [
  { key: "t-dashboard", ic: "bar-chart", label: "学情概览" },
  { key: "t-courses", ic: "book-open", label: "我的课程" },
  { key: "t-announce", ic: "bell", label: "公告管理" },
  { key: "t-students", ic: "users", label: "学生名单" },
];

function renderNav() {
  const nav = $("#nav");
  nav.innerHTML = "";
  const isT = currentUser.role === "teacher";
  $("#sidebarSub").textContent = isT ? "教师端" : "学生端";
  const ITEMS = isT ? NAV_TEACHER : NAV;
  ITEMS.forEach((n) => {
    const item = el("div", "nav-item" + (n.key === activeNav ? " active" : ""));
    const ic = el("span", "ic"); ic.innerHTML = icon(n.ic, 18);
    item.appendChild(ic);
    item.appendChild(el("span", null, n.label));
    item.onclick = () => navigate(n.key);
    nav.appendChild(item);
  });
}

function navigate(key) {
  activeNav = key;
  renderNav();
  const v = $("#view");
  v.innerHTML = "";
  hideCrumb();
  if (key === "home") return renderHome(v);
  if (key === "aichat") return renderAIChat(v);
  if (key === "dashboard") return renderDashboard(v);
  if (key === "signin") return renderSignin(v);
  if (key === "t-dashboard") return tDashboard(v);
  if (key === "t-courses") return tCourses(v);
  if (key === "t-announce") return tAnnouncements(v);
  if (key === "t-students") return tRoster(v);
}

/* ---------------- 面包屑 ---------------- */
function showCrumb(parts) {
  const v = $("#view");
  let cr = $("#crumb");
  if (!cr) { cr = el("div", "crumb"); cr.id = "crumb"; v.parentNode.insertBefore(cr, v); }
  cr.className = "crumb show";
  cr.innerHTML = "";
  parts.forEach((p, i) => {
    if (i > 0) cr.appendChild(Object.assign(el("span", "sep"), { textContent: "/" }));
    const item = el("span", "c-item" + (i === parts.length - 1 ? " cur" : ""), p.label);
    if (p.onclick) item.onclick = p.onclick;
    cr.appendChild(item);
  });
}
function hideCrumb() { const c = $("#crumb"); if (c) c.className = "crumb"; }

/* ---------------- 课程中心（含搜索过滤） ---------------- */
function renderHome(v) {
  v.appendChild(el("div", "h-title", "课程中心"));
  v.appendChild(el("p", "h-sub", currentUser.name + "，" + currentUser.major + " · 这里有你的通识课程"));

  const grid = el("div", "course-grid");
  v.appendChild(grid);

  const list = COURSES.filter((c) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (c.title + c.teacher + c.category + (c.desc || "")).toLowerCase().includes(s);
  });

  if (!list.length) {
    grid.innerHTML = '<div class="card" style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-3)">未找到与「' + esc(searchTerm) + '」相关的课程</div>';
    return;
  }
  list.forEach((c) => {
    const card = el("div", "course-card");
    const cover = el("div", "course-cover", c.coverText);
    cover.style.background = c.coverColor;
    const body = el("div", "course-body");
    body.appendChild(el("h4", null, c.title));
    body.appendChild(el("div", "course-meta", c.category + " · " + c.teacher));
    const prog = el("div", "progress");
    const span = el("span");
    const saved = NF(localStorage.getItem("progress_" + c.id));
    const pct = saved || c.progress;
    span.style.width = pct + "%";
    prog.appendChild(span);
    body.appendChild(prog);
    card.appendChild(cover);
    card.appendChild(body);
    card.onclick = () => openCourse(c.id);
    grid.appendChild(card);
  });

  // 通知公告（本人课程 + 全校）
  const anns = ANNOUNCEMENTS.filter((a) => !a.course_id || COURSES.some((c) => c.id === a.course_id)).slice(0, 3);
  if (anns.length) {
    const box = el("div", "card");
    box.style.cssText = "margin-top:22px;padding:18px";
    box.appendChild(el("div", "h-title2", "📢 通知公告"));
    const list = el("div", "ann-list");
    anns.forEach((a) => {
      const item = el("div", "ann-item");
      item.innerHTML = `<div class="ann-title">${esc(a.title)}<span class="ann-course">${esc(a.course_title || "全校")}</span></div><div class="ann-content">${esc(a.content)}</div><div class="muted2" style="margin-top:6px">${esc(a.created_at)}</div>`;
      list.appendChild(item);
    });
    box.appendChild(list);
    v.appendChild(box);
  }
}

$("#topSearch").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim();
  if (activeNav === "home") renderHome($("#view"));
});

/* ---------------- 学习页 ---------------- */
function openCourse(id, skipNav) {
  const c = COURSES.find((x) => x.id === id);
  if (!c) return;
  const v = $("#view");
  activeNav = "learn";
  renderNav();
  showCrumb([
    { label: "课程中心", onclick: () => { activeNav = "home"; renderNav(); hideCrumb(); renderHome($("#view")); } },
    { label: c.title },
  ]);
  renderLearn(v, c);
}

function renderLearn(v, c) {
  v.appendChild(el("h1", "h-title", c.title));
  const saved = NF(localStorage.getItem("progress_" + c.id)) || c.progress;
  v.appendChild(el("p", "h-sub", c.category + " · " + c.teacher + " · 进度 " + saved + "%"));

  if (!c.sections || c.sections.length === 0) {
    const empty = el("div", "card");
    empty.style.textAlign = "center"; empty.style.padding = "64px 20px"; empty.style.color = "var(--text-3)";
    empty.innerHTML = '<div style="font-size:46px;opacity:.6">📭</div>' +
      '<div style="font-size:18px;margin-top:14px;color:var(--text-2);font-weight:800;font-family:var(--font-serif)">老师暂未上传数据</div>' +
      '<div style="margin-top:8px">本课程的内容正在准备中，请稍后再来查看～</div>';
    v.appendChild(empty);
    return;
  }

  const learn = el("div", "learn");
  const chapter = el("div", "chapter");
  const panel = el("div", "card");

  const videos = c.sections.filter((s) => s.stype === "video");
  const docs = c.sections.filter((s) => s.stype === "doc");
  const quizzes = c.sections.filter((s) => s.stype === "quiz");

  const player = el("div");
  player.style.cssText = "border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);background:#000";
  const video = document.createElement("video");
  video.controls = true;
  video.style.cssText = "width:100%;display:block;max-height:420px;background:#000";
  if (videos[0]) video.src = videos[0].content;
  video.addEventListener("timeupdate", () => {
    if (!video.duration) return;
    const ratio = Math.min(100, Math.round((video.currentTime / video.duration) * 100));
    const key = "progress_" + c.id;
    const prev = NF(localStorage.getItem(key)) || 0;
    if (ratio > prev) { localStorage.setItem(key, ratio); refreshProgressLabel(c, ratio); }
  });
  player.appendChild(video);

  const tabs = el("div", "learn-tabs");
  const tabDefs = [
    { key: "video", label: "视频", show: videos.length },
    { key: "doc", label: "资料", show: docs.length },
    { key: "quiz", label: "章节测验", show: quizzes.length },
    { key: "discussion", label: "课程讨论", show: true },
  ];
  let curTab = "video";

  function renderTab() {
    panel.innerHTML = "";
    if (curTab === "video") {
      panel.appendChild(player);
      chapter.innerHTML = '<div class="ch">章节列表</div>';
      if (videos.length === 0) chapter.appendChild(el("div", "item", "暂无视频"));
      videos.forEach((s, i) => {
        const it = el("div", "item" + (i === 0 ? " active" : ""), s.title);
        it.onclick = () => {
          video.src = s.content; video.play().catch(() => {});
          [...chapter.querySelectorAll(".item")].forEach((x) => x.classList.remove("active"));
          it.classList.add("active");
        };
        chapter.appendChild(it);
      });
    } else if (curTab === "doc") {
      panel.appendChild(el("h3", null, "课程资料"));
      const list = el("div", "card");
      list.style.cssText = "box-shadow:none;border:1px solid var(--border);margin-top:10px";
      if (docs.length === 0) list.appendChild(el("div", "muted", "暂无资料"));
      docs.forEach((s) => {
        const a = el("a", "list-item");
        a.href = s.content; a.target = "_blank";
        a.style.cssText = "text-decoration:none;color:inherit;display:flex;align-items:center;gap:15px;padding:16px 18px;border-bottom:1px solid var(--border)";
        a.innerHTML = '<div class="li-ic" data-icon="file-text"> </div><div class="li-body"><h4>' + esc(s.title) + '</h4><p>点击打开 / 下载</p></div>';
        initIcons(a);
        list.appendChild(a);
      });
      panel.appendChild(list);
      chapter.innerHTML = '<div class="ch">资料列表</div><div class="item active">' + docs.length + " 份资料</div>";
    } else if (curTab === "quiz") {
      panel.appendChild(el("h3", null, "章节测验"));
      const box = el("div", "card");
      box.style.cssText = "box-shadow:none;border:1px solid var(--border);margin-top:10px";
      if (quizzes.length === 0) box.appendChild(el("div", "muted", "暂无测验"));
      quizzes.forEach((s) => {
        const q = el("div", "list-item");
        q.innerHTML = '<div class="li-ic" data-icon="clipboard"> </div><div class="li-body"><h4>' + esc(s.title) + "</h4><p>" + esc(s.content) + "</p></div>";
        initIcons(q);
        box.appendChild(q);
      });
      panel.appendChild(box);
      chapter.innerHTML = '<div class="ch">测验列表</div><div class="item active">' + quizzes.length + " 份测验</div>";
    } else {
      renderDiscussion(panel, c);
      chapter.innerHTML = '<div class="ch">讨论区</div><div class="item active">课程讨论</div>';
    }
  }

  tabs.innerHTML = "";
  tabDefs.forEach((t) => {
    if (!t.show) return;
    const b = el("button", curTab === t.key ? "active" : "", t.label);
    b.onclick = () => { curTab = t.key; [...tabs.children].forEach((x) => x.classList.remove("active")); b.classList.add("active"); renderTab(); };
    tabs.appendChild(b);
  });
  v.appendChild(tabs);

  learn.appendChild(chapter);
  learn.appendChild(panel);
  learn.appendChild(el("div"));
  v.appendChild(learn);
  renderTab();
}

function refreshProgressLabel(c, ratio) {
  const sub = $("#view").querySelector(".h-sub");
  if (sub) sub.textContent = c.category + " · " + c.teacher + " · 进度 " + ratio + "%";
}

/* ---------------- 课程讨论（真实感：时间戳 / 楼层 / 教师徽章） ---------------- */
function renderDiscussion(panel, c) {
  const box = el("div", "chat-box");
  const head = el("div", "chat-head");
  head.innerHTML = icon("message", 18) + " <span>" + esc(c.title) + " · 课程讨论</span>";
  head.style.display = "flex"; head.style.alignItems = "center"; head.style.gap = "9px";
  const msgs = el("div", "chat-msgs");
  const key = "discussions_" + c.id;
  let list = JSON.parse(localStorage.getItem(key) || "null");
  if (!list) { list = (c.discussions || []).map((m, i) => ({ ...m, ts: m.ts || "2026-09-0" + (i + 1) + " 09:1" + i, floor: i + 1 })); localStorage.setItem(key, JSON.stringify(list)); }

  function paint() {
    msgs.innerHTML = "";
    let floor = 0;
    list.forEach((m) => {
      floor++;
      const isMe = m.user === currentUser.name;
      const isTeacher = m.role === "teacher";
      const wrap = el("div", "chat-msg " + (isMe ? "me" : "ai"));
      const meta = el("div", "meta");
      meta.innerHTML = '<span style="font-weight:700">' + esc(m.user) + "</span>" +
        (isTeacher ? '<span class="badge-teacher">教师</span>' : "") +
        "<span>· " + (m.ts || "") + "</span><span>· #" + floor + "楼</span>";
      wrap.appendChild(meta);
      wrap.appendChild(el("div", null, m.content));
      msgs.appendChild(wrap);
    });
    msgs.scrollTop = msgs.scrollHeight;
  }
  paint();

  const input = el("div", "chat-input");
  const ipt = document.createElement("input");
  ipt.placeholder = "说点什么…";
  const send = el("button", "btn ai", "发送");
  send.onclick = () => {
    const v = ipt.value.trim();
    if (!v) return;
    const ts = new Date();
    const hh = String(ts.getHours()).padStart(2, "0");
    const mm = String(ts.getMinutes()).padStart(2, "0");
    list.push({ user: currentUser.name, content: v, ts: "今天 " + hh + ":" + mm, floor: list.length + 1 });
    localStorage.setItem(key, JSON.stringify(list));
    ipt.value = "";
    paint();
  };
  ipt.addEventListener("keydown", (e) => { if (e.key === "Enter") send.onclick(); });
  input.appendChild(ipt);
  input.appendChild(send);

  box.appendChild(head);
  box.appendChild(msgs);
  box.appendChild(input);
  panel.appendChild(box);
}

/* ---------------- AI 课堂 ---------------- */
function renderAIChat(v) {
  v.appendChild(el("div", "h-title", "AI 互动课堂"));
  v.appendChild(el("p", "h-sub", "基于 OpenMAIC 的多智能体课堂，随时与 AI 助教对话"));

  const banner = el("div", "ai-banner");
  banner.innerHTML = '<div class="emoji" data-icon="bot" style="font-size:40px;color:#6B5BD8"> </div><div><h3>多智能体 AI 课堂已就绪</h3><p>点击右侧按钮，进入真实的 AI 互动课堂（教师 / 助教 / 学伴 三种智能体）</p></div>';
  const btn = el("button", "btn ai", "打开 AI 互动课堂");
  btn.style.marginLeft = "auto";
  btn.onclick = () => window.open(AI_CLASSROOM_URL, "_blank");
  banner.appendChild(btn);
  v.appendChild(banner);
  initIcons(banner);

  const agents = el("div", "ai-agent");
  const defs = [
    { cls: "teacher", face: "师", role: "教师智能体", name: "主讲教师", desc: "讲解知识点、梳理课程脉络", color: "#EAF1FB" },
    { cls: "tutor", face: "助", role: "助教智能体", name: "答疑助教", desc: "解答疑问、布置与批改练习", color: "#F0ECFF" },
    { cls: "mate", face: "伴", role: "学伴智能体", name: "AI 学伴", desc: "陪伴讨论、激发思考", color: "#FFEDE5" },
  ];
  defs.forEach((d) => {
    const a = el("div", "agent " + d.cls);
    const face = el("div", "face", d.face);
    face.style.cssText = "width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;background:#fff;color:#5E82D8";
    a.appendChild(face);
    a.appendChild(el("span", "role", d.role));
    a.appendChild(el("h4", null, d.name));
    a.appendChild(el("p", null, d.desc));
    agents.appendChild(a);
  });
  v.appendChild(agents);

  const chat = el("div", "chat-box");
  chat.style.height = "300px";
  chat.innerHTML =
    '<div class="chat-head">' + icon("sparkles", 18) + ' <span>示例对话</span></div>' +
    '<div class="chat-msgs"><div class="chat-msg ai"><div class="meta"><span style="font-weight:700">答疑助教</span></div>同学你好，我是本课 AI 助教。有什么想了解的吗？</div>' +
    '<div class="chat-msg me"><div class="meta"><span style="font-weight:700">' + esc(currentUser.name) + '</span></div>能帮我总结一下第 1 章的核心概念吗？</div>' +
    '<div class="chat-msg ai"><div class="meta"><span style="font-weight:700">答疑助教</span></div>当然！第 1 章围绕「数据思维」展开，重点是从业务问题出发，明确要回答什么问题、需要哪些数据……</div></div>';
  v.appendChild(chat);
}

/* ---------------- 学情看板 ---------------- */
function renderDashboard(v) {
  const c = COURSES[0];
  const a = c.analytics || { studyHours: 0, videoProgress: 0, avgScore: 0, weekly: [] };
  v.appendChild(el("div", "h-title", "学情看板"));
  v.appendChild(el("p", "h-sub", currentUser.name + " · " + currentUser.major + " · 学习概览（示例数据）"));

  const stats = el("div", "stat-grid");
  [
    { ic: "clock", num: a.studyHours + " h", lbl: "累计学习时长" },
    { ic: "video", num: a.videoProgress + "%", lbl: "视频完成度" },
    { ic: "clipboard", num: a.avgScore, lbl: "作业平均得分" },
    { ic: "check-circle", num: "12 / 16", lbl: "签到记录" },
  ].forEach((s) => {
    const card = el("div", "stat");
    const ic = el("div", "ic"); ic.style.background = "var(--primary-soft)"; ic.style.color = "var(--primary-deep)"; ic.innerHTML = icon(s.ic, 22);
    card.appendChild(ic);
    card.appendChild(el("div", "num", s.num));
    card.appendChild(el("div", "lbl", s.lbl));
    stats.appendChild(card);
  });
  v.appendChild(stats);

  const chartCard = el("div", "chart-card");
  chartCard.appendChild(el("div", "h-title2", "本周学习时长（分钟）"));
  const bars = el("div", "bars");
  (a.weekly || []).forEach((w) => {
    const bar = el("div", "bar");
    const col = el("div", "col");
    col.style.height = w.val + "px";
    bar.appendChild(col);
    bar.appendChild(el("div", "lab", w.label));
    bars.appendChild(bar);
  });
  chartCard.appendChild(bars);
  v.appendChild(chartCard);
}

/* ---------------- 课堂签到 ---------------- */
function renderSignin(v) {
  v.appendChild(el("div", "h-title", "课堂签到"));
  v.appendChild(el("p", "h-sub", "线下课程定位签到 / 扫码签到"));

  const card = el("div", "signin-task");
  const left = el("div");
  left.appendChild(el("div", "st-course", "数据科学导论 · 第 5 讲"));
  left.appendChild(el("div", "muted", "签到时间：2026-09-15 10:00 - 10:15"));
  const btn = el("button", "btn", "立即签到");
  let done = false;
  btn.onclick = () => {
    if (done) return;
    done = true;
    btn.textContent = "✅ 已签到";
    btn.className = "btn ai";
    card.style.background = "linear-gradient(120deg,var(--ai-soft),var(--accent-soft))";
    toast("签到成功，已记录于「数据科学导论」");
  };
  card.appendChild(left);
  card.appendChild(btn);
  v.appendChild(card);

  const panel = el("div", "signin-panel");
  panel.innerHTML =
    '<div class="sp-map"><span data-icon="map-pin" style="font-size:22px"> </span><div class="sp-pin">校本部 · 教学楼 A302</div></div>' +
    '<div class="sp-info">定位签到需授权浏览器位置；或请教师出示课堂二维码进行扫码签到。</div>';
  v.appendChild(panel);
  initIcons(panel);
}

/* ---------------- 启动 ---------------- */
(function init() {
  // 铃铛
  $("#bellBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    const p = $("#notifyPanel");
    p.classList.toggle("show");
    renderNotif();
  });
  document.addEventListener("click", (e) => {
    const p = $("#notifyPanel");
    if (p && !$("#bellBtn").contains(e.target)) p.classList.remove("show");
    const am = $("#avatarMenu");
    if (am && !$("#topAvatar").parentNode.contains(e.target)) am.classList.remove("show");
  });

  document.querySelectorAll("#profileTabs .tab").forEach((t) => {
    t.addEventListener("click", () => renderProfileTab(t.getAttribute("data-tab")));
  });

  const saved = localStorage.getItem("static_user");
  if (saved) { try { currentUser = JSON.parse(saved); } catch (e) { currentUser = null; } }
  if (currentUser) showApp();
  else { $("#login").style.display = "flex"; $("#app").style.display = "none"; $("#li-pass").addEventListener("keydown", () => {}); }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || $("#login").style.display === "none") return;
    if ($("#regForm").style.display !== "none") { doRegister(); return; }
    if (e.target.id === "li-user" || e.target.id === "li-pass") doLogin();
  });

  initIcons();
})();
