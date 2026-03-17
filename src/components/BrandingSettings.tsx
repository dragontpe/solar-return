import type { Branding } from '../types/branding';

interface Props {
  branding: Branding;
  onChange: (b: Branding) => void;
  onClose: () => void;
}

export function BrandingSettings({ branding, onChange, onClose }: Props) {
  const update = (field: keyof Branding, value: string) => {
    onChange({ ...branding, [field]: value });
  };

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <h2>Report Branding</h2>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
          Your company details will appear on the cover page and footer of generated PDF reports.
        </p>

        <div className="form-group">
          <label>Company / Practitioner Name</label>
          <input
            value={branding.companyName}
            onChange={e => update('companyName', e.target.value)}
            placeholder="e.g. Starlight Astrology"
          />
        </div>

        <div className="form-group">
          <label>Tagline</label>
          <input
            value={branding.tagline}
            onChange={e => update('tagline', e.target.value)}
            placeholder="e.g. Professional astrological services"
          />
        </div>

        <div className="form-group">
          <label>Contact (email, website, or phone)</label>
          <input
            value={branding.contact}
            onChange={e => update('contact', e.target.value)}
            placeholder="e.g. hello@starlightastro.com"
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <button onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
