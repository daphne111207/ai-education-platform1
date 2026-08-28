/* =========================================================
   教师端（静态展示版）
   纯前端：数据来自 data.js，增删改通过 localStorage 持久化，
   刷新后仍保留，方便点着玩。无后端请求。
   ========================================================= */

// ---- 数据读写（localStorage 覆盖默认值，实现"可操作"效果）----
function _tData() {
  const saved = localStorage.getItem("static_t_courses");
  if (saved) { try { return JSON.parse(saved); } catch (e) {} }
  return JSON.parse(JSON.stringify(COURSES));
}
function _tSave(cs) { localStorage.setItem("static_t_courses", JSON.stringify(cs)); }
function _tAnns() {
  const saved = localStorage.getItem("static_t_anns");
  if (saved) { try { return JSON.parse(saved); } catch (e) {} }
  return ANNOUNCEMENTS.slice();
}
function _tSaveAnns(list) { localStorage.setItem("static_t_anns", JSON.stringify(list)); }

// ---- 通用小组件 ----
function tStat(ic, num, lbl) {
  return `<div class="stat"><div class="ic" style="background:linear-gradient(135deg,var(--primary-soft),var(--ai-soft))">${ic}</div><div class="num">${num}</div><div class="lbl">${lbl}</div></div>`;
}

