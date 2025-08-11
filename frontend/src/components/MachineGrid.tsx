import React, { useEffect, useState } from 'react';
import { getMachines } from '../services/api';

const MachineGrid = () => {
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await getMachines();
      if (response.success) {
        setMachines(response.data);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  return (
    <div>
      <h1>Fitness Class - Select Your Machine</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {machines.map((machine: any) => (
          <div key={machine.id} style={{ border: '1px solid black', padding: '20px' }}>
            {machine.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MachineGrid;