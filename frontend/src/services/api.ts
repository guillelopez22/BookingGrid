const API_BASE_URL = 'http://localhost:3001/api';

export const getMachines = async () => {
  const response = await fetch(`${API_BASE_URL}/machines`);
  return response.json();
};

export const lockMachine = async (machineId: number, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/machines/${machineId}/lock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });
  return response.json();
};

export const bookMachine = async (machineId: number, userId: string, lockToken: string) => {
  const response = await fetch(`${API_BASE_URL}/machines/${machineId}/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId, lock_token: lockToken }),
  });
  return response.json();
};

export const releaseLock = async (machineId: number, lockToken: string) => {
  const response = await fetch(`${API_BASE_URL}/machines/${machineId}/release`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lock_token: lockToken }),
  });
  return response.json();
};

export const unbookMachine = async (machineId: number, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/machines/${machineId}/unbook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });
  return response.json();
};