import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import './App.css';

function App() {
  const [netStatus, setNetStatus] = useState({
    level: 'disconnected',
    label: 'INIT',
    detail: '--',
    metrics: {},
    pose: 'pos: --',
  });

  const handleEStop = () => {
    window.dispatchEvent(new CustomEvent('app:estop'));
    const btn = document.getElementById('eStopButton');
    if (btn) btn.blur(); // remove focus
  };

  return (
    <div className="App">
      <Overlay netStatus={netStatus} onEStop={handleEStop} />
      <Scene onNetStatusChange={setNetStatus} />
    </div>
  );
}

export default App;
