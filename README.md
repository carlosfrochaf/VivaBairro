# VivaBairro — Plataforma Comunitária de Conexão Local

Bem-vindo à documentação oficial do **VivaBairro**.

O **VivaBairro** é uma plataforma digital colaborativa projetada para centralizar, organizar e dar visibilidade a acontecimentos, iniciativas, eventos e avisos de utilidade pública no âmbito dos bairros e comunidades locais.

---

## 💡 O Conceito do VivaBairro

> Em muitas cidades e bairros, informações vitais para a convivência e cidadania (como um mutirão de limpeza, uma feira de produtores, um buraco na via, um animal perdido ou um pedido de doação) acabam dispersas e perdidas em grupos infinitos de mensagens instantâneas e redes sociais.
>
> O **VivaBairro** resolve essa fragmentação através de um feed estruturado por **Assunto**, **Localização (Bairro/Ponto de Referência)** e **Situação Atual (Status)**.

```
       ┌─────────────────────────────────────────────────────────────┐
       │                 ECOSSISTEMA VIVABAIRRO                      │
       ├──────────────────────────────┬──────────────────────────────┤
       │ 👥 Moradores & Comércio      │ 🏛️ Prefeitura & Moderação    │
       │  • Consultam avisos locais   │  • Cadastro de bairros       │
       │  • Confirmam presença        │  • Comunicados oficiais      │
       │  • Criam mutirões e alertas  │  • Moderação auditável       │
       └──────────────┬───────────────┴──────────────┬───────────────┘
                      │                              │
                      ▼                              ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                   FEED GEOLOCALIZADO                        │
       │   [Atividades & Eventos]   |   [Avisos & Infraestrutura]    │
       │   [Pedidos de Ajuda]       |   [Comunicados Oficiais]       │
       └─────────────────────────────────────────────────────────────┘
```

---

## 🌟 Pilares Fundamentais

1. 📍 **Localização Sem Invasão de Privacidade:** O usuário escolhe o bairro principal para navegar sem a obrigatoriedade de fornecer o GPS exato ou endereço residencial.
2. 📅 **Gestão Dinâmica de Atividades:** Inscrições com confirmação de presença (RSVP), limite de vagas, cancelamento e alertas automáticos de alteração de horário/local.
3. 🛠️ **Avisos com Ciclo de Vida:** Publicações com status atualizáveis (*Em andamento*, *Resolvido*, *Encerrado*) para evitar ruído e notícias desatualizadas.
4. 🤝 **Colaboração e Ajuda Mútua:** Espaço seguro para troca de ferramentas, indicações e apoio entre vizinhos.
5. 🛡️ **Governança e Moderação Justa:** Atuação transparente de moderadores e prefeitura, com trilha de auditoria e proteção contra denúncias em massa (*anti-brigading*).

---

## 🧭 Navegação Rápida

- [Visão Geral & Proposta de Valor](1-visao-geral/proposito-objetivos.md)
- [Perfis de Usuários & Personas](1-visao-geral/personas-perfis.md)
- [Bairros & Modelo Territorial](2-localizacao-bairros/modelo-geografico.md)
- [Gestão de Atividades & Eventos](3-atividades-eventos/ciclo-vida-eventos.md)
- [Avisos, Problemas & Ajuda Mútua](4-avisos-pedidos-ajuda/categorias-avisos.md)
- [Privacidade & Proteção de Dados (LGPD)](4-avisos-pedidos-ajuda/privacidade-seguranca.md)
- [Contas & Política de Anonimização](5-usuarios-perfis/autenticacao-cadastro.md)
- [Governança, Moderação & Prefeitura](6-governanca-moderacao/matriz-permissoes.md)
- [Busca, Feed & Notificações](7-busca-notificacoes/feed-busca-filtros.md)
- [Arquitetura Técnica & Modelo de Dados](8-arquitetura-tecnica/visao-arquitetura.md)
