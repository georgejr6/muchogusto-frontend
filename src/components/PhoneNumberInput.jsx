import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const countries = {
  CO: { name: 'Colombia', code: '+57', flag: '🇨🇴', areaCodes: ['1', '2', '3', '4', '5'] },
  US: { name: 'United States', code: '+1', flag: '🇺🇸', areaCodes: ['212', '310', '415', '512', '305'] },
  TH: { name: 'Thailand', code: '+66', flag: '🇹🇭', areaCodes: ['2', '53', '75', '81', '43'] }
};

const PhoneNumberInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required = false,
  className = '' 
}) => {
  const [selectedCountry, setSelectedCountry] = useState('CO');
  const [selectedAreaCode, setSelectedAreaCode] = useState(countries['CO'].areaCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    // When value changes from outside (or initial mount), parse it if possible
    // This is simple parsing; a robust solution might use libphonenumber-js
    if (value && typeof value === 'string' && value.includes(' ')) {
       // Format expected: +CODE AREA NUMBER
       const parts = value.split(' ');
       if (parts.length >= 3) {
           const cCode = parts[0];
           const aCode = parts[1];
           const num = parts.slice(2).join('');
           
           const foundCountryKey = Object.keys(countries).find(k => countries[k].code === cCode);
           if (foundCountryKey) {
               setSelectedCountry(foundCountryKey);
               setSelectedAreaCode(aCode);
               setPhoneNumber(num);
           }
       }
    }
  }, [value]);

  const handleCountryChange = (cKey) => {
    setSelectedCountry(cKey);
    const newAreaCode = countries[cKey].areaCodes[0];
    setSelectedAreaCode(newAreaCode);
    updateValue(cKey, newAreaCode, phoneNumber);
  };

  const handleAreaCodeChange = (aCode) => {
    setSelectedAreaCode(aCode);
    updateValue(selectedCountry, aCode, phoneNumber);
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // only digits
    setPhoneNumber(rawValue);
    updateValue(selectedCountry, selectedAreaCode, rawValue);
  };

  const updateValue = (cKey, aCode, num) => {
    const cCode = countries[cKey].code;
    const fullNumber = `${cCode} ${aCode} ${num}`;
    // Simulate standard event
    onChange({ target: { name, value: fullNumber } });
  };

  const country = countries[selectedCountry];

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-200">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
          <SelectTrigger className={`w-[110px] bg-gray-900 border-gray-700 text-white ${error ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {Object.entries(countries).map(([key, c]) => (
              <SelectItem key={key} value={key} className="text-white">
                <span className="mr-2">{c.flag}</span> {c.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Area Code Selector */}
        <Select value={selectedAreaCode} onValueChange={handleAreaCodeChange}>
          <SelectTrigger className={`w-[100px] bg-gray-900 border-gray-700 text-white ${error ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {country.areaCodes.map(code => (
              <SelectItem key={code} value={code} className="text-white">
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Phone Number Input */}
        <Input
          type="tel"
          placeholder="0000000"
          value={phoneNumber}
          onChange={handlePhoneChange}
          className={`flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500' : ''} ${className}`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

export default PhoneNumberInput;