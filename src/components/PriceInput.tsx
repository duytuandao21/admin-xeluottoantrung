'use client';

import { useRef, useState } from 'react';
import { Input } from '@/components/ui';

export default function PriceInput({ name, defaultValue, required = false, placeholder = 'VD: 890.000.000' }: { name: string; defaultValue?: number; required?: boolean; placeholder?: string }) {
  const [value, setValue] = useState(defaultValue ? defaultValue.toLocaleString('vi-VN') : '');
  const inputRef = useRef<HTMLInputElement>(null);

  return <Input ref={inputRef} name={name} type="text" inputMode="numeric" autoComplete="off" required={required} value={value} placeholder={placeholder} onChange={event => {
    const cursor = event.currentTarget.selectionStart ?? event.currentTarget.value.length;
    const digitsBeforeCursor = event.currentTarget.value.slice(0, cursor).replace(/\D/g, '').length;
    const digits = event.currentTarget.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    const formatted = digits ? Number(digits).toLocaleString('vi-VN') : '';
    setValue(formatted);
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      let position = 0;
      let count = 0;
      while (position < formatted.length && count < digitsBeforeCursor) {
        if (/\d/.test(formatted[position])) count++;
        position++;
      }
      input.setSelectionRange(position, position);
    });
  }} />;
}
