# Desenvolvimento do VivaBairro

Aplicativo de bairro em Flutter, com API Node.js/TypeScript e PostgreSQL. Eventos, avisos, conversa da comunidade e moderação com responsabilidade territorial.

Este repositório reúne aplicativo, API, testes e [documentação do produto](https://vivabairro.gitbook.io/vivabairro). O GitBook define regras e critérios; os SVGs orientam a interface.

## Organização

| Caminho | Conteúdo |
| --- | --- |
| `mobile/` | Aplicativo Flutter, telas e testes |
| `api/` | API, migrações SQL e testes de integração |
| `docs/IMPLEMENTACAO.md` | O que funciona, decisões e pendências |
| `scripts/` | Comandos locais de Flutter e prévia |
| `AGENTS.md` | Regras para manutenção por assistentes |

## Executar no computador

Use Node.js 24 e Flutter 3.47.9. O Flutter é um SDK de desenvolvimento: `pubspec.yaml` declara dependências e restrições, mas não baixa o compilador. A versão está registrada em `.fvmrc` para uso opcional com FVM. O script abaixo procura o SDK em `FLUTTER_ROOT`, `.fvm/flutter_sdk`, `.tools/flutter` ou `~/development/flutter`, sem alterar o PATH.

Nesta máquina o SDK já está em `C:\Users\Patrick\development\flutter`. Android Studio, SDK API 36 e o emulador VivaBairro_API_36 foram instalados após autorização do responsável. A prévia web continua disponível; o estado da validação nativa está em docs/IMPLEMENTACAO.md.

Na raiz, instale as dependências:

```powershell
npm --prefix api ci
.\scripts\flutter.ps1 pub get
```

Em um terminal, inicie o PostgreSQL local:

```powershell
cd api
npm run db:local
```

O processo permanece aberto. Usa PostgreSQL real, escutando apenas em `127.0.0.1:54329`, e preserva os dados em `.local/postgres`. Não depende de Docker nem instala serviço no Windows. O pacote embarcado serve para desenvolvimento; em hospedagem, use uma instância PostgreSQL gerenciada ou administrada pela equipe.

Copie `api/.env.example` para `api/.env` se ainda não existir. As opções `DEMO_MODE=true` e `JOBS_ENABLED=true` habilitam a caixa fictícia e os lembretes locais.

Em outro terminal:

```powershell
cd api
npm run db:migrate
$env:SEED_PASSWORD = 'VivaBairro-local-2026'
npm run db:seed
npm run dev
```

O seed é idempotente e não sobrescreve contas existentes. A senha acima é exclusiva de demonstração local. Contas fictícias: `morador@vivabairro.test`, `moderador@vivabairro.test` e `admin@vivabairro.test`. O moderador atua no Jardim Aurora; o administrador, no município fictício. Novos cadastros sempre começam sem privilégios.

Em um terceiro terminal, na raiz:

```powershell
.\scripts\flutter.ps1 run -d chrome --web-port 8088
```

Alternativa para servir uma compilação já pronta:

```powershell
.\scripts\flutter.ps1 build web --release
node scripts/preview.mjs
```

Abra http://127.0.0.1:8088. Use apenas uma dessas alternativas por vez para evitar conflito na porta. A API usa a porta 3001. Para outro servidor, passe `--dart-define=API_URL=https://seu-servidor` no comando Flutter.

## Android

Nesta máquina, o emulador `VivaBairro_API_36` já está configurado (Android 16/API 36, 2 GB de RAM e teclado físico). Para outras máquinas, use o [guia oficial do Flutter](https://docs.flutter.dev/platform-integration/android/setup). Para iniciar:

```powershell
.\scripts\flutter.ps1 emulators --launch VivaBairro_API_36
.\scripts\flutter.ps1 devices
.\scripts\flutter.ps1 run -d ID_DO_DISPOSITIVO
```

No emulador Android, o endereço padrão da API é `http://10.0.2.2:3001`. HTTP está permitido somente no manifesto de debug. Uma distribuição release precisa de API HTTPS e assinatura própria; foi gerado um APK debug x86_64 para o emulador em `mobile/build/app/outputs/flutter-apk/app-debug.apk`. Ele não é um pacote de distribuição para celulares ARM. Performance e tamanho de release ainda não foram medidos.

## Verificar alterações

Com o PostgreSQL local ativo:

```powershell
npm --prefix api run lint
npm --prefix api run format:check
npm --prefix api run build
npm --prefix api test
.\scripts\flutter.ps1 analyze
.\scripts\flutter.ps1 test
```

Os testes de API criam um schema exclusivo e o removem ao terminar; não apagam os dados de demonstração. `TEST_DATABASE_URL` pode apontar para outra base de testes. Os testes Flutter cobrem validação, fonte ampliada, recuperação de rascunho e comunicação HTTP.

## Limites desta versão

A demonstração inclui fotos, recuperação e confirmação de e-mail em caixa local, troca de senha, exclusão de conta, lembretes internos, filtros e gestão territorial. Push externo, IA e hospedagem de produção ainda dependem de configuração e validação. O APK Android debug foi compilado e instalado no emulador. Testes em aparelho real seguem pendentes. Consulte docs/IMPLEMENTACAO.md para limitações.
