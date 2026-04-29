import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [editOrder, setEditOrder] = useState(null);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="logo-mark">合</span>
          <span className="logo-text">発注管理システム</span>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn ${page === 'dashboard' ? 'active' : ''}`}
            onClick={() => setPage('dashboard')}
          >ダッシュボード</button>
          <button
            className={`nav-btn ${page === 'new' ? 'active' : ''}`}
            onClick={() => { setPage('new'); setEditOrder(null); }}
          >＋ 新規発注</button>
          <button
            className={`nav-btn ${page === 'list' ? 'active' : ''}`}
            onClick={() => setPage('list')}
          >発注一覧</button>
        </nav>
        <div className="header-right">
          <span className="user-badge">{user.role}</span>
          <span className="user-name">{user.name}</span>
          <button className="logout-btn" onClick={() => setUser(null)}>ログアウト</button>
        </div>
      </header>

      <main className="app-main">
        {page === 'dashboard' && (
          <Dashboard user={user} onNewOrder={() => setPage('new')} onViewList={() => setPage('list')} />
        )}
        {page === 'new' && (
          <OrderForm user={user} onComplete={() => setPage('list')} onCancel={() => setPage('dashboard')} />
        )}
        {page === 'list' && (
          <OrderList user={user} onNewOrder={() => setPage('new')} />
        )}
      </main>
    </div>
  );
}
