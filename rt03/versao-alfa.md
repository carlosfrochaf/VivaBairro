# Versão Alfa executável

A Alfa é uma aplicação web que roda localmente: um servidor Node.js com API HTTP e uma interface responsiva ligada a ela. Usa dados fictícios em memória e uma IA simulada, sem chamar serviço externo. Cada reinício do servidor volta aos dados iniciais.

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

1. **Boas-vindas:** clique em "Entrar" sem escolher bairro para ver a validação. Depois escolha "Jardim Aurora".
2. **Início:** veja eventos e avisos do bairro. Busque "piscina" para ver o estado vazio e o botão "Limpar filtros".
3. **Evento:** abra "Aula de horta" (uma vaga livre) e clique em "Quero participar". A tela de confirmação aparece. Volte ao evento: ele aparece como "Lotado" e oferece "Cancelar minha presença", que pede confirmação antes.
4. **Criar aviso:** clique em "Publicar aviso" com o formulário vazio para ver o resumo de erros. Preencha título e descrição com um telefone, recarregue a página e veja o rascunho recuperado e o alerta de privacidade.
5. **IA simulada:** o botão de sugestão só é liberado depois de marcar a autorização. A sugestão aparece editável; nada é publicado sem o clique em "Publicar aviso".
6. **Perfil:** veja suas atividades e avisos. Mude o estado de um aviso; só aparecem as ações válidas para o estado atual.

## Telas implementadas

| Tela do protótipo | Implementação na Alfa |
| --- | --- |
| 01 Boas-vindas | Escolha de bairro, sem pedir localização ou endereço. Entrada com perfil de demonstração. |
| 02 Início | Feed do bairro (eventos e avisos), busca por texto, filtro por tipo, filtros ativos visíveis e estado vazio. |
| 03 Detalhe do evento | Data, local, vagas, estado e confirmação ou cancelamento de presença. |
| 04 Confirmação | Retorno visível da inscrição e caminhos para "minhas atividades" e início. |
| 05 Criar aviso | Validação por campo, resumo de erros, contador de caracteres, rascunho automático, alerta de dados pessoais e IA opcional. |
| 06 Meu perfil | Eventos confirmados e avisos próprios com ações de estado. |

## API

| Método e rota | Função |
| --- | --- |
| `GET /api/bairros` | Município, bairros e categorias de aviso |
| `GET /api/feed?bairro=&q=&tipo=` | Eventos e avisos do bairro, com busca e filtro |
| `GET /api/eventos/:id` | Detalhe com confirmados, vagas e estado calculado |
| `POST` / `DELETE /api/eventos/:id/presenca` | Confirma ou cancela presença |
| `POST /api/avisos` | Cria aviso; o servidor valida de novo e responde `422` com erros por campo |
| `PATCH /api/avisos/:id/estado` | Muda o estado; só o autor pode, e só por transições válidas |
| `POST /api/ia/sugestao` | Sugestão de categoria e resumo; exige consentimento |
| `GET /api/perfil` | Atividades e avisos da conta |

## Cobertura dos requisitos

| Requisito | Situação na Alfa |
| --- | --- |
| RF-01 Conta e login | **Não implementado.** Todas as ações usam uma conta de demonstração. |
| RF-02 Bairro principal | **Parcial.** Escolha de um bairro, salva no navegador. Ainda sem bairros acompanhados. |
| RF-03 Consultar publicações | **Implementado** para eventos e avisos. Comunicados municipais ainda não existem. |
| RF-04 Busca e filtros | **Parcial.** Texto e tipo; filtros visíveis e limpáveis. Sem filtro de categoria e período. |
| RF-05 Criar e editar eventos | **Parcial.** A validação de evento existe e está testada; ainda não há tela para criar evento. |
| RF-06 Confirmar e cancelar presença | **Implementado.** Uma inscrição ativa por conta; a lotação não é ultrapassada. |
| RF-07 Avisos e estados | **Implementado.** Criação e mudança de estado com histórico. Edição do texto ainda não. |
| RF-09 Sugestão por IA com consentimento | **Implementado com provedor simulado.** |
| RF-10 Continuar sem IA | **Implementado.** Recusa, falha, tempo esgotado e resposta inválida mantêm o rascunho. |
| RF-08, RF-11 a RF-15 | **Não implementados** (respostas, denúncia, moderação, administração e notificações). |
| RNF-02 Responsividade | Conferido em 375 px de largura sem rolagem horizontal. Faltam outras larguras e o zoom. |
| RNF-06 Acessibilidade | Rótulos, foco visível, foco no primeiro erro, `aria-invalid` e mensagens anunciadas. Sem avaliação com leitor de tela. |
| RNF-07 Recuperação | Rascunho salvo no navegador a cada digitação e recuperado ao voltar à tela. |

## Limitações conhecidas

- Os dados ficam em memória: reiniciar o servidor apaga o que foi criado.
- A reserva da última vaga é segura porque o Node.js executa a verificação e a gravação sem pausa entre elas. Com banco de dados, isso precisará de uma transação.
- A IA é um conjunto de regras por palavra-chave. Ela serve para demonstrar o fluxo de consentimento e falha, não a qualidade de um modelo de linguagem.
- Não houve implantação pública nem teste de desempenho (RNF-01).
