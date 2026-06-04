/**
 * @file src/components/feedback/loading/index.tsx
 */

import { Spinner } from "@/components/ui";
import type { Status } from "@/lib/types";

interface ILoadingProps {
  status: Status;
  error: null | string;
  children: React.ReactNode;
}

const Loading = ({ status, error, children }: ILoadingProps) => {
  /* if (state === "failed") {
    throw new Response(error, { status: 400 });
  } */
  return (
    <div aria-busy={status === "pending"} aria-live="polite">
      {status === "pending" && (
        <div role="status">
          <Spinner aria-label="Loding..." />
        </div>
      )}

      {status === "failed" && (
        <p
          style={{
            marginTop: "8px",
            color: "red",
            marginBottom: 0,
          }}
        >
          {error ?? "Unknown error"}
        </p>
        // <LottieHandler
        //   className="text-danger mt-3 mb-0"
        //   message={error ?? "Unknown error"}
        //   type="lottie-error"
        //   title="Error"
        // />
      )}

      {status === "succeeded" && children}
    </div>
  );
};

export default Loading;
