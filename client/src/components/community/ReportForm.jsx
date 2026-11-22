/** Public report form. Submissions go to moderation and are never counted as official statistics. */
import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { REPORT_CATEGORIES } from '@shared/categories.js';
import { submitCommunityReport } from '@/services/dataService';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Hyderabad', 'Sukkur', 'Multan', 'Peshawar', 'Quetta', 'Faisalabad'];

// Local calendar date as YYYY-MM-DD (toISOString would shift it for users east of UTC).
const localDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const EMPTY = { city: '', area: '', category: REPORT_CATEGORIES[0], incidentDate: localDate(), description: '', contact: '', website: '' };

function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error ? <span role="alert" className="mt-1 block text-xs text-red-300">{error}</span> : hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export default function ReportForm({ onSubmitted }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus({ state: 'sending', message: '' });
    setErrors({});
    try {
      const res = await submitCommunityReport(form);
      setForm({ ...EMPTY, incidentDate: localDate() });
      setStatus({ state: 'done', message: res.message });
      onSubmitted?.();
    } catch (err) {
      setErrors(err.fields ?? {});
      setStatus({ state: 'error', message: err.fields ? 'Please fix the highlighted fields.' : err.message });
    }
  }

  const sending = status.state === 'sending';

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="City" error={errors.city}>
          <input className="glass-input" list="report-cities" value={form.city} onChange={update('city')} maxLength={60} required placeholder="e.g. Karachi" />
          <datalist id="report-cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="Area / neighbourhood" error={errors.area}>
          <input className="glass-input" value={form.area} onChange={update('area')} maxLength={80} required placeholder="e.g. Saddar" />
        </Field>
        <Field label="What happened?" error={errors.category}>
          <select className="glass-input [&>option]:bg-ink-800" value={form.category} onChange={update('category')}>
            {REPORT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Date of incident" error={errors.incidentDate}>
          <input type="date" className="glass-input" value={form.incidentDate} onChange={update('incidentDate')} min={localDate(-365)} max={localDate()} required />
        </Field>
      </div>

      <Field label="Description" error={errors.description} hint={`${form.description.length}/1000 - describe what happened and where. Do not include names or phone numbers of other people.`}>
        <textarea className="glass-input min-h-[120px] resize-y" value={form.description} onChange={update('description')} maxLength={1000} required />
      </Field>

      <Field label="Contact (optional)" error={errors.contact} hint="Only admins can see this, and only to follow up on the report.">
        <input className="glass-input" value={form.contact} onChange={update('contact')} maxLength={100} autoComplete="off" />
      </Field>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} /></label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={sending} className="btn-gradient disabled:opacity-60"><FiSend size={14} /> {sending ? 'Sending...' : 'Submit report'}</button>
        <p className="text-xs text-slate-500">Reports are reviewed by an admin before they are marked verified.</p>
      </div>

      {status.state === 'done' && <p role="status" className="rounded-2xl border border-risk-low/30 bg-risk-low/10 px-4 py-3 text-sm text-green-200">{status.message}</p>}
      {status.state === 'error' && <p role="alert" className="rounded-2xl border border-risk-high/30 bg-risk-high/10 px-4 py-3 text-sm text-red-200">{status.message}</p>}
    </form>
  );
}
