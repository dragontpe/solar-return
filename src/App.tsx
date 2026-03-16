import { useState } from 'react';
import type { SolarReturnData } from './engine/types';
import { InputScreen } from './screens/InputScreen';
import { CalculatingScreen } from './screens/CalculatingScreen';
import { ResultScreen } from './screens/ResultScreen';

type Screen = 'input' | 'calculating' | 'result';

function App() {
  const [screen, setScreen] = useState<Screen>('input');
  const [result, setResult] = useState<SolarReturnData | null>(null);

  const handleResult = (data: SolarReturnData) => {
    setResult(data);
    setScreen('result');
  };

  const handleStartOver = () => {
    setResult(null);
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
      {screen === 'result' && result && (
        <ResultScreen data={result} onStartOver={handleStartOver} />
      )}
    </div>
  );
}

export default App;
