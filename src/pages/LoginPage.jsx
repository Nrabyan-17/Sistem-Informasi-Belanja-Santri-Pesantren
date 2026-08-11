import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoPesantren from '../assets/logo-pesantren.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login) {
      login({ username, role: 'admin' });
    }
    navigate('/admin');
  };

  const handleQuickLogin = (role, targetPath) => {
    if (login) {
      login({ username: role, role: role === 'Staff Rumah Koin' ? 'staff' : 'admin' });
    }
    navigate(targetPath);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header Branding */}
        <div className="login-header">
          <div className="login-logo-badge">
            <img src={logoPesantren} alt="Logo Pesantren" className="login-logo-img" />
          </div>
          <h1 className="login-title">Nazhatut Thullab</h1>
          <p className="login-subtitle">Sistem Koin PP Nazhatut Thullab</p>
        </div>

        {/* Form Card */}
        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            {/* Username Input */}
            <div className="login-form-group">
              <label className="login-label">USERNAME</label>
              <input
                type="text"
                className="login-input"
                placeholder="Masukkan username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="login-form-group">
              <div className="login-label-row">
                <label className="login-label">PASSWORD</label>
                <a
                  href="#forgot"
                  className="login-forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Silakan hubungi administrator untuk mereset password.');
                  }}
                >
                  Lupa password?
                </a>
              </div>
              <input
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="login-btn-submit">
              Masuk ke Sistem
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="login-quick-section">
            <span className="login-quick-label">LOGIN CEPAT (PROTOTIPE)</span>
            <div className="login-quick-grid">
              <button
                type="button"
                className="login-quick-btn"
                onClick={() => handleQuickLogin('Kabid / Admin', '/admin')}
              >
                Kabid / Admin
              </button>
              <button
                type="button"
                className="login-quick-btn"
                onClick={() => handleQuickLogin('Staff Rumah Koin', '/staff')}
              >
                Staff Rumah Koin
              </button>
            </div>
            <button
              type="button"
              className="login-quick-btn login-quick-btn-full"
              onClick={() => handleQuickLogin('Wali Santri', '/wali')}
            >
              Wali Santri
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          © 2026 PP Nazhatut Thullab
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
