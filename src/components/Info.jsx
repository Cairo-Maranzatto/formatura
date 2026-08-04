export default function Info() {
  return (
    <section className="info">
      <div className="container">
        <h2>Informações do Evento</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>Local</h3>
            <p>Garden/Sagae Eventos Bauru<br />R. Quatro, 425 - Jardim Santos Dumont, Bauru/SP</p>
          </div>
          <div className="info-card">
            <h3>Horário</h3>
            <p>23 de Janeiro de 2027<br />21h00</p>
          </div>
          <div className="info-card">
            <h3>Traje</h3>
            <p>Traje Social<br />Elegante e confortável</p>
          </div>
          <div className="info-card">
            <h3>Estacionamento</h3>
            <p>Estacionamento no local<br />Com manobrista</p>
          </div>
        </div>
        <div className="map">Mapa do Google Maps</div>
      </div>
    </section>
  );
}
