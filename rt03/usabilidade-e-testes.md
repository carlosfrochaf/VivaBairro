# Usabilidade, validação e testes

Esta página mostra como a versão Alfa aplica os princípios de usabilidade definidos na [matriz de rastreabilidade](../10-requisitos/rastreabilidade-usabilidade.md) e quais testes comprovam o comportamento. As verificações foram feitas pela equipe; ainda não houve sessões com moradores ou organizadores.

## Princípios de usabilidade implementados

Os princípios seguem as dez heurísticas de usabilidade de Jakob Nielsen, adaptadas à revisão já prevista no projeto.

| Princípio | Onde aparece na Alfa | Arquivo |
| --- | --- | --- |
| Visibilidade do estado do sistema | Botões mudam para "Confirmando…", "Publicando…" e "Gerando sugestão…". Mensagem de confirmação após publicar. Estado do evento e do aviso sempre ao lado do item. Bairro ativo no topo. | `public/app.js` |
| Linguagem do usuário | Rótulos como "Quero participar", "Criar aviso" e "O que aconteceu?". Erros dizem o que fazer ("Use pelo menos 5 caracteres (agora são 3)."). | `src/dominio/validacao.js` |
| Controle e liberdade | Link "Voltar" em cada tela, "Limpar filtros", "Descartar sugestão" e "Descartar rascunho". Cancelar presença pede confirmação e oferece "Manter como está". | `public/app.js` |
| Consistência | Mesmas cores, nomes de estado e categorias do protótipo e da documentação. Estados vêm de um único módulo. | `src/dominio/eventos.js`, `avisos.js` |
| Prevenção de erros | Contador de caracteres, limite `maxlength`, botão de IA bloqueado até haver consentimento, só ações de estado válidas e alerta de telefone, CPF ou e-mail antes de publicar. | `public/app.js`, `src/dominio/privacidade.js` |
| Reconhecer em vez de lembrar | Categorias e bairros em listas, sem digitação livre. Rascunho recuperado com aviso "Recuperamos o rascunho que você começou". | `public/app.js` |
| Ajudar a reconhecer e corrigir erros | Resumo de erros no topo com links para cada campo, foco no primeiro campo com erro e mensagem ao lado do campo. | `public/app.js` |
| Estado vazio com saída | Busca sem resultados explica como ampliar a busca. Perfil sem itens oferece link para agir. | `public/app.js` |
| Acessibilidade | Rótulos associados, `aria-invalid` e `aria-describedby` nos campos, mensagens em regiões `aria-live`, foco visível, link "Pular para o conteúdo", alvos de toque com pelo menos 44 px e estado escrito em texto, não só em cor. | `public/index.html`, `estilo.css` |

## Validação de entradas

A validação acontece em duas camadas com o mesmo código: no navegador, para retorno imediato, e no servidor, onde vale de fato. Uma requisição feita fora da interface passa pela mesma regra.

| Campo | Regra | Mensagem exibida |
| --- | --- | --- |
| Título | Obrigatório, de 5 a 80 caracteres; espaços nas pontas são removidos | "Informe um título." / "Use pelo menos 5 caracteres (agora são 3)." |
| Local | Obrigatório, de 3 a 120 caracteres; orientação para usar local público | "Informe a rua ou um ponto de referência público." |
| Descrição | Obrigatória, de 10 a 1000 caracteres | "Informe o que aconteceu." |
| Categoria | Deve estar na lista fechada | "Escolha uma categoria da lista." |
| Bairro | Deve pertencer ao município | "Esse bairro não está disponível. Escolha um bairro da lista." |
| Início e término do evento | Datas válidas; início no futuro; término depois do início | "O término precisa ser depois do início." |
| Capacidade do evento | Vazia ou inteiro de 1 a 5000 | "O limite de participantes deve ser um número inteiro entre 1 e 5000, ou ficar em branco." |
| Dados pessoais no texto | Telefone, CPF ou e-mail geram alerta, sem bloquear | "Parece haver um número de telefone. Evite expor dados pessoais." |
| Corpo da requisição | JSON válido e no máximo 20 mil caracteres | "Não foi possível ler os dados enviados." / "O conteúdo enviado é grande demais." |

## Tratamento de erros

| Situação | Resposta da API | O que a pessoa vê |
| --- | --- | --- |
| Campos inválidos | `422` com `erros` por campo | Os mesmos erros nos mesmos campos; o rascunho é mantido |
| JSON malformado | `400` | Mensagem compreensível, sem detalhe técnico |
| Evento lotado, presença repetida ou evento encerrado | `409` com `codigo` | "Não há mais vagas neste evento." e similares; o botão volta a funcionar |
| Mudar aviso de outra pessoa | `403` | "Só o autor pode mudar o estado deste aviso." |
| Transição de estado inválida | `409` | "Não é possível passar de "Resolvido pelo autor" para "Em andamento"." |
| Item ou rota inexistente | `404` | "Evento não encontrado." |
| Erro interno | `500`, sem pilha de execução | "Algo deu errado do nosso lado. Seu texto não foi perdido; tente de novo." |
| Servidor fora do ar | Sem resposta | "Sem conexão com o servidor..." e botão "Tentar de novo" |
| IA sem consentimento, com falha, tempo esgotado ou resposta inválida | `200` com `ok: false` e `motivo` | Explicação do motivo; o texto continua no formulário e a publicação manual segue possível |

