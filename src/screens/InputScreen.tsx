import { useState } from 'react';
import type { SolarReturnData } from '../engine/types';
import { calculateSolarReturn } from '../engine/index';

interface Props {
  onCalculating: () => void;
  onResult: (data: SolarReturnData) => void;
}

export function InputScreen({ onCalculating, onResult }: Props) {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState(1990);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  const [birthHour, setBirthHour] = useState(12);
  const [birthMinute, setBirthMinute] = useState(0);
  const [birthCity, setBirthCity] = useState('');
  const [birthLat, setBirthLat] = useState(0);
  const [birthLon, setBirthLon] = useState(0);
  const [birthTz, setBirthTz] = useState(0);
  const [returnYear, setReturnYear] = useState(new Date().getFullYear() + 1);
  const [returnCity, setReturnCity] = useState('');
  const [returnLat, setReturnLat] = useState(0);
  const [returnLon, setReturnLon] = useState(0);
  const [returnTz, setReturnTz] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    onCalculating();
    try {
      const hour = birthHour + birthMinute / 60;
      const result = await calculateSolarReturn(
        {
          name,
          year: birthYear,
          month: birthMonth,
          day: birthDay,
          hour,
          lat: birthLat,
          lon: birthLon,
          timezone: birthTz,
        },
        {
          name: returnCity,
          lat: returnLat,
          lon: returnLon,
          timezone: returnTz,
        },
        returnYear,
      );
      onResult(result);
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div>
      <h2>Birth Data</h2>
      <div className="form-row">
        <div className="form-group">
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Year</label>
          <input type="number" value={birthYear} onChange={e => setBirthYear(+e.target.value)} />
        </div>
        <div className="form-group">
          <label>Month</label>
          <input type="number" min={1} max={12} value={birthMonth} onChange={e => setBirthMonth(+e.target.value)} />
        </div>
        <div className="form-group">
          <label>Day</label>
          <input type="number" min={1} max={31} value={birthDay} onChange={e => setBirthDay(+e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Hour (24h)</label>
          <input type="number" min={0} max={23} value={birthHour} onChange={e => setBirthHour(+e.target.value)} />
        </div>
        <div className="form-group">
          <label>Minute</label>
          <input type="number" min={0} max={59} value={birthMinute} onChange={e => setBirthMinute(+e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Birth City</label>
          <input value={birthCity} onChange={e => setBirthCity(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Latitude</label>
          <input type="number" step="0.0001" value={birthLat} onChange={e => setBirthLat(+e.target.value)} />
        </div>
        <div className="form-group">
          <label>Longitude</label>
          <input type="number" step="0.0001" value={birthLon} onChange={e => setBirthLon(+e.target.value)} />
        </div>
        <div className="form-group">
          <label>UTC Offset</label>
          <input type="number" step="0.5" value={birthTz} onChange={e => setBirthTz(+e.target.value)} />
        </div>
      </div>

      <h2>Solar Return</h2>
      <div className="form-row">
        <div className="form-group">
          <label>Return Year</label>
          <input type="number" value={returnYear} onChange={e => setReturnYear(+e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Return City</label>
          <input value={returnCity} onChange={e => setReturnCity(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Latitude</label>
          <input type="number" step="0.0001" value={returnLat} onChange={e => setReturnLat(+e.target.value)} />
        </div>
        <div className="form-group">
          <label>Longitude</label>
          <input type="number" step="0.0001" value={returnLon} onChange={e => setReturnLon(+e.target.value)} />
        </div>
        <div className="form-group">
          <label>UTC Offset</label>
          <input type="number" step="0.5" value={returnTz} onChange={e => setReturnTz(+e.target.value)} />
        </div>
      </div>

      <button onClick={handleSubmit}>Calculate Solar Return</button>
      {error && <p style={{ color: '#ff6b6b', marginTop: 12 }}>{error}</p>}
    </div>
  );
}
