# Versão Alfa executável

> Registro histórico da Alfa web em app/. Para o aplicativo Android atual, consulte [implementação](../docs/IMPLEMENTACAO.md).

A Alfa é uma aplicação web: um servidor Node.js com API HTTP e uma interface responsiva ligada a ela. Tem cadastro e login, usa dados fictícios em memória e uma IA simulada, sem chamar serviço externo. Cada reinício do servidor volta aos dados iniciais, inclusive as contas criadas.

## Acesso online

A Alfa está publicada em **[vivabairro-alfa.onrender.com](https://vivabairro-alfa.onrender.com)**, no plano gratuito do Render. Depois de alguns minutos sem uso, o servidor hiberna, e o primeiro acesso pode levar cerca de um minuto para carregar. Os dados voltam ao estado inicial sempre que o servidor reinicia.

## Como executar localmente

Requisito: [Node.js](https://nodejs.org/) 20 ou mais recente.

```bash
git clone https://github.com/carlosfrochaf/VivaBairro.git
cd VivaBairro/app
npm install
npm start
```

Abra `http://localhost:3000` no navegador. Para rodar os testes:

```bash
npm test
```

## Roteiro de demonstração

1. **Boas-vindas e conta:** a tela inicial oferece "Entrar" e "Criar conta", como no protótipo. Em "Criar conta", envie o formulário vazio para ver os erros e depois crie uma conta com nome, e-mail, senha e bairro principal. Para ir direto às telas, use "Explorar com a conta de demonstração".
2. **Início:** veja eventos e avisos do bairro. Busque "piscina" para ver o estado vazio e o botão "Limpar filtros".
3. **Evento:** abra "Aula de horta" (uma vaga livre) e clique em "Quero participar". A tela de confirmação aparece. Volte ao evento: ele aparece como "Lotado" e oferece "Cancelar minha presença", que pede confirmação antes.
4. **Criar aviso:** clique em "Publicar aviso" com o formulário vazio para ver o resumo de erros. Preencha título e descrição com um telefone, recarregue a página e veja o rascunho recuperado e o alerta de privacidade.
5. **IA simulada:** o botão de sugestão só é liberado depois de marcar a autorização. A sugestão aparece editável; nada é publicado sem o clique em "Publicar aviso".
6. **Perfil:** veja suas atividades e avisos. Mude o estado de um aviso; só aparecem as ações válidas para o estado atual.
7. **Sair e entrar:** use "Sair da conta" no perfil. Tente entrar com a senha errada para ver a mensagem genérica e depois entre com a senha certa.

## Telas implementadas

| Tela do protótipo | Implementação na Alfa |
| --- | --- |
| 01 Boas-vindas | Botões "Entrar" e "Criar conta", como no protótipo, mais o atalho para a conta de demonstração. |
| Entrar | E-mail e senha, com opção de mostrar a senha, mensagem genérica para dados incorretos e bloqueio após 5 tentativas erradas. |
| Criar conta | Nome de exibição, e-mail, senha com confirmação e bairro principal, com validação por campo. Não pede endereço nem localização. |
| 02 Início | Feed do bairro (eventos e avisos), busca por texto, filtro por tipo, filtros ativos visíveis e estado vazio. Sino no topo com o número de lembretes. |
| Trocar bairro | Escolhe um bairro ou "Todos os meus bairros", que junta o principal e os acompanhados. |
| Lembretes | Eventos confirmados que começam nas próximas 24 horas. |
| 03 Detalhe do evento | Data, local, vagas, estado e confirmação ou cancelamento de presença. |
| 04 Confirmação | Retorno visível da inscrição, quando o lembrete vai aparecer e caminhos para "minhas atividades" e início. |
| 05 Criar aviso | Validação por campo, resumo de erros, contador de caracteres, rascunho automático, alerta de dados pessoais, foto opcional e IA opcional. A foto é reduzida no navegador (até 1280 px) antes do envio. |
| 06 Meu perfil | Eventos confirmados, avisos próprios com ações de estado e preferências: bairros acompanhados (até 5) e lembretes ligados ou desligados. |

## API

| Método e rota | Função |
| --- | --- |
| `POST /api/contas` | Cria conta e abre sessão |
| `POST` / `GET` / `DELETE /api/sessao` | Entra, consulta a conta logada e sai |
| `POST /api/sessao/demonstracao` | Entra na conta de demonstração |
| `GET /api/bairros` | Município, bairros e categorias de aviso |
| `GET /api/feed?bairro=&q=&tipo=` | Eventos e avisos do bairro, com busca e filtro; `bairro=meus` junta o principal e os acompanhados |
| `GET /api/eventos/:id` | Detalhe com confirmados, vagas e estado calculado |
| `POST` / `DELETE /api/eventos/:id/presenca` | Confirma ou cancela presença |
| `POST /api/avisos` | Cria aviso, com foto opcional; o servidor valida de novo e responde `422` com erros por campo |
| `GET /api/avisos/:id/foto` | Devolve a foto do aviso, fora do JSON do feed |
| `PATCH /api/avisos/:id/estado` | Muda o estado; só o autor pode, e só por transições válidas |
| `POST /api/ia/sugestao` | Sugestão de categoria e resumo; exige consentimento |
| `GET /api/perfil` | Atividades e avisos da conta |
| `PATCH /api/perfil` | Salva bairros acompanhados e a preferência de lembretes |
| `GET /api/notificacoes` | Lembretes de eventos confirmados que começam nas próximas 24 horas |

## Cobertura dos requisitos

| Requisito | Situação na Alfa |
| --- | --- |
| RF-01 Conta e login | **Parcial.** Criar conta, entrar e sair funcionam. Erro de login não revela se o e-mail existe. Falta recuperar o acesso por e-mail. |
| RF-02 Bairro principal | **Implementado.** Bairro principal escolhido no cadastro, até 5 bairros acompanhados no perfil e opção de ver um bairro ou todos juntos. Trocar a preferência não muda o bairro das publicações. |
| RF-03 Consultar publicações | **Implementado** para eventos e avisos. Comunicados municipais ainda não existem. |
| RF-04 Busca e filtros | **Parcial.** Texto e tipo; filtros visíveis e limpáveis. Sem filtro de categoria e período. |
| RF-05 Criar e editar eventos | **Parcial.** A validação de evento existe e está testada; ainda não há tela para criar evento. |
| RF-06 Confirmar e cancelar presença | **Implementado.** Uma inscrição ativa por conta; a lotação não é ultrapassada. |
| RF-07 Avisos e estados | **Implementado.** Criação com foto opcional e mudança de estado com histórico. Edição do texto ainda não. |
| RF-09 Sugestão por IA com consentimento | **Implementado com provedor simulado.** |
| RF-10 Continuar sem IA | **Implementado.** Recusa, falha, tempo esgotado e resposta inválida mantêm o rascunho. |
| RF-15 Notificações | **Parcial.** Lembrete no site um dia antes dos eventos confirmados, que a pessoa pode desligar no perfil. Não há envio por e-mail nem aviso de alteração ou cancelamento. |
| RF-08, RF-11 a RF-14 | **Não implementados** (respostas, denúncia, moderação e administração). |
| RNF-02 Responsividade | Conferido em 375 px de largura sem rolagem horizontal. Faltam outras larguras e o zoom. |
| RNF-06 Acessibilidade | Rótulos, foco visível, foco no primeiro erro, `aria-invalid` e mensagens anunciadas. Sem avaliação com leitor de tela. |
| RNF-07 Recuperação | Rascunho salvo no navegador a cada digitação e recuperado ao voltar à tela. |

## Limitações conhecidas

- Os dados ficam em memória: reiniciar o servidor apaga o que foi criado, inclusive contas. Um banco de dados fica para a Beta.
- Senhas são guardadas só como hash scrypt com sal, e a sessão usa um cookie `HttpOnly`. A página de [cadastro e autenticação](../5-usuarios-perfis/autenticacao-cadastro.md) cita bcrypt/argon2 e JWT: a Alfa usa scrypt e um token de sessão guardado no servidor, porque já vêm no Node.js. A escolha final fica para a Beta.
- A reserva da última vaga é segura porque o Node.js executa a verificação e a gravação sem pausa entre elas. Com banco de dados, isso precisará de uma transação.
- A IA é um conjunto de regras por palavra-chave. Ela serve para demonstrar o fluxo de consentimento e falha, não a qualidade de um modelo de linguagem.
- Fotos ficam em memória junto com os outros dados. Na Beta, devem ir para um serviço de armazenamento de arquivos.
- Lembretes aparecem só dentro do site, quando a pessoa abre a página. Não há e-mail nem notificação no celular.
- A implantação no Render é de demonstração. Não houve teste de desempenho (RNF-01).

## Atualização da implementação — 08/11/2026

Esta página registra a Alfa web de app/, com dados em memória. Não descreve o aplicativo Flutter atual, mantido em mobile/ e api/. A Alfa online foi preservada.
