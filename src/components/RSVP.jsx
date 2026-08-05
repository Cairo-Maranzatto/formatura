import { useMemo, useState } from 'react';

const ADULT_PRICE = 922.9;
const CHILD_PRICE = 462.9;

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

const maskCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskPhone = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

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
    let maskedValue = value;

    if (name === 'cpf') maskedValue = maskCPF(value);
    if (name === 'celular') maskedValue = maskPhone(value);

    setFormData((prev) => ({ ...prev, [name]: maskedValue }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: '' });

    // Validações
    const cleanedCpf = formData.cpf.replace(/\D/g, '');
    const cleanedPhone = formData.celular.replace(/\D/g, '');

    if (cleanedCpf.length !== 11) {
      setStatus({ loading: false, error: 'CPF inválido. Informe os 11 dígitos.' });
      return;
    }

    if (cleanedPhone.length < 10) {
      setStatus({ loading: false, error: 'Celular inválido. Informe DDD + número.' });
      return;
    }

    if (!validateEmail(formData.email)) {
      setStatus({ loading: false, error: 'E-mail inválido.' });
      return;
    }

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

      // Para integração Web (Sites), o redirecionamento para o init_point é o padrão do Checkout Pro.
      // Se preferir abrir em Modal, você pode usar o preferenceId com o SDK do Mercado Pago:
      // const mp = new window.MercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
      // mp.checkout({ preference: { id: data.preferenceId }, autoOpen: true });
      
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

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input type="email" id="email" name="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cpf">CPF</label>
                <input type="text" id="cpf" name="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="celular">Celular</label>
                <input type="tel" id="celular" name="celular" placeholder="(00) 00000-0000" value={formData.celular} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="qtdAdulto">Qtd. Adulto ({formatCurrency(ADULT_PRICE)})</label>
                <input type="number" id="qtdAdulto" name="qtdAdulto" min="0" value={formData.qtdAdulto} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="qtdInfantil">Qtd. Infantil ({formatCurrency(CHILD_PRICE)})</label>
                <input type="number" id="qtdInfantil" name="qtdInfantil" min="0" value={formData.qtdInfantil} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group total-box">
              <label>Total a pagar</label>
              <strong>{formatCurrency(total)}</strong>
            </div>

            {status.error ? <p className="form-error">{status.error}</p> : null}

            <button type="submit" className="btn btn-submit" disabled={status.loading}>
              {status.loading ? 'Redirecionando para o Mercado Pago...' : 'Confirmar'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
