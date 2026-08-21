import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconEye, IconEyeOff } from '../components/common/Icons';
import logoPesantren from '../assets/logo-pesantren.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  // Bersihkan sesi lama setiap kali halaman login dibuka
  useEffect(() => {
    logout();
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

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
                <button
                  type="button"
                  className="login-forgot-link text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline transition-colors cursor-pointer bg-transparent border-0 p-0"
                  onClick={() => setIsForgotModalOpen(true)}
                >
                  Lupa password?
                </button>
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

      {/* POP-UP MODAL LUPA PASSWORD (DESAIN RAPI & MODERN) */}
      {isForgotModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsForgotModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 sm:p-8 border border-slate-100 flex flex-col gap-6 animate-scaleUp text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center shadow-xs">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Lupa Kata Sandi?
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Panduan bantuan &amp; pemulihan akses akun sistem pesantren
                </p>
              </div>
            </div>

            {/* Content Cards */}
            <div className="flex flex-col gap-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">
                  1
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Verifikasi Akun</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Siapkan <strong>NIP/Username</strong> (untuk Staff &amp; Admin) atau <strong>NIS Santri</strong> (untuk Wali Santri) yang terdaftar.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">
                  2
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hubungi Administrator</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Silakan hubungi bagian administrasi (BAK) atau loket Rumah Koin untuk melakukan pengaturan ulang (*reset*) kata sandi.
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col gap-2.5 mt-1">
              <a
                href="https://wa.me/6281234567890?text=Assalamu%27alaikum%20Admin,%20saya%20memerlukan%20bantuan%20reset%20kata%20sandi%20akun%20Sistem%20Koin%20Pesantren."
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                Hubungi Admin via WhatsApp
              </a>

              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Kembali ke Halaman Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
