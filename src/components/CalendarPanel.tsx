import { useMemo, useState } from "react";
import { formatDateKey, formatDisplayDate } from "../mockData";
import type { CalendarEvent, EventCategory } from "../types";

type EventFilter = EventCategory | "全部";

const WEEK_LABELS = ["一", "二", "三", "四", "五", "六", "日"];
const EVENT_FILTERS: EventFilter[] = ["全部", "赛事", "福利", "社区", "更新"];

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
  const map: Record<EventCategory, "event" | "benefit" | "community" | "update"> = {
    赛事: "event",
    福利: "benefit",
    社区: "community",
    更新: "update",
  };
  return map[category] ?? "community";
}

interface CalendarPanelProps {
  calendarEvents: CalendarEvent[];
  todayKey: string;
}

export default function CalendarPanel({ calendarEvents, todayKey }: CalendarPanelProps) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [eventFilter, setEventFilter] = useState<EventFilter>("全部");
  const [showAddModal, setShowAddModal] = useState(false);

  const eventsByDate = useMemo(() => {
    const eventMap = new Map<string, CalendarEvent[]>();
    for (const event of calendarEvents) {
      const list = eventMap.get(event.date) ?? [];
      list.push(event);
      eventMap.set(event.date, list);
    }
    for (const list of eventMap.values()) {
      list.sort((a, b) => `${a.date} ${a.startAt}`.localeCompare(`${b.date} ${b.startAt}`));
    }
    return eventMap;
  }, [calendarEvents]);

  const calendarCells = useMemo(() => buildCalendarCells(monthCursor, todayKey), [monthCursor, todayKey]);

  const selectedDateEvents = useMemo(() => {
    const dailyEvents = eventsByDate.get(selectedDate) ?? [];
    if (eventFilter === "全部") return dailyEvents;
    return dailyEvents.filter((event) => event.category === eventFilter);
  }, [eventsByDate, selectedDate, eventFilter]);

  return (
    <section className="content-section calendar-layout">
      <article className="card calendar-card">
        <div className="calendar-toolbar">
          <div>
            <h3>活动日历</h3>
            <p className="muted">支持按分类筛选赛事、福利、社区和版本更新活动。</p>
          </div>
          <div className="calendar-toolbar-actions">
            <button type="button" className="secondary-btn" onClick={() => setShowAddModal(true)}>
              + 添加活动
            </button>
            <div className="month-nav">
              <button
                type="button"
                className="month-btn"
                onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              >
                上月
              </button>
              <span>{formatMonthTitle(monthCursor)}</span>
              <button
                type="button"
                className="month-btn"
                onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              >
                下月
              </button>
            </div>
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

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="list-header">
              <h3>添加活动</h3>
              <button type="button" className="text-btn" onClick={() => setShowAddModal(false)}>
                关闭
              </button>
            </div>
            <p className="muted" style={{ marginTop: 8 }}>
              手动录入活动信息，数据将保存在本地。
            </p>
            <div className="composer-form" style={{ marginTop: 12 }}>
              <input className="input-control" placeholder="活动标题" disabled />
              <input className="input-control" placeholder="日期 (YYYY-MM-DD)" disabled />
              <div className="form-row">
                <input className="input-control" placeholder="开始时间" disabled />
                <input className="input-control" placeholder="地点" disabled />
              </div>
              <input className="input-control" placeholder="奖励描述" disabled />
              <button type="button" className="primary-btn" disabled>
                保存活动
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
