import React, { useEffect, useState } from 'react';
import { getMachines } from '../services/api';
import './MachineGrid.css';

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
      <div className="machine-grid">
        {machines.map((machine: any) => (
          <div 
            key={machine.id} 
            className={`machine-item ${machine.status || 'available'}`}
          >
            <div>{machine.name}</div>
            <small>{machine.status || 'available'}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MachineGrid;