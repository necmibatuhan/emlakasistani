import { useState, useEffect } from 'react';

export function useCountdown(initialMinutes = 10) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return { minutes, seconds, isExpired };
}
