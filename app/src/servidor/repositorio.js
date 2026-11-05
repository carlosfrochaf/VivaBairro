// Armazenamento em memória com dados fictícios de demonstração.
// Reinicia a cada execução; substitui o banco de dados previsto na arquitetura.

import { gerarHash, gerarToken } from './senhas.js';

const HORA = 60 * 60 * 1000;
const DIA = 24 * HORA;

export const CONTA_DEMO = {
  id: 'conta-demo',
  nome: 'Perfil de demonstração',
  email: 'demonstracao@vivabairro.test',
  bairroId: 'jardim-aurora',
};

function emDias(agora, dias, hora) {
  const data = new Date(agora.getTime() + dias * DIA);
  // Horários de Brasília (UTC-3), independentemente do fuso do servidor.
  data.setUTCHours(hora + 3, 0, 0, 0);
  return data.toISOString();
}

export function criarRepositorio(agora = new Date()) {
  const estado = {
    municipio: { id: 'mun-demo', nome: 'Município de demonstração' },
    // A conta de demonstração recebe uma senha aleatória: só se entra nela pelo botão de demonstração.
    contas: [{ ...CONTA_DEMO, senhaHash: gerarHash(gerarToken()) }],
    sessoes: new Map(),
    bairros: [
      { id: 'jardim-aurora', nome: 'Jardim Aurora' },
      { id: 'vila-esperanca', nome: 'Vila Esperança' },
      { id: 'centro', nome: 'Centro' },
    ],
    eventos: [
      {
        id: 'ev-mutirao',
        titulo: 'Mutirão da Praça do Sol',
        descricao:
          'A comunidade vai plantar mudas, pintar os bancos e organizar um cantinho para as crianças.',
        local: 'Coreto da Praça do Sol',
        bairroId: 'jardim-aurora',
        autorId: 'conta-organizadora',
        inicio: emDias(agora, 3, 9),
        fim: emDias(agora, 3, 12),
        capacidade: 20,
        gratuito: true,
      },
      {
        id: 'ev-horta',
        titulo: 'Aula de horta',
        descricao: 'Oficina aberta sobre compostagem e plantio de temperos em vasos.',
        local: 'Horta comunitária, ao lado da UBS',
        bairroId: 'jardim-aurora',
        autorId: 'conta-organizadora',
        inicio: emDias(agora, 4, 10),
        fim: emDias(agora, 4, 12),
        capacidade: 2,
        gratuito: true,
      },
      {
        id: 'ev-feira',
        titulo: 'Feira de trocas',
        descricao: 'Traga livros, brinquedos ou roupas em bom estado para trocar.',
        local: 'Escadaria da Igreja Matriz',
        bairroId: 'centro',
        autorId: 'conta-organizadora',
        inicio: emDias(agora, 6, 14),
        fim: emDias(agora, 6, 17),
        capacidade: null,
        gratuito: true,
      },
    ],
    // Inscrições de contas fictícias para mostrar contagem e lotação.
    inscricoes: [
      ...Array.from({ length: 17 }, (_, n) => ({ eventoId: 'ev-mutirao', contaId: `vizinho-${n}`, ativa: true })),
      { eventoId: 'ev-horta', contaId: 'vizinho-a', ativa: true },
    ],
    avisos: [
      {
        id: 'av-luz',
        titulo: 'Luz apagada na Rua das Acácias',
        descricao: 'O poste em frente à padaria está apagado há três noites.',
        local: 'Rua das Acácias, em frente à padaria',
        categoria: 'infraestrutura',
        bairroId: 'jardim-aurora',
        autorId: CONTA_DEMO.id,
        estado: 'aberto',
        criadoEm: new Date(agora.getTime() - HORA).toISOString(),
        historico: [],
      },
      {
        id: 'av-escada',
        titulo: 'Empréstimo de escada para mutirão',
        descricao: 'Precisamos de uma escada de 2 metros no sábado de manhã.',
        local: 'Praça do Sol',
        categoria: 'ajuda',
        bairroId: 'jardim-aurora',
        autorId: 'conta-organizadora',
        estado: 'em-andamento',
        criadoEm: new Date(agora.getTime() - DIA).toISOString(),
        historico: [],
      },
    ],
  };
  let sequencia = 1;
  return { estado, novoId: (prefixo) => `${prefixo}-${Date.now().toString(36)}-${sequencia++}` };
}
