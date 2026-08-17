import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

// Zone de depot. Le composant ne connait ni le stockage ni la mesure : il
// remonte le fichier choisi, le service s'occupe du reste.
export function DropZone({ label, accept, hint, file, disabled, onPick, preview }: {
  label: string;
  accept: string;
  hint?: string;
  file: File | null;
  disabled?: boolean;
  onPick: (file: File) => void;
  preview?: string | null;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function pick(chosen: File | undefined) {
    if (chosen) onPick(chosen);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setOver(false);
    if (!disabled) pick(event.dataTransfer.files?.[0]);
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    pick(event.target.files?.[0]);
    // Permet de re-choisir le meme fichier apres une erreur.
    event.target.value = '';
  }

  return (
    <div
      className={`dropzone${over ? ' is-over' : ''}${file ? ' is-filled' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      onClick={() => !disabled && input.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') input.current?.click(); }}
    >
      {preview
        ? <img className="dropzone__thumb" src={preview} alt="" />
        : <span className="dropzone__glyph" aria-hidden="true" />}
      <div className="dropzone__body">
        <strong>{file ? file.name : label}</strong>
        <span className="muted">
          {file ? `${Math.max(1, Math.round(file.size / 1024))} Ko` : (hint ?? '')}
        </span>
      </div>
      <input ref={input} type="file" accept={accept} onChange={onChange} hidden />
    </div>
  );
}
