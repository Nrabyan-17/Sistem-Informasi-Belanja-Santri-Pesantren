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

      {/* POP-UP MODAL LUPA PASSWORD (LAYOUT PERSIS MODAL SUKSES TAMBAH DATA) */}
      {isForgotModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsForgotModalOpen(false)}
        >
          <div
            className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
            style={{ padding: '36px 28px 28px 28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lock Badge Icon dengan Ring & Bounce (Diberi Jarak Bawah yang Lapang) */}
            <div
              className="modal-badge-bounce w-20 h-20 min-w-[80px] min-h-[80px] rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/10 ring-8 ring-emerald-50 dark:ring-emerald-900/20"
              style={{ marginBottom: '26px' }}
            >
              <svg className="w-9 h-9 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            {/* Title & Subtitle (Diberikan Jarak Margin yang Pas) */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight" style={{ marginBottom: '8px' }}>
              Lupa Kata Sandi?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2" style={{ marginBottom: '24px' }}>
              Panduan bantuan &amp; pemulihan akses akun sistem pesantren
            </p>

            {/* Detail Breakdown Card dengan Spacing Dalam dan Luar yang Lapang */}
            <div
              className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-left flex flex-col gap-4"
              style={{ padding: '22px 20px', marginBottom: '26px' }}
            >
              {/* Item 1 */}
              <div className="flex gap-3.5 items-start">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  1
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Verifikasi Akun
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Siapkan <strong className="text-slate-800 dark:text-slate-100">NIP/Username</strong> (untuk Staff &amp; Admin) atau <strong className="text-slate-800 dark:text-slate-100">NIS Santri</strong> (untuk Wali Santri) yang terdaftar.
                  </p>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200/80 dark:bg-slate-700/80"></div>

              {/* Item 2 */}
              <div className="flex gap-3.5 items-start">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  2
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Hubungi Administrator
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Silakan hubungi bagian administrasi (BAK) atau loket Rumah Koin untuk melakukan pengaturan ulang (*reset*) kata sandi.
                  </p>
                </div>
              </div>
            </div>

            {/* Button Selesai / Kembali ke Halaman Login (Diberikan Jarak Margin yang Jelas) */}
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              style={{ height: '48px' }}
              className="w-full py-3 bg-[#0e5d26] hover:bg-[#0b471d] active:scale-[0.99] text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center"
            >
              Mengerti &amp; Kembali ke Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

