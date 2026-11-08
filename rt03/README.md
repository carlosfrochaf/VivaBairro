# Planejamento e desenvolvimento

O VivaBairro é um aplicativo Android para acompanhar eventos, avisos e colaboração por bairro. O planejamento parte de tarefas concretas: encontrar uma atividade, confirmar presença, informar uma ocorrência, responder a um pedido de ajuda e acompanhar sua atualização.

## Organização da solução

O produto organiza informações por município e bairro. A pessoa escolhe o bairro principal e os que acompanha, sem GPS contínuo ou endereço residencial. Autores gerenciam suas publicações; moderadores analisam denúncias nos bairros atribuídos; administradores gerenciam município, bairros e designações. A [visão do produto](../1-visao-geral/documento-visao-produto.md) e os [requisitos](../10-requisitos/requisitos-funcionais-nao-funcionais.md) detalham as responsabilidades.

Flutter compõe o aplicativo, Fastify e TypeScript compõem a API e PostgreSQL mantém os dados. Render hospeda a API e Neon mantém o banco da demonstração. A [arquitetura](../8-arquitetura-tecnica/visao-arquitetura.md) explica conexões e limites.

## Interface e implementação

O [protótipo SVG](../9-prototipo-interface/prototipo-wireframes.md) orienta as telas e a identidade visual. Material Design 3 apoia componentes e estados. Segurança da conta, moderação e administração seguem os mesmos padrões de linguagem, retorno das ações e recuperação de erros.

O desenvolvimento organiza código por responsabilidade, valida regras no servidor e mantém migrações, testes e configuração de qualidade no repositório. A [implementação](../docs/IMPLEMENTACAO.md) informa o que está disponível; o [guia de desenvolvimento](../docs/DESENVOLVIMENTO.md) explica a execução. O [relatório de IA](relatorio-ia.md) registra contribuições e modelos declarados.

## Próximas tarefas

O [planejamento](../planejamento/como-usar-o-quadro.md) oferece uma base para distribuir responsabilidades e critérios de conclusão. Não há evidência de um quadro ativo mantido pela equipe. As pendências incluem pesquisa com moradores, teste físico, entrega de e-mail, retenção e validação da representação municipal. Push e IA externa permanecem sem integração.
