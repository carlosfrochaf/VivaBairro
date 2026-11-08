# Sobre o VivaBairro

O VivaBairro organiza informações da comunidade por bairro: eventos com data, local e confirmação de presença; avisos sobre ocorrências; pedidos e ofertas de ajuda. A proposta é facilitar encontrar e acompanhar essas informações sem depender de mensagens espalhadas em grupos. Esse benefício é uma hipótese a avaliar com moradores, não um resultado de pesquisa já medido.

A pessoa escolhe seu bairro principal e outros que deseja acompanhar. Não precisa informar endereço residencial nem manter GPS ativo. Publicações usam locais públicos ou referências; o aplicativo não é canal de emergência e não garante atendimento da prefeitura.

Autores podem editar, atualizar ou remover suas publicações. Denúncias levam à análise humana, com justificativa e possibilidade de revisão. Moderadores recebem bairros específicos; administradores municipais controlam bairros, designações e comunicados. Ainda será necessário definir como comprovar a representação da prefeitura e quem opera a moderação.

## Implementação atual

O VivaBairro é um aplicativo Flutter para Android, com API Node.js/Fastify e PostgreSQL. O código fica em mobile/ e api/, no mesmo repositório da documentação. Render hospeda a API e Neon mantém o banco da demonstração.

Há dados fictícios, fluxos de conta, eventos, avisos, colaboração e administração. Notificações internas funcionam; e-mail externo, push e IA externa não estão conectados. O estado verificável e as limitações estão em [implementação](docs/IMPLEMENTACAO.md), e a publicação em [hospedagem](docs/IMPLANTACAO.md).

O [protótipo](9-prototipo-interface/prototipo-wireframes.md) orienta a identidade e as telas principais. Novos fluxos podem ser acrescentados com coerência visual, clareza de ações, erros recuperáveis e acessibilidade.
