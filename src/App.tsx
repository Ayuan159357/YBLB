import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import "./App.css";
import { formatDateKey, formatDisplayDate } from "./mockData";
import { useAppStore } from "./hooks/useAppStore";
import type { CalendarEvent, EventCategory, NavKey, PostTag } from "./types";

type EventFilter = EventCategory | "全部";

const NAV_ITEMS: Array<{ key: NavKey; label: string; hint: string }> = [
  { key: "overview", label: "首页概览", hint: "实时状态" },
  { key: "checkin", label: "每日签到", hint: "领奖进度" },
  { key: "calendar", label: "活动日历", hint: "赛事与福利" },
  { key: "roles", label: "我的角色", hint: "阵容管理" },
  { key: "community", label: "社区互动", hint: "发帖交流" },
  { key: "tasks", label: "任务中心", hint: "每日目标" },
  { key: "messages", label: "消息通知", hint: "系统提醒" },
  { key: "settings", label: "设置同步", hint: "偏好选项" },
];

const WEEK_LABELS = ["一", "二", "三", "四", "五", "六", "日"];
const EVENT_FILTERS: EventFilter[] = ["全部", "赛事", "福利", "社区", "更新"];
const POST_TAGS: PostTag[] = ["攻略", "讨论", "招募", "同人", "公告"];
const MILESTONE_DAYS = [1, 3, 7, 14, 21, 28];

type CalendarCell = {
  dateKey: string;
  dayNumber: number;
  inMonth: boolean;
  isToday: boolean;
};

function formatMonthTitle(monthAnchor: Date): string {
  return `${monthAnchor.getFullYear()} 年 ${monthAnchor.getMonth() + 1} 月`;
}

function buildCalendarCells(monthAnchor: Date, todayKey: string): CalendarCell[] {
  const firstDay = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1 - mondayOffset);

  const cells: CalendarCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const cursor = new Date(gridStart);
    cursor.setDate(gridStart.getDate() + index);
    const dateKey = formatDateKey(cursor);

    cells.push({
      dateKey,
      dayNumber: cursor.getDate(),
      inMonth: cursor.getMonth() === monthAnchor.getMonth(),
      isToday: dateKey === todayKey,
    });
  }

  return cells;
}

function toCategoryToken(category: EventCategory): "event" | "benefit" | "community" | "update" {
  switch (category) {
    case "赛事":
      return "event";
    case "福利":
      return "benefit";
    case "社区":
      return "community";
    case "更新":
      return "update";
    default:
      return "community";
  }
}

function formatRelativeTime(isoTime: string): string {
  const diffMinutes = Math.max(0, Math.floor((Date.now() - new Date(isoTime).getTime()) / 60000));

  if (diffMinutes < 1) {
    return "刚刚";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} 小时前`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} 天前`;
}

