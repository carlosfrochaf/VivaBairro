# Instruções para agentes de IA — VivaBairro

Este arquivo orienta agentes que trabalham no repositório. O GitBook continua sendo a especificação detalhada do produto: consulte e atualize suas páginas quando mudar comportamento, requisito, arquitetura, protótipo ou decisão. Não replique a documentação inteira aqui.

## Regras de autoria

- Escreva em português brasileiro claro, direto e compatível com o público da página. Use termos concretos e verbos ativos; explique siglas na primeira ocorrência.
- Não use aberturas genéricas, slogans, adjetivos promocionais, conclusões que repetem o texto ou listas previsíveis só para preencher espaço. Não invente coloquialismos nem erros para o texto “parecer humano”. Priorize precisão, exemplos próprios do produto e a voz do grupo.
- Diferencie fatos do produto, decisões aprovadas, hipóteses e perguntas abertas. Dê evidência quando existir: fonte, método, data e o que ela permite concluir. Nunca crie entrevistas, citações, resultados de pesquisa, aprovações municipais, medições ou integrações.
- Quando não houver evidência, escreva “hipótese a validar” e registre como a equipe pode validá-la. Não apresente benefício esperado como resultado comprovado. Mantenha o espaço para descobertas futuras sem preencher lacunas com suposições.
- Use uma página principal por assunto. Antes de criar outra, procure conteúdo existente e prefira completá-lo. Atualize links e `SUMMARY.md` ao criar, renomear ou mover páginas.
- Preserve o conteúdo e a hierarquia do GitBook, imagens, SVGs, protótipos, documentos-fonte e configurações. Não apague nem reorganize artefatos sem pedido explícito.

## Regras para diagramas e protótipos

- Comece pelo público e pela pergunta que o desenho deve responder. Separe contexto do sistema, arquitetura interna, modelo de dados, permissões e fluxo operacional quando misturá-los prejudicar a leitura.
- Em diagramas de arquitetura, mostre fronteira do VivaBairro, sistemas externos, responsabilidade dos blocos, direção e finalidade de cada conexão. Identifique protocolo ou dado quando isso estiver decidido; marque tecnologia ainda hipotética como proposta. Inclua legenda para cores e formas e descrição acessível no SVG.
- Em modelos de dados, mostre entidades, cardinalidades e relações coerentes com o dicionário. Use os mesmos nomes e papéis em texto, diagrama e requisitos. Não use hierarquia visual se os papéis não herdarem permissões.
- Em fluxos de interface, represente entradas, confirmações, erros, cancelamento e recuperação para ações sensíveis. Dados de exemplo devem estar marcados como fictícios; não invente estatísticas ou funções para deixar uma tela mais cheia.
- Preserve contraste, foco, rótulos legíveis e distinção que não dependa apenas de cor. Mantenha padrão visual e de termos com o protótipo existente, sem adornos que ocultem o fluxo.

## Pesquisa e fontes externas

- Consulte `referencias-e-pesquisa.md` como índice inicial; para decisões de tecnologia, segurança, privacidade, acessibilidade ou legislação, confira também a fonte primária vigente e sua versão/data.
- Separe o que a fonte recomenda da evidência coletada com usuários e das decisões aprovadas pela equipe. Uma referência externa não prova que uma necessidade exista no público do VivaBairro nem que o produto esteja em conformidade.
- Prefira documentação oficial e pesquisas primárias. Adapte guias de outros países ao contexto local, sem apresentá-los como obrigação brasileira.
- Ao usar uma fonte para justificar requisito ou decisão, registre o link, o ponto aplicado e o limite da conclusão na página pertinente. Atualize o índice quando uma fonte nova fundamentar uma decisão duradoura; remova ou marque links desatualizados.

## Mapa da documentação

`SUMMARY.md` define a navegação do GitBook. Use as páginas atuais como referência por assunto:

