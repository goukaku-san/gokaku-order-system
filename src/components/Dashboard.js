import React, { useEffect, useState } from 'react';

const STATUS_COLOR = {
  '下書き': '#94a3b8',
  '申請中': '#f59e0b',
  '承認済': '#3b82f6',
  '発注済': '#8b5cf6',
  '受領済': '#10b981',
  '却下':   '#ef4444',
};

export default function Dashboard({ user, onNewOrder, onViewList }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => {
        const results = data.results || [];
        setOrders(results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const myOrders = user.role === '管理者'
    ? orders
    : orders.filter(o => o.properties['申請者名']?.rich_text?.[0]?.plain_text === user.name);

  const countByStatus = (status) => myOrders.filter(o => o.properties['ステータス']?.select?.name === status).length;
  const pending = countByStatus('申請中');
  const approved = countByStatus('承認済');
  const total = myOrders.length;

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>ダッシュボード</h2>
        <span className="page-sub">こんにちは、{user.name}さん</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num">{pending}</div>
          <div className="stat-label">申請中</div>
          <div className="stat-dot" style={{background: STATUS_COLOR['申請中']}} />
        </div>
        <div className="stat-card">
          <div className="stat-num">{approved}</div>
          <div className="stat-label">承認済</div>
          <div className="stat-dot" style={{background: STATUS_COLOR['承認済']}} />
        </div>
        <div className="stat-card">
          <div className="stat-num">{total}</div>
          <div className="stat-label">総件数</div>
          <div className="stat-dot" style={{background: '#64748b'}} />
        </div>
      </div>

      <div className="action-cards">
        <button className="action-card primary" onClick={onNewOrder}>
          <span className="action-icon">＋</span>
          <span className="action-title">新規発注申請</span>
          <span className="action-desc">商品・消耗品の発注を申請する</span>
        </button>
        <button className="action-card" onClick={onViewList}>
          <span className="action-icon">📋</span>
          <span className="action-title">発注一覧を見る</span>
          <span className="action-desc">申請・承認状況を確認する</span>
        </button>
      </div>

      {user.role === '管理者' && pending > 0 && (
        <div className="alert-banner">
          ⚠️ 承認待ちの発注が <strong>{pending}件</strong> あります
          <button onClick={onViewList} className="alert-link">確認する →</button>
        </div>
      )}

      <div className="recent-section">
        <h3>最近の発注</h3>
        {loading ? (
          <p className="loading-text">読み込み中...</p>
        ) : myOrders.length === 0 ? (
          <p className="empty-text">発注履歴がありません</p>
        ) : (
          <div className="order-list-mini">
            {myOrders.slice(0, 5).map(o => {
              const status = o.properties['ステータス']?.select?.name || '不明';
              const poNum = o.properties['発注番号']?.title?.[0]?.plain_text || '-';
              const amount = o.properties['合計金額']?.number;
              const channel = o.properties['チャネル']?.select?.name || '-';
              return (
                <div key={o.id} className="order-row-mini">
                  <span className="order-po">{poNum}</span>
                  <span className="order-channel">{channel}</span>
                  <span className="status-badge" style={{background: STATUS_COLOR[status] + '22', color: STATUS_COLOR[status]}}>
                    {status}
                  </span>
                  {user.role === '管理者' && amount != null && (
                    <span className="order-amount">¥{amount.toLocaleString()}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
