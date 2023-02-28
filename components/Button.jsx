import React from "react";

function Button({ btnName, handleClick }) {
  return (
    <button
      onClick={handleClick && handleClick}
      className="font-medium text-white px-6 py-[6px] inline-block rounded-full bg-yellow-400 hover:opacity-50 overflow-hidden"
    >
      {btnName}
    </button>
  );
}

export default Button;
