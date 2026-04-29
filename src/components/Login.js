import React, { useState } from 'react';

// Phase1: 簡易ログイン（将来Google OAuth化）
const USERS = [
  { id: 'tamai',   name: '玉井 宏生',  email: 'info@gokaku.co.jp',    role: '管理者',  password: 'gokaku2024' },
  { id: 'kumada',  name: '熊田 かおり', email: 'kaori@gokaku.co.jp',   role: '管理者',  password: 'gokaku2024' },
  { id: 'ishida',  name: '石田 大介',  email: 'ishida@gokaku.co.jp',  role: '社員',    password: 'staff2024' },
  { id: 'araki',   name: '新木 重幸',  email: 'araki@gokaku.co.jp',   role: '社員',    password: 'staff2024' },
  { id: 'tanaka',  name: '田中 明泰',  email: 'tanaka@gokaku.co.jp',  role: '社員',    password: 'staff2024' },
  { id: 'ozaki',   name: '尾崎 正俊',  email: 'ozaki@gokaku.co.jp',   role: '社員',    password: 'staff2024' },
  { id: 'otsuki',  name: '大槻 健治',  email: 'otsuki@kansaifc.jp',   role: '下請け',  password: 'agent2024' },
  { id: 'ito',     name: '伊藤 亨人',  email: 'ito@kantofc.jp',       role: '下請け',  password: 'agent2024' },
  { id: 'isogai',  name: '磯貝 昌俊',  email: 'isogai@sj.jp',         role: '下請け',  password: 'agent2024' },
  { id: 'yamazaki',name: '山嵜 修一',  email: 'yamazaki@sj.jp',       role: '下請け',  password: 'agent2024' },
];

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('メールアドレスまたはパスワードが違います');
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-mark-lg">合</span>
          <h1>発注管理システム</h1>
          <p>株式会社合格</p>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          <div className="field">
            <label>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="field">
            <label>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary login-btn">ログイン</button>
        </form>
        <p className="login-note">パスワード不明の場合は管理者（熊田）へ</p>
      </div>
    </div>
  );
}
