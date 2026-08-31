/* =========================================================
   种子数据（静态展示版 · 无后端）
   说明：本文件保存"后端接口应返回的数据"初始值。
   交互产生的数据（讨论/群聊/签到/打分）由 api.js 写入 localStorage，
   刷新不丢；未来接老师提供的后端时，只需改 api.js 内部实现，UI 不动。
   ========================================================= */

// 可登录账号（演示用，密码均为 123456；role 决定进入学生端 / 教师端）
const USERS = [
  { username: "2023110001", password: "123456", name: "陈嘉禾", studentId: "2023110001", major: "人工智能学院", role: "student", color: "#2563EB" },
  { username: "2023110002", password: "123456", name: "林深夜", studentId: "2023110002", major: "计算机学院", role: "student", color: "#7C3AED" },
  { username: "teacher01",  password: "123456", name: "王怀安", studentId: "T-001",  major: "人文学院",     role: "teacher", color: "#0EA5E9" },
];

// AI 互动课堂（多智能体）真实链接：open.maic.chat 不支持跨域 iframe，故用"新窗口打开"
const AI_CLASSROOM_URL = "https://open.maic.chat/classroom/GEFSFOgzV6";

// 课程数据（coverColor 采用学术色板）
const COURSES = [
  {
    id: 1,
    title: "学术写作与规范",
    teacher: "王怀安 · 人文学院",
    coverColor: "#2563EB",
    coverText: "写",
    category: "人文通识",
    desc: "面向研究生的学术写作训练，涵盖文献检索、引用规范与论证结构。",
    progress: 35,
    sections: [
      { stype: "video", title: "第1章 文献检索与综述", content: "assets/ch1.mp4" },
      { stype: "video", title: "第2章 引用格式与学术诚信", content: "assets/ch2.mp4" },
      { stype: "video", title: "第3章 论证结构与逻辑", content: "assets/eth1.mp4" },
      { stype: "doc",   title: "第1章课件·文献检索", content: "assets/slide1.html" },
      { stype: "doc",   title: "第2章课件·引用规范", content: "assets/slide2.html" },
      { stype: "doc",   title: "第3章课件·论证结构", content: "assets/slide3.html" },
      { stype: "quiz",  title: "章节测验 1 · 引用规范", content: "15 道单选题，限时 20 分钟，覆盖引用规范与学术诚信。" },
      { stype: "quiz",  title: "章节测验 2 · 论证结构", content: "12 道单选题，限时 15 分钟，覆盖论证结构。" },
    ],
    homeworks: [
      { title: "作业 1：文献综述初稿", desc: "围绕自选课题完成 1500 字综述，使用课程引用格式。", due: "2026-09-20" },
    ],
    discussions: [
      { user: "陈嘉禾", role: "student", content: "老师，间接引用和直接引用在正文标注上有什么区别？", ts: "2026-09-10 09:12" },
      { user: "王怀安", role: "teacher", content: "间接引用需注明「据某某研究」，直接引用加上页码即可，详见第 2 章课件第 4 页。", ts: "2026-09-10 10:05" },
    ],
    tStats: { attendance: 82, submitRate: 90, active: 45, students: 52 },
    analytics: { studyHours: 12.5, videoProgress: 68, avgScore: 88, weekly: [
      { label: "一", val: 30 },{ label: "二", val: 55 },{ label: "三", val: 40 },{ label: "四", val: 72 },
      { label: "五", val: 60 },{ label: "六", val: 88 },{ label: "日", val: 45 } ] },
  },
  {
    id: 2,
    title: "数据科学导论",
    teacher: "李慕白 · 计算机学院",
    coverColor: "#7C3AED",
    coverText: "数",
    category: "理工通识",
    desc: "从数据到洞见：统计思维、可视化与建模入门。",
    progress: 0,
    sections: [],          // 空 → 显示「老师暂未上传内容」
    homeworks: [],
    discussions: [],
    tStats: { attendance: 68, submitRate: 75, active: 30, students: 36 },
    analytics: { studyHours: 0, videoProgress: 0, avgScore: 0, weekly: [] },
  },
  {
    id: 3,
    title: "工程伦理与社会责任",
    teacher: "赵明 · 马克思主义学院",
    coverColor: "#0EA5E9",
    coverText: "工",
    category: "理工通识",
    desc: "从真实工程事故出发，理解工程师的伦理责任与决策框架。",
    progress: 60,
    sections: [
      { stype: "video", title: "第1章 工程伦理导论", content: "assets/ch1.mp4" },
      { stype: "doc",   title: "第1章课件·伦理决策框架", content: "assets/slide1.html" },
      { stype: "quiz",  title: "章节测验 1 · 伦理决策", content: "10 道单选题，限时 15 分钟，覆盖第 1 章。" },
    ],
    homeworks: [],
    discussions: [
      { user: "林深夜", role: "student", content: "老师，自动驾驶的「电车难题」在工程中真的需要工程师决策吗？", ts: "2026-09-12 15:30" },
    ],
    tStats: { attendance: 74, submitRate: 85, active: 38, students: 44 },
    analytics: { studyHours: 8, videoProgress: 60, avgScore: 92, weekly: [
      { label: "一", val: 20 },{ label: "二", val: 35 },{ label: "三", val: 50 },{ label: "四", val: 30 },
      { label: "五", val: 65 },{ label: "六", val: 40 },{ label: "日", val: 25 } ] },
  },
];

