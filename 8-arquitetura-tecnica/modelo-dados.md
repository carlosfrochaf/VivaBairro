# Modelo Conceitual de Dados

O modelo de dados relacional reflete as entidades de negócio e suas restrições de integridade.

---

## 🗄️ Entidades Principais

```
 ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
 │     Users       │◄─────►│  Neighborhoods  │◄─────►│     Events      │
 ├─────────────────┤ 1   * ├─────────────────┤ 1   * ├─────────────────┤
 │ id              │       │ id              │       │ id              │
 │ email           │       │ name            │       │ title           │
 │ display_name    │       │ city_id         │       │ start_time      │
 │ role (RBAC)     │       │ active          │       │ max_attendees   │
 └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
          │ 1                       │ 1                       │ 1
          │                         │                         │
          ▼ *                       ▼ *                       ▼ *
 ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
 │     Notices     │       │ ModerationLogs  │       │  EventRSVPs     │
 ├─────────────────┤       ├─────────────────┤       ├─────────────────┤
 │ id              │       │ id              │       │ id              │
 │ category        │       │ moderator_id    │       │ event_id        │
 │ status          │       │ entity_type     │       │ user_id         │
 │ location_ref    │       │ reason          │       │ status          │
 └─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## 📝 Dicionário de Tabelas

1. **`Users`**: Identificação do morador, credenciais criptografadas, papel RBAC (`CITIZEN`, `ORGANIZER`, `MODERATOR`, `ADMIN`) e bairro padrão.
2. **`Neighborhoods`**: Bairros cadastrados oficialmente pela prefeitura.
3. **`Events`**: Atividades comunitárias com data de início, fim, capacidade, local e status.
4. **`EventRSVPs`**: Tabela associativa com presenças confirmadas e canceladas.
5. **`Notices`**: Avisos, ocorrências urbanas e pedidos de ajuda com status atualizável (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
6. **`NoticeComments`**: Respostas e ofertas de ajuda vinculadas a cada aviso.
7. **`ModerationLogs`**: Trilha de auditoria imutável registrando todas as intervenções de moderação.
