import { validarCadastro, validarLogin, normalizarEmail } from '../src/dominio/contas.js';
import { gerarHash, conferirSenha, gerarToken } from '../src/servidor/senhas.js';

const BAIRROS = ['jardim-aurora', 'centro'];
const cadastroValido = {
  nome: 'Ana',
  email: 'ana@exemplo.com',
  senha: 'horta2026',
  confirmacao: 'horta2026',
  bairroId: 'centro',
};

describe('validarCadastro', () => {
  test('aceita cadastro completo e normaliza o e-mail', () => {
    const r = validarCadastro({ ...cadastroValido, email: '  Ana@Exemplo.COM ' }, BAIRROS);
    expect(r.valido).toBe(true);
    expect(r.dados.email).toBe('ana@exemplo.com');
  });

  test('aponta todos os campos vazios de uma vez', () => {
    expect(Object.keys(validarCadastro({}, BAIRROS).erros).sort()).toEqual(['bairroId', 'confirmacao', 'email', 'nome', 'senha']);
  });

  test.each(['ana', 'ana@', 'ana@exemplo', 'ana exemplo@x.com'])('recusa e-mail "%s"', (email) => {
    expect(validarCadastro({ ...cadastroValido, email }, BAIRROS).erros.email).toMatch(/formato/);
  });

  test('explica o tamanho mínimo da senha', () => {
    const r = validarCadastro({ ...cadastroValido, senha: 'ab1', confirmacao: 'ab1' }, BAIRROS);
    expect(r.erros.senha).toBe('A senha precisa ter pelo menos 8 caracteres (agora são 3).');
  });

  test('exige letras e números na senha', () => {
    const r = validarCadastro({ ...cadastroValido, senha: 'somenteletras', confirmacao: 'somenteletras' }, BAIRROS);
    expect(r.erros.senha).toBe('Use letras e números na senha.');
  });

  test('avisa quando a confirmação é diferente', () => {
    expect(validarCadastro({ ...cadastroValido, confirmacao: 'horta2027' }, BAIRROS).erros.confirmacao).toBe('As senhas não são iguais.');
  });

  test('recusa bairro fora do município', () => {
    expect(validarCadastro({ ...cadastroValido, bairroId: 'outro' }, BAIRROS).erros.bairroId).toMatch(/não está disponível/);
  });
});

describe('validarLogin', () => {
  test('pede e-mail e senha', () => {
    expect(validarLogin({}).erros).toEqual({ email: 'Informe seu e-mail.', senha: 'Informe sua senha.' });
  });

  test('normaliza o e-mail', () => {
    expect(normalizarEmail(' ANA@exemplo.com ')).toBe('ana@exemplo.com');
  });
});

describe('senhas', () => {
  test('o hash não contém a senha e confere só a senha certa', () => {
    const hash = gerarHash('horta2026');
    expect(hash).not.toContain('horta2026');
    expect(conferirSenha('horta2026', hash)).toBe(true);
    expect(conferirSenha('horta2027', hash)).toBe(false);
  });

  test('a mesma senha gera hashes diferentes (sal aleatório)', () => {
    expect(gerarHash('horta2026')).not.toBe(gerarHash('horta2026'));
  });

  test('hash malformado não confere', () => {
    expect(conferirSenha('qualquer', 'texto-invalido')).toBe(false);
  });

  test('tokens de sessão são longos e únicos', () => {
    const a = gerarToken();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(gerarToken()).not.toBe(a);
  });
});
