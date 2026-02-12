import {
  Button,
  HelperText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "flowbite-react";
import { IoChatboxEllipsesSharp } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import { RiRobot2Line } from "react-icons/ri";
import useChatbot from "./useChatbot";

export function Chatbot() {
  const { state, openChatbotModal, closeChatbotModal, onChange, onSubmit } =
    useChatbot();

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 rounded-full cursor-pointer shadow-xl hover:shadow-2xl z-[9999]"
        gradientDuoTone="cyanToBlue"
        onClick={openChatbotModal}
        pill
      >
        <IoChatboxEllipsesSharp className="w-6 h-6 animate-pulse" />
      </Button>
      
      <Modal 
        dismissible 
        show={state.open} 
        onClose={closeChatbotModal}
        position="center"
        className="z-[9999]"
        theme={{
          root: {
            base: "fixed top-0 right-0 left-0 h-modal overflow-y-auto overflow-x-hidden md:inset-0 z-[9999]",
          },
          content: {
            base: "relative w-full p-4 h-auto",
          },
          body: {
            base: "p-6 flex-1 overflow-auto",
          },
          header: {
            close: {
              base: "ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-orange-500 hover:bg-orange-200 hover:text-orange-900", // Bouton fermeture orange
            },
          },
        }}
      >
        <ModalHeader className="bg-gradient-to-r from-blue-400 to-white-100 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <RiRobot2Line className="w-7 h-7 text-white" />
            <span>Posez toutes vos questions sur notre plateforme</span>
          </div>
        </ModalHeader>
        <ModalBody className="bg-blue-50 p-0">
          <form noValidate className="flex flex-col gap-4 p-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <Textarea
                placeholder="Demander n'importe quoi..."
                rows={4}
                value={state.prompt}
                onChange={onChange}
                className="border-blue-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
              {state.error && (
                <HelperText color="failure">{state.error}</HelperText>
              )}
            </div>
            <Button
              type="submit"
              gradientDuoTone="pinkToOrange" // Bouton soumission orange
              className="w-max cursor-pointer flex items-center gap-2"
              disabled={state.loading}
            >
              <IoSend className="w-4 h-4 " />
              <span>Soumettre</span>
            </Button>
          </form>
        </ModalBody>
        <ModalFooter className="bg-blue-100 rounded-b-lg">
          <>
            {state.loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-bounce"></div>
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{animationDelay: '0.4s'}}></div>
                <p className="ml-2 font-normal text-sm text-gray-700 dark:text-gray-400">
                  Raisonnement...
                </p>
              </div>
            ) : (
              <p className="font-normal text-sm leading-6 text-gray-900 dark:text-white">
                {state.answer || "Prêt à répondre à vos questions..."}
              </p>
            )}
          </>
        </ModalFooter>
      </Modal>
    </>
  );
}