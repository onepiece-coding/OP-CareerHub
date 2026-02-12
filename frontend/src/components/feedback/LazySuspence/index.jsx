import { Spinner } from "flowbite-react";
import { Suspense } from "react";

const LazySuspence = ({ height, children }) => {
  return (
    <Suspense
      fallback={
        <div
          className={`${
            height ? height : "mt-4"
          } flex justify-center items-center`}
        >
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default LazySuspence;
