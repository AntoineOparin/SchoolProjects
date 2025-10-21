import React from "react";
import logo from "../assets/logo.jpg";

const Logo = ({ className, onClick, role }) => {
  return (
    <img
      src={logo}
      alt="Salon logo"
      className={`w-1/20 ${className || ""}`}
      onClick={onClick}
      role={role}
    />
  );
};

export default Logo;
