/**
 * @file src/pages/error-element/index.tsx
 */

import { isRouteErrorResponse, useRouteError } from "react-router";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui";
import { useEffect } from "react";

const ErrorElement = () => {
  const error = useRouteError();

  let errorStatus: number | string = 500;
  let errorStatusText: string = "Something went wrong";

  // Case A: Error thrown from a Loader/Action (Standard React Router error)
  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorStatusText = error.statusText;
  }

  // Case B: Raw Response thrown from a Component (Loading component)
  else if (error instanceof Response) {
    errorStatus = error.status;
    errorStatusText = error.statusText || "Server Error";
  }

  // Case C: Standard JS Error (e.g., a code crash)
  else if (error instanceof Error) {
    errorStatus = "App Error";
    errorStatusText = error.message;
  }

  useEffect(() => {
    if (error instanceof Error && import.meta.env.MODE === "development") {
      console.error("Uncaught App Error:", error);
    }
  }, [error]);

  return (
    <>
      <title>OP-Blog - Error Element</title>

      <div className="root" style={{ minHeight: "100vh" }}>
        <Card style={{ maxWidth: "250px" }}>
          <Card.Header>
            <h1 className="card-header-heading">An error occurred</h1>
          </Card.Header>
          <Card.Body>
            <p>{`${errorStatus} | ${errorStatusText}`}</p>
          </Card.Body>
          <Card.Footer className={"to-footer"}>
            <p>
              Go back to safety? <Link to="/">here</Link>
            </p>
          </Card.Footer>
        </Card>
      </div>
    </>
  );
};

export default ErrorElement;
