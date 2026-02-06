import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './layout/header/Header';
import Calendar from './pages/Calendar/Calendar';
import Inscription from './components/Inscription/Inscription';
import { setCardScanCallback } from './services/cardScanListener';
import { AuthProvider, useAuth } from './context/AuthContext';

type AppState = 'waiting' | 'login' | 'inscription' | 'calendar';

function AppContent() {
  const [scannedCardId, setScannedCardId] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('login');
  const [existingCardId, setExistingCardId] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [refreshEvents, setRefreshEvents] = useState<(() => void) | undefined>(undefined);
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
            <h2>Traitement de la carte...</h2>
            <p>Veuillez patienter pendant que nous vérifions votre carte...</p>
          </div>
        );
      
      case 'inscription':
        return scannedCardId ? <Inscription card_id={scannedCardId} /> : null;
      
      case 'calendar':
        return (
          <div className="calendar-with-connexion">
              {scannedCardId && <Calendar card_id={scannedCardId} setIsAdmin={setIsAdmin} setRefreshEvents={setRefreshEvents} />}
          </div>
        );
      
      case 'login':
      default:
        return (
          <div className="login-container">
            <h2>Bienvenue au CreaLab</h2>
            <p>Veuillez scanner votre carte pour continuer.</p>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <Header setScannedCardId={setScannedCardId} isAdmin={isAdmin} onEventChange={refreshEvents} />
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
