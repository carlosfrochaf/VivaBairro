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
| Nome de exibição | Obrigatório, de 2 a 60 caracteres | "Informe como quer ser chamado." |
| E-mail | Obrigatório, formato nome@exemplo.com, sem diferença entre maiúsculas e minúsculas | "Confira o e-mail. Ele deve ter o formato nome@exemplo.com." |
| Senha | Pelo menos 8 caracteres, com letras e números | "A senha precisa ter pelo menos 8 caracteres (agora são 3)." / "Use letras e números na senha." |
| Confirmação de senha | Igual à senha | "As senhas não são iguais." |
| Foto do aviso | Opcional; JPG, PNG ou WebP; até 900 KB depois de reduzida no navegador | "Use uma foto JPG, PNG ou WebP." / "A foto é grande demais (950 KB). Use uma de até 900 KB." |
| Bairros acompanhados | Até 5, todos do município; o principal e os repetidos são ignorados | "Escolha até 5 bairros para acompanhar." |
| Corpo da requisição | JSON válido e no máximo 20 mil caracteres (1,3 milhão em aviso com foto) | "Não foi possível ler os dados enviados." / "O conteúdo enviado é grande demais." |

## Tratamento de erros

| Situação | Resposta da API | O que a pessoa vê |
| --- | --- | --- |
| Campos inválidos | `422` com `erros` por campo | Os mesmos erros nos mesmos campos; o rascunho é mantido |
| JSON malformado | `400` | Mensagem compreensível, sem detalhe técnico |
| Evento lotado, presença repetida ou evento encerrado | `409` com `codigo` | "Não há mais vagas neste evento." e similares; o botão volta a funcionar |
| Ação sem login | `401` | Volta para a entrada: "Entre na sua conta para continuar." |
| E-mail ou senha incorretos | `401` | "E-mail ou senha incorretos..." (a mesma mensagem nos dois casos); a senha é apagada e o e-mail fica |
| 5 tentativas de login erradas | `429` | "Muitas tentativas sem sucesso. Aguarde 15 minutos..." |
| E-mail já cadastrado | `409` | "Use outro e-mail ou entre na conta que você já tem." |
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
| `tests/contas.test.js` | Unitário | Cadastro e login: campos obrigatórios, e-mail, força e confirmação da senha; hash com sal e token de sessão | 16 |
| `tests/contas-api.test.js` | Integração | `401` sem login, cookie `HttpOnly` e `Secure`, senha fora das respostas, e-mail repetido, mesma mensagem para e-mail e senha errados, bloqueio após 5 tentativas e saída | 8 |
| `tests/extras.test.js` | Unitário | Foto (tipo, tamanho, formato), bairros acompanhados (limite, repetidos, inexistentes) e lembretes (24 h antes, só presença ativa, preferência desligada, evento cancelado) | 15 |
| `tests/extras-api.test.js` | Integração | Foto enviada e servida à parte, foto inválida com `422`, feed "meus bairros", preferências inválidas, lembrete que some ao desligar ou ao cancelar a presença | 7 |

### Resultado da execução (05/11/2026)

```text
Test Suites: 10 passed, 10 total
Tests:       112 passed, 112 total
Snapshots:   0 total
```

### Cobertura

```text
File             | % Stmts | % Branch | % Funcs | % Lines
-----------------|---------|----------|---------|--------
All files        |   91.23 |    81.48 |   95.38 |    92.70
 dominio         |   97.36 |    87.20 |   97.67 |   98.01
 integracoes     |     100 |    80.76 |     100 |     100
 servidor        |   85.71 |    75.16 |   93.33 |   88.15
```

As regras do produto (`dominio` e `integracoes`) têm mais de 98% das linhas cobertas. O servidor tem cobertura menor porque o envio de arquivos estáticos e alguns caminhos de erro foram verificados no navegador, não por teste automatizado.

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
| Criar conta com o formulário vazio | Resumo com 5 erros e foco no primeiro campo |
| Criar conta com senhas diferentes | Só o erro da confirmação, com foco nela |
| Criar conta válida | Entra direto, com mensagem de boas-vindas e o início no bairro principal |
| Sair e abrir o perfil | Perfil bloqueado; volta para a entrada |
| Entrar com a senha errada | Mensagem genérica; e-mail mantido, senha apagada e foco na senha |
| Entrar com a senha certa e com a conta de demonstração | Entra e abre o início |
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
4. Os horários dos eventos apareciam 3 horas adiantados no servidor publicado, que usa outro fuso. Os dados de demonstração agora usam o horário de Brasília.
5. A Alfa entrava direto com um perfil de demonstração, diferente do protótipo. Agora tem as telas "Entrar" e "Criar conta".

## O que ainda falta verificar

- Sessões com pessoas do público, com registro de data, versão, tarefas e problemas, conforme a matriz de rastreabilidade.
- Navegação completa só por teclado e com leitor de tela (NVDA, VoiceOver).
- Zoom de texto a 200% e larguras de tablet e desktop largo.
- Navegadores além do Chromium.
