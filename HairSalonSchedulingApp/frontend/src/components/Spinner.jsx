import React from "react";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-slate-400 bg-opacity-25">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default Spinner;