// 通知公告（course_id 为空 = 全校）
const ANNOUNCEMENTS = [
  { id: 1, course_id: 1, course_title: "学术写作与规范", title: "作业 1 提交提醒", content: "《文献综述初稿》请于 9 月 20 日前提交，引用格式见第 2 章课件。", created_at: "2026-08-28" },
  { id: 2, course_id: null, course_title: "全校", title: "本学期通识课选课说明", content: "选课系统将于 9 月 1 日开放，请关注研究生院教务通知。", created_at: "2026-08-26" },
  { id: 3, course_id: 3, course_title: "工程伦理与社会责任", title: "第 1 讲课件与测验已更新", content: "请同学们完成章节测验 1，成绩将计入平时分。", created_at: "2026-08-25" },
];

// 班级群聊分组
const GROUPS = [
  { id: "g1", name: "学术写作与规范 · 1班", emoji: "✍️", warm: false },
  { id: "g2", name: "工程伦理 · 讨论组", emoji: "⚙️", warm: false },
  { id: "g3", name: "数据科学导论 · 答疑群", emoji: "📊", warm: true },
];

// 学习小组
const STUDY_GROUPS = [
  { id: "s1", name: "文献综述互助组", course: "学术写作与规范", members: 6, desc: "每周共读一篇顶会论文，互评综述初稿。" },
  { id: "s2", name: "伦理案例研读社", course: "工程伦理与社会责任", members: 4, desc: "拆解真实工程事故，练习伦理决策框架。" },
];

// 课堂签到任务
const SIGNIN_TASKS = [
  { id: "t1", course: "学术写作与规范", mode: "定位", deadline: "2026-09-15 10:00", done: false },
  { id: "t2", course: "工程伦理与社会责任", mode: "二维码", deadline: "2026-09-15 14:00", done: false },
  { id: "t3", course: "数据科学导论", mode: "手势", deadline: "2026-09-16 09:30", done: false },
];

// 教师端：学生名单（签到 / 提交 / 得分）
const ROSTER = [
  { id: 1, name: "陈嘉禾", course_id: 1, signin: "12/16", submit: "已交", score: "88" },
  { id: 2, name: "林深夜", course_id: 1, signin: "9/16",  submit: "未交", score: "—" },
  { id: 3, name: "周晓芸", course_id: 1, signin: "14/16", submit: "已交", score: "90" },
  { id: 4, name: "林深夜", course_id: 3, signin: "10/16", submit: "已交", score: "92" },
  { id: 5, name: "郑凯",   course_id: 3, signin: "8/16",  submit: "已交", score: "75" },
  { id: 6, name: "沈雨桐", course_id: 3, signin: "11/16", submit: "未交", score: "—" },
];
