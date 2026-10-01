# Gestão e Qualidade de Código

## Estado do repositório

O repositório atual contém principalmente documentação GitBook e assets do protótipo; ainda não há uma aplicação frontend/backend implementada. Por isso, a configuração entregue padroniza Markdown, espaços e formatação e estabelece regras a aplicar quando o código do site for iniciado. Não se afirma que exista pipeline de CI ou análise de código executada.

## Arquivos de configuração

| Arquivo | Uso |
| --- | --- |
| `.editorconfig` | Padroniza UTF-8, fim de linha, quebra final e indentação entre editores. |
| `.prettierrc.json` | Define regras do formatador Prettier para Markdown, JSON, YAML, CSS e código futuro. |
| `.markdownlint-cli2.jsonc` | Define regras automáticas de consistência para a documentação Markdown. |
| `eslint.config.mjs` | Fornece regras iniciais para JavaScript, como igualdade estrita, aviso de variáveis não usadas e cautela com `console`. |

Os arquivos estabelecem a base de lint e formatação, mas as ferramentas ainda precisam ser instaladas e ligadas a comandos de verificação quando o frontend for iniciado. A configuração ESLint cobre JavaScript; se o grupo escolher TypeScript, deve incluir regras específicas para essa linguagem. Não há aplicação ainda, portanto não se afirma que lint, análise de tipos ou testes de aplicação já foram executados.

## Práticas propostas

O código futuro deve preferir componentes e funções pequenos, nomes que expliquem intenção, validação nas fronteiras da API e tratamento explícito de estados vazios e erros. Regras de negócio não devem ficar escondidas em componentes visuais. A integração de IA deve ser substituível por uma interface própria e não pode expor chaves no frontend.

Os princípios SOLID serão usados como guia, sem criar abstrações desnecessárias: cada módulo terá responsabilidade clara; dependências externas, como banco e IA, serão acessadas por adaptadores; e serviços poderão ser testados sem chamar o provedor real. Pull requests devem descrever o comportamento alterado, vincular tarefas do quadro e registrar como foi verificado.

## Verificações antes de integrar alterações

Quem contribuir deve conferir links internos do GitBook, revisar a formatação Markdown, validar o diagrama e confirmar que toda mudança de requisito aparece nas telas ou na matriz de rastreabilidade correspondente. Quando o aplicativo existir, acrescentar verificação de lint, formatação, tipos e testes automatizados ao pipeline escolhido pelo grupo.
