const API_URL = 'https://flat360.onrender.com/api';

// Helper to get token from localStorage
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

// Auth API
export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Login failed');
  return data;
};

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

// Flats API
export const getFlats = async () => {
  const response = await fetch(`${API_URL}/flats`, {
    headers: { ...getAuthHeader() }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch flats');
  return data;
};

export const getFlatByQr = async (qrCodeId) => {
  const response = await fetch(`${API_URL}/flats/qr/${qrCodeId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Flat not found');
  return data;
};

export const createFlat = async (flatData) => {
  const response = await fetch(`${API_URL}/flats`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(flatData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create flat');
  return data;
};

export const updateFlat = async (id, flatData) => {
  const response = await fetch(`${API_URL}/flats/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(flatData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update flat');
  return data;
};

export const deleteFlat = async (id) => {
  const response = await fetch(`${API_URL}/flats/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete flat');
  return data;
};

// Visitor API
export const registerEntry = async (visitorData) => {
  const response = await fetch(`${API_URL}/visitor/entry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visitorData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to register entry');
  return data;
};

export const requestExit = async (id) => {
  const response = await fetch(`${API_URL}/visitor/request-exit/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to request checkout');
  return data;
};

export const getVisitorStatus = async (id) => {
  const response = await fetch(`${API_URL}/visitor/status/${id}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch status');
  return data;
};

export const registerExit = async (id) => {
  const response = await fetch(`${API_URL}/visitor/exit/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeader() }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to register exit');
  return data;
};

export const getVisitorLogs = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.date) queryParams.append('date', filters.date);
  if (filters.flatId) queryParams.append('flatId', filters.flatId);
  if (filters.visitorName) queryParams.append('visitorName', filters.visitorName);

  const response = await fetch(`${API_URL}/visitor/logs?${queryParams.toString()}`, {
    headers: { ...getAuthHeader() }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch logs');
  return data;
};
