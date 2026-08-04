export default function RSVP() {
  function handleSubmit(e) {
    e.preventDefault();
    alert('Obrigado por confirmar! Em breve entraremos em contato.');
  }

  return (
    <section className="rsvp" id="formulario">
      <div className="container">
        <h2>Confirme sua Presença</h2>
        <div className="rsvp-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome completo</label>
              <input type="text" id="nome" name="nome" placeholder="Digite seu nome completo" required />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="celular">Celular</label>
                <input type="tel" id="celular" name="celular" placeholder="(00) 00000-0000" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input type="email" id="email" name="email" placeholder="seu@email.com" required />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="convites">Quantidade de convites</label>
                <input type="number" id="convites" name="convites" min="1" defaultValue="1" required />
              </div>
              <div className="form-group">
                <label htmlFor="pagamento">Forma de pagamento</label>
                <select id="pagamento" name="pagamento" required>
                  <option value="">Selecione uma opção</option>
                  <option value="pix">Pix</option>
                  <option value="cartao">Cartão de Crédito</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="presencial">Pagamento no Evento</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-submit">Enviar Confirmação</button>
          </form>
        </div>
      </div>
    </section>
  );
}
