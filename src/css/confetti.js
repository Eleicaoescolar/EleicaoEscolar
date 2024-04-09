import React, { useEffect } from 'react';
import ConfettiGenerator from 'confetti-js';
import './Consulta.css';

function MyComponent() {
  useEffect(() => {
    const confettiSettings = { target: 'my-canvas' };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();

    return () => confetti.clear();
  }, []);

  return (
    <canvas id="my-canvas"></canvas>
  );
}

export default MyComponent;
