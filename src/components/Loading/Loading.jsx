import { useState, CSSProperties } from "react";
import { ClipLoader } from "react-spinners";

const Loading = () => {
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#0CBF66");
  return (
    <div className="fixed inset-0 bg-gray-300 bg-opacity-50 z-50 flex justify-center items-center">
      <div className="loader">
        {" "}
        <ClipLoader
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
