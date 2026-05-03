
export const FieldInput = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
  <div className="input-group">
    <label>{label}</label>
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

export const FieldTextarea = ({ label, value, onChange, placeholder = "" }: any) => (
  <div className="input-group">
    <label>{label}</label>
    <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

export const FieldCheckbox = ({ label, checked, onChange }: any) => (
  <label className="checkbox-label">
    <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
    <span>{label}</span>
  </label>
);

export const FieldSelect = ({ label, value, onChange, options }: any) => (
  <div className="input-group">
    <label>{label}</label>
    <select value={value || ''} onChange={e => onChange(e.target.value)}>
      <option value="">Select...</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);
