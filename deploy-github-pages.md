# 部署到 GitHub Pages · 傻瓜指南

目标：把你电脑上 `site/gh-pages/` 这个文件夹，变成一个 **`https://你的用户名.github.io/仓库名`** 的公网网站，朋友点链接就能看。

> 只需做一次。下面所有命令在 **PowerShell** 里跑（不是 cmd）。

---

## 第 1 步：在 GitHub 上建一个空仓库

1. 打开 https://github.com/new
2. Repository name 填：`grad-course-ai-platform`（或你喜欢的名字）
3. 选 **Public**（私有仓库 Pages 要收费）
4. **不要**勾选 "Add a README file" / .gitignore / License（保持空仓库）
5. 点 **Create repository**
6. 创建后页面会显示类似：
   ```
   https://github.com/你的用户名/grad-course-ai-platform.git
   ```
   把这段地址复制好（下面要用）。

---

## 第 2 步：在本机把代码推上去

打开 PowerShell，粘贴下面命令（把 `你的用户名` 和 `仓库名` 换成真实的）：

```powershell
cd "C:\Users\yitong.deng\Desktop\大创\site\gh-pages"
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

> 第一次 push 会让你登录 GitHub：
> - **用户名**：你的 GitHub 账号
> - **密码**：这里**不能填登录密码**，要填 **Personal Access Token (PAT)**。
>   - 获取 PAT：GitHub 右上角头像 → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → 勾选 `repo` 全部 → 生成后**复制保存**（只显示一次）。
> - 粘贴时密码框可能不显示字符，正常，粘贴完回车即可。

---

## 第 3 步：开启 GitHub Pages

1. 进入你刚建的仓库页面
2. 点 **Settings**（右侧）→ 左侧 **Pages**
3. Source 选 **Deploy from a branch**
4. Branch 选 **main** / 文件夹选 **/ (root)**
5. 点 **Save**
6. 等 1–2 分钟，页面会显示：
   ```
   Your site is published at https://你的用户名.github.io/仓库名/
   ```

🎉 完成！把这个链接发给朋友即可。

---

## 第 4 步（可选）：以后改了内容怎么更新

改完 `gh-pages/` 里的文件后，PowerShell 里：

```powershell
cd "C:\Users\yitong.deng\Desktop\大创\site\gh-pages"
git add -A
git commit -m "更新内容"
git push
```

等 1 分钟刷新网页即可看到新内容。

---

## 常见问题

- **页面打不开 / 404**：确认第 3 步选的是 `main` 分支 + `/ (root)`，且仓库是 Public。
- **样式/视频没出来**：确认 `styles.css`、`app.js`、`data.js`、`assets/` 都在仓库里（和 index.html 同级）。
- **想换课程/资料**：直接改 `data.js`（课程、视频、资料都在那里），改完按第 4 步推送。
- **GitHub 桌面版更顺手**：不想用命令，可装 [GitHub Desktop](https://desktop.github.com/)，把 `gh-pages` 文件夹拖进去，点 Publish 即可。
