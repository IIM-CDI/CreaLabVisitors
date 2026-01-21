import React, { useEffect, useState } from 'react';
import './App.css';
import Login from './pages/Login/Login';
import Header from './layout/header/Header';
import { setCardScanCallback } from './services/cardScanListener';

function App() {
  const [scannedCardId, setScannedCardId] = useState<string | null>(null);

  useEffect(() => {
    setCardScanCallback((id: string) => setScannedCardId(id));
    return () => setCardScanCallback(() => {});
  }, []);

  return (
    <div className="App">
      <Header setScannedCardId={setScannedCardId} />
      <Login scannedCardId={scannedCardId} />
    </div>
  );
}

export default App;
