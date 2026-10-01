# Arquitetura do VivaBairro

A arquitetura descreve responsabilidades e fluxos, sem escolher frameworks ou provedores ainda. O objetivo é mostrar como a interface, as regras territoriais, os dados e serviços externos se relacionam.

## Contexto do sistema

![Contexto do sistema VivaBairro](../assets/contexto-vivabairro.svg)

O diagrama mostra quem usa o produto e quais serviços externos são opcionais. Não há integração direta prevista com sistemas da prefeitura; a existência de um canal municipal depende de autorização e operação acordadas.

## Containers propostos

![Containers propostos do VivaBairro](../assets/arquitetura-vivabairro.svg)

- **Site responsivo:** feed, busca, eventos, avisos, perfil, telas administrativas e estados da interface.
- **API e regras do produto:** sessão, autorização por município/bairro, validação de entrada, eventos, avisos, denúncias, moderação, auditoria, busca e notificações.
- **Banco de dados:** contas, municípios, bairros, publicações, participações e histórico.
- **Armazenamento de fotos:** opcional; separar acesso e remoção do conteúdo textual.
- **E-mail:** serviço externo opcional para notificações configuradas.
- **IA:** serviço externo opcional, chamado somente após consentimento. Recebe título e descrição necessários, devolve sugestão e não publica.

As setas representam a direção e finalidade da comunicação. Os protocolos estão indicados apenas como proposta quando ainda não há stack: HTTPS para interface/API e conexão protegida no servidor para serviços e banco. A tecnologia específica permanece pendente.

## Fluxo de sugestão por IA

1. A pessoa preenche o rascunho e escolhe pedir ajuda de IA.
2. Uma tela de consentimento informa quais campos serão enviados, o uso do provedor externo e a alternativa manual.
3. O navegador envia a solicitação ao backend; a chave do provedor permanece no servidor.
4. O backend minimiza e valida a entrada, aplica timeout e chama o serviço escolhido.
5. O backend valida a resposta e retorna somente categoria e resumo sugeridos.
6. A pessoa aceita, edita ou descarta as sugestões e confirma a publicação em ação separada.
7. Em recusa, falha, timeout ou resposta inválida, o rascunho continua disponível para publicação manual.

A política de retenção do provedor e o texto final de consentimento precisam ser definidos antes de uma integração real.

## Fronteiras de responsabilidade

O navegador não decide permissões. Toda ação verifica conta, papel, município e bairro no backend. A autorização municipal é distinta da moderação: administrador administra apenas o município vinculado; moderador atua somente nos bairros designados; organizador gerencia eventos de que é autor. A auditoria guarda decisões sem permitir edição silenciosa do histórico.

## Tecnologias e decisões pendentes

React/TypeScript, uma API HTTP e PostgreSQL são opções possíveis, não decisões aprovadas. A equipe ainda precisa escolher stack, autenticação, hospedagem, armazenamento de imagens, provedor de e-mail e provedor de IA. O diagrama deve ser atualizado quando essas decisões forem tomadas.

A implantação municipal, gestão de representantes, retenção dos dados e operação de moderação também não estão definidas. Não representar esses serviços como integrados até haver acordo e teste.
