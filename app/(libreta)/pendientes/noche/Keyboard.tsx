'use client';

import { useEffect } from 'react';
import { Delete } from 'lucide-react';
import { cn } from '@/lib/utils';

/** What is already known about a letter: Wordle hints, or played in hangman (and whether it was there). */
export type KeyState = 'hit' | 'near' | 'miss' | 'used-hit' | 'used-miss';

const ROWS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];

const COLOR: Record<KeyState, string> = {
  hit: 'bg-acento text-sobre-acento border-acento',
  near: 'bg-acento-suave text-tinta border-acento',
  miss: 'bg-borde/60 text-tinta-suave border-borde line-through',
  'used-hit': 'bg-acento text-sobre-acento border-acento',
  'used-miss': 'bg-borde/60 text-tinta-suave border-borde',
};

/**
 * An on-screen keyboard, with Ñ, for hangman and the word game. On desktop it
 * also listens to the real keyboard. Each key can come painted with what is
 * already known about that letter.
 */
export function Keyboard({
  onLetter,
  onBackspace,
  onEnter,
  stateOf,
  disabled = false,
}: {
  onLetter: (letter: string) => void;
  onBackspace?: () => void;
  onEnter?: () => void;
  stateOf?: (letter: string) => KeyState | undefined;
  disabled?: boolean;
}) {
  useEffect(() => {
    if (disabled) return;
    const listen = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const k = e.key.toUpperCase();
      if (k === 'ENTER' && onEnter) onEnter();
      else if (k === 'BACKSPACE' && onBackspace) onBackspace();
      else if (/^[A-ZÑ]$/.test(k)) onLetter(k);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', listen);
    return () => window.removeEventListener('keydown', listen);
  }, [onLetter, onBackspace, onEnter, disabled]);

  return (
    <div className="flex select-none flex-col items-center gap-1.5" aria-label="Teclado">
      {ROWS.map((row, i) => (
        <div key={row} className="flex w-full justify-center gap-1">
          {i === 2 && onEnter && (
            <Key wide onClick={onEnter} disabled={disabled} label="Listo">
              Listo
            </Key>
          )}
          {[...row].map((l) => {
            const state = stateOf?.(l);
            return (
              <Key
                key={l}
                onClick={() => onLetter(l)}
                // A Wordle miss stays typeable (you may want it anyway); a hangman
                // letter already played does not.
                disabled={disabled || state === 'used-hit' || state === 'used-miss'}
                className={state ? COLOR[state] : undefined}
                label={l}
              >
                {l}
              </Key>
            );
          })}
          {i === 2 && onBackspace && (
            <Key wide onClick={onBackspace} disabled={disabled} label="Borrar">
              <Delete className="size-5" aria-hidden />
            </Key>
          )}
        </div>
      ))}
    </div>
  );
}

function Key({
  children,
  onClick,
  disabled,
  wide = false,
  className,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  wide?: boolean;
  className?: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'foco tocable flex h-11 items-center justify-center rounded-[calc(var(--radio)-4px)] border border-borde bg-superficie font-cartel text-lg tracking-wide text-tinta shadow-baja transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        wide ? 'min-w-14 px-2 text-sm font-semibold' : 'w-[8.6%] min-w-7 max-w-10',
        className,
      )}
    >
      {children}
    </button>
  );
}
