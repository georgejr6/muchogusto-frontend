// Re-export everything from apiClient — supabaseClient is now the real backend
export {
  supabase,
  createAuthSession,
  verifyOTP,
  getProfile,
  insertProfile,
  updateProfile,
  uploadProfilePhoto,
} from './apiClient';
