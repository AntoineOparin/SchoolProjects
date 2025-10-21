import React from "react";

const Footer = () => {
  return (
    <div>
      <footer className="flex justify-center items-center h-8 bg-sky-950 backdrop-blur-xs">
        <p className="text-sm text-gray-300">
          &copy; {new Date().getFullYear()} Antoine Oparin - Zoi Justine Orpilla
          - Thomas Koleboshyna. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Footer;
