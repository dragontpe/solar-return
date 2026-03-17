import { useState } from 'react';
import type { SolarReturnData } from './engine/types';
import type { ReportData } from './report/assembler';
import type { Branding } from './types/branding';
import { loadBranding, saveBranding } from './types/branding';
import { InputScreen } from './screens/InputScreen';
import { CalculatingScreen } from './screens/CalculatingScreen';
import { ResultScreen } from './screens/ResultScreen';
import { BrandingSettings } from './components/BrandingSettings';

type Screen = 'input' | 'calculating' | 'result';

function App() {
  const [screen, setScreen] = useState<Screen>('input');
  const [srData, setSrData] = useState<SolarReturnData | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [branding, setBranding] = useState<Branding>(loadBranding);
  const [showSettings, setShowSettings] = useState(false);

  const handleResult = (data: SolarReturnData, reportData: ReportData) => {
    setSrData(data);
    setReport(reportData);
    setScreen('result');
  };

  const handleStartOver = () => {
    setSrData(null);
    setReport(null);
    setScreen('input');
  };

  const handleBrandingChange = (b: Branding) => {
    setBranding(b);
    saveBranding(b);
  };

  return (
    <div>
      <div className="top-bar">
        <h1>Solar Return</h1>
        <button className="settings-btn" onClick={() => setShowSettings(true)}>Settings</button>
      </div>
      {showSettings && (
        <BrandingSettings
          branding={branding}
          onChange={handleBrandingChange}
          onClose={() => setShowSettings(false)}
        />
      )}
      {screen === 'input' && (
        <InputScreen
          onCalculating={() => setScreen('calculating')}
          onResult={handleResult}
          branding={branding}
        />
      )}
      {screen === 'calculating' && <CalculatingScreen />}
      {screen === 'result' && report && srData && (
        <ResultScreen report={report} srChart={srData.srChart} onStartOver={handleStartOver} />
      )}
    </div>
  );
}

export default App;
