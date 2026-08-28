// ===== 教师端前端逻辑（真实接口）=====
// 复用 app.js 中的 api() / el() / esc() / navigate() 等全局工具。

let T_COURSES = [];

// ---------- 学情概览 ----------
async function tDashboard(v) {
  v.appendChild(el("h1", null, `教师工作台 · ${esc(ME.name)} 👋`));
  v.appendChild(el("p", "h-sub", "查看所授课程的班级学情与运营情况"));
  let courses = [];
  try { courses = await api("/api/teacher/courses"); T_COURSES = courses; }
  catch (e) { v.appendChild(el("p", null, "加载课程失败：" + e.message)); return; }
  if (!courses.length) {
    v.appendChild(el("p", "muted2", "你还没有课程，去「我的课程」新建一门吧。"));
    return;
  }
  // 概览卡片
  const grid = el("div", "stat-grid");
  let totalStudents = 0, totalHW = 0, totalSub = 0;
  const cards = [
    { n: courses.length, l: "我教的课程", to: "t-courses" },
    { n: "—", l: "学生总数(班均)", to: "t-students" },
    { n: "—", l: "作业总数", to: "t-courses" },
    { n: "—", l: "提交总数", to: "t-courses" },
  ];
  cards.forEach(c => {
    const s = el("div", "stat", `<div class="ic" style="background:var(--primary-soft)">📌</div>
      <div class="num">${c.n}</div><div class="lbl">${c.l}</div>`);
    s.style.cursor = "pointer"; s.onclick = () => navigate(c.to);
    grid.appendChild(s);
  });
  v.appendChild(grid);

  // 每门课学情
  v.appendChild(el("h3", "mt", "各课程学情"));
  for (const c of courses) {
    let an = {};
    try { an = await api("/api/teacher/courses/" + c.id + "/analytics"); } catch (e) {}
    const card = el("div", "tcard",
      `<div style="display:flex;justify-content:space-between;align-items:center">
        <b style="font-size:16px">${esc(c.title)}</b>
        <span class="muted2">${esc(c.category)}</span>
      </div>
      <div class="tgrid" style="grid-template-columns:repeat(4,1fr);margin-top:12px">
        <div><div class="num">${an.total_students ?? 0}</div><div class="muted2">学生数</div></div>
        <div><div class="num">${an.signin_rate ?? 0}%</div><div class="muted2">签到率</div></div>
        <div><div class="num">${an.submission_rate ?? 0}%</div><div class="muted2">作业提交率</div></div>
        <div><div class="num">${an.active_students ?? 0}</div><div class="muted2">活跃学生</div></div>
      </div>
      <button class="btn sm" style="margin-top:12px" onclick="navigate('t-courses')">管理课程</button>`);
    v.appendChild(card);
  }
}

// ---------- 我的课程 ----------
async function tCourses(v) {
  v.appendChild(el("h1", null, "我的课程"));
  v.appendChild(el("p", "h-sub", "创建课程、上传章节与资料、布置作业与测验"));
  const top = el("div", "field-row");
  const newBtn = el("button", "btn", "➕ 新建课程");
  newBtn.onclick = () => showCourseForm(v);
  top.appendChild(newBtn);
  v.appendChild(top);

  let courses = [];
  try { courses = await api("/api/teacher/courses"); T_COURSES = courses; }
  catch (e) { v.appendChild(el("p", null, "加载失败：" + e.message)); return; }

  const grid = el("div", "tgrid");
  courses.forEach(c => {
    const card = el("div", "tcourse",
      `<div class="cover">${c.cover || "📘"}</div>
       <div class="tt">${esc(c.title)}</div>
       <div class="tm">${esc(c.category)} · ${esc(c.teacher || "")}</div>`);
    card.onclick = () => tCourseEdit(v, c.id);
    grid.appendChild(card);
  });
  v.appendChild(grid);
  if (!courses.length) v.appendChild(el("p", "muted2", "还没有课程，点击上方「新建课程」开始。"));
}

