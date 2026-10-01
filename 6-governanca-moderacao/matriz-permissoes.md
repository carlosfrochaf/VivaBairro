# Matriz de Perfis e Permissões (RBAC)

O controle de acesso baseado em funções (*Role-Based Access Control - RBAC*) no VivaBairro organiza os direitos de cada agente na plataforma.

---

## Papéis do Sistema

```
 ┌─────────────────────────────────────────────────────────────┐
 │                ADMINISTRADOR MUNICIPAL                      │
 │    • Cadastra bairros • Define moderadores • Estatísticas   │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────┴──────────────────────────────┐
 │                  MODERADOR REGIONAL                         │
 │    • Modera avisos/eventos locais • Revisa denúncias        │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────┴──────────────────────────────┐
 │                ORGANIZADOR DE ATIVIDADE                     │
 │    • Gerencia vagas • Edita detalhes • Emite comunicados    │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────┴──────────────────────────────┐
 │                 MORADOR / CIDADÃO LOCAL                     │
 │    • Consulta feed • Cria avisos • Confirma presença (RSVP) │
 └─────────────────────────────────────────────────────────────┘
```

---

## Matriz Detalhada de Permissões

| Recurso / Funcionalidade | Morador | Organizador | Moderador | Administrador |
| :--- | :---: | :---: | :---: | :---: |
| **Consultar Feed e Buscar** | Sim | Sim | Sim | Sim |
| **Criar Avisos e Pedidos de Ajuda** | Sim | Sim | Sim | Sim |
| **Confirmar Presença em Eventos** | Sim | Sim | Sim | Sim |
| **Criar e Gerenciar Eventos Próprios** | Sim | Sim | Sim | Sim |
| **Editar Vagas / Cancelar Evento Próprio**| Não | Sim | Sim | Sim |
| **Mover Publicação de Bairro (Correção)**| Não | Não | Sim | Sim |
| **Ocultar / Moderar Conteúdo Denunciado**| Não | Não | Sim | Sim |
| **Publicar Comunicados Oficiais** | Não | Não | Não | Sim |
| **Cadastrar Novos Bairros / Moderadores**| Não | Não | Não | Sim |
