# Cadastro Enxuto & Autenticação

O **VivaBairro** adota uma política de coleta mínima de dados (*Data Minimization*), facilitando a adesão da comunidade e reduzindo superfícies de risco.

---

## 📋 Campos Mínimos de Cadastro

Para criar uma conta, são solicitados estritamente:

1. **E-mail:** Para login, recuperação de senha e notificações essenciais.
2. **Senha Segura:** Armazenada com hash criptográfico forte (`bcrypt` / `argon2`).
3. **Nome de Exibição / Apelido:** O nome público com o qual o usuário deseja ser identificado na comunidade (pode ser diferente do nome civil).

---

## 🔐 Autenticação e Sessão

* **Sessões Seguras:** Tokens JWT assinados com expiração e rotação de Refresh Tokens em cookies `HttpOnly` e `Secure`.
* **Recuperação de Senha:** Fluxo por e-mail com token temporário e de uso único (*magic link / OTP*).
