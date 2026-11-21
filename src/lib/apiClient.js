// API client — connects frontend to the Node.js/Express backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getUserToken() {
  return localStorage.getItem('token');
}

function getAdminToken() {
  return localStorage.getItem('adminToken');
}

// Admin (host) tokens are only ever sent to host/admin endpoints; everything else uses the member token,
// so a host who also signs in as a member can never have one token shadow the other.
function isAdminRequest(path, method = 'GET') {
  const m = method.toUpperCase();
  const p = path.split('?')[0];
  const q = path.includes('?') ? path.split('?')[1] : '';
  if (p.startsWith('/api/host/')) return true;
  if (p.startsWith('/api/emails')) return true;
  if (p.startsWith('/api/messages')) {
    return !(p === '/api/messages/inbox' || p === '/api/messages/reply');
  }
  if (p.startsWith('/api/events')) return p !== '/api/events/public';
  if (p.startsWith('/api/cities')) {
    if (p === '/api/cities/me/locate') return false;
    return m !== 'GET' || p === '/api/cities/demand' || /(^|&)all=1(&|$)/.test(q);
  }
  if (p.startsWith('/api/verification')) {
    return p === '/api/verification/pending' || p.startsWith('/api/verification/attempts');
  }
  if (p.startsWith('/api/safety/reports')) return true;
  if (p.startsWith('/api/access/')) return !(p === '/api/access/redeem' || p === '/api/access/pass' || p.startsWith('/api/access/code/'));
  if (p.startsWith('/api/users')) {
    if (p === '/api/users/public' || p.startsWith('/api/users/me')) return false;
    return true;
  }
  if (p === '/api/invitations/consent-webhook') return false;
  if (/^\/api\/invitations\/[^/]+\/resend-consent$/.test(p)) return true;
  if (p.startsWith('/api/auth/admin/')) return true;
  return false;
}

function getActiveToken(path = '', method = 'GET') {
  const admin = getAdminToken();
  const user = getUserToken();
  if (isAdminRequest(path, method)) return admin || user;
  return user || admin;
}

async function request(path, options = {}) {
  const token = getActiveToken(path, options.method || 'GET');
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

// Invite-only: signing up creates a pending account and emails a code. No session until the email is verified.
export async function signup({ name, instagram, phone, email, consent, invite_code }) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, instagram, phone, email, consent, invite_code }),
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

export async function getConsentInfo(invitationId) {
  return request(`/api/invitations/${invitationId}/consent-info`);
}

export async function resendConsentEmail(invitationId) {
  return request(`/api/invitations/${invitationId}/resend-consent`, { method: 'POST' });
}

// ─── Users (admin) ────────────────────────────────────────────────────────────

export async function getUsers() {
  return request('/api/users');
}

export async function getPublicUsers() {
  return request('/api/users/public');
}

export async function getUser(id) {
  return request(`/api/users/${id}`);
}

