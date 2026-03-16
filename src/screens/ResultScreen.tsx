import type { SolarReturnData } from '../engine/types';

interface Props {
  data: SolarReturnData;
  onStartOver: () => void;
}

export function ResultScreen({ data, onStartOver }: Props) {
  return (
    <div>
      <h2>Solar Return — {data.birthData.name || 'Chart'} ({data.returnYear})</h2>

      <h2>Return Moment</h2>
      <p>UTC: {data.returnDateUTC}</p>
      <p>Local: {data.returnDateLocal}</p>

      <h2>SR Chart</h2>
      <p>Ascendant: {data.srChart.houses.ascSignName} | MC: {data.srChart.houses.mcSignName}</p>
      <table>
        <thead>
          <tr><th>Planet</th><th>Sign</th><th>Degree</th><th>House</th><th>R</th></tr>
        </thead>
        <tbody>
          {data.srChart.planets.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.signName}</td>
              <td>{p.degree}&deg;{p.minute}'</td>
              <td>{p.house}</td>
              <td>{p.retrograde ? 'R' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Natal Chart</h2>
      <p>Ascendant: {data.natalChart.houses.ascSignName} | MC: {data.natalChart.houses.mcSignName}</p>
      <table>
        <thead>
          <tr><th>Planet</th><th>Sign</th><th>Degree</th><th>House</th><th>R</th></tr>
        </thead>
        <tbody>
          {data.natalChart.planets.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.signName}</td>
              <td>{p.degree}&deg;{p.minute}'</td>
              <td>{p.house}</td>
              <td>{p.retrograde ? 'R' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>SR/Natal Contacts</h2>
      <table>
        <thead>
          <tr><th>SR Planet</th><th>Aspect</th><th>Natal Point</th><th>Orb</th></tr>
        </thead>
        <tbody>
          {data.srConjunctNatal.map((c, i) => (
            <tr key={i}>
              <td>{c.srPlanet}</td>
              <td>{c.type}</td>
              <td>{c.natalPoint}</td>
              <td>{c.orb}&deg;</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Year Events (first 30)</h2>
      <ul>
        {data.yearEvents.slice(0, 30).map((e, i) => (
          <li key={i}>{e.date}: {e.description}</li>
        ))}
      </ul>

      <button onClick={onStartOver}>Start Over</button>
    </div>
  );
}
