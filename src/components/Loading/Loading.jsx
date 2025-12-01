import { useState, CSSProperties } from "react";
import { ClipLoader, PuffLoader } from "react-spinners";

const Loading = () => {
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#42A5F5");
  return (
    <div className="fixed inset-0 bg-gray-300 bg-opacity-50 z-50 flex justify-center items-center">
      <div className="loader">
        {" "}
        <PuffLoader
          color={color}
          loading={loading}
          size={45}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    </div>
  );
};

export default Loading;
