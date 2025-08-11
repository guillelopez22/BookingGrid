import React from 'react';
import './ConfirmationModal.css';

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
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Booking</h2>
        <p>You have selected machine <strong>{machine.name}</strong></p>
        <p>This machine is now locked for 2 minutes.</p>
        <p>Would you like to confirm your booking?</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="btn-confirm">
            Confirm Booking
          </button>
          <button onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;