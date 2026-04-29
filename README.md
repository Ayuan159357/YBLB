# YBLB Desktop

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

一步两步的桌面版，Tauri + React 写的。

## 能干啥

- **控制台** — 签到状态、近期活动，打开就能看到
- **每日签到** — 连续签到、月度分布、里程碑奖励
- **活动日历** — 月视图、按类型筛选、每日活动详情
- **账号绑定** — 微信 OAuth 绑定（UI 做好了，接口待接）

## 用到的

- Tauri 2
- React 19
- TypeScript
- Vite

## 跑起来

```bash
# 装依赖
npm install

# 前端预览
npm run dev

# 桌面端联调
npm run tauri dev

# 构建
npm run build
```

## 项目结构

```
src/
  App.tsx                       主界面
  App.css                       样式
  mockData.ts                   模拟数据
  types.ts                      类型定义
  hooks/useAppStore.ts          状态管理
  components/
    ConsolePanel.tsx            控制台
    CheckInPanel.tsx            签到
    CalendarPanel.tsx           日历
    AccountBindingPanel.tsx     账号绑定
src-tauri/
  tauri.conf.json               窗口配置
  src/lib.rs                    Tauri 入口
```
