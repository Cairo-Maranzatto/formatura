import { useCallback, useEffect, useRef, useState } from 'react';

const slides = [
  '/images/carrossel/LOH_4254.jpg',
  '/images/carrossel/JEF_1336.jpg',
  '/images/carrossel/JEF_1368.jpg',
  '/images/carrossel/LOH_4269.jpg',
  '/images/carrossel/LOH_4283.jpg',
  '/images/carrossel/LOH_4294.jpg',
  '/images/carrossel/JEF_1330.jpg',
  '/images/carrossel/LOH_4230.jpg',
  '/images/carrossel/PHOL4448.jpg',
];

export default function Gallery() {
  const [current, setCurrent] = useState(0);
  const total = slides.length;
  const autoPlayRef = useRef(null);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 4000);
  }, [stopAutoPlay, total]);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  const goTo = (index) => {
    setCurrent((index + total) % total);
  };

  const stopAndGo = (index) => {
    stopAutoPlay();
    goTo(index);
    startAutoPlay();
  };

  return (
    <section className="gallery">
      <div className="container">
        <h2>Momentos Inesquecíveis</h2>
        <div className="carousel">
          <div className="carousel-track" style={{ transform: `translateX(${-current * 100}%)` }}>
            {slides.map((src, i) => (
              <img key={i} className="carousel-slide" src={src} alt={`Foto ${i + 1}`} />
            ))}
          </div>
          <button className="carousel-btn prev" aria-label="Anterior" onClick={() => stopAndGo(current - 1)}>&#10094;</button>
          <button className="carousel-btn next" aria-label="Próximo" onClick={() => stopAndGo(current + 1)}>&#10095;</button>
        </div>
        <div className="carousel-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === current ? 'active' : ''}`}
              data-index={i}
              aria-label={`Foto ${i + 1}`}
              onClick={() => stopAndGo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
