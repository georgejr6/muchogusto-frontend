// API client — connects frontend to the Node.js/Express backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getUserToken() {
  return localStorage.getItem('token');
}

function getAdminToken() {
  return localStorage.getItem('adminToken');
}

function getActiveToken() {
  return getAdminToken() || getUserToken();
}

async function request(path, options = {}) {
  const token = getActiveToken();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signup({ name, instagram, phone }) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, instagram, phone }),
  });
}

export async function adminLogin(email, password) {
  return request('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ─── Current User ─────────────────────────────────────────────────────────────

export async function getMe() {
  return request('/api/users/me');
}

export async function updateMe(data) {
  return request('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append('photo', file);
  return request('/api/users/me/photo', {
    method: 'POST',
    body: formData,
  });
}

export async function getMyInvitations() {
  return request('/api/users/me/invitations');
}

export async function respondToInvitation(invitationId, status) {
  return request(`/api/invitations/${invitationId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ─── Users (admin) ────────────────────────────────────────────────────────────

export async function getUsers() {
  return request('/api/users');
}

export async function getUser(id) {
  return request(`/api/users/${id}`);
}

export async function setUserBlur(userId, is_blurred) {
  return request(`/api/users/${userId}/blur`, {
    method: 'PUT',
    body: JSON.stringify({ is_blurred }),
  });
}

// ─── Events (admin) ───────────────────────────────────────────────────────────

export async function getEvents() {
  return request('/api/events');
}

export async function getEvent(id) {
  return request(`/api/events/${id}`);
}

export async function createEvent(data) {
  return request('/api/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id, data) {
  return request(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id) {
  return request(`/api/events/${id}`, { method: 'DELETE' });
}

// ─── Messages (admin) ─────────────────────────────────────────────────────────

export async function getMessagingUsers() {
  return request('/api/messages/users');
}

export async function getConversation(userId) {
  return request(`/api/messages/${userId}`);
}

export async function sendMessage(toUserId, content) {
  return request('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ toUserId, content }),
  });
}

export async function getUserInbox() {
  return request('/api/messages/inbox');
}

// ─── Backward-compatible shims (for any remaining supabaseClient imports) ─────

export const supabase = null;

export async function createAuthSession(phone) {
  return { data: { phone }, error: null };
}

export async function verifyOTP(phone, otpCode) {
  return { data: null, error: 'OTP not implemented — use direct signup' };
}

export async function getProfile(id) {
  try {
    const user = await getMe();
    return { data: user, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function insertProfile(profileData) {
  try {
    const result = await signup(profileData);
    return { data: result.user, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function updateProfile(id, updateData) {
  try {
    const user = await updateMe(updateData);
    return { data: user, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function uploadProfilePhoto(profileId, file) {
  try {
    const result = await uploadPhoto(file);
    return { data: { photo_url: result.photo_url }, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}
