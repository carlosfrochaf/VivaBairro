# Qualidade e manutenção

## Configuração existente

Na raiz estão .editorconfig, .prettierrc.json, .markdownlint-cli2.jsonc, eslint.config.mjs e .gitattributes. Eles definem padrões de edição e ferramentas pretendidas; sua presença não significa que a aplicação ou as dependências de lint já existam.

Quando a equipe escolher a stack, configurar comandos reproduzíveis para formatar, analisar e verificar o código. Registrar no README os comandos de desenvolvimento e as versões necessárias.

## Práticas de implementação

- Separar interface, regras do produto, autorização, persistência e integrações.
- Validar dados na entrada do servidor; não depender de controles escondidos na tela.
- Aplicar autorização por conta, município e bairro em cada rota protegida.
- Isolar e-mail, armazenamento e IA atrás de adaptadores, com caminho de falha.
- Manter as entidades, transições de estado e permissões com os mesmos nomes da documentação.
- Evitar dados pessoais em logs, exemplos, capturas e massa de demonstração.
- Corrigir documentação, protótipo, requisitos e rastreabilidade junto à mudança que os afeta.

## Revisão de mudanças

Uma revisão deve responder: qual tarefa do produto mudou? Que requisito e regra a sustentam? O que acontece fora de escopo ou quando falha? A permissão foi verificada no servidor? O desenho e a documentação continuam coerentes? Links, dados de exemplo e acessibilidade foram considerados?

Registrar quais verificações foram executadas e seu resultado; não afirmar que lint, testes, auditoria de segurança ou avaliação de acessibilidade ocorreram sem evidência.