| Assunto | Referência |
| --- | --- |
| Propósito, escopo, proposta e públicos | `1-visao-geral/` |
| Bairros e localização | `2-localizacao-bairros/` |
| Eventos e participação | `3-atividades-eventos/` |
| Avisos, colaboração e privacidade | `4-avisos-pedidos-ajuda/` |
| Cadastro, perfil e encerramento de conta | `5-usuarios-perfis/` |
| Papéis municipais, moderação, revisão e comunicados oficiais | `6-governanca-moderacao/` |
| Feed, busca e notificações | `7-busca-notificacoes/` |
| Arquitetura e modelo de dados | `8-arquitetura-tecnica/` |
| Protótipo e fluxos | `9-prototipo-interface/` e `assets/` |
| Requisitos e rastreabilidade | `10-requisitos/` |
| Qualidade e planejamento | `11-qualidade/` e `planejamento/` |
| Histórico da Alfa, relatório de IA e testes | `app/` e `rt03/` |

Ao mudar um fluxo, confira o requisito, a página de regra de negócio, o desenho afetado e a rastreabilidade. Atualize todos os elementos impactados na mesma tarefa e confira termos, papéis, links e status entre eles.

## Regras do produto que não podem se contradizer

- O VivaBairro é um aplicativo Flutter para Android, com prévia web de apoio, organizado por município e bairro. A conta escolhe bairro principal e bairros acompanhados; não é necessário GPS contínuo nem endereço residencial.
- Publicações usam local público ou ponto de referência e não devem expor dados sensíveis de terceiros.
- Autores gerenciam suas próprias publicações; organizadores são autores com ações de gestão do evento. Moderação é uma permissão separada, limitada a bairros atribuídos no servidor.
- Administradores municipais gerenciam o município configurado, bairros, designações e comunicados oficiais. A forma de validar a autoridade municipal é uma decisão pendente, não presumida.
- Denúncia inicia análise humana; não remove conteúdo automaticamente. Toda ação individual de moderação tem motivo, ator e histórico. O autor é avisado e pode pedir revisão.
- Comunicados oficiais são identificados por órgão emissor. O serviço não é canal de emergência nem garante atendimento público.
- IA externa está indisponível na implementação mobile. Uma integração futura poderá sugerir categoria e redação de avisos. Consentimento explícito precede o envio ao serviço externo. O backend minimiza o texto; a pessoa revisa; a publicação é manual. Falha da IA não bloqueia o fluxo.
- Validar permissões no servidor, privacidade, acessibilidade e auditoria conforme requisitos documentados. Não declarar conformidade, segurança ou qualidade sem verificação.

## Rotina de mudança

1. Identifique a necessidade, o requisito e a regra de negócio relacionados.
2. Confira se a solução altera algum pressuposto aberto; sinalize dúvidas de produto que não podem ser inferidas.
3. Implemente ou atualize o protótipo e os diagramas com estados e limites reais.
4. Atualize as páginas do GitBook e a matriz de rastreabilidade; não marque como validado o que só foi proposto.
5. Revise contradições, permissões territoriais, texto sem evidência, acessibilidade, links e mudanças acidentais em arquivos.

## Decisões ainda sem evidência ou aprovação

O repositório não registra pesquisa concluída com moradores nem autorização oficial de um município. A pasta `app/` tem uma versão Alfa com cadastro e login, dados fictícios em memória e IA simulada, publicada para demonstração em https://vivabairro-alfa.onrender.com. A implementação atual fica em mobile/ e api/, com PostgreSQL persistente; a Alfa permanece como referência histórica. Ao mudar regras em `app/src/dominio/`, atualize os testes em `app/tests/` e as páginas de `rt03/`. Os públicos, a adesão municipal, a operação de moderação, a política de retenção e algumas metas de desempenho devem continuar identificados como propostas até a equipe reunir evidências e decidir. O planejamento em `planejamento/plano-de-desenvolvimento.csv` é um ponto de partida, não um quadro de tarefas já ativo.

## Desenvolvimento mobile

Aplicativo Flutter/Dart para Android inicialmente, API Node.js/TypeScript e PostgreSQL. Decisão aprovada em 08/11/2026. A Alfa web é referência de fluxo, não a plataforma final.

Consulte https://vivabairro.gitbook.io/vivabairro/llms.txt e a documentação existente antes de alterar regras. Preserve os SVGs de origem. Use português brasileiro claro e mantenha a identidade azul-marinho, verde-petróleo, verde-água e coral. Material 3 orienta componentes e acessibilidade.

