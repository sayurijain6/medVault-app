import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedStat({ value, duration = 2 }) {
  const [target, setTarget] = useState(0);

  useEffect(() => {
    // Handle non-numeric values gracefully
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setTarget(num);
    }
  }, [value]);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (latest) => Math.floor(latest).toLocaleString());

  useEffect(() => {
    spring.set(target);
  }, [target, spring]);

  return <motion.span>{display}</motion.span>;
}
