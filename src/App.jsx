import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { PopupProvider } from './context/PopupContext';
import ScrollToTop from './components/common/ScrollToTop';
import AppRoutes from './routes/AppRoutes';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <PopupProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </PopupProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
