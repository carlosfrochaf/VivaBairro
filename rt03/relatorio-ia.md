# Relatório do uso de IA no desenvolvimento

Este relatório separa dois assuntos: a IA usada **para desenvolver** o VivaBairro e a IA prevista **dentro do produto** (sugestão de categoria e resumo de avisos, RF-09). Só registramos o uso que tem evidência no repositório ou que a equipe declarou.

## Ferramentas utilizadas

| Ferramenta | Para que foi usada | Evidência |
| --- | --- | --- |
| Claude Code (agente de programação da Anthropic, modelo Claude Opus 5.5) | Apoio à equipe, em 05/11/2026, na escrita do código da versão Alfa (`app/`), dos testes Jest e do rascunho destas páginas da RT03. Também ajudou a executar os testes e a percorrer as telas num navegador. A ferramenta não fez o projeto sozinha nem faz a entrega: escopo, requisitos, protótipo e decisões são da equipe, que conduziu o trabalho, revisou o resultado e responde por ele. | Arquivos em `app/` e `rt03/`; commit com a linha `Co-Authored-By: Claude`. |
| Agentes de IA na manutenção do GitBook | Reorganização da documentação na RT02, com as regras de autoria do `AGENTS.md`. | `AGENTS.md` (commit `c72e748`, 01/10/2026). O histórico não registra qual ferramenta foi usada. |
| Gemini e Figma | Usados em protótipos e imagens|Usamos para refinar o protótipo e o layout|

> A última linha deve ser preenchida pela equipe. Não listamos ferramentas sem evidência.

## Trechos produzidos com apoio de IA

O código de `app/` foi escrito com apoio do Claude Code, a partir dos requisitos, regras e protótipo que a equipe já havia definido neste GitBook nas RT01 e RT02. A IA acelerou a escrita; a equipe orientou o que construir, revisou e decidiu o que entra na entrega. Seguem três trechos representativos.

### 1. Validação de aviso compartilhada entre navegador e servidor

Arquivo `app/src/dominio/validacao.js`. A mesma função dá retorno imediato na tela e é executada de novo pela API antes de gravar.

```javascript
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
```

### 2. Regras da sugestão por IA (consentimento, minimização, tempo limite e validação da resposta)

Arquivo `app/src/integracoes/ia.js`. Este trecho implementa no código as regras de RF-09, RF-10 e RNF-05.

```javascript
export async function solicitarSugestao(entrada, provedor, opcoes = {}) {
  const tempoLimiteMs = opcoes.tempoLimiteMs ?? TEMPO_LIMITE_PADRAO_MS;
  if (entrada?.consentimento !== true) return { ok: false, motivo: 'sem-consentimento' };

  const payload = minimizarEntrada(entrada); // só título e descrição
  if (!payload.titulo && !payload.descricao) return { ok: false, motivo: 'texto-vazio' };

  try {
    const resposta = await comTempoLimite(Promise.resolve().then(() => provedor(payload)), tempoLimiteMs);
    if (!respostaValida(resposta)) return { ok: false, motivo: 'resposta-invalida' };
    return { ok: true, sugestao: { categoria: resposta.categoria, resumo: resposta.resumo.trim().slice(0, 280) } };
  } catch (erro) {
    return { ok: false, motivo: erro.message === 'tempo-esgotado' ? 'tempo-esgotado' : 'falha' };
  }
}
```

### 3. Regra de capacidade e inscrição única

Arquivo `app/src/dominio/eventos.js`.

```javascript
if (jaInscrito) return falha('ja-inscrito');
if (estado === 'lotado') return falha('lotado');
if (estado !== 'inscricoes-abertas') return falha('indisponivel');
```

Os testes em `app/tests/` também foram escritos com apoio de IA. Por isso, a revisão humana deve conferir se cada teste verifica a regra documentada, e não apenas o comportamento que o código já tem.

## Validação humana e automação

| Etapa | Automatizado | Responsabilidade humana |
| --- | --- | --- |
| Regras do produto | Não. A IA partiu do que já estava escrito no GitBook. | A equipe definiu escopo, requisitos e regras nas RT01 e RT02. Decisões em aberto continuam com a equipe. |
| Escrita de código | Com apoio do Claude Code, orientado pela equipe. | Revisar cada arquivo antes de aprovar e conferir nomes e estados contra a documentação. |
| Testes unitários e de integração | Execução automática com `npm test`: 112 testes, todos passando em 05/11/2026. | Conferir se os casos cobrem os critérios dos requisitos. Acrescentar casos quando encontrar falhas. |
| Verificação das telas | O agente percorreu as telas no navegador e corrigiu os problemas encontrados (ver [Usabilidade e testes](usabilidade-e-testes.md#problemas-encontrados-e-corrigidos)). | Repetir o roteiro em outros navegadores e com teclado. Fazer sessões com pessoas do público. |
| Texto da documentação | Rascunho escrito com apoio de IA. | Revisar a precisão, a voz do grupo e o que é fato ou hipótese antes da entrega. |

## Riscos e como mitigamos

| Risco | Exemplo concreto | Mitigação aplicada |
| --- | --- | --- |
| Erros de sintaxe ou de execução | Código que não roda ou quebra em outro ambiente. | Testes automatizados executados após a geração; servidor iniciado e telas percorridas no navegador. O console do navegador ficou sem erros. |
| Alucinação de requisito | A IA inventar uma função não especificada, como uma lista de espera. | O `AGENTS.md` proíbe inventar funções, pesquisas e integrações. A Alfa não tem lista de espera, e a tela de lotação diz apenas que a vaga volta se alguém cancelar. |
| Alucinação de dados | Números de uso, depoimentos ou parcerias municipais inventados. | Faixa fixa "dados fictícios de demonstração" em todas as telas. O relatório declara que não houve pesquisa com usuários. |
| Alucinação de formato da IA do produto | Um modelo devolver categoria inexistente ou texto vazio. | `respostaValida()` descarta a resposta, e o teste "descarta resposta fora do formato esperado" cobre cinco casos. |
| Vazamento de dados para o provedor de IA | Enviar conta, bairro ou local sem necessidade. | `minimizarEntrada()` envia só título e descrição. Um teste confere o payload exato. |
| Dependência e perda de autoria | A equipe não entender o código que entrega. | Código sem framework, separado por responsabilidade e comentado em português. A equipe deve revisar e conseguir explicar cada módulo. |
| Segurança | Segredos expostos ou permissões só no navegador. | Nenhuma chave no código. Permissões e validação refeitas no servidor (`403` para aviso de outra pessoa e `422` para entrada inválida). Mensagens de erro `500` não mostram detalhes internos. |

## IA dentro do produto

Na Alfa, a sugestão de categoria e resumo usa um **provedor simulado** (`provedorSimulado`), que classifica por palavras-chave, sem rede e sem modelo de linguagem. A troca por um provedor real exige apenas uma nova função com a mesma assinatura. Antes disso, a equipe precisa decidir provedor, retenção de dados e texto final de consentimento, como registrado em [Privacidade e segurança](../4-avisos-pedidos-ajuda/privacidade-seguranca.md).
