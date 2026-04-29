import { useMemo } from "react";
import type { AppState } from "../types";

const MILESTONE_DAYS = [1, 3, 7, 14, 21, 28];

interface CheckInPanelProps {
  signedDates: AppState["signedDates"];
  todayKey: string;
  hasSignedToday: boolean;
  signInStreak: number;
  coinBalance: number;
  onSignIn: () => void;
}

export default function CheckInPanel({
  signedDates,
  todayKey,
  hasSignedToday,
  signInStreak,
  coinBalance,
  onSignIn,
}: CheckInPanelProps) {
  const monthPrefix = todayKey.slice(0, 7);
  const [signYear, signMonth] = monthPrefix.split("-").map(Number);
  const daysInCurrentMonth = new Date(signYear, signMonth, 0).getDate();
  const monthlySignInCount = signedDates.filter((dateKey) => dateKey.startsWith(monthPrefix)).length;
  const signedDateSet = useMemo(() => new Set(signedDates), [signedDates]);

  return (
    <section className="content-section checkin-layout">
      <article className="card checkin-main">
        <div className="list-header">
          <h3>每日签到</h3>
          <span className={`status-pill ${hasSignedToday ? "done" : "pending"}`}>
            {hasSignedToday ? "今日已签到" : "今日待签到"}
          </span>
        </div>
        <p className="muted">
          本月已签到 {monthlySignInCount} 天，连续签到 {signInStreak} 天。
        </p>
        <p className="muted">当前星钻余额：{coinBalance}</p>
        <button type="button" className="primary-btn" disabled={hasSignedToday} onClick={onSignIn}>
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
}
