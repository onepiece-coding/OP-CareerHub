import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();

  let statusCode, statusText;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    statusText = error.statusText;
  } else {
    statusCode = 404;
    statusText = "Page non trouvée!";
  }

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="h-screen flex items-center justify-center py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
            {statusCode}
          </h1>
          <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
            {statusText}
          </p>
          <Link
            to="/"
            className="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"
          >
            Retour à la page d'accueil
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ErrorPage;
