import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePopup } from '../context/PopupContext';
import { IconEye, IconEyeOff } from '../components/common/Icons';
import logoPesantren from '../assets/logo-pesantren.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showPopup } = usePopup();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleNavigate = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'staff') navigate('/staff');
    else if (role === 'wali') navigate('/wali');
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const role = await login(username, password);
      handleRoleNavigate(role);
    } catch (err) {
      setErrorMsg(err.message || 'Username atau password salah.');
    } finally {
      setIsLoading(false);
    }
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
            {/* NIP / Username / NIS Input */}
            <div className="login-form-group flex flex-col gap-2">
              <label className="login-label text-xs font-bold tracking-wider text-slate-500 uppercase">NIP / USERNAME / NIS</label>
              <input
                type="text"
                className="login-input w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
                placeholder="Masukkan NIP, username, atau NIS santri..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                    showPopup('Lupa Password', 'Silakan hubungi administrator untuk mereset password.', 'info');
                  }}
                >
                  Lupa password?
                </a>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors p-1"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-rose-600 text-sm font-semibold text-center mt-2">{errorMsg}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-btn-submit w-full py-3.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-950/20 transition-all mt-1 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? 'Memproses...' : 'Masuk ke Sistem'}
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
