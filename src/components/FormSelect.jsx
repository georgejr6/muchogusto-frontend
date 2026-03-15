
import React from 'react';
import { Label } from '@/components/ui/label';

const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  error,
  placeholder = 'Select an option',
  required = false,
  className = ''
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-[#FFFDD0]">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`luxury-input appearance-none bg-[rgba(15,0,26,0.9)] ${error ? 'border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''} ${className}`}
      >
        <option value="" disabled className="text-[#F1E5AC]/50">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0f001a] text-[#FFFDD0]">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;
