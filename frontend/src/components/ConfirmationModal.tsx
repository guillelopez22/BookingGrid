import React from 'react';
import { Machine } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  machine: Machine | null;
  mode: 'lock' | 'release' | 'info';
  currentUserId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  machine, 
  mode,
  currentUserId,
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen || !machine) return null;

  const renderContent = () => {
    switch(mode) {
      case 'lock':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Confirm Booking</h2>
            <p className="mb-2">
              You have selected machine <strong className="text-blue-600">{machine.name}</strong>
            </p>
            <p className="mb-2 text-gray-600">This machine is now locked for 2 minutes.</p>
            <p className="mb-6">Would you like to confirm your booking?</p>
            <div className="flex gap-3">
              <button 
                onClick={onConfirm} 
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Confirm Booking
              </button>
              <button 
                onClick={onCancel} 
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Release Lock
              </button>
            </div>
          </>
        );
      
      case 'release':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Release Lock</h2>
            <p className="mb-2">
              Machine <strong className="text-blue-600">{machine.name}</strong> is locked by you.
            </p>
            <p className="mb-6">Do you want to release this lock?</p>
            <div className="flex gap-3">
              <button 
                onClick={onConfirm} 
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Release Lock
              </button>
              <button 
                onClick={onCancel} 
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Keep Lock
              </button>
            </div>
          </>
        );
      
      case 'info':
        const isOwnBooking = machine.booked_by === currentUserId;
        const isOwnLock = machine.locked_by === currentUserId;
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Machine Status</h2>
            <p className="mb-2">
              Machine <strong className="text-blue-600">{machine.name}</strong>
            </p>
            <p className="mb-4">
              Status: <span className={`font-semibold ${
                machine.status === 'booked' ? 'text-red-600' : 
                machine.status === 'locked' ? 'text-yellow-600' : 'text-green-600'
              }`}>{machine.status}</span>
            </p>
            {machine.status === 'booked' && (
              <p className="mb-4 text-gray-600">
                {isOwnBooking ? 'You have booked this machine.' : 'This machine is booked by another user.'}
              </p>
            )}
            {machine.status === 'locked' && (
              <p className="mb-4 text-gray-600">
                {isOwnLock ? 'You have locked this machine.' : 'This machine is temporarily locked by another user.'}
              </p>
            )}
            {machine.status === 'booked' && isOwnBooking ? (
              <div className="flex gap-3">
                <button 
                  onClick={onConfirm} 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                >
                  Cancel Booking
                </button>
                <button 
                  onClick={onCancel} 
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                >
                  Keep Booking
                </button>
              </div>
            ) : (
              <button 
                onClick={onCancel} 
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Close
              </button>
            )}
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default ConfirmationModal;