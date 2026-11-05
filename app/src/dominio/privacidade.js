// Detecta dados pessoais que não devem ir para uma publicação.
// Gera alertas para a pessoa revisar; não bloqueia nem altera o texto.

const PADROES = [
  { tipo: 'cpf', regex: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, mensagem: 'Parece haver um CPF.' },
  {
    tipo: 'telefone',
    regex: /(\(\d{2}\)\s?|\b\d{2}\s)?\b9?\d{4}[-\s]\d{4}\b/,
    mensagem: 'Parece haver um número de telefone.',
  },
  { tipo: 'email', regex: /[^\s@]+@[^\s@]+\.[^\s@]+/, mensagem: 'Parece haver um e-mail.' },
];

export function detectarDadosSensiveis(...textos) {
  const conteudo = textos.filter((t) => typeof t === 'string').join(' ');
  return PADROES.filter((p) => p.regex.test(conteudo)).map(({ tipo, mensagem }) => ({
    tipo,
    mensagem,
  }));
}
