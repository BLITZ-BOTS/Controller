import React from "react";
import CreateBotModal from "../../../Components/Modals/CreateBot";
import DeleteBotModal from "../../../Components/Modals/DeleteBot";

interface ModalRendererProps {
  modal: {
    type: "create_bot" | "delete_bot";
    props?: Record<string, any>;
    onCompleted?: (data?: { error: boolean }) => void;
  };
  closeModal: () => void;
}

const ModalRenderer: React.FC<ModalRendererProps> = ({ modal, closeModal }) => {
  const { type, props, onCompleted } = modal;

  const handleCompletion = () => {
    if (onCompleted) onCompleted();
    closeModal();
  };

  switch (type) {
    case "create_bot":
      return (
        <CreateBotModal
          {...props}
          onClose={closeModal}
          onCompleted={handleCompletion}
        />
      );
    case "delete_bot":
      return (
        <DeleteBotModal
          {...props}
          bot={props?.bot}
          onClose={closeModal}
          onCompleted={handleCompletion}
        />
      );
    default:
      return null;
  }
};

export default ModalRenderer;
