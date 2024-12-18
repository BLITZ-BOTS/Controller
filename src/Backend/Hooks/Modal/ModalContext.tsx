// Packages
import React, { createContext, useContext, useState } from 'react';

// Components
import ModalRenderer from './ModalRenderer';

// Modal Types
type ModalType = 'create_bot' | 'delete_bot';

// Props for Modal Data
interface ModalProps {
  type: ModalType;
  props?: Record<string, any>;
  onCompleted?: (data?: { error: boolean }) => void;
}

// Modal Context
interface ModalContextProps {
  showModal: (
    type: ModalType,
    props?: Record<string, any>,
    onCompleted?: (data?: { error: boolean }) => void
  ) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

// Modal Provider Component
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modal, setModal] = useState<ModalProps | null>(null);

  const showModal = (
    type: ModalType,
    props?: Record<string, any>,
    onCompleted?: () => void
  ) => {
    setModal({ type, props, onCompleted });
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}
      {/* Render Modal */}
      {modal && <ModalRenderer modal={modal} closeModal={closeModal} />}
    </ModalContext.Provider>
  );
};

// Hook to use Modal Context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
