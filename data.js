/* =========================================================
   内嵌数据（静态展示版 · 无后端）
   说明：本文件把"后端接口返回的数据"直接写死在前端，
   因此部署到 GitHub Pages 后无需任何服务器即可运行。
   如需修改课程/资料，改这里即可。
   ========================================================= */

// 可登录的学生账号（演示用，密码为下发密码）
const USERS = [
  { username: "2023110001", password: "123456", name: "陈嘉禾", studentId: "2023110001", major: "人工智能学院" },
  { username: "2023110002", password: "123456", name: "林深夜", studentId: "2023110002", major: "计算机学院" },
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
