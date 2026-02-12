import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";

const AiAnalysisModal = ({
  open,
  score,
  reasons,
  closeModal,
  updateApplicationStatus,
}) => {
  return (
    <>
      <Modal show={open} onClose={closeModal}>
        <ModalHeader>Score: {score}</ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {reasons.map((reason, index) => (
              <p
                key={index}
                className="text-base leading-relaxed text-gray-500 dark:text-gray-400"
              >
                {reason}
              </p>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            className="cursor-pointer"
            onClick={() => {
              updateApplicationStatus("accepted");
              closeModal();
            }}
          >
            Accepter
          </Button>
          <Button
            color="gray"
            className="cursor-pointer"
            onClick={() => {
              updateApplicationStatus("rejected");
              closeModal();
            }}
          >
            Rejeter
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AiAnalysisModal;
