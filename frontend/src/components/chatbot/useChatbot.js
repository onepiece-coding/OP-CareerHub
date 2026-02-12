import { useCallback, useState } from "react";
import { axiosErrorHandler } from "../../api/axiosErrorHandler";
import { axiosInstance } from "../../api/axiosInstance";

const useChatbot = () => {
  const [state, setState] = useState({
    prompt: "",
    open: false,
    loading: false,
    error: null,
    answer: null,
  });

  const openChatbotModal = useCallback(() => {
    setState((prev) => ({ ...prev, open: true }));
  }, []);

  const closeChatbotModal = useCallback(() => {
    setState((prev) => ({ ...prev, open: false, answer: "" }));
  }, []);

  const onChange = useCallback((e) => {
    setState((prev) => ({ ...prev, prompt: e.target.value }));
  }, []);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!state.prompt) {
        setState((prev) => ({ ...prev, error: "une invite est requise!" }));
        return;
      } else {
        setState((prev) => ({ ...prev, loading: true, error: null }));
      }

      try {
        const { data } = await axiosInstance.post("/api/v1/chatbot", {
          query: state.prompt,
        });
        setState((prev) => ({
          ...prev,
          answer: data.answer,
          prompt: "",
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: axiosErrorHandler(error),
          loading: false,
        }));
      }
    },
    [state.prompt]
  );

  return {
    state,
    openChatbotModal,
    closeChatbotModal,
    onChange,
    onSubmit,
  };
};

export default useChatbot;
