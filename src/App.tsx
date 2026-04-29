import { type ReactNode, useState } from "react";
import "./App.css";
import { useAppStore } from "./hooks/useAppStore";
import type { NavKey } from "./types";
import ConsolePanel from "./components/ConsolePanel";
import CheckInPanel from "./components/CheckInPanel";
import CalendarPanel from "./components/CalendarPanel";
import AccountBindingPanel from "./components/AccountBindingPanel";

const NAV_ITEMS: Array<{ key: NavKey; label: string; hint: string }> = [
  { key: "console", label: "控制台", hint: "签到·活动" },
  { key: "checkin", label: "每日签到", hint: "领奖进度" },
  { key: "calendar", label: "活动日历", hint: "赛事与福利" },
  { key: "account", label: "账号绑定", hint: "微信 OAuth" },
];

function App() {
  const { state, todayKey, hasSignedToday, signInStreak, actions } = useAppStore();

  const [activeTab, setActiveTab] = useState<NavKey>("console");

  const currentNav = NAV_ITEMS.find((item) => item.key === activeTab) ?? NAV_ITEMS[0];

  const handleNavigate = (tab: NavKey) => {
    setActiveTab(tab);
  };

  let activePanel: ReactNode;

  switch (activeTab) {
    case "console":
      activePanel = (
        <ConsolePanel
          signedDates={state.signedDates}
          todayKey={todayKey}
          hasSignedToday={hasSignedToday}
          signInStreak={signInStreak}
          coinBalance={state.coinBalance}
          calendarEvents={state.calendarEvents}
          nickname={state.profile.nickname}
          level={state.profile.level}
          onNavigate={handleNavigate}
          onSignIn={actions.signInToday}
        />
      );
      break;

    case "checkin":
      activePanel = (
        <CheckInPanel
          signedDates={state.signedDates}
          todayKey={todayKey}
          hasSignedToday={hasSignedToday}
          signInStreak={signInStreak}
          coinBalance={state.coinBalance}
          onSignIn={actions.signInToday}
        />
      );
      break;

    case "calendar":
      activePanel = (
        <CalendarPanel calendarEvents={state.calendarEvents} todayKey={todayKey} />
      );
      break;

    case "account":
      activePanel = <AccountBindingPanel />;
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
            <div className="brand-chip">
              <img src="/jpg/dead.png" alt="一步两步" style={{ width: 28, height: 28, borderRadius: 6 }} />
            </div>
            <div>
              <p className="brand-title">一步两步</p>
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
              <span className="capsule">星钻 {state.coinBalance}</span>
            </div>
          </header>

          {activePanel}
        </main>
      </div>
    </div>
  );
}

export default App;
