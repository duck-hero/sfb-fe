import React from "react";
import dayjs from "dayjs";

export default function DateCell({ dateString }) {
  if (!dateString) return <span className="text-gray-400 text-[11px]">-</span>;
  const d = dayjs(dateString);
  return (
    <div className="flex flex-col leading-tight">
      <span className="font-semibold text-gray-800 text-[11px]">
        {d.format("HH:mm:ss")}
      </span>
      <span className="text-[10px] text-gray-500">{d.format("DD/MM/YYYY")}</span>
    </div>
  );
}


