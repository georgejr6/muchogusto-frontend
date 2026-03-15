
import { useMemo } from 'react';

export const useProfileCompletion = (profile) => {
  return useMemo(() => {
    if (!profile) return { percentage: 0, incompleteFields: [], isComplete: false };

    // Only count these specific required fields per instructions
    const requiredFields = [
      { name: 'dob', label: 'Date of Birth', required: true },
      { name: 'email', label: 'Email', required: true },
      { name: 'hobbies', label: 'Hobbies / Interests', required: true },
      { name: 'bio', label: 'Short Bio', required: true },
      { name: 'hasPhotos', label: 'Photos', required: true }
    ];

    const incompleteFields = requiredFields.filter(field => {
      const val = profile[field.name];
      if (typeof val === 'boolean') return !val;
      if (Array.isArray(val)) return val.length === 0;
      return !val || String(val).trim() === '';
    });

    const completedCount = requiredFields.length - incompleteFields.length;
    const percentage = requiredFields.length > 0 ? Math.round((completedCount / requiredFields.length) * 100) : 0;

    return {
      percentage,
      incompleteFields,
      isComplete: incompleteFields.length === 0
    };
  }, [profile]);
};
