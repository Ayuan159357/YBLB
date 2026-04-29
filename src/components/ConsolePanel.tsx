import { useMemo } from "react";
import { formatDisplayDate } from "../mockData";
import type { CalendarEvent, EventCategory, NavKey } from "../types";

const MILESTONE_DAYS = [1, 3, 7, 14, 21, 28];

function toCategoryToken(category: EventCategory): "event" | "benefit" | "community" | "update" {
  const map: Record<EventCategory, "event" | "benefit" | "community" | "update"> = {
    赛事: "event",
    福利: "benefit",
    社区: "community",
    更新: "update",
  };
  return map[category] ?? "community";
}

interface ConsolePanelProps {
  signedDates: string[];
  todayKey: string;
  hasSignedToday: boolean;
  signInStreak: number;
  coinBalance: number;
  calendarEvents: CalendarEvent[];
  nickname: string;
  level: number;
  onNavigate: (tab: NavKey) => void;
  onSignIn: () => void;
}

export default function ConsolePanel({
  signedDates,
  todayKey,
  hasSignedToday,
  signInStreak,
  coinBalance,
  calendarEvents,
  nickname,
  level,
  onNavigate,
  onSignIn,
}: ConsolePanelProps) {
  const monthPrefix = todayKey.slice(0, 7);
  const monthlySignInCount = signedDates.filter((dateKey) => dateKey.startsWith(monthPrefix)).length;

  const upcomingEvents = useMemo(() => {
    return [...calendarEvents]
      .filter((event) => event.date >= todayKey)
      .sort((a, b) => `${a.date} ${a.startAt}`.localeCompare(`${b.date} ${b.startAt}`))
      .slice(0, 5);
  }, [calendarEvents, todayKey]);

  return (
    <section className="content-section">
      <article className="card hero-card">
        <div className="hero-main">
          <p className="eyebrow">一步两步社区桌面版</p>
          <h1 className="hero-title">
            控制台 · {nickname}
          </h1>
          <p className="hero-subtitle">
            Lv.{level} · 星钻 {coinBalance} · 连续签到 {signInStreak} 天
          </p>
          <div className="hero-actions">
            {hasSignedToday ? (
              <button type="button" className="primary-btn" disabled>
                今日已签到 ✓
              </button>
            ) : (
              <button type="button" className="primary-btn" onClick={onSignIn}>
                立即签到 +20 星钻
              </button>
            )}
            <button type="button" className="secondary-btn" onClick={() => onNavigate("calendar")}>
              查看活动日历
            </button>
          </div>
        </div>
        <div className="hero-metrics">
          <div className="metric-item">
            <span className="metric-label">星钻余额</span>
            <span className="metric-value">{coinBalance}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">连续签到</span>
            <span className="metric-value">{signInStreak} 天</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">本月签到</span>
            <span className="metric-value">{monthlySignInCount} 天</span>
          </div>
        </div>
      </article>

      <div className="console-grid">
        <article className="card">
          <div className="list-header">
            <h3>签到里程碑</h3>
            <button type="button" className="text-btn" onClick={() => onNavigate("checkin")}>
              查看完整签到
            </button>
          </div>
          <div className="milestone-row" style={{ marginTop: 12 }}>
            {MILESTONE_DAYS.map((day) => (
              <div className={`milestone-item ${monthlySignInCount >= day ? "reached" : ""}`} key={day}>
                <strong>{day} 天</strong>
                <span>{monthlySignInCount >= day ? "已达成" : "未达成"}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card list-card">
          <div className="list-header">
            <h3>近期活动</h3>
            <button type="button" className="text-btn" onClick={() => onNavigate("calendar")}>
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
                      {formatDisplayDate(event.date)} · {event.startAt}
                    </span>
                  </div>
                  <span className="muted">奖励：{event.reward}</span>
                </div>
              );
            })}
            {upcomingEvents.length === 0 && <p className="empty-state">暂无近期活动。</p>}
          </div>
        </article>
      </div>
    </section>
  );
}