function App() {
  const { state, todayKey, hasSignedToday, signInStreak, activeRole, unreadCount, completedTaskCount, actions } =
    useAppStore();

  const [activeTab, setActiveTab] = useState<NavKey>("overview");
  const [monthCursor, setMonthCursor] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [eventFilter, setEventFilter] = useState<EventFilter>("全部");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTag, setPostTag] = useState<PostTag>("讨论");

  const eventsByDate = useMemo(() => {
    const eventMap = new Map<string, CalendarEvent[]>();

    for (const event of state.calendarEvents) {
      const list = eventMap.get(event.date) ?? [];
      list.push(event);
      eventMap.set(event.date, list);
    }

    for (const list of eventMap.values()) {
      list.sort((left, right) => `${left.date} ${left.startAt}`.localeCompare(`${right.date} ${right.startAt}`));
    }

    return eventMap;
  }, [state.calendarEvents]);

  const calendarCells = useMemo(() => buildCalendarCells(monthCursor, todayKey), [monthCursor, todayKey]);

  const selectedDateEvents = useMemo(() => {
    const dailyEvents = eventsByDate.get(selectedDate) ?? [];
    if (eventFilter === "全部") {
      return dailyEvents;
    }
    return dailyEvents.filter((event) => event.category === eventFilter);
  }, [eventsByDate, selectedDate, eventFilter]);

  const upcomingEvents = useMemo(() => {
    return [...state.calendarEvents]
      .filter((event) => event.date >= todayKey)
      .sort((left, right) => `${left.date} ${left.startAt}`.localeCompare(`${right.date} ${right.startAt}`))
      .slice(0, 5);
  }, [state.calendarEvents, todayKey]);

  const currentNav = NAV_ITEMS.find((item) => item.key === activeTab) ?? NAV_ITEMS[0];
  const totalTaskCount = state.tasks.length;
  const taskProgress = totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;

  const monthPrefix = todayKey.slice(0, 7);
  const [signYear, signMonth] = monthPrefix.split("-").map(Number);
  const daysInCurrentMonth = new Date(signYear, signMonth, 0).getDate();
  const monthlySignInCount = state.signedDates.filter((dateKey) => dateKey.startsWith(monthPrefix)).length;
  const signedDateSet = useMemo(() => new Set(state.signedDates), [state.signedDates]);

  const handleCreatePost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    actions.addPost(postTitle, postContent, postTag);
    setPostTitle("");
    setPostContent("");
  };

  let activePanel: ReactNode;

  switch (activeTab) {
    case "overview":
      activePanel = (
        <section className="content-section">
          <article className="card hero-card">
            <div className="hero-main">
              <p className="eyebrow">一步两步社区桌面版</p>
              <h1 className="hero-title">{state.profile.nickname}，今天一起把活跃度拉满</h1>
              <p className="hero-subtitle">
                当前头衔：{state.profile.title}。核心功能已整合为桌面端统一工作台，支持签到、活动追踪、角色管理与社区互动。
              </p>
              <div className="hero-actions">
                <button type="button" className="primary-btn" onClick={() => setActiveTab("checkin")}>
                  立即签到
                </button>
                <button type="button" className="secondary-btn" onClick={() => setActiveTab("calendar")}>
                  查看活动日历
                </button>
              </div>
            </div>
            <div className="hero-metrics">
              <div className="metric-item">
                <span className="metric-label">星钻余额</span>
                <span className="metric-value">{state.coinBalance}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">连续签到</span>
                <span className="metric-value">{signInStreak} 天</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">任务完成度</span>
                <span className="metric-value">{taskProgress}%</span>
              </div>
            </div>
          </article>

          <div className="stat-grid">
            <article className="card stat-card">
              <p className="stat-title">账号等级</p>
              <p className="stat-value">Lv.{state.profile.level}</p>
              <div className="progress-line">
                <span
                  className="progress-line-fill"
                  style={{ width: `${Math.round((state.profile.exp / state.profile.expToNextLevel) * 100)}%` }}
                />
              </div>
              <p className="muted">经验值 {state.profile.exp}/{state.profile.expToNextLevel}</p>
            </article>
            <article className="card stat-card">
              <p className="stat-title">当前主力角色</p>
              <p className="stat-value">{activeRole?.name ?? "未选择"}</p>
              <p className="muted">战力 {activeRole?.power ?? 0}</p>
              <button type="button" className="text-btn" onClick={() => setActiveTab("roles")}>
                前往角色页
              </button>
            </article>
            <article className="card stat-card">
              <p className="stat-title">未读消息</p>
              <p className="stat-value">{unreadCount}</p>
              <p className="muted">保持同步，不错过限时活动与社区热帖</p>
              <button type="button" className="text-btn" onClick={() => setActiveTab("messages")}>
                打开消息中心
              </button>
            </article>
          </div>

          <article className="card list-card">
            <div className="list-header">
              <h3>近期活动</h3>
              <button type="button" className="text-btn" onClick={() => setActiveTab("calendar")}>
                全部查看
              </button>
            </div>
            <div className="event-list">
              {upcomingEvents.map((event) => {
                const token = toCategoryToken(event.category);
                return (
                  <div className="event-item" key={event.id}>
                    <span className={`event-tag ${token}`}>{event.category}</span>
                    <div className="event-meta">
                      <strong>{event.title}</strong>
                      <span>
                        {formatDisplayDate(event.date)} · {event.startAt} · {event.location}
                      </span>
                    </div>
                    <span className="muted">奖励：{event.reward}</span>
                  </div>
                );
              })}
            </div>
          </article>

          <div className="quick-grid">
            <article className="card quick-card">
              <h4>社区速览</h4>
              <p>进入社区页即可发帖、点赞、跟踪热门话题，便于同步小程序社区内容。</p>
              <button type="button" className="secondary-btn" onClick={() => setActiveTab("community")}>
                进入社区
              </button>
            </article>
            <article className="card quick-card">
              <h4>今日任务</h4>
              <p>
                已完成 {completedTaskCount}/{totalTaskCount}，再做 {Math.max(totalTaskCount - completedTaskCount, 0)} 项可拿满奖励。
              </p>
              <button type="button" className="secondary-btn" onClick={() => setActiveTab("tasks")}>
                处理任务
              </button>
            </article>
          </div>
        </section>
      );
      break;

    case "checkin":
      activePanel = (
        <section className="content-section checkin-layout">
          <article className="card checkin-main">
            <div className="list-header">
              <h3>每日签到</h3>
              <span className={`status-pill ${hasSignedToday ? "done" : "pending"}`}>
                {hasSignedToday ? "今日已签到" : "今日待签到"}
              </span>
            </div>
            <p className="muted">本月已签到 {monthlySignInCount} 天，连续签到 {signInStreak} 天。</p>
            <button type="button" className="primary-btn" disabled={hasSignedToday} onClick={actions.signInToday}>
              {hasSignedToday ? "今日奖励已领取" : "领取今日奖励 +20 星钻"}
            </button>

            <div className="milestone-row">
              {MILESTONE_DAYS.map((day) => (
                <div className={`milestone-item ${monthlySignInCount >= day ? "reached" : ""}`} key={day}>
                  <strong>{day} 天</strong>
                  <span>{monthlySignInCount >= day ? "已达成" : "未达成"}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <h3>本月签到分布</h3>
            <p className="muted">蓝色数字表示已签到日期，帮助你快速发现补签空档。</p>
            <div className="monthly-sign-grid">
              {Array.from({ length: daysInCurrentMonth }, (_, index) => {
                const dayNumber = index + 1;
                const dateKey = `${monthPrefix}-${`${dayNumber}`.padStart(2, "0")}`;
                const signed = signedDateSet.has(dateKey);
                return (
                  <div key={dateKey} className={`sign-day ${signed ? "signed" : ""}`}>
                    {dayNumber}
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      );
      break;

    case "calendar":
      activePanel = (
        <section className="content-section calendar-layout">
          <article className="card calendar-card">
            <div className="calendar-toolbar">
              <div>
                <h3>活动日历</h3>
                <p className="muted">支持按分类筛选赛事、福利、社区和版本更新活动。</p>
              </div>
              <div className="month-nav">
                <button
                  type="button"
                  className="month-btn"
                  onClick={() =>
                    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                >
                  上月
                </button>
                <span>{formatMonthTitle(monthCursor)}</span>
                <button
                  type="button"
                  className="month-btn"
                  onClick={() =>
                    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                >
                  下月
                </button>
              </div>
            </div>

            <div className="filter-row">
              {EVENT_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`filter-chip ${eventFilter === filter ? "active" : ""}`}
                  onClick={() => setEventFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="week-head">
              {WEEK_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarCells.map((cell) => {
                const events = eventsByDate.get(cell.dateKey) ?? [];

                return (
                  <button
                    type="button"
                    key={cell.dateKey}
                    className={`day-cell ${cell.inMonth ? "" : "outside"} ${
                      cell.isToday ? "today" : ""
                    } ${selectedDate === cell.dateKey ? "selected" : ""}`}
                    onClick={() => setSelectedDate(cell.dateKey)}
                  >
                    <span className="day-number">{cell.dayNumber}</span>
                    <div className="day-events">
                      {events.slice(0, 3).map((event) => (
                        <span className={`day-dot ${toCategoryToken(event.category)}`} key={event.id} />
                      ))}
                    </div>
                    {events.length > 0 ? <small>{events.length} 项</small> : <small>无活动</small>}
                  </button>
                );
              })}
            </div>
          </article>

          <article className="card agenda-card">
            <div className="list-header">
              <h3>{formatDisplayDate(selectedDate)} 活动安排</h3>
              <span className="capsule">筛选：{eventFilter}</span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <p className="empty-state">该日期暂无符合筛选条件的活动。</p>
            ) : (
              <div className="agenda-list">
                {selectedDateEvents.map((event) => (
                  <div className="agenda-item" key={event.id}>
                    <span className={`event-tag ${toCategoryToken(event.category)}`}>{event.category}</span>
                    <div className="event-meta">
                      <strong>{event.title}</strong>
                      <span>
                        {event.startAt} · {event.location} · 奖励 {event.reward}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      );
      break;

    case "roles":
      activePanel = (
        <section className="content-section role-layout">
          {activeRole ? (
            <article className="card role-highlight">
              <div className="list-header">
                <h3>当前出战角色：{activeRole.name}</h3>
                <span className="capsule">{activeRole.rarity}</span>
              </div>
              <div className="role-badges">
                <span>{activeRole.faction}</span>
                <span>{activeRole.element}元素</span>
                <span>Lv.{activeRole.level}</span>
                <span>战力 {activeRole.power}</span>
              </div>
              <p className="role-story">{activeRole.story}</p>
              <div className="role-progress">
                <span>成长进度</span>
                <div className="role-progress-bar">
                  <span className="role-progress-fill" style={{ width: `${Math.min(activeRole.level * 2, 100)}%` }} />
                </div>
              </div>
              <button type="button" className="primary-btn" onClick={() => actions.trainRole(activeRole.id)}>
                执行角色演练 (+1 级，+120 战力)
              </button>
            </article>
          ) : (
            <article className="card">
              <p className="empty-state">暂无角色信息。</p>
            </article>
          )}

          <div className="role-grid">
            {state.roles.map((role) => (
              <article className={`card role-card ${role.id === state.activeRoleId ? "active" : ""}`} key={role.id}>
                <div className="list-header">
                  <h4>{role.name}</h4>
                  <span className="capsule">{role.rarity}</span>
                </div>
                <p className="muted">
                  {role.faction} · {role.element}元素 · Lv.{role.level}
                </p>
                <p className="stat-value">战力 {role.power}</p>
                <div className="role-tags">
                  {role.tags.map((tag) => (
                    <span className="role-tag" key={`${role.id}-${tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => actions.setActiveRole(role.id)}
                  disabled={role.id === state.activeRoleId}
                >
                  {role.id === state.activeRoleId ? "当前已启用" : "切换为主力"}
                </button>
              </article>
            ))}
          </div>
        </section>
      );
      break;

    case "community":
      activePanel = (
        <section className="content-section community-layout">
          <article className="card composer-card">
            <div className="list-header">
              <h3>发布社区动态</h3>
              <span className="capsule">桌面端直发</span>
            </div>
            <form className="composer-form" onSubmit={handleCreatePost}>
              <input
                className="input-control"
                value={postTitle}
                onChange={(event) => setPostTitle(event.currentTarget.value)}
                placeholder="帖子标题"
                maxLength={40}
              />
              <textarea
                className="textarea-control"
                value={postContent}
                onChange={(event) => setPostContent(event.currentTarget.value)}
                placeholder="说点什么：攻略、活动提醒、组队招募都可以..."
                maxLength={180}
              />
              <div className="form-row">
                <select
                  className="select-control"
                  value={postTag}
                  onChange={(event) => setPostTag(event.currentTarget.value as PostTag)}
                >
                  {POST_TAGS.map((tag) => (
                    <option value={tag} key={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <button type="submit" className="primary-btn">
                  发布帖子
                </button>
              </div>
            </form>
          </article>

          <article className="card post-list">
            <div className="list-header">
              <h3>社区动态</h3>
              <span className="muted">共 {state.posts.length} 条</span>
            </div>
            {state.posts.map((post) => (
              <div className="post-card" key={post.id}>
                <div className="post-head">
                  <span className="event-tag community">{post.tag}</span>
                  <strong>{post.title}</strong>
                  <span className="muted">{post.author}</span>
                </div>
                <p>{post.content}</p>
                <div className="post-footer">
                  <span className="muted">{formatRelativeTime(post.createdAt)}</span>
                  <div className="post-actions">
                    <button
                      type="button"
                      className={`text-btn ${post.likedByMe ? "active" : ""}`}
                      onClick={() => actions.likePost(post.id)}
                    >
                      {post.likedByMe ? "已赞" : "点赞"} {post.likes}
                    </button>
                    <span className="muted">评论 {post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </article>
        </section>
      );
      break;

    case "tasks":
      activePanel = (
        <section className="content-section task-layout">
          <article className="card task-card">
            <h3>任务进度</h3>
            <p className="muted">
              已完成 {completedTaskCount}/{totalTaskCount}，当前任务完成度 {taskProgress}%
            </p>
            <div className="progress-line">
              <span className="progress-line-fill" style={{ width: `${taskProgress}%` }} />
            </div>
          </article>

          <article className="card task-card">
            <h3>今日任务清单</h3>
            <div className="task-list">
              {state.tasks.map((task) => (
                <div className={`task-item ${task.status === "done" ? "done" : ""}`} key={task.id}>
                  <button
                    type="button"
                    className={`checkbox-btn ${task.status === "done" ? "checked" : ""}`}
                    onClick={() => actions.toggleTask(task.id)}
                  >
                    {task.status === "done" ? "已完成" : "去完成"}
                  </button>
                  <div className="task-text">
                    <strong>{task.title}</strong>
                    <span>{task.description}</span>
                  </div>
                  <span className="task-reward">+{task.reward} 星钻</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      );
      break;

    case "messages":
      activePanel = (
        <section className="content-section">
          <article className="card notice-card">
            <div className="notice-header">
              <h3>消息通知</h3>
              <button type="button" className="secondary-btn" onClick={actions.markAllNotificationsRead}>
                全部标记已读
              </button>
            </div>

            {state.notifications.length === 0 ? (
              <p className="empty-state">当前没有通知。</p>
            ) : (
              state.notifications.map((notice) => (
                <div className={`notice-item ${notice.read ? "" : "unread"}`} key={notice.id}>
                  <div className="notice-content">
                    <strong>{notice.title}</strong>
                    <p>{notice.content}</p>
                    <span className="notice-time">{formatRelativeTime(notice.time)}</span>
                  </div>
                  {!notice.read ? (
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() => actions.markNotificationRead(notice.id)}
                    >
                      标记已读
                    </button>
                  ) : (
                    <span className="capsule">已读</span>
                  )}
                </div>
              ))
            )}
          </article>
        </section>
      );
      break;

    case "settings":
      activePanel = (
        <section className="content-section setting-grid">
          <article className="card setting-card">
            <h3>启动与同步</h3>
            <label className="toggle-row">
              <span>开机自启桌面客户端</span>
              <input
                type="checkbox"
                checked={state.settings.autoLaunch}
                onChange={(event) => actions.updateSetting("autoLaunch", event.currentTarget.checked)}
              />
            </label>
            <label className="toggle-row">
              <span>启动时自动同步社区数据</span>
              <input
                type="checkbox"
                checked={state.settings.syncOnStartup}
                onChange={(event) => actions.updateSetting("syncOnStartup", event.currentTarget.checked)}
              />
            </label>
            <label className="toggle-row">
              <span>活动开始前推送提醒</span>
              <input
                type="checkbox"
                checked={state.settings.pushOnEventStart}
                onChange={(event) => actions.updateSetting("pushOnEventStart", event.currentTarget.checked)}
              />
            </label>
          </article>

          <article className="card setting-card">
            <h3>应用偏好</h3>
            <label className="field-row">
              <span>语言</span>
              <select
                className="select-control"
                value={state.settings.language}
                onChange={(event) =>
                  actions.updateSetting("language", event.currentTarget.value as "zh-CN" | "en-US")
                }
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </label>
            <label className="field-row">
              <span>更新通道</span>
              <select
                className="select-control"
                value={state.settings.updateChannel}
                onChange={(event) =>
                  actions.updateSetting("updateChannel", event.currentTarget.value as "stable" | "beta")
                }
              >
                <option value="stable">Stable</option>
                <option value="beta">Beta</option>
              </select>
            </label>
            <p className="muted">当前主题：蓝白现代风。后续可接入更多皮肤方案。</p>
          </article>
        </section>
      );
      break;

    default:
      activePanel = null;
      break;
  }

  return (
    <div className="app-bg">
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-chip">YBLB</div>
            <div>
              <p className="brand-title">一步两步 Desktop</p>
              <p className="brand-subtitle">Tauri + React 社区客户端</p>
            </div>
          </div>

          <div className="sidebar-summary">
            <div className="sidebar-summary-row">
              <span>等级</span>
              <strong>Lv.{state.profile.level}</strong>
            </div>
            <div className="sidebar-summary-row">
              <span>星钻</span>
              <strong>{state.coinBalance}</strong>
            </div>
            <div className="sidebar-summary-row">
              <span>未读</span>
              <strong>{unreadCount}</strong>
            </div>
          </div>

          <nav className="nav-list">
            {NAV_ITEMS.map((item) => (
              <button
                type="button"
                key={item.key}
                className={`nav-btn ${activeTab === item.key ? "active" : ""}`}
                onClick={() => setActiveTab(item.key)}
              >
                <span className="nav-label">{item.label}</span>
                <span className="nav-hint">{item.hint}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="main-pane">
          <header className="card topbar">
            <div className="topbar-title">
              <p className="eyebrow">功能中心</p>
              <h2>{currentNav.label}</h2>
            </div>
            <div className="topbar-actions">
              <span className="capsule">连续签到 {signInStreak} 天</span>
              <span className="capsule">未读 {unreadCount}</span>
              <button type="button" className="ghost-btn" onClick={() => setActiveTab("messages")}>
                消息中心
              </button>
            </div>
          </header>

          {activePanel}
        </main>
      </div>
    </div>
  );
}

export default App;
