import React, { useEffect, useState } from 'react';
import { getMachines, lockMachine, bookMachine, releaseLock } from '../services/api';
import ConfirmationModal from './ConfirmationModal';

const MachineGrid = () => {
  const [machines, setMachines] = useState([]);
  // Store userId in localStorage to persist across renders
  const [userId] = useState(() => {
    const stored = localStorage.getItem('userId');
    if (stored) {
      return stored;
    }
    const newId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', newId);
    return newId;
  });
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [lockToken, setLockToken] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMachines();
    
    // Poll every 3 seconds for real-time updates
    const interval = setInterval(() => {
      fetchMachines();
    }, 3000);
    
    return () => clearInterval(interval);
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

  const getMachineStatusClass = (status: string) => {
    switch(status) {
      case 'available':
        return 'bg-green-100 hover:bg-green-200 border-green-400 cursor-pointer';
      case 'locked':
        return 'bg-yellow-100 border-yellow-400 cursor-not-allowed';
      case 'booked':
        return 'bg-red-100 border-red-400 cursor-not-allowed';
      default:
        return 'bg-green-100 hover:bg-green-200 border-green-400 cursor-pointer';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Fitness Class - Select Your Machine
        </h1>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {machines.map((machine: any) => (
            <div 
              key={machine.id} 
              className={`
                border-2 rounded-lg p-2 sm:p-3 md:p-4 text-center transition-all
                ${getMachineStatusClass(machine.status || 'available')}
              `}
              onClick={() => handleMachineClick(machine)}
            >
              <div className="font-semibold text-sm sm:text-base md:text-lg">{machine.name}</div>
              <div className="text-xs sm:text-sm mt-1 capitalize">
                {machine.status || 'available'}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Legend:</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded mr-2"></div>
              <span className="text-sm">Locked (Reserved)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded mr-2"></div>
              <span className="text-sm">Booked</span>
            </div>
          </div>
        </div>
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