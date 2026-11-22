import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

/** Animates a number from its previous value to `value`. */
export default function CountUp({ value, duration = 0.9 }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const controls = animate(shown, value, { duration, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);
  return <>{shown}</>;
}
