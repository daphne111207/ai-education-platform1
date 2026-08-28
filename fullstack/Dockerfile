# 研究生通识课 AI 教育平台 —— 学生端后端镜像
FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# 基础系统工具（健康检查 / 排障用）
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 先装 Python 依赖（利用 Docker 层缓存）
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# 复制后端代码与前端静态文件
COPY backend/ /app/backend/
COPY static/ /app/static/

WORKDIR /app/backend

# 入口：导入账号 + 写入种子数据（均幂等），随后启动服务（端口读 $PORT）
CMD ["sh", "-c", "python import_users.py; python seed_courses.py; python main.py"]
