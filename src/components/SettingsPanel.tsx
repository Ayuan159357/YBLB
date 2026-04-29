import { useState } from "react";
import type { AppSettings } from "../types";

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export default function SettingsPanel({ settings, onUpdateSetting }: SettingsPanelProps) {
  const [showBindModal, setShowBindModal] = useState(false);
  const [wechatBound, setWechatBound] = useState(false);
  const [wechatNickname] = useState("晨星旅人");

  return (
    <section className="content-section setting-grid">
      <article className="card setting-card">
        <h3>启动与同步</h3>
        <label className="toggle-row">
          <span>开机自启桌面客户端</span>
          <input
            type="checkbox"
            checked={settings.autoLaunch}
            onChange={(e) => onUpdateSetting("autoLaunch", e.currentTarget.checked)}
          />
        </label>
        <label className="toggle-row">
          <span>启动时自动同步社区数据</span>
          <input
            type="checkbox"
            checked={settings.syncOnStartup}
            onChange={(e) => onUpdateSetting("syncOnStartup", e.currentTarget.checked)}
          />
        </label>
        <label className="toggle-row">
          <span>活动开始前推送提醒</span>
          <input
            type="checkbox"
            checked={settings.pushOnEventStart}
            onChange={(e) => onUpdateSetting("pushOnEventStart", e.currentTarget.checked)}
          />
        </label>
      </article>

      <article className="card setting-card">
        <h3>应用偏好</h3>
        <label className="field-row">
          <span>语言</span>
          <select
            className="select-control"
            value={settings.language}
            onChange={(e) => onUpdateSetting("language", e.currentTarget.value as "zh-CN" | "en-US")}
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
          </select>
        </label>
        <label className="field-row">
          <span>更新通道</span>
          <select
            className="select-control"
            value={settings.updateChannel}
            onChange={(e) => onUpdateSetting("updateChannel", e.currentTarget.value as "stable" | "beta")}
          >
            <option value="stable">Stable</option>
            <option value="beta">Beta</option>
          </select>
        </label>
      </article>

      <article className="card setting-card">
        <h3>账号绑定</h3>
        <p className="muted">绑定微信账号后可使用小程序扫码同步数据。</p>
        <div className="binding-card">
          <div className="binding-row">
            <div className="binding-info">
              <span className="binding-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <div>
                <strong>微信</strong>
                <p className="muted">{wechatBound ? `已绑定 · ${wechatNickname}` : "未绑定"}</p>
              </div>
            </div>
            <button
              type="button"
              className={wechatBound ? "secondary-btn" : "primary-btn"}
              onClick={() => {
                if (wechatBound) {
                  setWechatBound(false);
                } else {
                  setShowBindModal(true);
                }
              }}
            >
              {wechatBound ? "解绑" : "绑定"}
            </button>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 8, fontSize: "0.8rem" }}>
          后续将通过小程序 OAuth 授权完成绑定。
        </p>
      </article>

      {showBindModal && (
        <div className="modal-overlay" onClick={() => setShowBindModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="list-header">
              <h3>绑定微信账号</h3>
              <button type="button" className="text-btn" onClick={() => setShowBindModal(false)}>
                关闭
              </button>
            </div>
            <p className="muted" style={{ marginTop: 8 }}>
              请在小程序中扫描二维码完成授权绑定。
            </p>
            <div className="qrcode-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="8" height="8" rx="1" />
                <rect x="14" y="2" width="8" height="8" rx="1" />
                <rect x="2" y="14" width="8" height="8" rx="1" />
                <path d="M14 16h2v2h-2zM18 14h2v4h-2zM18 20h-2v2h2z" />
                <path d="M20 18h2" />
              </svg>
              <p className="muted">二维码占位（后续对接微信 OAuth）</p>
            </div>
            <button type="button" className="primary-btn" style={{ marginTop: 12 }} onClick={() => setShowBindModal(false)}>
              模拟绑定成功
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
