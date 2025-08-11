import React, { useEffect, useState } from 'react';
import { getMachines, lockMachine, bookMachine, releaseLock, unbookMachine } from '../services/api';
import { Machine } from '../types';
import ConfirmationModal from './ConfirmationModal';

const MachineGrid = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [userId] = useState(() => {
    const stored = localStorage.getItem('userId');
    if (stored) {
      return stored;
    }
    const newId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', newId);
    return newId;
  });
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [lockToken, setLockToken] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'lock' | 'release' | 'info'>('lock');
  const [userLocks, setUserLocks] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    fetchMachines();
    
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

  const handleMachineClick = async (machine: Machine) => {
    if (machine.status === 'locked' && machine.locked_by === userId) {
      setSelectedMachine(machine);
      setLockToken(userLocks.get(machine.id) || null);
      setModalMode('release');
      setShowModal(true);
      return;
    }
    
    if (machine.status !== 'available') {
      setSelectedMachine(machine);
      setModalMode('info');
      setShowModal(true);
      return;
    }
    
    setMachines(prevMachines => 
      prevMachines.map(m => 
        m.id === machine.id 
          ? { ...m, status: 'locked' as const, locked_by: userId }
          : m
      )
    );
    
    try {
      const response = await lockMachine(machine.id, userId);
      if (response.success) {
        setUserLocks(prev => new Map(prev).set(machine.id, response.data.lock_token));
        setSelectedMachine(machine);
        setLockToken(response.data.lock_token);
        setModalMode('lock');
        setShowModal(true);
        fetchMachines();
      } else {
        fetchMachines();
        alert(response.error || 'Failed to lock machine');
      }
    } catch (error) {
      console.error('Error locking machine:', error);
      fetchMachines();
    }
  };

  const handleModalConfirm = async () => {
    if (modalMode === 'lock') {
      if (!selectedMachine || !lockToken) return;
      
      setMachines(prevMachines => 
        prevMachines.map(m => 
          m.id === selectedMachine.id 
            ? { ...m, status: 'booked' as const, booked_by: userId, locked_by: null }
            : m
        )
      );
      setShowModal(false);
      
      try {
        const response = await bookMachine(selectedMachine.id, userId, lockToken);
        if (response.success) {
          setUserLocks(prev => {
            const newMap = new Map(prev);
            newMap.delete(selectedMachine.id);
            return newMap;
          });
          alert('Booking confirmed!');
          setSelectedMachine(null);
          setLockToken(null);
          fetchMachines();
        } else {
          fetchMachines();
          alert(response.error || 'Failed to book machine');
        }
      } catch (error) {
        console.error('Error booking machine:', error);
        fetchMachines();
      }
    } else if (modalMode === 'release') {
      handleModalCancel();
    } else if (modalMode === 'info' && selectedMachine?.status === 'booked' && selectedMachine.booked_by === userId) {
      if (!selectedMachine) return;
      
      setMachines(prevMachines => 
        prevMachines.map(m => 
          m.id === selectedMachine.id 
            ? { ...m, status: 'available' as const, booked_by: null }
            : m
        )
      );
      setShowModal(false);
      
      try {
        const response = await unbookMachine(selectedMachine.id, userId);
        if (response.success) {
          alert('Booking cancelled successfully!');
          setSelectedMachine(null);
          fetchMachines();
        } else {
          fetchMachines();
          alert(response.error || 'Failed to cancel booking');
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        fetchMachines();
      }
    }
  };

  const handleModalCancel = async () => {
    setShowModal(false);
    
    if ((modalMode === 'lock' || modalMode === 'release') && selectedMachine && lockToken) {
      setMachines(prevMachines => 
        prevMachines.map(m => 
          m.id === selectedMachine.id 
            ? { ...m, status: 'available' as const, locked_by: null }
            : m
        )
      );
      
      try {
        await releaseLock(selectedMachine.id, lockToken);
        setUserLocks(prev => {
          const newMap = new Map(prev);
          newMap.delete(selectedMachine.id);
          return newMap;
        });
      } catch (error) {
        console.error('Error releasing lock:', error);
      }
    }
    
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
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Fitness Class - Select Your Machine
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          Your ID: {userId} (last 4: {userId.slice(-4)})
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {machines.map((machine) => (
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
              {(machine.locked_by || machine.booked_by) && (
                <div className="text-xs mt-1 truncate">
                  {machine.booked_by 
                    ? (machine.booked_by === userId ? 'You' : `User: ${machine.booked_by.slice(-4)}`)
                    : (machine.locked_by === userId ? 'You' : `User: ${machine.locked_by?.slice(-4)}`)}
                </div>
              )}
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
        mode={modalMode}
        currentUserId={userId}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default MachineGrid;