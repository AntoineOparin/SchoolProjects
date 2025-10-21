import React from "react";
import Logo from "../components/Logo.jsx";

export default function Home() {

  return (
    <div className="flex min-h-screen bg-sky-800 p-1">

      {/* right side */}
      <div className="bg-sky-200 rounded-lg m-1 p-2 w-4/4">
        <p className="flex justify-center items-center rounded-lg m-4 mb-8 text-2xl font-bold">
          Page Not Found
        </p>
        <div className="flex items-center justify-center h-60 bg-orange-200 ring-8 ring-sky-700 rounded-lg m-1 p-2">
          This is not the page you're looking for...
        </div>
      </div>
    </div>
  );
}
