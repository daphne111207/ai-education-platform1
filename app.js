/* =========================================================
   研究生通识课 AI 教育平台 · 学生端（静态展示版）
   纯前端：登录用 localStorage，数据来自 data.js，无后端请求。
   ========================================================= */

const $ = (s) => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let currentUser = null;

/* ---------------- 登录 / 退出 ---------------- */
function doLogin() {
  const u = $("#li-user").value.trim();
  const p = $("#li-pass").value;
  const user = USERS.find((x) => x.username === u && x.password === p);
  if (!user) {
    $("#li-err").textContent = "用户名或密码错误，或该账号未下发";
    return;
  }
  currentUser = { username: user.username, name: user.name, avatar: user.avatar, role: user.role || "student" };
  localStorage.setItem("static_user", JSON.stringify(currentUser));
  showApp();
}

function logout() {
  localStorage.removeItem("static_user");
  currentUser = null;
  $("#app").style.display = "none";
  $("#login").style.display = "flex";
}

function showApp() {
  $("#login").style.display = "none";
  $("#app").style.display = "flex";
  $("#topAvatar").textContent = currentUser.avatar;
  const isT = currentUser.role === "teacher";
  $("#aiCard").style.display = isT ? "none" : "block";
  renderNav();
  navigate(isT ? "t-dashboard" : "home");
}

/* ---------------- 导航 ---------------- */
const NAV = [
  { key: "home", ic: "📚", label: "课程中心" },
  { key: "aichat", ic: "🤖", label: "AI 课堂" },
  { key: "dashboard", ic: "📈", label: "学情看板" },
  { key: "signin", ic: "✅", label: "课堂签到" },
];
let activeNav = "home";

function renderNav() {
  const nav = $("#nav");
  nav.innerHTML = "";
  const isT = currentUser.role === "teacher";
  $("#sidebarSub").textContent = isT ? "教师端" : "学生端";
  const ITEMS = isT ? [
    { key: "t-dashboard", ic: "📈", label: "学情概览" },
    { key: "t-courses", ic: "📚", label: "我的课程" },
    { key: "t-announce", ic: "📢", label: "公告管理" },
    { key: "t-students", ic: "👥", label: "学生名单" },
  ] : NAV;
  ITEMS.forEach((n) => {
    const item = el("div", "nav-item" + (n.key === activeNav ? " active" : ""));
    item.innerHTML = `<span class="ic">${n.ic}</span><span>${n.label}</span>`;
    item.onclick = () => navigate(n.key);
    nav.appendChild(item);
  });
}

function navigate(key, courseId) {
  activeNav = key;
  renderNav();
  const v = $("#view");
  v.innerHTML = "";
  if (key === "home") return renderHome(v);
  if (key === "aichat") return renderAIChat(v);
  if (key === "dashboard") return renderDashboard(v);
  if (key === "signin") return renderSignin(v);
  if (key === "t-dashboard") return tDashboard(v);
  if (key === "t-courses") return tCourses(v);
  if (key === "t-announce") return tAnnouncements(v);
  if (key === "t-students") return tRoster(v);
}

