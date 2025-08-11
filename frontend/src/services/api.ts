const API_BASE_URL = 'http://localhost:3001/api';

export const getMachines = async () => {
  const response = await fetch(`${API_BASE_URL}/machines`);
  return response.json();
};