import { MapPin, Calendar, Shirt, Car } from 'lucide-react';

export default function Info() {
  return (
    <section className="info" id="local">
      <div className="container">
        <h2>Informações Importantes</h2>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">
              <MapPin size={32} />
            </div>
            <h3>Onde</h3>
            <p><strong>Garden Eventos</strong><br />R. Quatro, 425 - Bauru/SP</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">
              <Calendar size={32} />
            </div>
            <h3>Quando</h3>
            <p><strong>23 de Janeiro</strong><br />Sábado, às 21h00</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">
              <Shirt size={32} />
            </div>
            <h3>Traje</h3>
            <p><strong>Traje de Gala</strong><br />Elegância para nossa noite</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">
              <Car size={32} />
            </div>
            <h3>Conforto</h3>
            <p><strong>Manobrista</strong><br />Estacionamento no local</p>
          </div>
        </div>

        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.312563384351!2d-49.03456342385412!3d-22.304037579685933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94bf67119f4a958b%3A0xc3f83734e5a95315!2sGarden%20Eventos!5e0!3m2!1spt-BR!2sbr!4v1709664000000!5m2!1spt-BR!2sbr" 
            width="100%" 
            height="350" 
            style={{ border: 0, borderRadius: '16px' }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização do Evento"
          ></iframe>
          <div className="map-actions">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=Garden+Eventos+Bauru" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Abrir no Google Maps
            </a>
            <a 
              href="https://waze.com/ul?q=Garden+Eventos+Bauru" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Abrir no Waze
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
