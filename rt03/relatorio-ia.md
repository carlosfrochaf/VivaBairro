# Uso de IA no desenvolvimento

É preciso separar a IA usada para construir o projeto de uma função de IA oferecida ao usuário. O aplicativo atual foi desenvolvido com participação substancial de um agente de programação; isso não significa que ele tenha IA conectada dentro do produto.

## Ferramentas e participação

| Ferramenta | Participação registrada | Limite da evidência |
| --- | --- | --- |
| Codex | Em 08/11/2026, escreveu e revisou código Flutter, API, migrações, testes, configuração de hospedagem e documentação. Também operou o emulador para revisar telas e corrigir problemas. | Código e documentação tiveram autoria assistida extensa, não apenas correção ortográfica. Revisão humana integral ainda não está registrada. |
| Claude Code | O registro anterior da equipe atribui à ferramenta apoio na Alfa web, testes Jest e documentação em 05/11/2026. | Preserva-se a atribuição histórica; a versão exata do modelo e a extensão da revisão humana não foram verificadas nesta etapa. |
| Gemini e Figma | A equipe informou uso no refinamento de imagens e protótipo. | Figma é ferramenta de design; não se presume que todo trabalho nele seja gerado por IA. Versões, prompts e contribuições detalhadas ainda não foram registrados. |
| Assistentes na documentação anterior | Histórico do AGENTS.md e das páginas registra reorganização e manutenção. | Não atribuir ferramenta ou modelo sem evidência. |

## Decisões do responsável e da equipe

O responsável forneceu a proposta, os SVGs corretos e feedback sobre fidelidade visual e espaçamento. Escolheu Flutter, autorizou a configuração Android e definiu Render com Neon. Pediu revisão com teclado, fonte ampliada e TalkBack, dados fictícios para demonstração e atualização contínua do GitBook.

Essas decisões orientaram o agente, mas não comprovam que toda linha de código tenha sido revisada pela equipe. Antes de apresentar ou operar o projeto, a equipe deve entender e conseguir explicar regras, dados, permissões e limitações.

## Exemplos de trabalho assistido

A API verifica autoria e território no servidor e usa transação PostgreSQL para concorrência de vagas. O aplicativo preserva rascunhos, oferece revisão antes de publicar e trata estados de carregamento e erro. Esses trechos e seus testes foram produzidos com assistência de IA.

A revisão encontrou botões encostados, rótulos cortados e transbordamento de formulários com teclado e texto ampliado. Foram corrigidos espaçamento, rolagem, seletores e semântica de cartões. O [histórico](../docs/IMPLEMENTACAO.md) registra casos, capturas e limites; não houve teste com moradores.

Exemplos de orientações recebidas foram manter o SVG de referência, testar telas no emulador com fonte ampliada, povoar o ambiente com contas fictícias e atualizar o GitBook a cada mudança. Esses pedidos não substituem critérios de aceitação; precisam ser traduzidos em verificações observáveis.

## Como verificamos e o que não foi verificado

Lint, análise estática, compilação e testes automatizados ajudam a detectar falhas. A API foi exercitada com PostgreSQL real; widgets foram verificados em larguras e escalas de texto específicas. Houve revisão visual e parcial do foco/ativação com TalkBack no emulador. Não houve acesso ao áudio para avaliar pronúncia, teste em aparelho físico ou certificação de acessibilidade.

Os testes também foram escritos pelo agente. Por isso, a equipe deve conferir se verificam o requisito e se incluem falhas possíveis, em vez de apenas reproduzir a implementação. Teste que falha precisa de diagnóstico; não deve ser removido ou ter sua expectativa enfraquecida para produzir um resultado positivo.

Os 112 testes citados no registro histórico são da Alfa, em app/. Os testes de Flutter e da nova API são baterias distintas, com resultados documentados separadamente. Não afirmar revisão completa ou aprovação humana sem registro.

## Riscos que permanecem

Código gerado pode conter erros, regras não solicitadas ou dependências mal escolhidas. Diagramas e documentação podem ficar divergentes. Dados fictícios podem parecer reais se não forem identificados. Para reduzir esses riscos, regras estão no AGENTS.md, permissões são verificadas no servidor, segredos ficam fora do repositório e mudanças atualizam a documentação funcional.

Retenção, validação institucional, pesquisa com usuários e operação pública ainda exigem decisões humanas. A IA não valida representação de prefeitura nem substitui responsáveis pela moderação.

## IA dentro do produto

Na Alfa, sugestões usam regras por palavras-chave, sem modelo de linguagem externo. No Flutter, IA externa permanece indisponível e o fluxo manual funciona. Não há publicação nem moderação automática. Uma integração futura exige escolher provedor, definir consentimento, minimizar dados, revisar retenção e testar falhas sem perder o rascunho.
