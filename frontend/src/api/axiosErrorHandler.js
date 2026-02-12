import { isAxiosError } from "axios";

export const axiosErrorHandler = (error) => {
  if (isAxiosError(error)) {
    console.log(
      error.response?.data?.message ||
        error.response?.data?.error[0]?.msg ||
        error.message
    );
    return (
      error.response?.data?.message ||
      error.response?.data?.error[0]?.msg ||
      error.message
    );
  } else {
    return "Une erreur inattendue!";
  }
};
