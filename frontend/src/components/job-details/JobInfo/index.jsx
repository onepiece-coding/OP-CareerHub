import { memo } from "react";

const JobInfo = memo(({ title, children }) => {
  return (
    <>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mb-4 text-lg text-gray-600 dark:text-gray-400">
        {children}
      </p>
    </>
  );
});

export default JobInfo;
