# Matriz de Perfis e Permissões (RBAC)

O controle de acesso baseado em funções (*Role-Based Access Control - RBAC*) no VivaBairro organiza os direitos de cada agente na plataforma.

---

## 👥 Papéis do Sistema

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

## 📊 Matriz Detalhada de Permissões

| Recurso / Funcionalidade | Morador | Organizador | Moderador | Administrador |
| :--- | :---: | :---: | :---: | :---: |
| **Consultar Feed e Buscar** | ✅ | ✅ | ✅ | ✅ |
| **Criar Avisos e Pedidos de Ajuda** | ✅ | ✅ | ✅ | ✅ |
| **Confirmar Presença em Eventos** | ✅ | ✅ | ✅ | ✅ |
| **Criar e Gerenciar Eventos Próprios** | ✅ | ✅ | ✅ | ✅ |
| **Editar Vagas / Cancelar Evento Próprio**| ❌ | ✅ | ✅ | ✅ |
| **Mover Publicação de Bairro (Correção)**| ❌ | ❌ | ✅ | ✅ |
| **Ocultar / Moderar Conteúdo Denunciado**| ❌ | ❌ | ✅ | ✅ |
| **Publicar Comunicados Oficiais** | ❌ | ❌ | ❌ | ✅ |
| **Cadastrar Novos Bairros / Moderadores**| ❌ | ❌ | ❌ | ✅ |
