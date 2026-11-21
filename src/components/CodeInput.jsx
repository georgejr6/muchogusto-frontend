import React, { useRef } from 'react';

export const CODE_LEN = 6;

// Six boxes, one hidden-feeling input each. Supports paste and iOS/Android one-time-code autofill.
const CodeInput = ({ value, onChange, onComplete, disabled }) => {
  const refs = useRef([]);
  const digits = Array.from({ length: CODE_LEN }, (_, i) => value[i] || '');

  const setAt = (i, ch) => {
    const arr = digits.slice();
    arr[i] = ch;
    const next = arr.join('').slice(0, CODE_LEN);
    onChange(next);
    if (next.length === CODE_LEN && !next.includes(' ')) onComplete?.(next);
  };

  const handleChange = (i, e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) { setAt(i, ''); return; }
    if (raw.length > 1) {
      const next = raw.slice(0, CODE_LEN);
      onChange(next);
      refs.current[Math.min(next.length, CODE_LEN - 1)]?.focus();
      if (next.length === CODE_LEN) onComplete?.(next);
      return;
    }
    setAt(i, raw);
    if (i < CODE_LEN - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          pattern="[0-9]*"
          maxLength={CODE_LEN}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className="mg-input !px-0 text-center font-display text-2xl"
          style={{ width: '100%', minWidth: 0 }}
        />
      ))}
    </div>
  );
};

export default CodeInput;
