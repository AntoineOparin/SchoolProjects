import React from "react";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";

export default function About() {
  return (
    <div className="flex min-h-screen p-1 bg-sky-800">
      {/* right side */}
      <div className="w-full bg-sky-200 rounded-lg m-1 p-2">
        <h1 className="flex justify-center items-center rounded-xl mb-4 text-sky-950 text-4xl">
          About Us
        </h1>
        {/* container of three users (us) */}
        <div className="flex flex-row justify-evenly m-2">
          <section className="flex-1 bg-sky-600 p-2 m-2 rounded-2xl text-white h-[40em] overflow-hidden">
            <h1 className="m-2 text-2xl text-center">Antoine Oparin</h1>
            <p className="m-2">Student id: 2333239</p>
            <div className="bg-[url('src/assets/IMG_0985.jpeg')] h-1/2 bg-cover bg-center m-2 border-sky-800 border-4 rounded-lg"></div>
            <p className="m-2 text-sm">
              Very passionate about full stack development with React and Flask
            </p>
            <h2 className="text-xl m-2">Roles: </h2>
            <ul className="ml-10 list-disc overflow-y-scroll h-1/5">
              <li>Appointments backend & frontend</li>
              <li>Reports backend & frontend</li>
              <li>Authentication backend & frontend</li>
              <li>Administration frontend</li>
              <li>Registration + Login backend & frontend</li>
              <li>API frontend</li>
              <li>Profile page backend & frontend</li>
            </ul>
          </section>
          <section className="flex-1 bg-sky-600 p-2 m-2 rounded-2xl text-white h-[40em] overflow-hidden">
            <h1 className="m-2 text-2xl text-center">Zoi Justine Orpilla</h1>
            <p className="m-2">Student id: 2336511</p>
            <div className="bg-[url('src/assets/IMG_6210.jpeg')] h-1/2 bg-cover bg-center m-2 border-sky-800 border-4 rounded-lg"></div>
            <p className="m-2 text-sm">I like animals</p>
            <h2 className="text-xl m-2">Roles: </h2>
            <ul className="ml-10 list-disc overflow-y-scroll h-1/5">
              <li>Reports backend & frontend</li>
              <li>Database classes</li>
              <li>API reports backend</li>
            </ul>
          </section>
          <section className="flex-1 bg-sky-600 p-2 m-2 rounded-2xl text-white h-[40em] overflow-hidden">
            <h1 className="m-2 text-2xl text-center">Thomas Koleboshyna</h1>
            <p className="m-2">2337084</p>
            <div className="bg-[url('src/assets/gnome.jpg')] h-1/2 bg-cover bg-center m-2 border-sky-800 border-4 rounded-lg"></div>
            <p className="m-2 text-sm">
              Interested in learning about apps with a decoupled
              frontend/backend
            </p>
            <h2 className="text-xl m-2">Roles: </h2>
            <ul className="ml-10 list-disc overflow-y-scroll h-1/5">
              <li>Administration frontend & backend</li>
              <li>Administration logging</li>
              <li>API backend</li>
              <li>Database CRUD methods</li>
              <li>About page</li>
              <li>UI embellishment</li>
              <li>Blueprint structure</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
