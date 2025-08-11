import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  machine: any;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  machine, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen || !machine) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
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
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;