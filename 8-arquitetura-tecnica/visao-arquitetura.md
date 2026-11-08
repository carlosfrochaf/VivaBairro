# Arquitetura do VivaBairro

Flutter/Dart no aplicativo Android, Fastify/TypeScript na API Node.js e PostgreSQL na persistência. Render e Neon foram aprovados em 08/11/2026 para a demonstração; o estado da publicação está em [implantação](../docs/IMPLANTACAO.md).

## Componentes e comunicação

~~~mermaid
flowchart TB
  pessoa[Morador, moderador ou administrador]
  subgraph produto[VivaBairro]
    mobile[Flutter Android: interface e sessão]
    api[Fastify no Render: regras e autorização]
    banco[(PostgreSQL no Neon: dados e imagens)]
    pessoa -->|Interação com telas| mobile
    mobile -->|HTTPS e token de sessão| api
    api -->|SQL com TLS| banco
  end
  api -.->|Fila: configuração pendente| smtp[Provedor SMTP externo]
~~~

Setas contínuas representam a arquitetura escolhida; pontilhadas indicam integração pendente. Localmente, API e PostgreSQL rodam no computador. O emulador usa 10.0.2.2 para alcançar a API. A prévia web apoia revisão visual; não substitui teste Android.

## Responsabilidades e dados

O aplicativo orienta o preenchimento e apresenta estados de carregamento, erro e sucesso. A API repete validações, verifica autoria, município e bairro e executa transações. Senhas usam scrypt e sessões são registradas como hash no servidor. Neon fornece somente PostgreSQL; Better Auth/Neon Auth não é necessário.

O banco guarda contas, publicações, participações, respostas, denúncias, decisões, recursos e notificações. Um bloqueio transacional protege a última vaga contra inscrições simultâneas. Migrações versionadas em api/migrations/ são aplicadas antes de iniciar a API.

Fotos são validadas e redimensionadas, com metadados removidos, e ficam no PostgreSQL. Isso evita depender do disco temporário da hospedagem, mas requer planejamento de armazenamento para maior volume. Lembretes internos e fila de e-mail são processados enquanto a API está ativa. O plano gratuito não garante execução contínua.

## Limites e evolução

SMTP está preparado, sem provedor conectado. Push e IA externa não estão implementados no aplicativo; avisos funcionam manualmente. Não existe integração com sistemas internos de prefeitura. Validar representante municipal, retenção, limpeza de imagens abandonadas, backup e operação ainda exige decisões.

Os SVGs de [contexto](../assets/contexto-vivabairro.svg) e [containers](../assets/arquitetura-vivabairro.svg) registram a proposta anterior de site e foram preservados como histórico. O diagrama desta página descreve a implementação atual. A Alfa em app/ permanece separada, com dados próprios em memória.