function showCourseForm(v) {
  const card = el("div", "tcard");
  card.innerHTML = `<h3>新建课程</h3>
    <div class="field-row">
      <div class="field"><label>课程名称</label><input id="nc-title" placeholder="如 数据挖掘基础" /></div>
      <div class="field"><label>分类</label><input id="nc-cat" value="通识课" /></div>
      <div class="field"><label>封面emoji</label><input id="nc-cover" value="📘" style="width:80px" /></div>
    </div>
    <div class="field"><label>课程简介</label><textarea id="nc-desc" rows="3" placeholder="课程描述"></textarea></div>
    <div style="margin-top:10px">
      <button class="btn" id="nc-save">保存</button>
      <button class="btn sm" style="margin-left:8px" onclick="this.closest('.tcard').remove()">取消</button>
    </div>`;
  v.insertBefore(card, v.children[2] || null);
  card.querySelector("#nc-save").onclick = async () => {
    const title = card.querySelector("#nc-title").value.trim();
    if (!title) { alert("请填写课程名称"); return; }
    try {
      const c = await api("/api/teacher/courses", { method: "POST", json: {
        title, category: card.querySelector("#nc-cat").value,
        cover: card.querySelector("#nc-cover").value, desc: card.querySelector("#nc-desc").value,
      }});
      T_COURSES.push(c);
      card.remove();
      tCourses(v);
    } catch (e) { alert(e.message); }
  };
}

// ---------- 课程编辑（章节/作业） ----------
async function tCourseEdit(v, cid) {
  let course, detail;
  try {
    course = (T_COURSES.find(c => c.id === cid)) || (await api("/api/teacher/courses")).find(c => c.id === cid);
    detail = await api("/api/courses/" + cid);
  } catch (e) { v.appendChild(el("p", null, "加载失败：" + e.message)); return; }
  v.appendChild(el("h1", null, esc(course.title)));
  v.appendChild(el("p", "h-sub", "管理章节内容、上传视频/资料、查看作业提交"));
  const back = el("button", "btn sm", "← 返回课程列表");
  back.onclick = () => navigate("t-courses");
  v.appendChild(back);

  // 章节列表
  v.appendChild(el("h3", "mt", "课程章节"));
  const secWrap = el("div", null);
  v.appendChild(secWrap);
  (detail.sections || []).forEach(s => {
    const it = el("div", "sec-item",
      `<div class="st"><b>${esc(s.title)}</b> <span class="badge">${esc(s.stype)}</span>
        <div class="muted2">${esc(s.content || "")}</div></div>`);
    const del = el("button", "btn sm", "删除");
    del.onclick = async () => {
      if (!confirm("确定删除该章节？")) return;
      await api("/api/teacher/courses/" + cid + "/sections/" + s.id, { method: "DELETE" });
      tCourseEdit(v, cid);
    };
    it.appendChild(del);
    secWrap.appendChild(it);
  });
  // 新增章节
  const form = el("div", "tcard");
  form.innerHTML = `<h3>添加章节</h3>
    <div class="field-row">
      <div class="field"><label>标题</label><input id="ns-title" placeholder="如 第1章 导论" /></div>
      <div class="field" style="max-width:160px"><label>类型</label>
        <select id="ns-type"><option value="video">视频</option><option value="doc">资料</option><option value="quiz">测验</option></select>
      </div>
    </div>
    <div class="field"><label>内容（视频/资料填 /files/xxx 或外链；测验填说明）</label>
      <input id="ns-content" placeholder="如 /files/ch1.mp4 或 10道选择题" /></div>
    <div class="upload-row">
      <input type="file" id="ns-file" />
      <button class="btn sm" id="ns-upload">上传文件并填入</button>
    </div>
    <button class="btn" id="ns-save">添加章节</button>`;
  v.appendChild(form);
  form.querySelector("#ns-upload").onclick = async () => {
    const f = form.querySelector("#ns-file").files[0];
    if (!f) { alert("请先选择文件"); return; }
    const fd = new FormData(); fd.append("file", f);
    const r = await api("/api/teacher/upload", { method: "POST", body: fd });
    form.querySelector("#ns-content").value = r.url;
    alert("已上传：" + r.url);
  };
  form.querySelector("#ns-save").onclick = async () => {
    const title = form.querySelector("#ns-title").value.trim();
    if (!title) { alert("请填写标题"); return; }
    await api("/api/teacher/courses/" + cid + "/sections", { method: "POST", json: {
      title, stype: form.querySelector("#ns-type").value, content: form.querySelector("#ns-content").value,
    }});
    tCourseEdit(v, cid);
  };

  // 作业
  v.appendChild(el("h3", "mt", "作业与测验"));
  const hwBtn = el("button", "btn sm", "➕ 布置作业");
  hwBtn.onclick = async () => {
    const title = prompt("作业标题："); if (!title) return;
    const desc = prompt("作业说明（可空）：") || "";
    const due = prompt("截止日期（可空，如 2026-09-30）：") || "";
    await api("/api/teacher/courses/" + cid + "/homeworks", { method: "POST", json: { title, desc, due } });
    tCourseEdit(v, cid);
  };
  v.appendChild(hwBtn);
  let hws = [];
  try { hws = await api("/api/teacher/courses/" + cid + "/homeworks"); } catch (e) {}
  const tbl = el("table", "tbl");
  tbl.innerHTML = `<thead><tr><th>作业</th><th>截止</th><th>提交/已批</th><th>操作</th></tr></thead>`;
  const tb = el("tbody");
  hws.forEach(h => {
    const tr = el("tr");
    tr.innerHTML = `<td>${esc(h.title)}</td><td class="muted2">${esc(h.due || "—")}</td>
      <td>${h.submissions}/${h.graded}</td>`;
    const op = el("td");
    const gradeBtn = el("button", "btn sm", "批改");
    gradeBtn.onclick = () => tGrade(v, h.id);
    const delBtn = el("button", "btn sm", "删除");
    delBtn.onclick = async () => { await api("/api/teacher/homeworks/" + h.id, { method: "DELETE" }); tCourseEdit(v, cid); };
    op.appendChild(gradeBtn); op.appendChild(delBtn);
    tr.appendChild(op); tb.appendChild(tr);
  });
  tbl.appendChild(tb); v.appendChild(tbl);
}