/* ---------------- 课程中心 ---------------- */
function renderHome(v) {
  v.appendChild(el("div", "h-title", "课程中心"));
  v.appendChild(el("p", "h-sub", `你好，${currentUser.name}，这里有你的通识课程`));

  const grid = el("div", "course-grid");
  COURSES.forEach((c) => {
    const card = el("div", "course-card");
    const cover = el("div", "course-cover", c.cover);
    cover.style.background = "linear-gradient(135deg,var(--primary-soft),var(--ai-soft))";
    const body = el("div", "course-body");
    body.appendChild(el("h4", null, c.title));
    body.appendChild(el("div", "course-meta", `${c.category} · ${c.teacher}`));
    const prog = el("div", "progress");
    const span = el("span");
    span.style.width = c.progress + "%";
    prog.appendChild(span);
    body.appendChild(prog);
    card.appendChild(cover);
    card.appendChild(body);
    card.onclick = () => openCourse(c.id);
    grid.appendChild(card);
  });
  v.appendChild(grid);

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

function openCourse(id) {
  const c = COURSES.find((x) => x.id === id);
  if (!c) return;
  activeNav = "learn";
  renderNav();
  renderLearn($("#view"), c);
}

/* ---------------- 学习页 ---------------- */
function renderLearn(v, c) {
  v.appendChild(el("h1", "h-title", c.title));
  v.appendChild(el("p", "h-sub", `${c.category} · ${c.teacher} · 进度 ${c.progress}%`));

  // 空课程占位
  if (!c.sections || c.sections.length === 0) {
    const empty = el("div", "card");
    empty.style.textAlign = "center";
    empty.style.padding = "64px 20px";
    empty.style.color = "var(--text-3)";
    empty.innerHTML =
      '<div style="font-size:46px">📭</div>' +
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

  // 默认展示第一个视频
  const player = el("div");
  player.style.cssText = "border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);background:#000";
  const video = document.createElement("video");
  video.controls = true;
  video.style.cssText = "width:100%;display:block;max-height:420px;background:#000";
  if (videos[0]) video.src = videos[0].content;
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
        const it = el("div", "item" + (i === 0 ? " active" : ""), "▶ " + s.title);
        it.onclick = () => {
          video.src = s.content;
          video.play().catch(() => {});
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
        a.href = s.content;
        a.target = "_blank";
        a.style.cssText = "text-decoration:none;color:inherit;display:flex;align-items:center;gap:15px;padding:16px 18px;border-bottom:1px solid var(--border)";
        a.innerHTML = '<div class="li-ic">📄</div><div class="li-body"><h4>' + esc(s.title) + '</h4><p>点击打开 / 下载</p></div>';
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
        q.innerHTML = '<div class="li-ic">📝</div><div class="li-body"><h4>' + esc(s.title) + "</h4><p>" + esc(s.content) + "</p></div>";
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
  learn.appendChild(el("div")); // 右侧占位（保持三栏布局）
  v.appendChild(learn);
  renderTab();
}

/* ---------------- 课程讨论（localStorage 本地留存） ---------------- */
function renderDiscussion(panel, c) {
  const box = el("div", "chat-box");
  const head = el("div", "chat-head", "💬 " + c.title + " · 课程讨论");
  const msgs = el("div", "chat-msgs");
  const key = "discussions_" + c.id;
  let list = JSON.parse(localStorage.getItem(key) || "null");
  if (!list) { list = c.discussions.slice(); localStorage.setItem(key, JSON.stringify(list)); }

  function paint() {
    msgs.innerHTML = "";
    list.forEach((m) => {
      const isMe = m.user === currentUser.name;
      const d = el("div", "msg " + (isMe ? "me" : "ai"), m.content);
      msgs.appendChild(d);
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
    list.push({ user: currentUser.name, content: v, time: new Date().toISOString().slice(0, 10) });
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
  banner.innerHTML = '<div class="emoji">🤖</div><div><h3>多智能体 AI 课堂已就绪</h3><p>点击右侧按钮，进入真实的 AI 互动课堂（教师 / 助教 / 学伴 三种智能体）</p></div>';
  const btn = el("button", "btn ai", "🔗 打开 AI 互动课堂");
  btn.style.marginLeft = "auto";
  btn.onclick = () => window.open(AI_CLASSROOM_URL, "_blank");
  banner.appendChild(btn);
  v.appendChild(banner);

  const agents = el("div", "ai-agent");
  const defs = [
    { cls: "teacher", face: "👩‍🏫", role: "教师智能体", name: "主讲教师", desc: "讲解知识点、梳理课程脉络" },
    { cls: "tutor", face: "🧑‍🏫", role: "助教智能体", name: "答疑助教", desc: "解答疑问、布置与批改练习" },
    { cls: "mate", face: "🐱", role: "学伴智能体", name: "AI 学伴", desc: "陪伴讨论、激发思考" },
  ];
  defs.forEach((d) => {
    const a = el("div", "agent " + d.cls);
    a.innerHTML = `<div class="face">${d.face}</div><span class="role">${d.role}</span><h4>${d.name}</h4><p>${d.desc}</p>`;
    agents.appendChild(a);
  });
  v.appendChild(agents);

  const chat = el("div", "chat-box");
  chat.style.height = "300px";
  chat.innerHTML =
    '<div class="chat-head">💡 示例对话</div>' +
    '<div class="chat-msgs"><div class="msg ai">同学你好，我是本课 AI 助教。有什么想了解的吗？</div><div class="msg me">能帮我总结一下第 1 章的核心概念吗？</div><div class="msg ai">当然！第 1 章围绕「数据思维」展开，重点是从业务问题出发，明确要回答什么问题、需要哪些数据……</div></div>';
  v.appendChild(chat);
}

/* ---------------- 学情看板 ---------------- */
function renderDashboard(v) {
  const c = COURSES[0];
  const a = c.analytics || { studyHours: 0, videoProgress: 0, avgScore: 0, weekly: [] };
  v.appendChild(el("div", "h-title", "学情看板"));
  v.appendChild(el("p", "h-sub", "你的学习概览（示例数据）"));

  const stats = el("div", "stat-grid");
  [
    { ic: "⏱️", num: a.studyHours + " h", lbl: "累计学习时长" },
    { ic: "🎬", num: a.videoProgress + "%", lbl: "视频完成度" },
    { ic: "📝", num: a.avgScore, lbl: "作业平均得分" },
    { ic: "✅", num: "12 / 16", lbl: "签到记录" },
  ].forEach((s) => {
    const card = el("div", "stat");
    const ic = el("div", "ic", s.ic);
    ic.style.background = "linear-gradient(135deg,var(--primary-soft),var(--ai-soft))";
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
  left.appendChild(el("div", "st-course", "数据科学导论 · 第 3 讲"));
  left.appendChild(el("div", "muted", "签到时间：2026-09-08 10:00 - 10:15"));
  const btn = el("button", "btn", "📍 立即签到");
  let done = false;
  btn.onclick = () => {
    if (done) return;
    done = true;
    btn.textContent = "✅ 已签到";
    btn.className = "btn ai";
    card.style.background = "linear-gradient(120deg,var(--ai-soft),var(--accent-soft))";
  };
  card.appendChild(left);
  card.appendChild(btn);
  v.appendChild(card);

  const panel = el("div", "signin-panel");
  panel.innerHTML =
    '<div class="sp-map"><div class="sp-pin">📍</div>校本部 · 教学楼 A302</div>' +
    '<div class="sp-info">定位签到需授权浏览器位置；或请教师出示课堂二维码进行扫码签到。</div>';
  v.appendChild(panel);
}

/* ---------------- 启动 ---------------- */
(function init() {
  const saved = localStorage.getItem("static_user");
  if (saved) {
    try { currentUser = JSON.parse(saved); } catch (e) { currentUser = null; }
  }
  if (currentUser) showApp();
  else { $("#login").style.display = "flex"; $("#app").style.display = "none"; }
  // 回车登录
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && $("#login").style.display !== "none" && (e.target.id === "li-user" || e.target.id === "li-pass")) doLogin();
  });
})();