/* ---------------- 学情概览 ---------------- */
function tDashboard(v) {
  const cs = _tData();
  const anns = _tAnns();
  v.appendChild(el("div", "h-title", "学情概览"));
  v.appendChild(el("p", "h-sub", `你好，${currentUser.name}，这是你的教学班级概览（示例数据）`));

  const stats = el("div", "stat-grid");
  stats.innerHTML =
    tStat("📚", cs.length, "我的课程") +
    tStat("👥", ROSTER.length, "学生数") +
    tStat("📝", cs.reduce((s, c) => s + (c.hw || []).length, 0), "作业总数") +
    tStat("📢", anns.length, "公告总数");
  v.appendChild(stats);

  v.appendChild(el("div", "h-title2", "各课程学情"));
  cs.forEach((c) => {
    const t = c.tStats || { attendance: 0, submitRate: 0, active: 0, students: 0 };
    const card = el("div", "tcard");
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <h3 style="margin:0">${c.cover} ${esc(c.title)}</h3>
        <button class="btn sm" onclick="tCourseDetail(document.getElementById('view'), ${c.id})">管理课程 →</button>
      </div>
      <div class="muted2" style="margin-top:4px">${esc(c.category)} · ${esc(c.teacher)} · 学生 ${t.students} 人 · 章节 ${(c.sections || []).length} · 作业 ${(c.hw || []).length}</div>
      <div class="stat-grid" style="margin-top:12px">
        ${tStat("✅", t.attendance + "%", "出勤率")}
        ${tStat("📤", t.submitRate + "%", "作业提交率")}
        ${tStat("🔥", t.active, "活跃学生")}
      </div>`;
    v.appendChild(card);
  });
}

/* ---------------- 我的课程 ---------------- */
function tCourses(v) {
  const cs = _tData();
  v.appendChild(el("div", "h-title", "我的课程"));
  v.appendChild(el("p", "h-sub", "点击课程进入章节与作业管理（演示：可新增课程、章节、作业）"));

  const grid = el("div", "tgrid");
  cs.forEach((c) => {
    const card = el("div", "tcourse");
    card.innerHTML = `<div class="cover">${c.cover}</div><div class="tt">${esc(c.title)}</div><div class="tm">${esc(c.category)} · ${esc(c.teacher)}</div><div class="tm">章节 ${(c.sections || []).length} 个 · 作业 ${(c.hw || []).length} 份</div>`;
    card.onclick = () => tCourseDetail(v, c.id);
    grid.appendChild(card);
  });
  v.appendChild(grid);

  const add = el("button", "btn", "＋ 新建课程（演示）");
  add.style.marginTop = "16px";
  add.onclick = () => {
    const t = prompt("课程名称：");
    if (!t) return;
    const cs2 = _tData();
    cs2.push({
      id: Date.now(), title: t, teacher: currentUser.name, cover: "📘", category: "通识课",
      desc: "", progress: 0, sections: [], discussions: [], homeworks: [], hw: [],
      tStats: { attendance: 0, submitRate: 0, active: 0, students: 0 },
      analytics: { studyHours: 0, videoProgress: 0, avgScore: 0, weekly: [] },
    });
    _tSave(cs2);
    tCourses(v);
  };
  v.appendChild(add);
}

/* ---------------- 课程管理（章节 + 作业） ---------------- */
function tCourseDetail(v, cid) {
  const cs = _tData();
  const c = cs.find((x) => x.id === cid);
  if (!c) return;
  activeNav = "t-courses";
  renderNav();
  v.innerHTML = "";
  v.appendChild(el("div", "h-title", `${c.cover} ${c.title}`));
  v.appendChild(el("p", "h-sub", `${esc(c.category)} · ${esc(c.teacher)} · 章节 ${(c.sections || []).length} 个`));

  const back = el("button", "btn sm", "← 返回课程列表");
  back.onclick = () => tCourses(v);
  v.appendChild(back);

  // ---- 章节管理 ----
  const secCard = el("div", "tcard");
  secCard.appendChild(el("h3", "", "📑 章节管理"));
  const secs = c.sections || [];
  if (!secs.length) secCard.appendChild(el("div", "muted2", "暂无章节，请在下方添加（演示）"));
  secs.forEach((s, i) => {
    const it = el("div", "sec-item");
    const ic = s.stype === "video" ? "🎬" : s.stype === "quiz" ? "📝" : "📄";
    it.innerHTML = `<span class="st">${ic} ${esc(s.title)}</span><span class="badge">${esc(s.stype)}</span>`;
    const del = el("button", "btn sm", "删除");
    del.onclick = () => { c.sections.splice(i, 1); _tSave(cs); tCourseDetail(v, cid); };
    it.appendChild(del);
    secCard.appendChild(it);
  });
  const row = el("div", "field-row");
  const f1 = el("div", "field");
  f1.innerHTML = '<label>章节标题</label><input id="t-sec-title" placeholder="如 第4章 xxx" />';
  const f2 = el("div", "field");
  f2.innerHTML = '<label>类型</label><select id="t-sec-type"><option value="video">视频</option><option value="doc">资料</option><option value="quiz">测验</option></select>';
  const btn = el("button", "btn sm", "＋ 添加");
  btn.onclick = () => {
    const t = document.getElementById("t-sec-title").value.trim();
    if (!t) return;
    const ty = document.getElementById("t-sec-type").value;
    c.sections.push({ stype: ty, title: t, content: ty === "doc" ? "#" : "（演示内容）" });
    _tSave(cs);
    tCourseDetail(v, cid);
  };
  row.appendChild(f1); row.appendChild(f2); row.appendChild(btn);
  secCard.appendChild(row);
  v.appendChild(secCard);

  // ---- 作业布置与批改 ----
  const hwCard = el("div", "tcard");
  hwCard.appendChild(el("h3", "", "📝 作业布置与批改"));
  const hws = c.hw || [];
  if (!hws.length) hwCard.appendChild(el("div", "muted2", "暂无作业，请在下方布置（演示）"));
  hws.forEach((h) => {
    const it = el("div", "sec-item");
    const n = (h.subs || []).length;
    const graded = (h.subs || []).filter((s) => s.score != null).length;
    it.innerHTML = `<span class="st">${esc(h.title)}<span class="muted2" style="margin-left:8px">截止 ${esc(h.due || "未设")} · 已交 ${n} · 已批 ${graded}</span></span>`;
    const g = el("button", "btn sm", "批改");
    g.onclick = () => tGrade(v, cid, h.title);
    const d = el("button", "btn sm", "删除");
    d.onclick = () => { c.hw = hws.filter((x) => x !== h); _tSave(cs); tCourseDetail(v, cid); };
    it.appendChild(g); it.appendChild(d);
    hwCard.appendChild(it);
  });
  const row2 = el("div", "field-row");
  const g1 = el("div", "field");
  g1.innerHTML = '<label>作业标题</label><input id="t-hw-title" placeholder="如 作业2：xxx" />';
  const g2 = el("div", "field");
  g2.innerHTML = '<label>截止日期</label><input id="t-hw-due" placeholder="2026-09-15" />';
  const b2 = el("button", "btn sm", "＋ 布置");
  b2.onclick = () => {
    const t = document.getElementById("t-hw-title").value.trim();
    if (!t) return;
    c.hw = hws.concat([{ title: t, desc: "", due: document.getElementById("t-hw-due").value, subs: [] }]);
    _tSave(cs);
    tCourseDetail(v, cid);
  };
  row2.appendChild(g1); row2.appendChild(g2); row2.appendChild(b2);
  hwCard.appendChild(row2);
  v.appendChild(hwCard);
}

/* ---------------- 批改作业 ---------------- */
function tGrade(v, cid, htitle) {
  const cs = _tData();
  const c = cs.find((x) => x.id === cid);
  const h = (c.hw || []).find((x) => x.title === htitle);
  if (!c || !h) return;
  v.innerHTML = "";
  v.appendChild(el("div", "h-title", "批改作业"));
  v.appendChild(el("p", "h-sub", `${c.title} · ${htitle}`));
  const back = el("button", "btn sm", "← 返回课程");
  back.onclick = () => tCourseDetail(v, cid);
  v.appendChild(back);

  const tbl = el("table", "tbl");
  const head = el("tr");
  ["学生", "提交内容", "状态", "得分", "操作"].forEach((t) => head.appendChild(el("th", null, t)));
  tbl.appendChild(head);

  const subs = h.subs || [];
  if (!subs.length) {
    const tr = el("tr");
    const td = el("td");
    td.colSpan = 5;
    td.className = "muted2";
    td.textContent = "暂无提交";
    tr.appendChild(td);
    tbl.appendChild(tr);
  }
  subs.forEach((s) => {
    const tr = el("tr");
    tr.appendChild(el("td", null, s.name));
    tr.appendChild(el("td", null, s.answer || "（未提交）"));
    tr.appendChild(el("td", null, s.answer ? "已交" : "未交"));
    tr.appendChild(el("td", null, s.score != null ? s.score : "—"));
    const td = el("td");
    const inp = document.createElement("input");
    inp.style.width = "70px";
    inp.value = s.score != null ? s.score : "";
    const save = el("button", "btn sm", "打分");
    save.onclick = () => { s.score = inp.value.trim() || null; _tSave(cs); tGrade(v, cid, htitle); };
    td.appendChild(inp); td.appendChild(save);
    tr.appendChild(td);
    tbl.appendChild(tr);
  });
  v.appendChild(tbl);
}

/* ---------------- 公告管理 ---------------- */
function tAnnouncements(v) {
  const cs = _tData();
  v.appendChild(el("div", "h-title", "公告管理"));
  v.appendChild(el("p", "h-sub", "发布课程公告或全校公告（演示）"));

  const card = el("div", "tcard");
  card.appendChild(el("h3", "", "📢 发布公告"));
  const row = el("div", "field-row");
  const f1 = el("div", "field");
  f1.innerHTML = '<label>标题</label><input id="t-ann-title" placeholder="公告标题" />';
  const f2 = el("div", "field");
  f2.innerHTML = `<label>范围</label><select id="t-ann-course" style="width:100%"><option value="">全校公告</option>${cs.map((c) => `<option value="${c.id}">${esc(c.title)}</option>`).join("")}</select>`;
  row.appendChild(f1); row.appendChild(f2);
  card.appendChild(row);
  const f3 = el("div", "field");
  f3.innerHTML = '<label>内容</label><textarea id="t-ann-content" rows="2" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:10px;box-sizing:border-box"></textarea>';
  card.appendChild(f3);
  const b = el("button", "btn", "发布");
  b.onclick = () => {
    const t = document.getElementById("t-ann-title").value.trim();
    if (!t) return;
    const cid = document.getElementById("t-ann-course").value;
    const cidN = cid ? Number(cid) : null;
    const cTitle = cidN ? ((cs.find((x) => x.id === cidN) || {}).title || "") : "全校";
    const list = _tAnns();
    list.unshift({
      id: Date.now(), course_id: cidN, course_title: cTitle, title: t,
      content: document.getElementById("t-ann-content").value,
      created_at: new Date().toISOString().slice(0, 10),
    });
    _tSaveAnns(list);
    tAnnouncements(v);
  };
  card.appendChild(b);
  v.appendChild(card);

  const list = el("div", "ann-list");
  _tAnns().forEach((a) => {
    const item = el("div", "ann-item");
    item.innerHTML = `<div class="ann-title">${esc(a.title)}<span class="ann-course">${esc(a.course_title || "全校")}</span></div><div class="ann-content">${esc(a.content)}</div><div class="muted2" style="margin-top:6px">${esc(a.created_at)}</div>`;
    list.appendChild(item);
  });
  v.appendChild(list);
}

/* ---------------- 学生名单 ---------------- */
function tRoster(v) {
  const cs = _tData();
  v.appendChild(el("div", "h-title", "学生名单"));
  v.appendChild(el("p", "h-sub", "查看各班学生签到与作业提交情况（示例数据）"));

  const row = el("div", "field-row");
  const f = el("div", "field");
  f.innerHTML = `<label>按课程筛选</label><select id="t-roster-c" style="width:220px"><option value="">全部课程</option>${cs.map((c) => `<option value="${c.id}">${esc(c.title)}</option>`).join("")}</select>`;
  row.appendChild(f);
  const b = el("button", "btn sm", "筛选");
  b.onclick = () => paint();
  row.appendChild(b);
  v.appendChild(row);

  function paint() {
    const old = document.getElementById("t-roster-tbl");
    if (old) old.remove();
    const sel = document.getElementById("t-roster-c").value;
    const tbl = el("table", "tbl");
    tbl.id = "t-roster-tbl";
    const head = el("tr");
    ["学生", "课程", "签到", "作业", "得分"].forEach((t) => head.appendChild(el("th", null, t)));
    tbl.appendChild(head);
    const rows = ROSTER.filter((r) => !sel || r.course_id === Number(sel));
    rows.forEach((r) => {
      const tr = el("tr");
      tr.appendChild(el("td", null, r.name));
      tr.appendChild(el("td", null, ((cs.find((x) => x.id === r.course_id)) || {}).title || "—"));
      tr.appendChild(el("td", null, r.signin));
      const td4 = el("td");
      td4.innerHTML = r.submit === "已交" ? "<span class='tag-ok'>已交</span>" : "<span class='tag-no'>未交</span>";
      tr.appendChild(td4);
      tr.appendChild(el("td", null, r.score));
      tbl.appendChild(tr);
    });
    if (!rows.length) {
      const tr = el("tr");
      const td = el("td");
      td.colSpan = 5;
      td.className = "muted2";
      td.textContent = "无学生";
      tr.appendChild(td);
      tbl.appendChild(tr);
    }
    v.appendChild(tbl);
  }
  paint();
}