A referência visual confirmada pelo responsável é docs/design/vivabairro_a3_prototipo-mobile.svg, acompanhada de vivabairro_a3_publicos-e-tarefas.svg. São cópias preservadas dos arquivos enviados da pasta Usabilidade - A3 - 1. Não usar os arquivos prototipo-mobile.svg/prototipo-web.svg do aplicativo filter: foram enviados por engano. Material 3 não autoriza substituir o layout do protótipo por uma interface genérica. Conferir as seis telas: boas-vindas com degradê e símbolo, feed com cards e avisos separados, capa/detalhe do evento, confirmação dedicada, criar aviso e Meu espaço. Contagens devem vir do banco; não copiar números fictícios nem prometer funções indisponíveis. A prévia desktop mantém uma coluna mobile; testar também texto ampliado.

Valide permissões e entradas no servidor. Nunca permita autoatribuição de administrador. Moderadores atuam nos bairros designados; toda ação individual exige motivo e histórico. Denúncias não removem conteúdo automaticamente. Não exponha denunciantes.

Não exija GPS ou endereço residencial. IA é opcional e não publica nem modera; integrações não configuradas devem ser identificadas como indisponíveis. Não invente resultados de pesquisa ou conformidade. Preserve rascunhos em falhas e expiração da sessão. Ofereça retorno de carregamento, erro recuperável e sucesso; estados não podem depender só de cor.

Organize código por responsabilidade, mantenha segredos fora do Git e atualize docs/IMPLEMENTACAO.md com o estado real. Execute análise do Flutter, compilação TypeScript e testes de regras/integração afetados. Testes de vagas devem usar transações reais de PostgreSQL. Não modifique a Alfa online durante testes locais.

Flutter está fixado em .fvmrc; use scripts/flutter.ps1 ou um SDK compatível, sem alterar o PATH global. O responsável autorizou configurar Android em 08/11/2026. O responsável revisou e autorizou o aceite do Android SDK License Agreement em 08/11/2026. O build debug x86_64 e os fluxos de entrada, feed e detalhe foram conferidos no emulador Android 16/API 36. Preserve a prévia web como apoio; não confunda essa validação com testes em aparelho real, acessibilidade completa ou desempenho de release. Não confunda pubspec com instalador do SDK. Destino aprovado em 08/11/2026: https://github.com/carlosfrochaf/VivaBairro. Preservar app/ (Alfa) e a sincronização atual do GitBook.

Revise espaçamento em telas estreitas: mantenha pelo menos 12 px entre controles empilhados e use runSpacing nos grupos Wrap. Separe textos auxiliares e imagens dos botões; mantenha ações do mesmo grupo alinhadas. Confira quebras de linha e fonte ampliada antes de considerar a interface pronta.

Ao revisar layouts Android, testar teclado aberto e texto ampliado juntos. Diálogos com formulários precisam de rolagem; seletores devem acomodar largura e altura do texto. Usar rótulos curtos com ajuda abaixo, área segura inferior e espaço acima dos campos em painéis expansíveis. Registrar separadamente revisão visual nativa e testes de widget, sem declarar cobertura de estados não exercitados.

Acessibilidade: cartões acionáveis devem expor papel de botão, rótulo contextual e ação ao leitor, sem duplicar os filhos. Marcar títulos como cabeçalhos e comunicar estados como lida/não lida por texto semântico. Validar semântica e foco nativo separadamente; não alegar avaliação da fala sem acesso ao áudio.

## Manutenção contínua do GitBook e hospedagem

Render Free e Neon Free aprovados para demonstração. Preservar a Alfa. Não contratar planos pagos sem decisão do responsável. A autenticação é própria da API; não ativar Neon Auth. Nunca versionar credenciais, dumps, tokens, .env ou chaves de assinatura.

Toda mudança até a conclusão do aplicativo atualiza o GitBook na mesma entrega: regras na página funcional, decisões na arquitetura, configuração em docs/IMPLANTACAO.md e resultados em docs/IMPLEMENTACAO.md. Atualizar referências e relatório de IA quando necessário. Distinguir alteração local, commit enviado e sincronização pública verificada. Configuração preparada não é serviço publicado. Preservar .gitbook.yaml e caminhos públicos existentes.
