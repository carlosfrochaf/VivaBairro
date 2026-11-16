# Usabilidade, validação e testes

A revisão verifica se a pessoa identifica onde está, entende as ações e corrige erros sem perder o que escreve. As [heurísticas de Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/), o [Material Design 3](https://m3.material.io/) e a [acessibilidade Flutter](https://docs.flutter.dev/ui/accessibility) orientam a inspeção; não substituem avaliação com moradores.

## Situação consolidada — 16/11/2026

O último resultado da API é de 17 testes aprovados em 15/11; o do Flutter é de 20 testes aprovados em 16/11, com análise estática sem problemas. A compilação TypeScript passa em 16/11. Os totais menores nos registros anteriores correspondem às respectivas revisões e não ao total atual.

A administração de moderadores foi percorrida no emulador conectado à API online, incluindo designação e revogação confirmadas pelo responsável. O novo cenário de widget combina lista preenchida, fonte ampliada e área de teclado. Essa cobertura simulada não deve ser apresentada como revisão visual nativa de todos esses estados. O ensaio completo dos fluxos da apresentação ainda está pendente; consulte o [roteiro](../docs/APRESENTACAO.md).

## Aplicação nas telas

| Princípio | Aplicação |
| --- | --- |
| Visibilidade do estado | Bairro e filtros identificados, carregamento e confirmação das ações, estados escritos em texto. |
| Linguagem familiar | Participar, publicar, responder e resolver; mensagens explicam o que fazer. |
| Controle | Voltar, limpar filtros, cancelar presença e confirmar ações sensíveis. |
| Consistência | Identidade do SVG, componentes Material 3 e termos iguais para estados e papéis. |
| Prevenção | Validação de campos, revisão antes de publicar e checagem de autoria e território no servidor. |
| Reconhecimento | Seletores de bairros e categorias, rascunhos recuperáveis e ações contextualizadas. |
| Recuperação | Texto preservado em falhas, nova tentativa e orientação nos formulários. |
| Acessibilidade | Rótulos semânticos, cabeçalhos, cartões acionáveis, rolagem e estados que não dependem só de cor. |

A [rastreabilidade](../10-requisitos/rastreabilidade-usabilidade.md) relaciona necessidades, requisitos e interface. Controles mantêm espaço, acomodam quebras de linha e respeitam a área segura do Android.

## Verificações registradas em 08/11/2026

| Verificação | Resultado e alcance |
| --- | --- |
| API com PostgreSQL real | 16 testes no relatório do executor (15 subtestes e uma suíte), aprovados. Autorização, concorrência de vagas, moderação, imagens, recuperação, revogação, encerramento de conta e lembretes. |
| Flutter | 18 testes de widgets e cliente HTTP aprovados; análise estática sem problemas. Layouts estreitos, texto ampliado, rascunho e semântica. |
| Integração Android local | Um roteiro aprovado no emulador API 36: conta temporária, entrada, criação, edição, resolução e remoção de aviso; encerramento da conta ao final. |
| Integração contínua | Jobs API e Flutter aprovados no [GitHub Actions](https://github.com/carlosfrochaf/VivaBairro/actions/runs/42490292213), commit 5fd363e. O teste com emulador é local. |
| API online | Cadastro, sessão, gravação/leitura e recusa de comunicado oficial sem autorização verificados por HTTPS. Conta temporária encerrada. |
| App online | Feed com imagens e painel municipal conferidos no emulador; não cobre todo o fluxo remoto de moderação. |

As contagens descrevem as execuções registradas, não cobertura total. Esta revisão documental não executa novamente as baterias do aplicativo.

## Teclado e fonte ampliada

A inspeção nativa cobre feed, editor, categorias, perfil, preferências, segurança, detalhe de evento e diálogo de denúncia. Editor e diálogo são conferidos com teclado aberto e fonte ampliada. Testes reproduzem telas de 320/360 pixels, escala de texto 2x e teclado simulado de 300 pixels. Diálogos roláveis, seletores adaptáveis e margens dos botões tratam os transbordamentos identificados.

![Editor com teclado e fonte ampliada](../docs/screenshots/android-editor-fonte-ampliada.png)

![Diálogo com fonte ampliada](../docs/screenshots/android-denuncia-fonte-ampliada.png)

## TalkBack

A revisão parcial verifica foco sequencial no feed e detalhe, abertura de cartão por toque duplo, campo de motivo, fechamento do diálogo e retorno do foco. Cartões expõem papel de botão e rótulo contextual; títulos são cabeçalhos; notificações indicam lida ou não lida. A fonte está restaurada ao tamanho padrão.

![Foco do TalkBack](../docs/screenshots/android-talkback-foco.png)

Não há avaliação do áudio ou compreensão da fala. Cadastro, recuperação, administração, upload e todos os erros ainda não têm revisão completa com leitor. Testes de listas administrativas vazias não comprovam todos os estados. Descrição alternativa específica por foto permanece uma melhoria a planejar.

## Validação com pessoas

Não há sessões concluídas com moradores nem teste em aparelho físico. A equipe precisa observar tarefas como encontrar evento, cancelar presença, publicar aviso e solicitar revisão. O registro deve incluir contexto, tarefa, dificuldade, resultado e limitação, sem inventar participantes ou métricas. Orientação horizontal, desempenho em release e revisão completa de acessibilidade também estão pendentes.

## Revisão de moderação em 15/11/2026

A bateria local passa com 17 testes no executor da API e 19 testes Flutter, além de lint, formatação, compilação e análise estática. A revisão online por HTTPS confirma decisões, notificações em português, recursos independentes, autoria de respostas, escopo da fila e revogação com sessões abertas. As contas descartáveis são encerradas ao final. Detalhes e limites estão em [implementação](../docs/IMPLEMENTACAO.md).

O roteiro HTTPS não substitui a revisão das telas: seus papéis são preparados e revogados pelo operador. O ambiente Android está restaurado e os resultados nativos e a situação do acesso administrativo estão em [implementação](../docs/IMPLEMENTACAO.md).

## Administração no aplicativo

A bateria Flutter atual contém 20 testes aprovados. O cenário administrativo usa uma lista preenchida e texto ampliado em duas vezes e área de teclado de 300 pixels para conferir confirmação com o bairro, cancelamento sem envio, designação e revogação. O seletor exclui bairros de outro município. Esses resultados usam uma API simulada; não comprovam por si só a designação online nem a compreensão do fluxo por moradores.

A revisão nativa de 16/11/2026 percorre a administração com fonte padrão, lista vazia e preenchida, seletor de bairro e confirmações de designação e revogação. O responsável conclui os cliques que alteram permissões. A API online confirma o papel somente no Centro e o bloqueio de moderação após revogação, mesmo com a sessão ainda aberta. A conta temporária é encerrada. Não foram observados cortes ou sobreposição nessas telas; fonte ampliada com teclado, nesta rodada, tem cobertura automatizada de widget, não nova avaliação visual nativa.
