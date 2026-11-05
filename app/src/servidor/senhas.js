// Senhas guardadas só como hash scrypt com sal aleatório (RNF-03).

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const TAMANHO_CHAVE = 64;

export function gerarHash(senha) {
  const sal = randomBytes(16).toString('hex');
  const chave = scryptSync(senha, sal, TAMANHO_CHAVE).toString('hex');
  return `scrypt:${sal}:${chave}`;
}

export function conferirSenha(senha, hash) {
  const [algoritmo, sal, chave] = String(hash).split(':');
  if (algoritmo !== 'scrypt' || !sal || !chave) return false;
  const esperado = Buffer.from(chave, 'hex');
  const obtido = scryptSync(String(senha), sal, TAMANHO_CHAVE);
  // Comparação em tempo constante evita revelar a senha pelo tempo de resposta.
  return esperado.length === obtido.length && timingSafeEqual(esperado, obtido);
}

export function gerarToken() {
  return randomBytes(32).toString('hex');
}
