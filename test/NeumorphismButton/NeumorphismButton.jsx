import React, { useState } from 'react';
import './NeumorphismButton.css';

export default function NeumorphismButton({ onClick, children = 'Click me' }) {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <button
      className={`neumorphism-button ${isPressed ? 'pressed' : ''}`}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}
