import type { ChangeEvent, ReactNode } from 'react';

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  required?: boolean;
};

export function TextField({ label, value, onChange, type = 'text', placeholder, required }: TextFieldProps) {
  return (
    <label className="field">
      <span>{label}{required ? ' *' : ''}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      />
    </label>
  );
}

export function TextAreaField({ label, value, onChange }: Omit<TextFieldProps, 'type'>) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
      />
    </label>
  );
}

export function SelectField({ label, children, value, onChange }: {
  label: string; value: string; onChange: (next: string) => void; children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>
    </label>
  );
}