// ---------- 批改作业 ----------
async function tGrade(v, hid) {
  let subs = [];
  try { subs = await api("/api/teacher/homeworks/" + hid + "/submissions"); } catch (e) { alert(e.message); return; }
  const box = el("div", "tcard");
  box.innerHTML = `<h3>批改作业（${subs.length} 份提交）</h3>`;
  if (!subs.length) box.appendChild(el("p", "muted2", "暂无学生提交。"));
  subs.forEach(s => {
    const row = el("div", "sec-item");
    row.innerHTML = `<div class="st"><b>${esc(s.student)}</b>
      <div class="muted2">${esc(s.answer || "(未填写内容)")}</div>
      <div class="muted2">当前成绩：${esc(s.score || "未批改")}</div></div>`;
    const inp = el("input"); inp.placeholder = "打分"; inp.style.width = "90px"; inp.value = s.score || "";
    const save = el("button", "btn sm", "保存");
    save.onclick = async () => {
      await api("/api/teacher/submissions/" + s.id + "/grade", { method: "POST", json: { score: inp.value } });
      save.textContent = "已保存"; setTimeout(() => tGrade(v, hid), 400);
    };
    row.appendChild(inp); row.appendChild(save);
    box.appendChild(row);
  });
  const back = el("button", "btn sm", "返回");
  back.onclick = () => tCourses(v);
  box.appendChild(back);
  v.innerHTML = ""; v.appendChild(box);
}

