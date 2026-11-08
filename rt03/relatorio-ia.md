# Uso de IA no desenvolvimento

Usamos assistência de IA no planejamento, na programação, na revisão da interface, nos testes e na documentação do VivaBairro. A participação inclui geração e alteração substancial de código, não apenas correção de textos. A equipe define o objetivo, fornece os protótipos, decide o escopo e responde pelo que apresenta e disponibiliza.

## Ferramentas e modelos

Registro baseado na informação do responsável em 08/11/2026. Ferramenta e modelo são informações diferentes. Não há um registro completo que associe cada arquivo ou resposta a um modelo específico.

| Ferramenta ou família | Modelo informado | Precisão da atribuição |
| --- | --- | --- |
| Assistentes OpenAI / Codex | GPT-6 Lunar | Nome informado pelo responsável com ressalva de memória; identificação declarada, a confirmar. Não inferimos versão interna ou identificador de API. |
| Assistentes OpenAI / Codex | GPT-6 Astra | Uso informado pelo responsável no trabalho assistido de desenvolvimento. Não atribuímos toda a produção exclusivamente a esse modelo. |
| Claude Code | Claude Opus 5.5 | Nome confirmado pelo responsável, com participação em código, testes e documentação. Não há atribuição verificável por trecho. |

Figma é a ferramenta de design dos protótipos de referência; isso não implica geração por IA. A relação de modelos confirmada pelo responsável contém os três nomes acima. Não atribuímos o trabalho a Gemini sem confirmação. Documentação dos fornecedores explica ferramentas, mas não comprova quais modelos a equipe utilizou: essa atribuição vem do relato do responsável.

## Participação no projeto

No planejamento, a assistência organiza tarefas de moradores, autores, moderadores e administradores em requisitos e critérios de aceitação. Ajuda a apontar inconsistências e relacionar regras às telas. A equipe decide Flutter para Android, escolha manual do bairro, escopo municipal e hospedagem Render com Neon.

Na implementação, o Codex participa da escrita e revisão de telas Flutter, chamadas HTTP, validações, permissões territoriais, transações de vagas, migrações PostgreSQL e scripts. Também prepara testes, configuração de qualidade, APKs e documentação. Os exemplos de eventos, avisos e autores são fictícios; não representam pesquisa de campo nem ocorrências reais.

Na interface, o SVG fornecido pela equipe orienta identidade, hierarquia e fluxos. A revisão assistida cobre espaçamento, teclado aberto, fonte ampliada e semântica para TalkBack. Na hospedagem, o agente auxilia na configuração e conferência de dados e permissões. O responsável entra nas próprias contas e define sua senha fora do chat. Credenciais não fazem parte da documentação pública.

## Orientações e revisão

Exemplos de pedidos da equipe, resumidos: manter fidelidade ao protótipo; conferir textos cortados e controles sobrepostos; revisar telas com teclado e fonte ampliada; verificar acessibilidade no Android; criar exemplos de outras contas; e atualizar o GitBook junto com o aplicativo. Os pedidos são convertidos em alterações e verificações observáveis.

O [AGENTS.md](../AGENTS.md) orienta manutenção, consulta aos requisitos, privacidade e proibição de inventar evidências. As [referências](../referencias-e-pesquisa.md) permitem conferir recomendações fora das respostas dos assistentes.

A verificação combina análise estática, lint, compilação, PostgreSQL real, testes Flutter e execução no emulador. Os [resultados](usabilidade-e-testes.md) têm escopo e limitações registrados. Os testes também têm autoria assistida: passar neles não prova cobertura integral nem substitui revisão independente. Falhas exigem diagnóstico; testes não devem ser enfraquecidos apenas para obter aprovação.

Não há registro de revisão humana integral de cada linha, teste com moradores, teste em aparelho físico ou auditoria de segurança. A equipe precisa entender e explicar as regras, revisar o código e decidir as pendências operacionais. A aprovação de uma escolha de produto não comprova revisão completa da implementação.

## Cuidados e limites

Respostas podem conter erros, dependências inadequadas, referências incorretas ou funções não solicitadas. Informações externas precisam de fonte; comportamento precisa de teste pertinente; conclusão precisa de evidência. Não publicamos credenciais, dados privados ou relatos fictícios como pesquisa real. Autoridade municipal, retenção e operação de moderação exigem decisões humanas.

## IA dentro do aplicativo

O aplicativo não possui provedor externo de IA conectado. Criar eventos e avisos funciona manualmente. Uma assistência de redação ou categoria permanece proposta: exige consentimento antes do envio, minimização de dados, revisão da sugestão e confirmação humana para publicar. IA não publica, remove conteúdo ou decide sanções automaticamente.
