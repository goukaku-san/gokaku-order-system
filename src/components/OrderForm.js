import React, { useState, useEffect } from 'react';

const UNITS = ['å', 'è¢', 'ç®±', 'kg', 'ã', 'æ'];
const CHANNELS = ['å¬äº', 'åºå®åºè', 'EC', 'å±é'];
const DELIVERY_DESTINATIONS = ['å®å¡ååº«', 'åéæ¬åº', 'ã¯ã·ã­ã¼', 'å¬äºä¼å ´'];
const ACCOUNT_ITEMS = ['ä»å¥é«', 'æ¶èåè²»', 'è·é éè³', 'åºåå®£ä¼è²»'];

const emptyItem = () => ({
  id: Date.now(),
  productName: '',
  supplier: '',
  quantity: 1,
  unit: 'å',
  unitPrice: 0,
  deliveryTo: 'å®å¡ååº«',
  accountItem: 'ä»å¥é«',
});

export default function OrderForm({ user, onComplete, onCancel }) {
  const [channel, setChannel] = useState('å¬äº');
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
      alert('éä¿¡ã«å¤±æãã¾ãã: ' + err.message);
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="form-done">
        <div className="done-icon">â</div>
        <h2>ç³è«ãéä¿¡ãã¾ãã</h2>
        <p>ç®¡çèï¼çç°ï¼ãç¢ºèªå¾ãæ¿èªãã¾ã</p>
      </div>
    );
  }

  return (
    <div className="order-form-wrap">
      <div className="page-header">
        <h2>æ°è¦çºæ³¨ç³è«</h2>
        <span className="page-sub">ç³è«èï¼{user.name}ï¼{user.role}ï¼</span>
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        {/* ãããæå ± */}
        <div className="form-section">
          <h3>åºæ¬æå ±</h3>
          <div className="form-row">
            <div className="field">
              <label>ãã£ãã« <span className="required">*</span></label>
              <select value={channel} onChange={e => setChannel(e.target.value)}>
                {CHANNELS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* æç´° */}
        <div className="form-section">
          <div className="section-header">
            <h3>çºæ³¨æç´°</h3>
            <button type="button" className="btn-add" onClick={addItem}>ï¼ è¡ãè¿½å </button>
          </div>

          {items.map((item, idx) => (
            <div key={item.id} className="item-block">
              <div className="item-num">#{idx + 1}</div>
              <div className="item-fields">
                <div className="field">
                  <label>ååå <span className="required">*</span></label>
                  <input
                    list={`products-${item.id}`}
                    value={item.productName}
                    onChange={e => {
                    const val = e.target.value;
                    updateItem(item.id, 'productName', val);
                    const matched = products.find(p => p.name === val);
                    if (matched) selectProduct(item.id, matched);
                  }}
                    placeholder="åååãå¥åã¾ãã¯é¸æ"
                    required
                  />
                  <datalist id={`products-${item.id}`}>
                    {products.map(p => (
                      <option key={p.id} value={p.name} onClick={() => selectProduct(item.id, p)} />
                    ))}
                  </datalist>
                </div>

                <div className="field">
                  <label>ä»å¥å</label>
                  <input
                    value={item.supplier}
                    onChange={e => updateItem(item.id, 'supplier', e.target.value)}
                    placeholder="ä»å¥åå"
                  />
                </div>

                <div className="field-row">
                  <div className="field field-sm">
                    <label>æ°é <span className="required">*</span></label>
                    <input
                      type="number" min="1"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="field field-sm">
                    <label>åä½</label>
                    <select value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  {user.role === 'ç®¡çè' && (
                    <div className="field field-sm">
                      <label>åä¾¡ï¼åï¼</label>
                      <input
                        type="number" min="0"
                        value={item.unitPrice}
                        onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
                      />
                    </div>
                  )}
                  {user.role === 'ç®¡çè' && (
                    <div className="field field-sm">
                      <label>å°è¨</label>
                      <div className="field-readonly">Â¥{(item.quantity * item.unitPrice).toLocaleString()}</div>
                    </div>
                  )}
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>ç´åå</label>
                    <select value={item.deliveryTo} onChange={e => updateItem(item.id, 'deliveryTo', e.target.value)}>
                      {DELIVERY_DESTINATIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  {user.role === 'ç®¡çè' && (
                    <div className="field">
                      <label>åå®ç§ç®</label>
                      <select value={item.accountItem} onChange={e => updateItem(item.id, 'accountItem', e.target.value)}>
                        {ACCOUNT_ITEMS.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              {items.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => removeItem(item.id)}>Ã</button>
              )}
            </div>
          ))}
        </div>

        {/* åè¨ã»åè */}
        <div className="form-section">
          {user.role === 'ç®¡çè' && (
            <div className="total-row">
              <span>åè¨éé¡</span>
              <span className="total-amount">Â¥{totalAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="field">
            <label>åè</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="ç¹è¨äºé ãããã°å¥åãã¦ãã ãã"
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>ã­ã£ã³ã»ã«</button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'éä¿¡ä¸­...' : 'ç³è«ãã'}
          </button>
        </div>
      </form>
    </div>
  );
}
