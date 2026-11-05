// Validação de cadastro e login (RF-01). Roda no navegador e no servidor.

export const LIMITES_CONTA = {
  nome: { min: 2, max: 60 },
  senha: { min: 8, max: 72 },
  email: { max: 120 },
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

export function normalizarEmail(email) {
  return texto(email).toLowerCase();
}

function validarEmail(erros, email) {
  if (!email) erros.email = 'Informe seu e-mail.';
  else if (email.length > LIMITES_CONTA.email.max || !EMAIL.test(email)) {
    erros.email = 'Confira o e-mail. Ele deve ter o formato nome@exemplo.com.';
  }
}

export function validarCadastro(entrada = {}, bairrosValidos = []) {
  const dados = {
    nome: texto(entrada.nome),
    email: normalizarEmail(entrada.email),
    bairroId: texto(entrada.bairroId),
  };
  // A senha não é aparada: espaços fazem parte dela.
  const senha = typeof entrada.senha === 'string' ? entrada.senha : '';
  const confirmacao = typeof entrada.confirmacao === 'string' ? entrada.confirmacao : '';
  const erros = {};

  const { min, max } = LIMITES_CONTA.nome;
  if (!dados.nome) erros.nome = 'Informe como quer ser chamado.';
  else if (dados.nome.length < min || dados.nome.length > max) {
    erros.nome = `O nome deve ter de ${min} a ${max} caracteres.`;
  }

  validarEmail(erros, dados.email);

  if (!senha) erros.senha = 'Crie uma senha.';
  else if (senha.length < LIMITES_CONTA.senha.min) {
    erros.senha = `A senha precisa ter pelo menos ${LIMITES_CONTA.senha.min} caracteres (agora são ${senha.length}).`;
  } else if (senha.length > LIMITES_CONTA.senha.max) {
    erros.senha = `A senha pode ter no máximo ${LIMITES_CONTA.senha.max} caracteres.`;
  } else if (!/[a-zA-Z]/.test(senha) || !/\d/.test(senha)) {
    erros.senha = 'Use letras e números na senha.';
  }

  if (!confirmacao) erros.confirmacao = 'Repita a senha.';
  else if (confirmacao !== senha) erros.confirmacao = 'As senhas não são iguais.';

  if (!dados.bairroId) erros.bairroId = 'Escolha seu bairro principal.';
  else if (!bairrosValidos.includes(dados.bairroId)) {
    erros.bairroId = 'Esse bairro não está disponível. Escolha um bairro da lista.';
  }

  return { valido: Object.keys(erros).length === 0, erros, dados: { ...dados, senha } };
}

export function validarLogin(entrada = {}) {
  const email = normalizarEmail(entrada.email);
  const senha = typeof entrada.senha === 'string' ? entrada.senha : '';
  const erros = {};
  validarEmail(erros, email);
  if (!senha) erros.senha = 'Informe sua senha.';
  return { valido: Object.keys(erros).length === 0, erros, dados: { email, senha } };
}
