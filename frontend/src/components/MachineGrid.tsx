import React, { useEffect, useState } from 'react';
import { getMachines, lockMachine, bookMachine, releaseLock } from '../services/api';
import ConfirmationModal from './ConfirmationModal';
import './MachineGrid.css';

const MachineGrid = () => {
  const [machines, setMachines] = useState([]);
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [lockToken, setLockToken] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

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
        setSelectedMachine(machine);
        setLockToken(response.data.lock_token);
        setShowModal(true);
        fetchMachines(); // Refresh the grid
      } else {
        alert(response.error || 'Failed to lock machine');
      }
    } catch (error) {
      console.error('Error locking machine:', error);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedMachine || !lockToken) return;
    
    try {
      const response = await bookMachine(selectedMachine.id, userId, lockToken);
      if (response.success) {
        alert('Booking confirmed!');
        setShowModal(false);
        setSelectedMachine(null);
        setLockToken(null);
        fetchMachines();
      } else {
        alert(response.error || 'Failed to book machine');
      }
    } catch (error) {
      console.error('Error booking machine:', error);
    }
  };

  const handleCancelBooking = async () => {
    if (selectedMachine && lockToken) {
      try {
        await releaseLock(selectedMachine.id, lockToken);
      } catch (error) {
        console.error('Error releasing lock:', error);
      }
    }
    setShowModal(false);
    setSelectedMachine(null);
    setLockToken(null);
    fetchMachines();
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
      <ConfirmationModal
        isOpen={showModal}
        machine={selectedMachine}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelBooking}
      />
    </div>
  );
};

export default MachineGrid;