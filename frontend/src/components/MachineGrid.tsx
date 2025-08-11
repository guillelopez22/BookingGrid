import React, { useEffect, useState } from 'react';
import { getMachines, lockMachine } from '../services/api';
import './MachineGrid.css';

const MachineGrid = () => {
  const [machines, setMachines] = useState([]);
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);

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

  const handleMachineClick = async (machine: any) => {
    if (machine.status !== 'available') {
      alert('Machine is not available');
      return;
    }
    
    try {
      const response = await lockMachine(machine.id, userId);
      if (response.success) {
        alert('Machine locked! You have 2 minutes to confirm.');
        fetchMachines(); // Refresh the grid
      } else {
        alert(response.error || 'Failed to lock machine');
      }
    } catch (error) {
      console.error('Error locking machine:', error);
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
            onClick={() => handleMachineClick(machine)}
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