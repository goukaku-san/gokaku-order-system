import React, { useEffect, useState } from 'react';

const STATUS_COLOR = {
  '下書き': '#94a3b8',
  '申請中': '#f59e0b',
  '承認済': '#3b82f6',
  '発注済': '#8b5cf6',
  '受領済': '#10b981',
  '却下':   '#ef4444',
};

const STATUS_FLOW = ['申請中', '承認済', '発注済', '受領済'];

export default function OrderList({ user, onNewOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('全て');

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => {
        setOrders(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const visibleOrders = user.role === '管理者'
    ? orders
    : orders.filter(o => o.properties['申請者名']?.rich_text?.[0]?.plain_text === user.name);

  const filteredOrders = filterStatus === '全て'
    ? visibleOrders
    : visibleOrders.filter(o => o.properties['ステータス']?.select?.name === filterStatus);

  const updateStatus = async (pageId, status, reason = '') => {
    setProcessing(true);
    await fetch('/api/order', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, status, rejectReason: reason }),
    });
    setSelected(null);
    setRejectReason('');
    fetchOrders();
    setProcessing(false);
  };

  const getNextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="order-list-wrap">
      <div className="page-header">
        <h2>発注一覧</h2>
        <button className="btn-primary" onClick={onNewOrder}>＋ 新規発注</button>
      </div>

      {/* フィルタ */}
      <div className="filter-bar">
        {['全て', '申請中', '承認済', '発注済', '受領済', '却下'].map(s => (
          <button
            key={s}
            className={`filter-btn ${filterStatus === s ? 'active' : ''}`}
            style={filterStatus === s && s !== '全て' ? { borderColor: STATUS_COLOR[s], color: STATUS_COLOR[s] } : {}}
            onClick={() => setFilterStatus(s)}
          >
            {s}
            {s !== '全て' && (
              <span className="filter-count">
                {visibleOrders.filter(o => o.properties['ステータス']?.select?.name === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading-text">読み込み中...</p>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>該当する発注はありません</p>
        </div>
      ) : (
        <div className="order-table-wrap">
          <table className="order-table">
            <thead>
              <tr>
                <th>発注番号</th>
                <th>申請者</th>
                <th>チャネル</th>
                <th>申請日</th>
                {user.role === '管理者' && <th>金額</th>}
                <th>ステータス</th>
                {user.role === '管理者' && <th>操作</th>}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => {
                const status = o.properties['ステータス']?.select?.name || '-';
                const poNum = o.properties['発注番号']?.title?.[0]?.plain_text || '-';
                const applicant = o.properties['申請者名']?.rich_text?.[0]?.plain_text || '-';
                const channel = o.properties['チャネル']?.select?.name || '-';
                const applyDate = o.properties['申請日']?.date?.start;
                const amount = o.properties['合計金額']?.number;
                const nextStatus = getNextStatus(status);
                const isSelected = selected?.id === o.id;

                return (
                  <React.Fragment key={o.id}>
                    <tr
                      className={`order-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelected(isSelected ? null : o)}
                    >
                      <td className="po-num">{poNum}</td>
                      <td>{applicant}</td>
                      <td><span className="channel-tag">{channel}</span></td>
                      <td>{formatDate(applyDate)}</td>
                      {user.role === '管理者' && (
                        <td>{amount != null ? `¥${amount.toLocaleString()}` : '-'}</td>
                      )}
                      <td>
                        <span className="status-badge" style={{background: STATUS_COLOR[status] + '22', color: STATUS_COLOR[status]}}>
                          {status}
                        </span>
                      </td>
                      {user.role === '管理者' && (
                        <td onClick={e => e.stopPropagation()}>
                          <div className="action-btns">
                            {nextStatus && (
                              <button
                                className="btn-action approve"
                                disabled={processing}
                                onClick={() => updateStatus(o.id, nextStatus)}
                              >
                                {nextStatus}へ
                              </button>
                            )}
                            {status === '申請中' && (
                              <button
                                className="btn-action reject"
                                disabled={processing}
                                onClick={() => setSelected(isSelected ? null : { ...o, rejectMode: true })}
                              >
                                却下
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                    {isSelected && selected.rejectMode && (
                      <tr className="reject-row">
                        <td colSpan={user.role === '管理者' ? 7 : 6}>
                          <div className="reject-form">
                            <input
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              placeholder="却下理由を入力してください"
                              className="reject-input"
                            />
                            <button
                              className="btn-action reject"
                              disabled={processing || !rejectReason}
                              onClick={() => updateStatus(o.id, '却下', rejectReason)}
                            >
                              確定
                            </button>
                            <button className="btn-secondary sm" onClick={() => setSelected(null)}>
                              キャンセル
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
