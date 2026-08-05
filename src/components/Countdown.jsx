import { useEffect, useState } from 'react';

const TARGET_TIMESTAMP = new Date('2027-01-23T21:00:00').getTime();

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function update() {
      const now = new Date().getTime();
      const diff = TARGET_TIMESTAMP - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="countdown">
      <div className="container">
        <h2>Contagem Regressiva</h2>
        <div className="countdown-grid">
          <div className="countdown-card"><span className="countdown-number">{timeLeft.days}</span><span className="countdown-label">Dias</span></div>
          <div className="countdown-card"><span className="countdown-number">{timeLeft.hours}</span><span className="countdown-label">Horas</span></div>
          <div className="countdown-card"><span className="countdown-number">{timeLeft.minutes}</span><span className="countdown-label">Minutos</span></div>
          <div className="countdown-card"><span className="countdown-number">{timeLeft.seconds}</span><span className="countdown-label">Segundos</span></div>
        </div>
      </div>
    </section>
  );
}