// ---------- 公告管理 ----------
async function tAnnouncements(v) {
  v.appendChild(el("h1", null, "公告管理"));
  v.appendChild(el("p", "h-sub", "发布课程公告或全校公告，学生首页可见"));
  const form = el("div", "tcard");
  form.innerHTML = `<h3>发布新公告</h3>
    <div class="field-row">
      <div class="field"><label>标题</label><input id="an-title" placeholder="如 第3章提前发布" /></div>
      <div class="field" style="max-width:220px"><label>关联课程（留空=全校）</label>
        <select id="an-course"><option value="">全校公告</option></select></div>
    </div>
    <div class="field"><label>内容</label><textarea id="an-content" rows="3" placeholder="公告内容"></textarea></div>
    <button class="btn" id="an-save">发布</button>`;
  v.appendChild(form);
  // 课程下拉
  let courses = [];
  try { courses = await api("/api/teacher/courses"); T_COURSES = courses; } catch (e) {}
  const sel = form.querySelector("#an-course");
  courses.forEach(c => { const o = el("option"); o.value = c.id; o.textContent = c.title; sel.appendChild(o); });
  form.querySelector("#an-save").onclick = async () => {
    const title = form.querySelector("#an-title").value.trim();
    const content = form.querySelector("#an-content").value.trim();
    if (!title || !content) { alert("请填写标题和内容"); return; }
    const cid = form.querySelector("#an-course").value || null;
    await api("/api/teacher/announcements", { method: "POST", json: { title, content, course_id: cid ? Number(cid) : null } });
    tAnnouncements(v);
  };
  v.appendChild(el("p", "muted2", "（历史公告可在数据库/学生端首页查看，本页聚焦发布。）"));
}

// ---------- 学生名单 ----------
async function tRoster(v) {
  v.appendChild(el("h1", null, "学生名单"));
  v.appendChild(el("p", "h-sub", "查看学生及各班学习参与情况"));
  let students = [];
  try { students = await api("/api/teacher/students"); } catch (e) { v.appendChild(el("p", null, "加载失败：" + e.message)); return; }
  if (!T_COURSES.length) { try { T_COURSES = await api("/api/teacher/courses"); } catch (e) {} }
  const courseSel = el("div", "field-row");
  const sel = el("select"); sel.style.maxWidth = "260px";
  sel.innerHTML = `<option value="">全部课程（汇总）</option>` + T_COURSES.map(c => `<option value="${c.id}">${esc(c.title)}</option>`).join("");
  courseSel.appendChild(el("span", "muted2", "选择课程："));
  courseSel.appendChild(sel);
  v.appendChild(courseSel);

  const render = async (cid) => {
    let rows = students.map(s => ({ ...s, signed: false, submitted: false }));
    if (cid) {
      try {
        const an = await api("/api/teacher/courses/" + cid + "/analytics");
        const map = {}; an.students.forEach(x => map[x.id] = x);
        rows = rows.map(s => ({ ...s, signed: map[s.id]?.signed, submitted: map[s.id]?.submitted }));
      } catch (e) {}
    }
    const tbl = el("table", "tbl");
    tbl.innerHTML = `<thead><tr><th>用户名</th><th>姓名</th><th>邮箱</th>${cid ? "<th>签到</th><th>提交</th>" : ""}</tr></thead>`;
    const tb = el("tbody");
    rows.forEach(s => {
      const tr = el("tr");
      tr.innerHTML = `<td>${esc(s.username)}</td><td>${esc(s.name)}</td><td class="muted2">${esc(s.email || "—")}</td>` +
        (cid ? `<td>${s.signed ? '<span class="tag-ok">✔</span>' : '<span class="tag-no">—</span>'}</td><td>${s.submitted ? '<span class="tag-ok">✔</span>' : '<span class="tag-no">—</span>'}</td>` : "");
      tb.appendChild(tr);
    });
    tbl.appendChild(tb);
    const old = v.querySelector("#roster-tbl"); if (old) old.remove();
    tbl.id = "roster-tbl"; v.appendChild(tbl);
  };
  sel.onchange = () => render(sel.value);
  render("");
}
