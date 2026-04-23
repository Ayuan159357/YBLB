# YBLB Desktop

一步两步社区桌面版，使用 Tauri + React + TypeScript 构建。

## 已实现功能

- 蓝白现代化桌面 UI（响应式布局，支持窄屏）
- 首页概览（等级、星钻、任务进度、近期活动）
- 每日签到（连续签到、月度签到分布、里程碑）
- 活动日历（按类型筛选、月视图、当日活动详情）
- 我的角色（角色切换、演练成长、标签化展示）
- 社区互动（发帖、点赞、动态列表）
- 任务中心（完成任务领取奖励）
- 消息通知（未读管理、全部已读）
- 设置同步（启动项、推送、语言、更新通道）

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
src-tauri/
	tauri.conf.json        # 桌面窗口与应用配置
	src/lib.rs             # Tauri 入口
```

## 后续接入建议

当前版本使用本地 Mock 数据完成桌面产品框架。若要与微信小程序社区实现完整一致的线上能力，需要接入对应后端 API（例如签到、活动、角色资产、社区帖子、消息中心等）。
