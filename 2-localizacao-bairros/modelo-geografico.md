# Modelo Geográfico & Privacidade

O modelo geográfico do **VivaBairro** adota o princípio de **privacidade por design (*Privacy by Design*)**.

---

## 📍 Seleção de Bairros Sem Rastreamento Forçado

* **Sem necessidade de GPS contínuo:** O usuário não é obrigado a ceder a localização em tempo real do seu dispositivo móvel para consultar ou publicar.
* **Bairro Principal & Bairros de Interesse:**
  * O morador define um **Bairro Principal** (onde mora ou trabalha), que dita o feed inicial.
  * Pode acompanhar **múltiplos bairros secundários** (ex: o bairro onde estudam os filhos ou onde residem familiares).

---

## 🔒 Proteção do Endereço Residencial

Ao criar publicações (atividades ou avisos):
* O autor define um **ponto de referência público** (ex: *"Praça da Matriz"*, *"Rua das Flores na altura do nº 200"*, *"Em frente à UBS Central"*).
* O endereço residencial cadastrado no perfil do morador **nunca é exibido publicamente** por padrão.

```
 [Usuário cria publicação]
           │
           ├── Informa Local do Evento/Aviso: "Praça do Skate, Centro" ──► ✅ PÚBLICO
           │
           └── Endereço Privado do Morador: "Rua X, Apto 12" ─────────────► 🔒 PRIVADO
```
