import type { ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
}

function Modal({ onClose, children }: ModalProps) {
  return (
    <div
      onClick={onClose}
      className='modal-overlay'
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='modal-content'
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;