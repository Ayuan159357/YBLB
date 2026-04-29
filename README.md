# YBLB Desktop

一步两步社区桌面版，使用 Tauri + React + TypeScript 构建。

## 已实现功能

- 蓝白现代化桌面 UI（响应式布局，支持窄屏）
- 控制台（签到状态 + 近期活动一览）
- 每日签到（连续签到、月度签到分布、里程碑）
- 活动日历（按类型筛选、月视图、当日活动详情）
- 账号绑定（微信 OAuth 绑定 UI 骨架）

## 技术栈

- Tauri 2
- React 19
- TypeScript
- Vite

## 项目启动

1. 安装 Node.js 20+
2. 安装 Rust 工具链（用于 Tauri 桌面端）
3. 安装依赖：

```bash
npm install
```

4. 前端开发预览：

```bash
npm run dev
```

5. 桌面端联调：

```bash
npm run tauri dev
```

6. 构建前端产物：

```bash
npm run build
```

## 目录结构

```text
src/
  App.tsx                # 主界面与模块路由
  App.css                # 蓝白视觉主题与响应式样式
  mockData.ts            # 初始数据与日期工具
  types.ts               # 业务类型定义
  hooks/useAppStore.ts   # 本地状态管理与交互动作
  components/            # 面板组件
    ConsolePanel.tsx     # 控制台
    CheckInPanel.tsx     # 每日签到
    CalendarPanel.tsx    # 活动日历
    AccountBindingPanel.tsx # 账号绑定
src-tauri/
  tauri.conf.json        # 桌面窗口与应用配置
  src/lib.rs             # Tauri 入口
```
