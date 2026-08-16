import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoPesantren from '../assets/logo-pesantren.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [noHp, setNoHp] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login) {
      login({ noHp, role: 'admin' });
    }
    navigate('/admin');
  };

  const handleQuickLogin = (role, targetPath) => {
    if (login) {
      login({ noHp: '081234567890', role: role === 'Staff Rumah Koin' ? 'staff' : 'admin' });
    }
    navigate(targetPath);
  };

  return (
    <div className="login-page min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="login-container max-w-md w-full flex flex-col items-center animate-fadeIn">
        {/* Header Branding */}
        <div className="login-header text-center mb-7">
          <div className="login-logo-badge w-24 h-24 flex items-center justify-center mx-auto mb-3">
            <img src={logoPesantren} alt="Logo Pesantren" className="login-logo-img w-full h-full object-contain mix-blend-multiply" />
          </div>
          <h1 className="login-title text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Nazhatut Thullab</h1>
          <p className="login-subtitle text-sm text-slate-500 font-medium mt-1">Sistem Koin PP Nazhatut Thullab</p>
        </div>

        {/* Form Card */}
        <div className="login-card bg-white w-full rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-xl">
          <form onSubmit={handleSubmit} className="login-form flex flex-col gap-5">
            {/* Nomor Handphone Input */}
            <div className="login-form-group flex flex-col gap-2">
              <label className="login-label text-xs font-bold tracking-wider text-slate-500 uppercase">NOMOR HANDPHONE</label>
              <input
                type="tel"
                className="login-input w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
                placeholder="Masukkan nomor handphone..."
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="login-form-group flex flex-col gap-2">
              <div className="login-label-row flex justify-between items-center">
                <label className="login-label text-xs font-bold tracking-wider text-slate-500 uppercase">PASSWORD</label>
                <a
                  href="#forgot"
                  className="login-forgot-link text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline transition-colors"
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
                className="login-input w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-btn-submit w-full py-3.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-950/20 transition-all mt-1 cursor-pointer"
            >
              Masuk ke Sistem
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="login-quick-section mt-7 pt-6 border-t border-slate-100 flex flex-col gap-3 text-center">
            <span className="login-quick-label text-xs font-bold text-slate-500">
              Ingin login sebagai apa?
            </span>
            <div className="login-quick-grid grid grid-cols-2 gap-2.5">
              <button
                type="button"
                className="login-quick-btn py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                onClick={() => handleQuickLogin('Kabid / Admin', '/admin')}
              >
                Kabid / Admin
              </button>
              <button
                type="button"
                className="login-quick-btn py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                onClick={() => handleQuickLogin('Staff Rumah Koin', '/staff')}
              >
                Staff Rumah Koin
              </button>
            </div>
            <button
              type="button"
              className="login-quick-btn login-quick-btn-full w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
              onClick={() => handleQuickLogin('Wali Santri', '/wali')}
            >
              Wali Santri
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer mt-7 text-xs font-medium text-slate-400 text-center">
          © 2026 PP Nazhatut Thullab
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
