/* =========================================================
   内嵌数据（静态展示版 · 无后端）
   说明：本文件把"后端接口返回的数据"直接写死在前端，
   因此部署到 GitHub Pages 后无需任何服务器即可运行。
   如需修改课程/资料/公告/名单，改这里即可。
   ========================================================= */

// 可登录账号（演示用，密码为下发密码；role 决定进入学生端还是教师端）
const USERS = [
  { username: "2023110001", password: "123456", name: "陈嘉禾", studentId: "2023110001", major: "人工智能学院", role: "student" },
  { username: "2023110002", password: "123456", name: "林深夜", studentId: "2023110002", major: "计算机学院", role: "student" },
  { username: "teacher01", password: "123456", name: "王怀安", studentId: "T-001", major: "人文学院", role: "teacher" },
];

// AI 互动课堂（多智能体）真实链接
const AI_CLASSROOM_URL = "https://open.maic.chat/classroom/GEFSFOgzV6";

// 课程数据
const COURSES = [
  {
    id: 1,
    title: "学术写作与规范",
    teacher: "王怀安 · 人文学院",
    coverColor: "#5E82D8",
    coverText: "写",
    category: "人文通识",
    desc: "面向研究生的学术写作训练，涵盖文献综述、引用规范与论证结构。",
    progress: 35,
    sections: [
      { stype: "video", title: "第1章 文献检索与综述", content: "assets/ch1.mp4" },
      { stype: "video", title: "第2章 引用格式与学术诚信", content: "assets/ch2.mp4" },
      { stype: "video", title: "第3章 论证结构与逻辑", content: "assets/eth1.mp4" },
      { stype: "doc", title: "第1章课件·文献检索", content: "assets/slide1.html" },
      { stype: "doc", title: "第2章课件·引用规范", content: "assets/slide2.html" },
      { stype: "doc", title: "第3章课件·论证结构", content: "assets/slide3.html" },
      { stype: "quiz", title: "章节测验 1", content: "15 道单选题，限时 20 分钟，覆盖引用规范与学术诚信。" },
      { stype: "quiz", title: "章节测验 2", content: "12 道单选题，限时 15 分钟，覆盖论证结构。" },
    ],
    discussions: [
      { user: "陈嘉禾", role: "student", content: "老师，间接引用和直接引用在正文标注上有什么区别？", ts: "2026-09-10 09:12" },
      { user: "王怀安", role: "teacher", content: "间接引用需注明“据某某研究”，直接引用的话加上页码即可，详见第 2 章课件第 4 页。", ts: "2026-09-10 10:05" },
    ],
    homeworks: [
      { title: "作业 1：文献综述初稿", desc: "围绕自选课题完成 1500 字综述，使用课程引用格式。", due: "2026-09-20" },
    ],
    // 教师端：作业与提交（subs）
    hw: [
      {
        title: "作业 1：文献综述初稿",
        desc: "围绕自选课题完成 1500 字综述，使用课程引用格式。",
        due: "2026-09-20",
        subs: [
          { name: "陈嘉禾", answer: "已完成《大语言模型辅助写作的边界》综述初稿，引文 12 篇…", score: "88" },
          { name: "林深夜", answer: "（未提交）", score: null },
          { name: "周晓芸", answer: "综述聚焦“图情学文献计量”，已完成 1500 字正文…", score: "90" },
        ],
      },
    ],
    // 教师端：班级学情
    tStats: { attendance: 82, submitRate: 90, active: 45, students: 52 },
    analytics: {
      studyHours: 12.5,
      videoProgress: 68,
      avgScore: 88,
      weekly: [
        { label: "周一", val: 30 },
        { label: "周二", val: 55 },
        { label: "周三", val: 40 },
        { label: "周四", val: 72 },
        { label: "周五", val: 60 },
        { label: "周六", val: 88 },
        { label: "周日", val: 45 },
      ],
    },
  },
  {
    id: 2,
    title: "数据科学导论",
    teacher: "李慕白 · 计算机学院",
    coverColor: "#A99CF5",
    coverText: "数",
    category: "理工通识",
    desc: "探讨 AI 发展中的伦理、隐私与社会影响。",
    progress: 0,
    sections: [],   // 空 → 点击后显示「老师暂未上传数据」
    discussions: [],
    homeworks: [],
    hw: [],
    tStats: { attendance: 68, submitRate: 75, active: 30, students: 36 },
    analytics: { studyHours: 0, videoProgress: 0, avgScore: 0, weekly: [] },
  },
  {
    id: 3,
    title: "工程伦理与社会责任",
    teacher: "赵明 · 马克思主义学院",
    coverColor: "#62CBA0",
    coverText: "工",
    category: "理工通识",
    desc: "从真实工程事故出发，理解工程师的伦理责任与决策框架。",
    progress: 60,
    sections: [
      { stype: "video", title: "第1章 工程伦理导论", content: "assets/ch1.mp4" },
      { stype: "doc", title: "第1章课件·伦理决策框架", content: "assets/slide1.html" },
      { stype: "quiz", title: "章节测验 1", content: "10 道单选题，限时 15 分钟，覆盖第 1 章。" },
    ],
    discussions: [
      { user: "林深夜", role: "student", content: "老师，自动驾驶的“电车难题”在工程中真的需要工程师决策吗？", ts: "2026-09-12 15:30" },
    ],
    homeworks: [],
    hw: [
      {
        title: "作业 1：AI 伦理案例分析",
        desc: "选择一个 AI 伦理案例进行分析并提交报告。",
        due: "2026-09-25",
        subs: [
          { name: "林深夜", answer: "以自动驾驶伦理困境为例，分析了责任归属问题…", score: "92" },
          { name: "郑凯", answer: "以人脸识别隐私为例，分析了数据权利边界…", score: "75" },
          { name: "沈雨桐", answer: "（未提交）", score: null },
        ],
      },
    ],
    tStats: { attendance: 74, submitRate: 85, active: 38, students: 44 },
    analytics: {
      studyHours: 8,
      videoProgress: 60,
      avgScore: 92,
      weekly: [
        { label: "周一", val: 20 },
        { label: "周二", val: 35 },
        { label: "周三", val: 50 },
        { label: "周四", val: 30 },
        { label: "周五", val: 65 },
        { label: "周六", val: 40 },
        { label: "周日", val: 25 },
      ],
    },
  },
];

