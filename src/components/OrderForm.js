import React, { useState, useEffect } from 'react';

const UNITS = ['個', '袋', '箱', 'kg', '㎏', '枚'];
const CHANNELS = ['催事', '固定店舗', 'EC', '共通'];
const DELIVERY_DESTINATIONS = ['宝塚倉庫', '参道本店', 'クシロー', '催事会場'];
const ACCOUNT_ITEMS = ['仕入高', '消耗品費', '荷造運賃', '広告宣伝費'];

const emptyItem = () => ({
  id: Date.now(),
  productName: '',
  supplier: '',
  quantity: 1,
  unit: '個',
  unitPrice: 0,
  deliveryTo: '宝塚倉庫',
  accountItem: '仕入高',
});

export default function OrderForm({ user, onComplete, onCancel }) {
  const [channel, setChannel] = useState('催事');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const selectProduct = (itemId, product) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, productName: product.name, unitPrice: product.price, unit: product.unit }
        : item
    ));
  };

  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (id) => items.length > 1 && setItems(items.filter(i => i.id !== id));

  const totalAmount = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          header: {
            channel,
            applicantName: user.name,
            applicantRole: user.role,
            totalAmount,
            note,
          },
          items: items.map(i => ({
            productName: i.productName,
            supplier: i.supplier,
            quantity: Number(i.quantity),
            unit: i.unit,
            unitPrice: Number(i.unitPrice),
            deliveryTo: i.deliveryTo,
            accountItem: i.accountItem,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        setTimeout(onComplete, 2000);
      }
    } catch (err) {
      alert('送信に失敗しました: ' + err.message);
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="form-done">
        <div className="done-icon">✓</div>
        <h2>申請を送信しました</h2>
        <p>管理者（熊田）が確認後、承認します</p>
      </div>
    );
  }

  return (
    <div className="order-form-wrap">
      <div className="page-header">
        <h2>新規発注申請</h2>
        <span className="page-sub">申請者：{user.name}（{user.role}）</span>
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        {/* ヘッダ情報 */}
        <div className="form-section">
          <h3>基本情報</h3>
          <div className="form-row">
            <div className="field">
              <label>チャネル <span className="required">*</span></label>
              <select value={channel} onChange={e => setChannel(e.target.value)}>
                {CHANNELS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 明細 */}
        <div className="form-section">
          <div className="section-header">
            <h3>発注明細</h3>
            <button type="button" className="btn-add" onClick={addItem}>＋ 行を追加</button>
          </div>

          {items.map((item, idx) => (
            <div key={item.id} className="item-block">
              <div className="item-num">#{idx + 1}</div>
              <div className="item-fields">
                <div className="field">
                  <label>商品名 <span className="required">*</span></label>
                  <input
                    list={`products-${item.id}`}
                    value={item.productName}
                    onChange={e => updateItem(item.id, 'productName', e.target.value)}
                    placeholder="商品名を入力または選択"
                    required
                  />
                  <datalist id={`products-${item.id}`}>
                    {products.map(p => (
                      <option key={p.id} value={p.name} onClick={() => selectProduct(item.id, p)} />
                    ))}
                  </datalist>
                </div>

                <div className="field">
                  <label>仕入先</label>
                  <input
                    value={item.supplier}
                    onChange={e => updateItem(item.id, 'supplier', e.target.value)}
                    placeholder="仕入先名"
                  />
                </div>

                <div className="field-row">
                  <div className="field field-sm">
                    <label>数量 <span className="required">*</span></label>
                    <input
                      type="number" min="1"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="field field-sm">
                    <label>単位</label>
                    <select value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  {user.role === '管理者' && (
                    <div className="field field-sm">
                      <label>単価（円）</label>
                      <input
                        type="number" min="0"
                        value={item.unitPrice}
                        onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
                      />
                    </div>
                  )}
                  {user.role === '管理者' && (
                    <div className="field field-sm">
                      <label>小計</label>
                      <div className="field-readonly">¥{(item.quantity * item.unitPrice).toLocaleString()}</div>
                    </div>
                  )}
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>納品先</label>
                    <select value={item.deliveryTo} onChange={e => updateItem(item.id, 'deliveryTo', e.target.value)}>
                      {DELIVERY_DESTINATIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  {user.role === '管理者' && (
                    <div className="field">
                      <label>勘定科目</label>
                      <select value={item.accountItem} onChange={e => updateItem(item.id, 'accountItem', e.target.value)}>
                        {ACCOUNT_ITEMS.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              {items.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => removeItem(item.id)}>×</button>
              )}
            </div>
          ))}
        </div>

        {/* 合計・備考 */}
        <div className="form-section">
          {user.role === '管理者' && (
            <div className="total-row">
              <span>合計金額</span>
              <span className="total-amount">¥{totalAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="field">
            <label>備考</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="特記事項があれば入力してください"
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>キャンセル</button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? '送信中...' : '申請する'}
          </button>
        </div>
      </form>
    </div>
  );
}
