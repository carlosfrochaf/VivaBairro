# VivaBairro — versão Alfa

Aplicação web local: API em Node.js (sem frameworks) e interface responsiva em HTML, CSS e JavaScript. Os dados são fictícios e ficam em memória. A IA é simulada, sem serviço externo.

Requisito: Node.js 20 ou mais recente.

```bash
npm install
npm start          # http://localhost:3000
npm test           # testes Jest
npm run test:cobertura
```

| Pasta | Conteúdo |
| --- | --- |
| `src/dominio/` | Regras do produto: validação, eventos, avisos e privacidade. Usadas pelo navegador e pelo servidor. |
| `src/integracoes/ia.js` | Sugestão por IA com consentimento, minimização, tempo limite e provedor simulado |
| `src/servidor/` | API HTTP e repositório em memória |
| `public/` | Telas da Alfa |
| `tests/` | Testes unitários e de integração |

Documentação da entrega: [RT03 no GitBook](../rt03/README.md).
