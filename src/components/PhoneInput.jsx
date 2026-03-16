import React, { useState } from 'react';
import { X } from 'lucide-react';

export const COUNTRY_CODES = [
  { value: '+1',    label: 'USA / Canada (+1)' },
  { value: '+57',   label: 'Colombia (+57)' },
  { value: '+66',   label: 'Thailand (+66)' },
  { value: '+44',   label: 'UK (+44)' },
  { value: '+34',   label: 'Spain (+34)' },
  { value: '+52',   label: 'Mexico (+52)' },
  { value: '+55',   label: 'Brazil (+55)' },
  { value: '+54',   label: 'Argentina (+54)' },
  { value: '+56',   label: 'Chile (+56)' },
  { value: '+51',   label: 'Peru (+51)' },
  { value: '+58',   label: 'Venezuela (+58)' },
  { value: '+593',  label: 'Ecuador (+593)' },
  { value: '+507',  label: 'Panama (+507)' },
  { value: '+502',  label: 'Guatemala (+502)' },
  { value: '+503',  label: 'El Salvador (+503)' },
  { value: '+504',  label: 'Honduras (+504)' },
  { value: '+505',  label: 'Nicaragua (+505)' },
  { value: '+506',  label: 'Costa Rica (+506)' },
  { value: '+53',   label: 'Cuba (+53)' },
  { value: '+1809', label: 'Dominican Rep. (+1809)' },
  { value: '+591',  label: 'Bolivia (+591)' },
  { value: '+595',  label: 'Paraguay (+595)' },
  { value: '+598',  label: 'Uruguay (+598)' },
  { value: '+49',   label: 'Germany (+49)' },
  { value: '+33',   label: 'France (+33)' },
  { value: '+39',   label: 'Italy (+39)' },
  { value: '+31',   label: 'Netherlands (+31)' },
  { value: '+32',   label: 'Belgium (+32)' },
  { value: '+41',   label: 'Switzerland (+41)' },
  { value: '+43',   label: 'Austria (+43)' },
  { value: '+351',  label: 'Portugal (+351)' },
  { value: '+30',   label: 'Greece (+30)' },
  { value: '+46',   label: 'Sweden (+46)' },
  { value: '+47',   label: 'Norway (+47)' },
  { value: '+45',   label: 'Denmark (+45)' },
  { value: '+358',  label: 'Finland (+358)' },
  { value: '+48',   label: 'Poland (+48)' },
  { value: '+7',    label: 'Russia (+7)' },
  { value: '+380',  label: 'Ukraine (+380)' },
  { value: '+90',   label: 'Turkey (+90)' },
  { value: '+20',   label: 'Egypt (+20)' },
  { value: '+27',   label: 'South Africa (+27)' },
  { value: '+234',  label: 'Nigeria (+234)' },
  { value: '+254',  label: 'Kenya (+254)' },
  { value: '+212',  label: 'Morocco (+212)' },
  { value: '+233',  label: 'Ghana (+233)' },
  { value: '+255',  label: 'Tanzania (+255)' },
  { value: '+256',  label: 'Uganda (+256)' },
  { value: '+91',   label: 'India (+91)' },
  { value: '+92',   label: 'Pakistan (+92)' },
  { value: '+880',  label: 'Bangladesh (+880)' },
  { value: '+94',   label: 'Sri Lanka (+94)' },
  { value: '+977',  label: 'Nepal (+977)' },
  { value: '+86',   label: 'China (+86)' },
  { value: '+81',   label: 'Japan (+81)' },
  { value: '+82',   label: 'South Korea (+82)' },
  { value: '+65',   label: 'Singapore (+65)' },
  { value: '+60',   label: 'Malaysia (+60)' },
  { value: '+62',   label: 'Indonesia (+62)' },
  { value: '+63',   label: 'Philippines (+63)' },
  { value: '+84',   label: 'Vietnam (+84)' },
  { value: '+66',   label: 'Thailand (+66)' },
  { value: '+95',   label: 'Myanmar (+95)' },
  { value: '+855',  label: 'Cambodia (+855)' },
  { value: '+856',  label: 'Laos (+856)' },
  { value: '+61',   label: 'Australia (+61)' },
  { value: '+64',   label: 'New Zealand (+64)' },
  { value: '+971',  label: 'UAE (+971)' },
  { value: '+966',  label: 'Saudi Arabia (+966)' },
  { value: '+972',  label: 'Israel (+972)' },
  { value: '+961',  label: 'Lebanon (+961)' },
  { value: '+962',  label: 'Jordan (+962)' },
  { value: '+964',  label: 'Iraq (+964)' },
  { value: '+98',   label: 'Iran (+98)' },
  { value: '+967',  label: 'Yemen (+967)' },
  { value: '+974',  label: 'Qatar (+974)' },
  { value: '+965',  label: 'Kuwait (+965)' },
  { value: '+973',  label: 'Bahrain (+973)' },
];

/**
 * PhoneInput — country code dropdown (with manual fallback) + phone number field.
 *
 * Props:
 *   countryCode       string   — selected country code value (e.g. '+57')
 *   onCountryChange   fn       — called with new code string
 *   phone             string   — the number portion
 *   onPhoneChange     fn       — called with new number string
 *   error             string   — validation error message
 *   required          bool
 *   label             string   — defaults to 'Phone Number'
 *   autoFocus         bool
 */
const PhoneInput = ({
  countryCode,
  onCountryChange,
  phone,
  onPhoneChange,
  error,
  required = false,
  label = 'Phone Number',
  autoFocus = false,
}) => {
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const handleSelectChange = (e) => {
    if (e.target.value === '__other__') {
      setManualMode(true);
      setManualCode('');
      onCountryChange('');
    } else {
      onCountryChange(e.target.value);
    }
  };

  const handleManualChange = (e) => {
    const val = e.target.value;
    setManualCode(val);
    onCountryChange(val);
  };

  const exitManual = () => {
    setManualMode(false);
    setManualCode('');
    onCountryChange(COUNTRY_CODES[0].value);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#FFFDD0]">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="flex gap-2">
        {/* Country code selector or manual input */}
        {manualMode ? (
          <div className="flex items-center gap-1 w-[130px]">
            <input
              type="text"
              value={manualCode}
              onChange={handleManualChange}
              placeholder="+123"
              maxLength={6}
              className="luxury-input w-full"
              autoFocus
            />
            <button
              type="button"
              onClick={exitManual}
              className="text-muted-foreground hover:text-[#D4AF37] flex-shrink-0"
              title="Back to list"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <select
            value={countryCode}
            onChange={handleSelectChange}
            className="luxury-input appearance-none bg-[rgba(15,0,26,0.9)] w-[175px] flex-shrink-0 text-sm"
          >
            {COUNTRY_CODES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
            <option value="__other__">Other (enter manually)</option>
          </select>
        )}

        {/* Number input */}
        <input
          type="tel"
          value={phone}
          onChange={e => onPhoneChange(e.target.value)}
          placeholder="Phone number"
          autoFocus={autoFocus}
          className={`luxury-input flex-1 ${error ? 'border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}`}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default PhoneInput;