export async function inviteUser(data) {
  return request('/api/users/invite', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminUpdateUser(id, data) {
  return request(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function adminUploadUserPhoto(id, file) {
  const formData = new FormData();
  formData.append('photo', file);
  return request(`/api/users/${id}/photo`, {
    method: 'POST',
    body: formData,
  });
}

export async function broadcastMessage(content) {
  return request('/api/messages/broadcast', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
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

export async function getPublicEvents(citySlug) {
  return request(`/api/events/public${citySlug ? `?city=${encodeURIComponent(citySlug)}` : ''}`);
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

// ─── Auth ─────────────────────────────────────────────────────────────────────

// Step 1: email a 6-digit code (always answers {sent:true}). Step 2: verifyLoginCode.
export async function requestLoginCode({ phone, email }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, email }),
  });
}

export async function verifyLoginCode({ email, phone, code }) {
  return request('/api/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, phone, code }),
  });
}

// ─── Cities & location ────────────────────────────────────────────────────────

export const getCities = ({ all = false } = {}) => request(`/api/cities${all ? '?all=1' : ''}`);
export const createCity = (data) => request('/api/cities', { method: 'POST', body: JSON.stringify(data) });
export const updateCity = (id, data) => request(`/api/cities/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const getCityDemand = () => request('/api/cities/demand');
export const shareLocation = (lat, lng) =>
  request('/api/cities/me/locate', { method: 'POST', body: JSON.stringify({ lat, lng, consent: true }) });

// ─── Verification ─────────────────────────────────────────────────────────────

export const getVerificationStatus = () => request('/api/verification/status');
export const startIdentityVerification = (consent = false) =>
  request('/api/verification/start', { method: 'POST', body: JSON.stringify({ consent }) });
export const refreshVerification = () => request('/api/verification/refresh', { method: 'POST' });
export async function uploadVerificationSelfie(file, consent = false) {
  const fd = new FormData();
  fd.append('consent', consent ? 'true' : 'false');
  fd.append('selfie', file);
  return request('/api/verification/selfie', { method: 'POST', body: fd });
}
export const getPendingVerifications = () => request('/api/verification/pending');
export const reviewVerification = (attemptId, approve) =>
  request(`/api/verification/attempts/${attemptId}/review`, { method: 'POST', body: JSON.stringify({ approve }) });
// Selfies are private: fetch with the admin token, return an object URL for <img src>.
export async function fetchVerificationSelfie(attemptId) {
  const res = await fetch(`${API_URL}/api/verification/attempts/${attemptId}/selfie`, {
    headers: { Authorization: `Bearer ${getActiveToken('/api/verification/attempts')}` },
  });
  if (!res.ok) throw new Error('Could not load selfie');
  return URL.createObjectURL(await res.blob());
}

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotifications = () => request('/api/notifications');
export const getUnreadCount = () => request('/api/notifications/unread-count');
export const markNotificationsRead = () => request('/api/notifications/read', { method: 'POST' });
export const updateNotificationPrefs = (data) =>
  request('/api/notifications/prefs', { method: 'PUT', body: JSON.stringify(data) });
export const getVapidKey = () => request('/api/notifications/vapid-key');

// ─── Safety ───────────────────────────────────────────────────────────────────

export const blockHost = (admin_id) => request('/api/safety/block', { method: 'POST', body: JSON.stringify({ admin_id }) });
export const reportTarget = ({ admin_id, user_id, reason }) =>
  request('/api/safety/report', { method: 'POST', body: JSON.stringify({ admin_id, user_id, reason }) });
export const getReports = () => request('/api/safety/reports');

// ─── Host tools ───────────────────────────────────────────────────────────────

export const getHostPool = (eventId, limit = 20) => request(`/api/host/pool?event_id=${eventId}&limit=${limit}`);
export const hostSwipe = ({ event_id, user_id, action, note }) =>
  request('/api/host/swipe', { method: 'POST', body: JSON.stringify({ event_id, user_id, action, note }) });
export const getShortlist = (eventId) => request(`/api/host/shortlist${eventId ? `?event_id=${eventId}` : ''}`);
export const getEventBoard = (eventId) => request(`/api/host/events/${eventId}/board`);
export const nudgeInvitation = (invitationId) => request(`/api/host/invitations/${invitationId}/nudge`, { method: 'POST' });
export const getHostMe = () => request('/api/host/me');
export const updateHostMe = (data) => request('/api/host/me', { method: 'PUT', body: JSON.stringify(data) });
export const getPublicHost = (handle) => request(`/api/public/hosts/${encodeURIComponent(handle)}`);

export async function changeAdminPassword(currentPassword, newPassword) {
  return request('/api/auth/admin/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ─── User settings ────────────────────────────────────────────────────────────

export async function updateSettings(data) {
  return request('/api/users/me/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Messages (user) ──────────────────────────────────────────────────────────

export async function replyToMessage(content) {
  return request('/api/messages/reply', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function markConversationRead(userId) {
  return request(`/api/messages/${userId}/mark-read`, { method: 'POST' });
}

// ─── Email (admin) ─────────────────────────────────────────────────────────────

export async function sendInvitationEmail(data) {
  return request('/api/emails/invitation', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getEmailList(eventId) {
  const qs = eventId ? `?eventId=${eventId}` : '';
  return request(`/api/emails/list${qs}`);
}

export async function getEmailSends(eventId) {
  const qs = eventId ? `?eventId=${eventId}` : '';
  return request(`/api/emails/sends${qs}`);
}

// ─── Event media upload (admin) ───────────────────────────────────────────────

export async function uploadEventMedia(file) {
  const formData = new FormData();
  formData.append('image', file);
  return request('/api/events/upload-media', {
    method: 'POST',
    body: formData,
  });
}

// ─── Public event (no auth) ───────────────────────────────────────────────────

export async function getPublicEventByToken(shareToken) {
  const res = await fetch(`${API_URL}/api/public/events/${shareToken}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Not found');
  return data;
}

export async function subscribeToEvent(shareToken, email, name) {
  const res = await fetch(`${API_URL}/api/public/events/${shareToken}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

export async function submitEventFeedback(shareToken, { rating, comment, email }) {
  const res = await fetch(`${API_URL}/api/public/events/${shareToken}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, comment, email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

export async function getEventFeedbackMeta(shareToken) {
  const res = await fetch(`${API_URL}/api/public/events/${shareToken}/feedback-meta`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Not found');
  return data;
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

// ─── Account deletion & join-by-link ──────────────────────────────────────────

export const deleteMyAccount = () => request('/api/users/me', { method: 'DELETE' });
export const joinEventByLink = (shareToken) =>
  request(`/api/public/events/${encodeURIComponent(shareToken)}/join`, { method: 'POST' });

// ─── Invite-only access ───────────────────────────────────────────────────────

export const getInvitePreview = (code) => request(`/api/access/code/${encodeURIComponent(code)}`);
export const redeemInvite = (code) => request('/api/access/redeem', { method: 'POST', body: JSON.stringify({ code }) });
export const getPass = () => request('/api/access/pass');
export const listInvites = () => request('/api/access/invites');
export const createInvite = (data) => request('/api/access/invites', { method: 'POST', body: JSON.stringify(data) });
export const revokeInvite = (id) => request(`/api/access/invites/${id}`, { method: 'DELETE' });
export const listAccessRequests = () => request('/api/access/requests');
export const approveAccessRequest = (id) => request(`/api/access/requests/${id}/approve`, { method: 'POST' });
export const declineAccessRequest = (id) => request(`/api/access/requests/${id}/decline`, { method: 'POST' });
export const hostCheckin = (data) => request('/api/host/checkin', { method: 'POST', body: JSON.stringify(data) });
