import { memo } from "react";
import { DATE_FORMATS, dateFormatter } from "../../../utils/dateFormatter";

const JobMeta = memo(({ position, company, createdAt }) => {
  return (
    <address className="flex items-center mb-6 not-italic">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {position}
        </h2>
        <p className="text-base text-gray-500 dark:text-gray-400">{company}</p>
        <p className="text-base text-gray-500 dark:text-gray-400">
          <time dateTime={createdAt}>
            {dateFormatter(createdAt, DATE_FORMATS.pretty)}
          </time>
        </p>
      </div>
    </address>
  );
});

export default JobMeta;
