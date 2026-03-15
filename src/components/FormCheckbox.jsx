
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

const FormCheckbox = ({ 
  label, 
  name, 
  checked, 
  onChange, 
  error,
  required = false,
  className = ''
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <Checkbox
          id={name}
          checked={checked}
          onCheckedChange={onChange}
          className="mt-1 border-[2px] border-[#D4AF37] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:text-[#0f001a] data-[state=checked]:shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-all duration-300"
        />
        <label
          htmlFor={name}
          className={`text-sm text-[#FFFDD0] cursor-pointer leading-relaxed ${className}`}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      </div>
      {error && (
        <p className="text-sm text-red-400 ml-8">{error}</p>
      )}
    </div>
  );
};

export default FormCheckbox;
