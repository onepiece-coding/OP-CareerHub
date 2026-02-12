import { memo } from "react";

const JobList = memo(({ title, items }) => {
  return (
    <>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <ul className="mb-4 max-w-md space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
        {items?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </>
  );
});

export default JobList;
