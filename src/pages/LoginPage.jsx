import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoPesantren from '../assets/logo-pesantren.png';
import { IconEye, IconEyeOff } from '../components/common/Icons';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [noHp, setNoHp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login) {
      // Deteksi role berdasarkan input atau default ke admin
      login({ noHp, role: 'admin', nama: 'Ustadzah Ina Wahdiah' });
    }
    navigate('/admin');
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
            {/* Username / Nomor Handphone Input */}
            <div className="login-form-group flex flex-col gap-2">
              <label className="login-label text-xs font-bold tracking-wider text-slate-500 uppercase">USERNAME / NOMOR HP</label>
              <input
                type="text"
                className="login-input w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
                placeholder="Masukkan username atau nomor HP..."
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
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-700 focus:outline-none transition-colors cursor-pointer flex items-center justify-center"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? (
                    <IconEyeOff className="w-5 h-5" />
                  ) : (
                    <IconEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-btn-submit w-full py-3.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-950/20 transition-all mt-1 cursor-pointer"
            >
              Masuk ke Sistem
            </button>
          </form>

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
