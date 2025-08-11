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