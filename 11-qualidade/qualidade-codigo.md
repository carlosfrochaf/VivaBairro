# Qualidade de código

## Verificações atuais

A API usa TypeScript, ESLint e Prettier, com arquivos de configuração versionados em api/. Na raiz, executar npm --prefix api run lint, npm --prefix api run format:check, npm --prefix api run build e npm --prefix api test. Os testes usam PostgreSQL real com schema isolado; não apontar o banco de testes para produção.

O Flutter usa analysis_options.yaml e flutter_lints. O wrapper scripts/flutter.ps1 executa analyze e test com o SDK fixado em .fvmrc. O teste em mobile/integration_test/ exige emulador e API local e cria uma conta temporária. Seu resultado deve ser registrado separadamente dos testes de widget.

A configuração .github/workflows/mobile-api.yml prepara essas verificações para GitHub Actions. Configuração existente não equivale a execução remota aprovada; consultar os resultados do workflow após o push.

## Evidências e limites

Em 08/11/2026, 16 testes da API e 18 testes Flutter foram aprovados na revisão local anterior. Cobrem autorização, concorrência de vagas, revisão por outro responsável, imagens, recuperação de conta, lembretes, layout e semântica. O [histórico de implementação](../docs/IMPLEMENTACAO.md) registra a revisão Android e seus limites.

Os 112 testes citados na documentação da Alfa pertencem a app/, não ao aplicativo Flutter. Não somar baterias diferentes para sugerir cobertura integral.

Ainda faltam teste físico, medição de desempenho em release, pesquisa com usuários e verificação completa dos serviços externos. Testes automatizados e revisão por IA não substituem avaliação humana do produto.

## Regra de manutenção

Uma mudança de regra deve atualizar código, teste pertinente, requisito e página funcional na mesma entrega. Não versionar .env, dados locais, tokens ou chaves de assinatura. Dependências têm arquivos de lock; usar instalação reproduzível. Preservar a Alfa e a sincronização do GitBook.
