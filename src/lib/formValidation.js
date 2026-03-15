
// Form validation utilities

export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return ""; // Made optional
  }
  if (name.trim().length < 2) {
    return "Name must be at least 2 characters";
  }
  if (name.trim().length > 50) {
    return "Name must be less than 50 characters";
  }
  return "";
};

export const validateInstagram = (handle) => {
  if (!handle || handle.trim().length === 0) {
    return ""; // Made optional
  }
  
  // Remove @ if user added it
  const cleanHandle = handle.trim().replace(/^@/, '');
  
  // Instagram username rules: 1-30 characters, letters, numbers, periods, underscores
  const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;
  
  if (!instagramRegex.test(cleanHandle)) {
    return "Invalid Instagram handle format";
  }
  
  return "";
};

export const validateWhatsApp = (number, countryCode) => {
  if (!number || number.trim().length === 0) {
    return "WhatsApp number is required";
  }
  
  // Remove spaces, dashes, parentheses
  const cleanNumber = number.replace(/[\s\-()]/g, '');
  
  // Must be digits only
  if (!/^\d+$/.test(cleanNumber)) {
    return "WhatsApp number must contain only digits";
  }
  
  // Should be between 7-15 digits (international standard)
  if (cleanNumber.length < 7 || cleanNumber.length > 15) {
    return "WhatsApp number must be 7-15 digits";
  }
  
  return "";
};

export const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return "Email is required";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  
  return "";
};

export const validateBio = (bio) => {
  if (!bio) {
    return ""; // Bio is optional
  }
  
  if (bio.length > 500) {
    return "Bio must be less than 500 characters";
  }
  
  return "";
};

export const validatePhotos = (photos) => {
  if (photos.length === 0) {
    return ""; // Photos are optional, but if provided must be valid
  }
  
  if (photos.length > 3) {
    return "Maximum 3 photos allowed";
  }
  
  for (let photo of photos) {
    // Check file size (max 5MB per photo)
    if (photo.size > 5 * 1024 * 1024) {
      return "Each photo must be less than 5MB";
    }
    
    // Check file type
    if (!photo.type.startsWith('image/')) {
      return "Only image files are allowed";
    }
  }
  
  return "";
};

// Check for duplicate Instagram handle or WhatsApp number in localStorage
export const checkDuplicates = (instagram, whatsapp, countryCode) => {
  try {
    const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
    
    // Clean WhatsApp number
    const cleanWhatsApp = whatsapp.replace(/[\s\-()]/g, '');
    const fullWhatsApp = `${countryCode}${cleanWhatsApp}`;
    
    const duplicateWhatsApp = profiles.find(
      p => p.whatsapp === fullWhatsApp
    );
    
    if (duplicateWhatsApp) {
      return { field: 'whatsapp', message: 'This WhatsApp number is already registered' };
    }

    if (instagram && instagram.trim().length > 0) {
      // Clean Instagram handle
      const cleanInstagram = instagram.trim().replace(/^@/, '').toLowerCase();
      
      // Check for duplicates
      const duplicateInstagram = profiles.find(
        p => p.instagram && p.instagram.toLowerCase() === cleanInstagram
      );
      
      if (duplicateInstagram) {
        return { field: 'instagram', message: 'This Instagram handle is already registered' };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return null;
  }
};
