import { memo } from "react";
import InfoItem from "./InfoItem";

const InfoList = memo(({ data }) => {
  return (
    <div className="rounded-xl">
      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {data.map((info) => (
          <InfoItem key={info.key} info={info} />
        ))}
      </dl>
    </div>
  );
});

export default InfoList;
