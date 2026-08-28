# 研究生通识课 AI 教育平台

面向研究生通识课的校内私有化线上自主学习平台。以「**多智能体 AI 课堂**」（OpenMAIC）为核心特色，提供学习通式 LMS 的学生端 + 教师端一体化体验，单仓库、同站部署。

> 当前为**可运行 MVP**：FastAPI + SQLite + 原生前端，已验证端到端跑通；原方案规划的 PostgreSQL / vLLM / Redis / MinIO 为生产演进方向，可作为申报书中的技术愿景。

---

## 一、核心特色

- **多智能体 AI 课堂**：课程可一键生成 OpenMAIC 多智能体教学空间（苏格拉底式提问、分组研讨、随堂测验），云端生成、新窗口打开。
- **学生 / 教师双端同站**：同一套后端与前端，按角色自动切换界面与权限。
- **闭环学习流**：课程中心 → 章节学习（视频/资料）→ 课程讨论 → 班级群聊(WebSocket) → 学习小组 → 课堂签到 → 作业提交与批改 → 学情看板。

## 二、学生端功能

| 模块 | 说明 |
|------|------|
| 课程中心 | 浏览/进入课程，查看章节与资料 |
| AI 互动课堂 | 调用 OpenMAIC 生成多智能体课堂 |
| 课程讨论 | 按课程发帖、回复 |
| 班级群聊 | 实时 WebSocket 群聊 |
| 学习小组 | 组建/加入小组，组内协作 |
| 课堂签到 | 课程签到 |
| 作业 | 查看作业、在线提交 |
| 学情看板 | 个人出勤、提交、活跃度概览 |
| 公告 | 查看本人课程与全校公告 |

## 三、教师端功能（role = teacher / admin）

| 模块 | 说明 |
|------|------|
| 学情概览 | 每门课出勤率、提交率、活跃学生、逐生明细 |
| 我的课程 | 课程的增删改查 |
| 章节管理 | 章节增删改，支持本地视频/资料上传（存 `/files/`） |
| 作业管理 | 布置作业、查看提交、在线打分 |
| 公告管理 | 发布课程公告或全校公告 |
| 学生名单 | 名单查看，按课程筛选签到/提交状态 |

> 权限守卫：`require_role("teacher","admin")`，学生访问教师 API 返回 403。

## 四、演示账号（种子自动建好）

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 学生 | `student01` | `123456` |
| 教师 | `teacher01` | `123456` |

## 五、本地运行

```bash
cd site/backend
pip install -r requirements.txt
python seed_courses.py      # 幂等：建演示老师/学生与示例课
python main.py              # 读环境变量 PORT，默认 8000
# 浏览器打开 http://127.0.0.1:8000
```

前端为 `static/` 下原生 HTML/JS，由后端以静态文件托管，无需单独构建。

## 六、云部署（Docker + Caddy，自动 HTTPS）

详见 `deploy-README.md` 与 `deploy.sh`。一句话流程：

```bash
# 在 Ubuntu 云服务器上（已装 Docker）
scp -r site/ 用户@服务器IP:~/site
ssh 用户@服务器IP
cd ~/site
cp .env.example .env        # 填 OPENMAIC_ACCESS_CODE 与 JWT_SECRET
bash deploy.sh              # 自动装 Docker、生成密钥、配 Caddyfile、compose up
```

- 访问：`https://你的域名`（或 `http://服务器IP` 纯演示）。
- 数据库（SQLite）存于 Docker 卷，**重启/重建不丢数据**。

## 七、目录结构

```
site/
├── backend/                 # FastAPI 后端
│   ├── main.py              # 入口（含迁移、静态托管、读 $PORT）
│   ├── models.py            # 数据模型
│   ├── core/               # config / database / security / utils
│   ├── routers/            # auth, courses, teacher, assignments, announcements...
│   ├── seed_courses.py     # 演示数据种子（幂等）
│   ├── import_users.py     # Excel 批量导入账号
│   └── requirements.txt
├── static/                 # 原生前端（学生端 app.js + 教师端 teacher.js）
├── Dockerfile              # 后端镜像
├── docker-compose.yml      # 后端 + Caddy
├── Caddyfile              # 反向代理 + 自动 HTTPS
├── deploy.sh / deploy-README.md
└── .env.example
```

## 八、技术栈

- 后端：Python + FastAPI + SQLAlchemy + SQLite + JWT（python-jose）。
- 前端：原生 HTML / CSS / JS（SPA，按角色切换）。
- AI：清华开源 OpenMAIC（多智能体编排），`/api/generate-classroom` 轮询生成。
- 部署：Docker + Caddy（自动 HTTPS），支持任意云平台。
