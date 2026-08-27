# 研究生通识课 AI 教育平台 · 静态展示版

这是「研究生通识课 AI 教育平台」的**纯静态展示版本**，用于部署到 GitHub Pages。

- 无任何后端依赖：课程、资料、视频、账号数据全部内嵌在前端（`data.js`）。
- 登录使用浏览器本地存储（localStorage），演示账号：`student01 / 123456`。
- 左侧《数据科学导论》含真实讲解视频、课件资料、测验、讨论；右侧《科技伦理与人工智能》展示「老师暂未上传数据」状态。

## 本地预览
```bash
cd gh-pages
python -m http.server 8099
# 浏览器打开 http://localhost:8099
```

## 部署
详见 `deploy-github-pages.md` —— 建仓库 → 推送 → 开启 GitHub Pages，约 5 分钟。
