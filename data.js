/* =========================================================
   内嵌数据（静态展示版 · 无后端）
   说明：本文件把"后端接口返回的数据"直接写死在前端，
   因此部署到 GitHub Pages 后无需任何服务器即可运行。
   如需修改课程/资料，改这里即可。
   ========================================================= */

// 可登录的学生账号（演示用，密码为下发密码）
const USERS = [
  { username: "student01", password: "123456", name: "张三", avatar: "张" },
  { username: "student02", password: "123456", name: "李四", avatar: "李" },
];

// AI 互动课堂（多智能体）真实链接
const AI_CLASSROOM_URL = "https://open.maic.chat/classroom/GEFSFOgzV6";

// 课程数据
const COURSES = [
  {
    id: 1,
    title: "数据科学导论",
    teacher: "李教授",
    cover: "📊",
    category: "理工通识",
    desc: "面向研究生的数据科学入门，涵盖数据思维、统计基础与可视化方法。",
    progress: 35,
    // sections：stype 支持 video(视频) / doc(资料) / quiz(测验)
    sections: [
      { stype: "video", title: "第1章 数据思维", content: "assets/ch1.mp4" },
      { stype: "video", title: "第2章 数据收集与清洗", content: "assets/ch2.mp4" },
      { stype: "video", title: "第3章 描述统计与可视化", content: "assets/eth1.mp4" },
      { stype: "doc", title: "第1章课件·数据思维", content: "assets/slide1.html" },
      { stype: "doc", title: "第2章课件·数据收集与清洗", content: "assets/slide2.html" },
      { stype: "doc", title: "第3章课件·描述统计与可视化", content: "assets/slide3.html" },
      { stype: "quiz", title: "章节测验 1", content: "20 道单选题，限时 25 分钟，覆盖第 1–2 章内容。" },
      { stype: "quiz", title: "章节测验 2", content: "15 道单选题，限时 20 分钟，覆盖第 3 章内容。" },
    ],
    discussions: [
      { user: "张三", content: "老师，第 2 章的方差公式能再推导一遍吗？", time: "2026-09-01" },
      { user: "李教授", content: "好的，下节课我们专门用 10 分钟讲清方差与标准差的区别。", time: "2026-09-02" },
    ],
    homeworks: [
      { title: "作业 1：数据清洗实践", desc: "使用提供的数据集完成缺失值处理并提交报告。", due: "2026-09-10" },
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
    title: "科技伦理与人工智能",
    teacher: "王老师",
    cover: "🤖",
    category: "人文通识",
    desc: "探讨 AI 发展中的伦理、隐私与社会影响。",
    progress: 0,
    sections: [],   // 空 → 点击后显示「老师暂未上传数据」
    discussions: [],
    homeworks: [],
    analytics: { studyHours: 0, videoProgress: 0, avgScore: 0, weekly: [] },
  },
];
