import { createContext, useContext, useState, useCallback } from 'react';
import Popup from '../components/common/Popup';

const PopupContext = createContext();

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [popupState, setPopupState] = useState({
    isOpen: false,
    type: 'info', // 'success', 'error', 'info'
    title: '',
    message: ''
  });

  const showPopup = useCallback((title, message, type = 'info') => {
    setPopupState({
      isOpen: true,
      title,
      message,
      type
    });
  }, []);

  const closePopup = useCallback(() => {
    setPopupState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <PopupContext.Provider value={{ showPopup }}>
      {children}
      <Popup 
        isOpen={popupState.isOpen}
        type={popupState.type}
        title={popupState.title}
        message={popupState.message}
        onClose={closePopup}
      />
    </PopupContext.Provider>
  );
};
