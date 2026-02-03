import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './layout/header/Header';
import Calendar from './pages/Calendar/Calendar';
import Inscription from './components/Inscription/Inscription';
import Connexion from './components/Connexion/Connexion';
import { setCardScanCallback } from './services/cardScanListener';
import { AuthProvider, useAuth } from './context/AuthContext';

type AppState = 'waiting' | 'login' | 'inscription' | 'calendar';

function AppContent() {
  const [scannedCardId, setScannedCardId] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('login');
  const [existingCardId, setExistingCardId] = useState<boolean | null>(null);
  const { setToken } = useAuth();

  useEffect(() => {
    setCardScanCallback((id: string) => {
      setScannedCardId(id);
      setAppState('waiting');
    });
    return () => setCardScanCallback(() => {});
  }, []);

  useEffect(() => {
    const checkExistingCard = async (id: string) => {
      try {
        const apiUrl = process.env.REACT_APP_ENV === 'PROD' ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;
        const response = await fetch(`${apiUrl}/check-card/${id}`);
        const data = await response.json();
        setExistingCardId(data.exists);
        if (data.exists && data.token) {
          setToken(data.token);
          setAppState('calendar');
        } else {
          setAppState('inscription');
        }
      } catch (error) {
        console.error('Error checking existing card:', error);
        setAppState('login');
      }
    };

    if (scannedCardId && appState === 'waiting') {
      checkExistingCard(scannedCardId);
    }
  }, [scannedCardId, appState, setToken]);

  const renderContent = () => {
    switch (appState) {
      case 'waiting':
        return (
          <div className="waiting-container">
            <h2>Processing Card...</h2>
            <p>Please wait while we check your card...</p>
          </div>
        );
      
      case 'inscription':
        return scannedCardId ? <Inscription card_id={scannedCardId} /> : null;
      
      case 'calendar':
        return (
          <div className="calendar-with-connexion">
              {scannedCardId && <Calendar card_id={scannedCardId} />}
          </div>
        );
      
      case 'login':
      default:
        return (
          <div className="login-container">
            <h2>Welcome to CreaLab</h2>
            <p>Please scan your card to proceed.</p>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <Header setScannedCardId={setScannedCardId} />
      <div className="app-content">
        {renderContent()}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
