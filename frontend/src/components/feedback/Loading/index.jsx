import { Alert, Spinner } from "flowbite-react";
import { IoIosInformationCircle } from "react-icons/io";

const Loading = ({ loading, error, children }) => {
  if (loading) {
    return (
      <div className="mt-4 flex justify-center">
        <Spinner aria-label="Extra large spinner example" size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        color="failure"
        className="mt-4 max-w-sm mx-auto"
        icon={IoIosInformationCircle}
      >
        <span className="font-medium">Opps!</span> {error}
      </Alert>
    );
  }

  return children;
};

export default Loading;
