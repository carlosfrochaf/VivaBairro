# Documento de Visão do Produto (Product Vision Board)

**Projeto:** VivaBairro  
**Artefato:** Product Vision Board  
**Natureza:** Plataforma Web de Conexão e Zeladoria Hiperlocal  

---

## Visão

Ser o lugar de referência onde cada bairro se organiza: moradores descobrem o que acontece perto deles, divulgam iniciativas e compartilham avisos úteis de forma clara, confiável e atualizada. 

O objetivo é que mutirões, feiras, pedidos de ajuda e problemas de infraestrutura deixem de se perder em conversas dispersas e passem a gerar participação e resolução comunitária efetiva.

---

## Público-Alvo

* **Moradores:** consultam, participam, publicam e denunciam conteúdo indevido.
* **Organizadores (comerciantes, associações, coletivos, produtores de eventos):** criam e administram atividades e eventos locais.
* **Moderadores de bairro:** analisam denúncias e publicações das regiões territoriais pelas quais respondem.
* **Prefeitura e equipe municipal:** cadastram bairros, atribuem moderadores e publicam comunicados oficiais verificados.

---

## Necessidades dos Usuários e Stakeholders

* **Moradores:** encontrar rapidamente o que acontece no próprio bairro, sem depender de grupos de mensagens instantâneas e conversas longas.
* **Organizadores:** divulgar atividades, acompanhar confirmações de presença (RSVP) e avisar mudanças ou cancelamentos de forma instantânea.
* **Quem publica avisos:** informar problemas urbanos e pedidos de ajuda com assunto, local e situação atual (*em andamento*, *resolvido*), para que avisos antigos não pareçam atuais.
* **Todos os usuários:** privacidade garantida (sem endereço residencial ou localização exata expostos por padrão) e orientação clara para não divulgar dados de terceiros.
* **Moderação:** decisões transparentes, com registro auditável de quem agiu e por quê, direito formal de pedir revisão e proteção contra denúncias em massa (*anti-brigading*).
* **Prefeitura:** canal oficial devidamente identificado e distinguível das publicações informais dos moradores.

---

## Especificação do Produto

Site (*web*) responsivo e otimizado por bairro, contendo:

* **Página inicial por bairro:** atividades próximas, avisos recentes e comunicados oficiais, com filtros por data, categoria e região, e busca textual (ex.: nome de uma praça ou rua).
* **Atividades e eventos:** título, descrição, objetivo, data, horário, local, vagas, custo e contato; confirmação e cancelamento de presença; edição, lotação e cancelamento pelo organizador; arquivamento automático após a data.
* **Avisos e pedidos de ajuda:** categorias, descrição, local, foto opcional, atualização de status e respostas vinculadas ao próprio aviso (mensagens privadas avaliadas em etapa futura).
* **Conta e perfil:** cadastro mínimo (e-mail, senha, nome de exibição), definição de bairro principal, controle granular de notificações, edição de dados e encerramento de conta com anonimização das publicações.
* **Perfis e permissões:** morador, organizador, moderador e administrador municipal, com funções e acessos estritamente separados (RBAC).
* **Moderação com registro:** ações publicação por publicação, log de decisões auditável, aviso ao autor e fluxo de pedido de revisão.
* **Notificações:** no site (in-app) e, opcionalmente, por e-mail (confirmações, mudanças de eventos, respostas, atualizações e decisões de moderação).
