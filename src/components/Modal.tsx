import { X } from 'lucide-react';

export const Modal = ({ title, onClose, children }: any) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <button onClick={onClose} className="modal-close">
        <X size={20} />
      </button>
      <h3 className="modal-title">{title}</h3>
      {children}
    </div>
  </div>
);
