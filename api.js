/* =========================================================
   api.js · 统一数据访问层（可替换）
   ---------------------------------------------------------
   当前实现：纯前端 + localStorage（无需后端，刷新不丢）。
   未来接老师提供的后端时，只需把每个方法体替换为 fetch(...)
   即可，前端 UI（app.js / teacher.js）无需改动。

   示例（接后端时）：
     getCourses: () => fetch('/api/courses').then(r => r.json())
   本文件已用 async 函数包裹，方便无缝切换。
   ========================================================= */

const api = (() => {
  const NS = "gep:";                       // localStorage 命名空间
  const load = (k, def) => {
    try { const v = localStorage.getItem(NS + k); return v ? JSON.parse(v) : def; }
    catch (e) { return def; }
  };
  const save = (k, v) => localStorage.setItem(NS + k, JSON.stringify(v));

  // —— 用户表（含注册 / 改资料，持久化）——
  const getUsers = () => load("users", USERS);
  const setUsers = (u) => save("users", u);

  // —— 深拷贝种子，避免污染原始常量 ——
  const seedCourses = () => JSON.parse(JSON.stringify(COURSES));

  return {
    /* ============ 鉴权 ============ */
    async login(username, password) {
      const u = getUsers().find(x => x.username === username && x.password === password);
      if (!u) throw new Error("账号或密码错误");
      return u;
    },
    async register({ username, password, name }) {
      const users = getUsers();
      if (users.find(x => x.username === username)) throw new Error("该学号已注册");
      const u = { username, password, name: name || ("同学" + username.slice(-4)),
                  studentId: username, major: "—", role: "student", color: "#2563EB" };
      users.push(u); setUsers(users);
      return u;
    },
    // 更新当前用户资料（昵称 / 头像色 / 密码）
    async updateProfile(username, patch) {
      const users = getUsers();
      const i = users.findIndex(x => x.username === username);
      if (i < 0) throw new Error("用户不存在");
      users[i] = { ...users[i], ...patch };
      setUsers(users);
      return users[i];
    },

    /* ============ 课程 ============ */
    async getCourses() {
      // 进度等交互数据合并自 localStorage
      const prog = load("progress", {});
      return seedCourses().map(c => ({ ...c, progress: prog[c.id] ?? c.progress }));
    },
    async getCourse(id) {
      const c = (await this.getCourses()).find(x => x.id === id);
      if (!c) throw new Error("课程不存在");
      return c;
    },
    async setProgress(courseId, val) {
      const prog = load("progress", {}); prog[courseId] = val; save("progress", prog);
      return val;
    },

    /* ============ 通知公告 ============ */
    async getAnnouncements() { return load("announcements", ANNOUNCEMENTS); },
    async publishAnnouncement(a) {
      const list = load("announcements", ANNOUNCEMENTS);
      const item = { id: Date.now(), course_id: a.course_id ?? null,
        course_title: a.course_title || "全校", title: a.title, content: a.content,
        created_at: new Date().toISOString().slice(0, 10) };
      list.unshift(item); save("announcements", list); return item;
    },

    /* ============ 课程讨论 ============ */
    async getDiscussion(courseId) {
      const all = load("discussions", {});
      const seed = seedCourses().find(c => c.id === courseId)?.discussions || [];
      return all[courseId] || seed;
    },
    async postDiscussion(courseId, { user, content }) {
      const all = load("discussions", {});
      const list = all[courseId] || (seedCourses().find(c => c.id === courseId)?.discussions || []);
      const item = { user, role: "student", content, ts: now() };
      list.push(item); all[courseId] = list; save("discussions", all);
      return item;
    },

    /* ============ 班级群聊 ============ */
    async getGroups() { return GROUPS; },
    async getGroupMessages(groupId) { return load("group_" + groupId, []); },
    async sendGroupMessage(groupId, msg) {
      const list = load("group_" + groupId, []);
      const item = { user: msg.user, role: msg.role || "student", content: msg.content, ts: now() };
      list.push(item); save("group_" + groupId, list); return item;
    },

    /* ============ 学习小组 ============ */
    async getStudyGroups() { return load("studyGroups", STUDY_GROUPS); },
    async joinStudyGroup(id) {
      const list = load("studyGroups", STUDY_GROUPS);
      const g = list.find(x => x.id === id); if (g) g.members += 1;
      save("studyGroups", list); return list;
    },

    /* ============ 课堂签到 ============ */
    async getSignIns() {
      const done = load("signins", {});
      return SIGNIN_TASKS.map(t => ({ ...t, done: !!done[t.id] }));
    },
    async doSignIn(taskId, method, payload) {
      const done = load("signins", {});
      done[taskId] = { method, payload, at: now() };
      save("signins", done);
      return done[taskId];
    },

    /* ============ 笔记 ============ */
    async getNote(courseId, section) { return load("note_" + courseId + "_" + section, ""); },
    async saveNote(courseId, section, text) { save("note_" + courseId + "_" + section, text); },

    /* ============ 学情看板（聚合） ============ */
    async getDashboard() {
      const courses = await this.getCourses();
      const studentCourses = courses.filter(c => c.progress > 0);
      const totalHours = studentCourses.reduce((s, c) => s + (c.analytics?.studyHours || 0), 0);
      const avgVideo = studentCourses.length
        ? Math.round(studentCourses.reduce((s, c) => s + (c.analytics?.videoProgress || 0), 0) / studentCourses.length) : 0;
      const avgScore = studentCourses.length
        ? Math.round(studentCourses.reduce((s, c) => s + (c.analytics?.avgScore || 0), 0) / studentCourses.length) : 0;
      const signIns = await this.getSignIns();
      const signed = signIns.filter(s => s.done).length;
      const signRate = signIns.length ? Math.round(signed / signIns.length * 100) : 0;
      // 合并周学习时长（取第一课）
      const weekly = studentCourses[0]?.analytics?.weekly ||
        [{label:"一",val:0},{label:"二",val:0},{label:"三",val:0},{label:"四",val:0},{label:"五",val:0},{label:"六",val:0},{label:"日",val:0}];
      return { totalHours, avgVideo, avgScore, signRate, courses: studentCourses, weekly };
    },

    /* ============ 教师端 ============ */
    async getTeacherOverview() {
      const courses = seedCourses();
      return {
        courses,
        totals: { courses: courses.length, students: 132, pending: 9, active: 113 },
      };
    },
    async getRoster(courseId) {
      const all = load("roster", ROSTER);
      return all.filter(r => r.course_id === courseId);
    },
    async saveScore(courseId, studentId, score) {
      const all = load("roster", ROSTER);
      const r = all.find(x => x.course_id === courseId && x.id === studentId);
      if (r) { r.score = score; r.submit = "已交"; }
      save("roster", all); return r;
    },
    async getSections(courseId) {
      const all = load("sections", {});
      if (all[courseId]) return all[courseId];
      const c = seedCourses().find(x => x.id === courseId);
      return c ? c.sections : [];
    },
    async addSection(courseId, sec) {
      const all = load("sections", {});
      const list = all[courseId] || (seedCourses().find(x => x.id === courseId)?.sections || []);
      list.push(sec); all[courseId] = list; save("sections", all); return list;
    },
    async removeSection(courseId, idx) {
      const all = load("sections", {});
      const list = all[courseId] || [];
      list.splice(idx, 1); all[courseId] = list; save("sections", all); return list;
    },
  };

  function now() {
    const d = new Date();
    const p = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
})();
