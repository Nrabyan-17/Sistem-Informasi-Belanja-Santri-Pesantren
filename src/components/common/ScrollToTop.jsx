import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Komponen otomatis me-reset posisi scroll ke paling atas (top: 0) saat berpindah halaman
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 1. Reset window & document scroll
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // 2. Reset scroll pada container layout jika ada overflow tersendiri
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.scrollTop = 0;

    const pageContent = document.querySelector('.page-content');
    if (pageContent) pageContent.scrollTop = 0;
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
