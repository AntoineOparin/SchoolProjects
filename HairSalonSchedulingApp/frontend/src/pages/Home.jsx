import React from "react";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-sky-800 rounded-lg m-1 p-1">
      <div className="bg-sky-200 rounded-lg m-1 p-2 text-sky-950">
        <div className="flex justify-between w-full">
          <h1 className="flex justify-center items-center rounded-lg m-4 text-4xl font-bold">
            HOME
          </h1>
          <Logo
            className="w-25 h-25 hover:cursor-pointer mr-auto"
            onClick={() => navigate("/")}
            role="button"
          />
        </div>
        <div className="flex flex-col h-60 align-center bg-orange-200 ring-8 ring-sky-700 rounded-lg m-1 mt-6 p-2">
          <h1 className="text-center m-2">Hair Salon Scheduling app</h1>
          <p>
            Have you ever needed a fresh haircut for a job interview? Have you ever wanted to get your hair dyed crazy colors on a whim?
            Look no further than our website; here, our selected group of professionals can offer you any service related to hair maintenance.
            From a simple beard trim to a perm or a full hair recolor, rest assured that your capillary needs will be tended to at our shop.
            This website offers a simple solution that allows you to get in touch with your professional of choice with amazing simplicity.
            Your next hairstyle is only a few clicks away!
          </p>
        </div>
      </div>
    </div>
  );
}
