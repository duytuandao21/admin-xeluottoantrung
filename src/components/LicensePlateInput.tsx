'use client';

import { Input } from '@/components/ui';
import { formatLicensePlate } from '@/lib/license-plate';

function formatInput(input: HTMLInputElement) {
  const raw = input.value;
  const cursor = input.selectionStart ?? raw.length;
  const formatted = formatLicensePlate(raw);
  if (formatted === raw) return;
  const count = raw.slice(0, cursor).replace(/[^a-z0-9]/gi, '').length;
  let position = 0;
  let seen = 0;
  while (position < formatted.length && seen < count) {
    if (/[A-Z0-9]/.test(formatted[position])) seen++;
    position++;
  }
  input.value = formatted;
  input.setSelectionRange(cursor === raw.length ? formatted.length : position, cursor === raw.length ? formatted.length : position);
}

export default function LicensePlateInput({ defaultValue }: { defaultValue?: string }) {
  return <Input name="licensePlate" aria-label="Biển số" defaultValue={formatLicensePlate(defaultValue)}
    placeholder="VD: 51A-123.45" autoComplete="off" spellCheck={false}
    onChange={event => { if (!(event.nativeEvent as InputEvent).isComposing) formatInput(event.currentTarget); }}
    onCompositionEnd={event => formatInput(event.currentTarget)}
    onBlur={event => formatInput(event.currentTarget)}
    onKeyDown={event => {
      const input = event.currentTarget;
      const cursor = input.selectionStart ?? 0;
      if (event.ctrlKey || event.metaKey || event.altKey || input.selectionEnd !== cursor ||
          !/^\d{2}[A-Z]{1,3}-\d{1,3}(?:\.\d{1,2})?$/.test(input.value)) return;
      // Delete the adjacent character with its automatic separator so editing cannot get stuck.
      if (event.key === 'Backspace' && /[.-]/.test(input.value.charAt(cursor - 1)) && cursor > 1) {
        event.preventDefault();
        input.setRangeText('', cursor - 2, cursor, 'end');
        formatInput(input);
      } else if (event.key === 'Delete' && /[.-]/.test(input.value.charAt(cursor)) && cursor < input.value.length - 1) {
        event.preventDefault();
        input.setRangeText('', cursor, cursor + 2, 'end');
        formatInput(input);
      }
    }} />;
}
