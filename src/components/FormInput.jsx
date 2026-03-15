
import React from 'react';
import { Label } from '@/components/ui/label';

const FormInput = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  placeholder,
  required = false,
  className = '',
  maxLength,
  ...props 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-[#FFFDD0]">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`luxury-input ${error ? 'border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormInput;
