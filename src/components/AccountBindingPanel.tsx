import { useState } from "react";

export default function AccountBindingPanel() {
  const [wechatBound, setWechatBound] = useState(false);
  const [showBindModal, setShowBindModal] = useState(false);

  return (
    <section className="content-section setting-grid">
      <article className="card setting-card">
        <h3>账号绑定</h3>
        <p className="muted">绑定账号后可使用小程序扫码同步数据。</p>

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
                <p className="muted">{wechatBound ? "已绑定" : "未绑定"}</p>
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

        <div className="binding-card" style={{ marginTop: 8 }}>
          <div className="binding-row">
            <div className="binding-info">
              <span className="binding-icon" style={{ background: "rgba(27,113,233,0.14)", color: "var(--brand-main)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <div>
                <strong>小程序同步</strong>
                <p className="muted">桌面端与小程序数据互通</p>
              </div>
            </div>
            <span className="capsule">敬请期待</span>
          </div>
        </div>

        <p className="muted" style={{ marginTop: 8, fontSize: "0.8rem" }}>
          后续将通过小程序 OAuth 授权完成绑定，实现桌面端与移动端数据同步。
        </p>
      </article>

      <article className="card setting-card">
        <h3>关于</h3>
        <p className="muted">YBLB Desktop v0.1.0</p>
        <p className="muted" style={{ marginTop: 4 }}>
          本项目已开源 —
          <a
            href="https://github.com/Ayuan159357/YBLB"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--brand-main)" }}
          >
            GitHub 仓库
          </a>
          <span> · MIT License</span>
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
            <button
              type="button"
              className="primary-btn"
              style={{ marginTop: 12 }}
              onClick={() => {
                setWechatBound(true);
                setShowBindModal(false);
              }}
            >
              模拟绑定成功
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