## Testes automatizados

Ferramenta: [Jest](https://jestjs.io/) 30, com módulos ES no Node.js 22. Execução: `cd app && npm test`. Cobertura: `npm run test:cobertura`.

| Arquivo | Tipo | O que verifica | Testes |
| --- | --- | --- | --- |
| `tests/validacao.test.js` | Unitário | Avisos e eventos: campos obrigatórios, limites, espaços, tipos inesperados, bairro inválido, datas e capacidade | 18 |
| `tests/eventos.test.js` | Unitário | Os seis estados do evento, inscrição única, lotação, evento indisponível e cancelamento que preserva o histórico | 13 |
| `tests/avisos.test.js` | Unitário | Mudança de estado pelo autor, histórico, permissão e transições inválidas | 5 |
| `tests/privacidade.test.js` | Unitário | Detecção de telefone, CPF e e-mail sem falso alarme para endereço, horário e data | 6 |
| `tests/ia.test.js` | Unitário | Consentimento, payload mínimo, tempo limite, falha, respostas inválidas e provedor simulado | 15 |
| `tests/api.test.js` | Integração | Servidor real: filtro por bairro, `400`, `403`, `404`, `409` e `422`, alerta de privacidade e falha de IA sem quebrar o fluxo | 9 |

### Resultado da execução (05/11/2026)

```text
Test Suites: 6 passed, 6 total
Tests:       66 passed, 66 total
Snapshots:   0 total
```

### Cobertura

```text
File             | % Stmts | % Branch | % Funcs | % Lines
-----------------|---------|----------|---------|--------
All files        |   84.28 |    72.02 |   85.18 |   86.99
 dominio         |   98.14 |    84.21 |     100 |     100
 integracoes     |     100 |    80.76 |     100 |     100
 servidor        |   70.42 |    52.77 |   73.33 |   74.56
```

As regras do produto (`dominio` e `integracoes`) têm 100% das linhas cobertas. O servidor tem cobertura menor porque o envio de arquivos estáticos e algumas rotas (cancelar presença e perfil) foram verificados no navegador, não por teste automatizado.

### Exemplo de teste

```javascript
test('sem consentimento explícito o provedor nunca é chamado', async () => {
  const provedor = jest.fn();
  expect(await solicitarSugestao({ ...entrada, consentimento: false }, provedor))
    .toEqual({ ok: false, motivo: 'sem-consentimento' });
  expect(await solicitarSugestao({ ...entrada, consentimento: 'sim' }, provedor))
    .toEqual({ ok: false, motivo: 'sem-consentimento' });
  expect(provedor).not.toHaveBeenCalled();
});
```

## Verificação manual das telas

Roteiro executado em 05/11/2026, no navegador do ambiente de desenvolvimento, com a Alfa local:

| Passo | Resultado |
| --- | --- |
| Entrar sem escolher bairro | Mensagem de erro e foco no campo |
| Buscar "piscina" | Estado vazio com orientação e filtro ativo visível |
| Confirmar a última vaga de "Aula de horta" | Tela de confirmação; o evento passa a "Lotado", com 0 vagas |
| Enviar aviso vazio | Resumo com 4 erros, foco no título e `aria-invalid="true"` |
| Digitar um telefone e recarregar a página | Rascunho recuperado e alerta de dado pessoal |
| Pedir sugestão de IA | Botão bloqueado até marcar a autorização; sugestão editável; publicação só no clique |
| Publicar | Mensagem de sucesso, aviso no perfil e rascunho apagado |
| Mudar o estado do aviso | Estado atualizado; só as transições válidas aparecem |
| Largura de 375 px | Layout se adapta, sem rolagem horizontal |
| Console do navegador | Sem erros |

### Problemas encontrados e corrigidos

1. A barra de navegação aparecia na tela de boas-vindas, porque o CSS sobrepunha o atributo `hidden`. Corrigido com `[hidden] { display: none !important; }`.
2. A mensagem de erro vermelha tinha pouco contraste sobre o fundo escuro da tela de boas-vindas. Nessa tela ela agora usa amarelo.
3. O botão "Marcar como aberto" era confuso para reabrir um aviso. Ele passou a se chamar "Reabrir aviso".

## O que ainda falta verificar

- Sessões com pessoas do público, com registro de data, versão, tarefas e problemas, conforme a matriz de rastreabilidade.
- Navegação completa só por teclado e com leitor de tela (NVDA, VoiceOver).
- Zoom de texto a 200% e larguras de tablet e desktop largo.
- Navegadores além do Chromium.
