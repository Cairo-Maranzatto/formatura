import { useMemo, useState } from 'react';

const ADULT_PRICE = 922.9;
const CHILD_PRICE = 462.9;

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function RSVP() {
  const [formData, setFormData] = useState({
    nome: '',
    celular: '',
    email: '',
    cpf: '',
    qtdAdulto: 1,
    qtdInfantil: 0,
  });
  const [status, setStatus] = useState({ loading: false, error: '' });

  const total = useMemo(() => {
    const adultQty = Number(formData.qtdAdulto) || 0;
    const childQty = Number(formData.qtdInfantil) || 0;
    return adultQty * ADULT_PRICE + childQty * CHILD_PRICE;
  }, [formData.qtdAdulto, formData.qtdInfantil]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: '' });

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível iniciar o pagamento.');
      }

      if (!data.checkoutUrl) {
        throw new Error('URL de checkout não recebida.');
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro inesperado ao iniciar pagamento.',
      });
    }
  }

  return (
    <section className="rsvp" id="formulario">
      <div className="container">
        <h2>Confirme sua Presença</h2>
        <div className="rsvp-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome completo</label>
              <input type="text" id="nome" name="nome" placeholder="Digite seu nome completo" value={formData.nome} onChange={handleChange} required />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="celular">Celular</label>
                <input type="tel" id="celular" name="celular" placeholder="(00) 00000-0000" value={formData.celular} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input type="email" id="email" name="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cpf">CPF</label>
                <input type="text" id="cpf" name="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="qtdAdulto">Qtd. Adulto ({formatCurrency(ADULT_PRICE)})</label>
                <input type="number" id="qtdAdulto" name="qtdAdulto" min="0" value={formData.qtdAdulto} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="qtdInfantil">Qtd. Infantil ({formatCurrency(CHILD_PRICE)})</label>
                <input type="number" id="qtdInfantil" name="qtdInfantil" min="0" value={formData.qtdInfantil} onChange={handleChange} required />
              </div>
              <div className="form-group total-box">
                <label>Total a pagar</label>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>

            {status.error ? <p className="form-error">{status.error}</p> : null}

            <button type="submit" className="btn btn-submit" disabled={status.loading}>
              {status.loading ? 'Redirecionando para o PagSeguro...' : 'Confirmar e Pagar'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