// 教师端：通知公告（course_id 为空 = 全校）
const ANNOUNCEMENTS = [
  { id: 1, course_id: 1, course_title: "学术写作与规范", title: "作业 1 提交提醒", content: "《文献综述初稿》请于 9 月 20 日前提交，引用格式见第 2 章课件。", created_at: "2026-08-28" },
  { id: 2, course_id: null, course_title: "全校", title: "本学期通识课选课说明", content: "选课系统将于 9 月 1 日开放，请关注研究生院教务通知。", created_at: "2026-08-26" },
  { id: 3, course_id: 3, course_title: "工程伦理与社会责任", title: "第 1 讲课件与测验已更新", content: "请同学们完成章节测验 1，成绩将计入平时分。", created_at: "2026-08-25" },
];

// 教师端：学生名单（签到 / 提交 / 得分）
const ROSTER = [
  { id: 1, name: "陈嘉禾", course_id: 1, signin: "已签 12/16", submit: "已交", score: "88" },
  { id: 2, name: "林深夜", course_id: 1, signin: "已签 9/16", submit: "未交", score: "—" },
  { id: 3, name: "周晓芸", course_id: 1, signin: "已签 14/16", submit: "已交", score: "90" },
  { id: 4, name: "林深夜", course_id: 3, signin: "已签 10/16", submit: "已交", score: "92" },
  { id: 5, name: "郑凯", course_id: 3, signin: "已签 8/16", submit: "已交", score: "75" },
  { id: 6, name: "沈雨桐", course_id: 3, signin: "已签 11/16", submit: "未交", score: "—" },
];
