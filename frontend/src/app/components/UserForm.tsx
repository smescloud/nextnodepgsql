import type { FormEventHandler } from 'react';

export interface UserDraft {
  name: string;
  email: string;
}

interface UserFormProps {
  title: string;
  description: string;
  values: UserDraft;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onChange: (field: keyof UserDraft, value: string) => void;
  onCancel?: () => void;
}

export default function UserForm({
  title,
  description,
  values,
  submitLabel,
  submitting = false,
  onSubmit,
  onChange,
  onCancel,
}: UserFormProps) {
  return (
    <section className="rounded-[32px] border border-white/60 bg-[var(--surface)] p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
      <div className="border-b border-[var(--line)] pb-5">
        <p className="text-xs uppercase tracking-[0.28em] text-teal-700">Editor</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
          <input
            type="text"
            value={values.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Jane Doe"
            className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            autoComplete="name"
            disabled={submitting}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={values.email}
            onChange={(event) => onChange('email', event.target.value)}
            placeholder="jane@example.com"
            className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            autoComplete="email"
            disabled={submitting}
          />
        </label>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLabel}
          </button>

          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
