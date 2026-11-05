// Validação de entradas de avisos e eventos.
// O mesmo módulo roda no navegador (retorno imediato) e no servidor (regra que vale).

export const CATEGORIAS_AVISO = [
  { id: 'infraestrutura', nome: 'Infraestrutura urbana' },
  { id: 'transito', nome: 'Trânsito e mobilidade' },
  { id: 'achados-perdidos', nome: 'Achados e perdidos' },
  { id: 'utilidade-publica', nome: 'Utilidade pública' },
  { id: 'ajuda', nome: 'Pedido de ajuda ou colaboração' },
];

export const LIMITES = {
  titulo: { min: 5, max: 80 },
  local: { min: 3, max: 120 },
  descricao: { min: 10, max: 1000 },
  capacidade: { min: 1, max: 5000 },
};

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function validarTexto(erros, campo, valor, rotulo) {
  const { min, max } = LIMITES[campo];
  if (!valor) {
    erros[campo] = `Informe ${rotulo}.`;
  } else if (valor.length < min) {
    erros[campo] = `Use pelo menos ${min} caracteres (agora são ${valor.length}).`;
  } else if (valor.length > max) {
    erros[campo] = `Use no máximo ${max} caracteres (agora são ${valor.length}).`;
  }
}

function validarBairro(erros, bairroId, bairrosValidos) {
  if (!bairroId) {
    erros.bairroId = 'Escolha o bairro da publicação.';
  } else if (!bairrosValidos.includes(bairroId)) {
    erros.bairroId = 'Esse bairro não está disponível. Escolha um bairro da lista.';
  }
}

function resultado(erros, dados) {
  return { valido: Object.keys(erros).length === 0, erros, dados };
}

export function validarAviso(entrada = {}, bairrosValidos = []) {
  const dados = {
    titulo: texto(entrada.titulo),
    local: texto(entrada.local),
    descricao: texto(entrada.descricao),
    categoria: texto(entrada.categoria),
    bairroId: texto(entrada.bairroId),
  };
  const erros = {};

  validarTexto(erros, 'titulo', dados.titulo, 'um título');
  validarTexto(erros, 'local', dados.local, 'a rua ou um ponto de referência público');
  validarTexto(erros, 'descricao', dados.descricao, 'o que aconteceu');
  if (!CATEGORIAS_AVISO.some((c) => c.id === dados.categoria)) {
    erros.categoria = 'Escolha uma categoria da lista.';
  }
  validarBairro(erros, dados.bairroId, bairrosValidos);

  return resultado(erros, dados);
}

function lerData(valor) {
  if (typeof valor !== 'string' || !valor) return null;
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function validarEvento(entrada = {}, bairrosValidos = [], agora = new Date()) {
  const dados = {
    titulo: texto(entrada.titulo),
    local: texto(entrada.local),
    descricao: texto(entrada.descricao),
    bairroId: texto(entrada.bairroId),
    inicio: texto(entrada.inicio),
    fim: texto(entrada.fim),
    capacidade: null,
  };
  const erros = {};

  validarTexto(erros, 'titulo', dados.titulo, 'um título');
  validarTexto(erros, 'local', dados.local, 'um local público ou ponto de referência');
  validarTexto(erros, 'descricao', dados.descricao, 'o objetivo do evento');
  validarBairro(erros, dados.bairroId, bairrosValidos);

  const inicio = lerData(dados.inicio);
  const fim = lerData(dados.fim);
  if (!inicio) erros.inicio = 'Informe data e hora de início.';
  else if (inicio <= agora) erros.inicio = 'O início precisa ser no futuro.';
  if (!fim) erros.fim = 'Informe data e hora de término.';
  else if (inicio && fim <= inicio) erros.fim = 'O término precisa ser depois do início.';

  const capacidade = entrada.capacidade;
  if (capacidade !== undefined && capacidade !== null && capacidade !== '') {
    const numero = Number(capacidade);
    const { min, max } = LIMITES.capacidade;
    if (!Number.isInteger(numero) || numero < min || numero > max) {
      erros.capacidade = `O limite de participantes deve ser um número inteiro entre ${min} e ${max}, ou ficar em branco.`;
    } else {
      dados.capacidade = numero;
    }
  }

  return resultado(erros, dados);
}
