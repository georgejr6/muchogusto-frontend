
import { useMemo } from 'react';

// Single source of truth for what a "complete" profile means.
// Must stay in sync with the backend's calcCompletion() in routes/users.js.
export const PROFILE_REQUIRED_FIELDS = [
  { name: 'dob', label: 'Date of Birth' },
  { name: 'email', label: 'Email' },
  { name: 'hobbies', label: 'Hobbies / Interests' },
  { name: 'bio', label: 'Short Bio' },
  { name: 'photo_url', label: 'Photo' },
];

const isFilled = (val) => {
  if (typeof val === 'boolean') return val;
  if (Array.isArray(val)) return val.length > 0;
  return !!val && String(val).trim() !== '';
};

export const useProfileCompletion = (profile) => {
  return useMemo(() => {
    if (!profile) return { percentage: 0, incompleteFields: [], isComplete: false };

    const incompleteFields = PROFILE_REQUIRED_FIELDS.filter(field => !isFilled(profile[field.name]));

    const completedCount = PROFILE_REQUIRED_FIELDS.length - incompleteFields.length;
    const percentage = PROFILE_REQUIRED_FIELDS.length > 0
      ? Math.round((completedCount / PROFILE_REQUIRED_FIELDS.length) * 100)
      : 0;

    return {
      percentage,
      incompleteFields,
      isComplete: incompleteFields.length === 0,
    };
  }, [profile]);
};
