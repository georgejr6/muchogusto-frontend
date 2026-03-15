
import React from 'react';
import { Label } from '@/components/ui/label';

const FormTextarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error,
  placeholder,
  required = false,
  maxLength = 500,
  rows = 4,
  className = ''
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-[#FFFDD0]">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={`luxury-input resize-none ${error ? 'border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''} ${className}`}
      />
      <div className="flex justify-between items-center">
        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : (
          <span></span>
        )}
        <p className="text-xs luxury-text-accent">
          {value?.length || 0}/{maxLength}
        </p>
      </div>
    </div>
  );
};

export default FormTextarea;
