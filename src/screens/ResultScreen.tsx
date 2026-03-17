import { useState } from 'react';
import type { ReportData } from '../report/assembler';
import type { ChartData } from '../engine/types';
import { buildPDF } from '../pdf/generator';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

interface Props {
  report: ReportData;
  srChart: ChartData;
  onStartOver: () => void;
}

export function ResultScreen({ report, srChart, onStartOver }: Props) {
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleGeneratePDF = async () => {
    setGenerating(true);
    setError('');
    setSaved(false);
    try {
      const pdfBytes = await buildPDF(report, srChart);
      const defaultName = `SolarReturn_${report.name}_${report.returnYear}.pdf`;
      const path = await save({
        defaultPath: defaultName,
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      });
      if (path) {
        await writeFile(path, pdfBytes);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setGenerating(false);
    }
  };

  const ordinal = (n: number) => {
    const s = ['th','st','nd','rd'];
    const v = n % 100;
    return n + (s[(v-20)%10] ?? s[v] ?? s[0]);
  };

  return (
    <div>
      <h2>Solar Return -- {report.name} ({report.returnYear})</h2>

      <div className="pills">
        <span className="pill">{report.srAscendant} Rising</span>
        <span className="pill">Sun in {ordinal(report.srSunHouse)}</span>
        <span className="pill">Moon in {report.srMoonSign} {ordinal(report.srMoonHouse)}</span>
      </div>

      <p style={{ color: '#9db4ff', fontSize: 13, margin: '8px 0' }}>
        {report.returnDateLocal} -- {report.returnLocation}
      </p>

      <h2>Report Contents</h2>
      <div className="section-list">
        {report.sections.map((s, i) => (
          <div key={i} className="section-preview">
            <strong>{s.heading}</strong>
            {s.subheading && <span className="sub"> -- {s.subheading}</span>}
            <p className="preview-text">
              {s.body.replace(/\*\*/g, '').substring(0, 120)}...
            </p>
          </div>
        ))}
      </div>

      <div className="actions">
        {generating ? (
          <div className="spinner">
            <p>Building your report...</p>
          </div>
        ) : saved ? (
          <p style={{ color: '#4ade80', fontSize: 16 }}>Report saved!</p>
        ) : (
          <>
            <button className="primary" onClick={handleGeneratePDF}>
              Generate PDF Report
            </button>
            <button className="secondary" onClick={onStartOver}>
              Start Over
            </button>
          </>
        )}
        {error && <p style={{ color: '#ff6b6b', marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  );
}
