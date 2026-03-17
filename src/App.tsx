import { useState } from 'react';
import type { SolarReturnData } from './engine/types';
import type { ReportData } from './report/assembler';
import { InputScreen } from './screens/InputScreen';
import { CalculatingScreen } from './screens/CalculatingScreen';
import { ResultScreen } from './screens/ResultScreen';

type Screen = 'input' | 'calculating' | 'result';

function App() {
  const [screen, setScreen] = useState<Screen>('input');
  const [srData, setSrData] = useState<SolarReturnData | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);

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

  return (
    <div>
      <h1>Solar Return</h1>
      {screen === 'input' && (
        <InputScreen
          onCalculating={() => setScreen('calculating')}
          onResult={handleResult}
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
