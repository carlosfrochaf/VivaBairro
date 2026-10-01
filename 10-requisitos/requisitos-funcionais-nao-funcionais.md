# Requisitos do VivaBairro

Os requisitos descrevem comportamentos e qualidades esperadas. A aplicação ainda precisa ser implementada; critérios marcados como proposta devem ser confirmados quando a equipe definir a stack e a operação.

## Requisitos funcionais

| ID | Requisito | Critério observável |
| --- | --- | --- |
| RF-01 | Criar conta, entrar, sair e recuperar acesso. | Credenciais inválidas não iniciam sessão; erros dizem como corrigir sem revelar se um e-mail está cadastrado. |
| RF-02 | Escolher um município e bairro principal e acompanhar outros bairros. | Feed e publicação mostram o território ativo; conteúdo não muda de bairro por trocar a preferência do perfil. |
| RF-03 | Consultar eventos, avisos e comunicados permitidos. | Cada cartão mostra tipo, bairro, local, data e estado e abre detalhes. |
| RF-04 | Buscar e filtrar por texto, bairro, categoria e período. | Filtros ativos ficam visíveis e podem ser limpos; resultado vazio explica como ampliar a busca. |
| RF-05 | Criar e editar eventos próprios com objetivo, data/hora, local e capacidade opcional. | Campos obrigatórios são validados; uma edição mostra o que mudou e notifica participantes quando a data, hora, local ou cancelamento mudar. |
| RF-06 | Confirmar e cancelar presença. | Uma conta tem uma inscrição ativa por evento; capacidade concorrida não ultrapassa o limite. Política de lista de espera ainda precisa de decisão. |
| RF-07 | Criar, editar e atualizar o estado dos avisos próprios. | O autor vê o estado atual e o histórico de atualização; a interface não oferece ações incompatíveis com o estado. |
| RF-08 | Responder a um pedido ou oferta de colaboração. | Resposta fica ligada ao aviso e pode ser denunciada ou moderada individualmente. |
| RF-09 | Solicitar uma sugestão de categoria/resumo por IA após consentir. | Antes do envio, a pessoa vê quais campos serão enviados, que serviço externo os processará e pode aceitar ou continuar sem IA. Sugestões são editáveis; nada é publicado automaticamente. |
| RF-10 | Continuar sem IA em caso de recusa, timeout, falha ou resposta inválida. | O texto original permanece no formulário; erro não apaga o rascunho nem bloqueia publicação manual. |
| RF-11 | Denunciar evento, aviso ou resposta. | A denúncia pede motivo, aceita contexto opcional e entra na fila sem remoção automática. A identidade de quem denunciou não aparece publicamente. |
| RF-12 | Moderar conteúdo dentro do território autorizado. | O servidor recusa ações fora do município/bairro designado. Cada ação individual exige motivo e gera histórico. |
| RF-13 | Avisar o autor de uma decisão e oferecer revisão. | A notificação identifica item, ação, motivo e caminho para recurso; o recurso tem estado consultável. |
| RF-14 | Administrar bairros, designações e comunicados oficiais do município vinculado. | Toda ação confere escopo no servidor e registra concedente/ator, data e alteração; conteúdo de moradores não é editado em silêncio. |
| RF-15 | Consultar e configurar notificações. | A pessoa controla tipos opcionais; alterações/cancelamento de eventos inscritos e decisões sobre conteúdo seguem preferências e política ainda a definir. |

## Requisitos não funcionais

| ID | Alvo proposto | Como verificar quando houver implementação |
| --- | --- | --- |
| RNF-01 Desempenho | Manter consultas comuns de feed, busca e detalhes abaixo de 2 s no percentil 95. É um alvo inicial, não uma medição. | Antes de aceitar o resultado, registrar versão, ambiente, quantidade de dados, concorrência simulada, amostra de requisições e percentis. Medir separadamente chamadas externas de IA. |
| RNF-02 Responsividade | Conteúdo utilizável em celular, tablet e desktop, sem rolagem horizontal da página. | Definir e registrar larguras de referência; conferir feed, formulário e painel municipal nessas larguras, incluindo zoom de texto. |
| RNF-03 Segurança | HTTPS em implantação; senhas com hash apropriado; autorização verificada no servidor; segredos fora do navegador e do repositório. | Revisar configuração de implantação e tentar acesso indevido por papel, usuário e bairro; não apresentar revisão como auditoria certificada. |
| RNF-04 Segredos externos | Chaves de API nunca aparecem em bundle, resposta de erro ou histórico versionado. | Conferir chamadas pelo backend e revisar variáveis de ambiente antes de implantar. |
| RNF-05 Privacidade | Não exigir endereço residencial ou GPS contínuo. Só enviar à IA os campos necessários depois do consentimento. | Conferir formulários, payload, retenção e aviso de consentimento. Definir finalidade, responsável e retenção antes de usar dados reais. |
| RNF-06 Acessibilidade | Formulários com rótulos associados, foco visível, operação por teclado, contraste legível e erros compreensíveis. | Fazer roteiro com teclado, ampliação e leitor de tela; registrar falhas. Não declarar conformidade sem avaliação apropriada. |
| RNF-07 Recuperação | Falha de IA ou conexão não deve descartar texto já inserido. | Interromper a chamada e a conexão em diferentes etapas; verificar recuperação do rascunho e fluxo manual. |
| RNF-08 Manutenibilidade | Separar interface, regras de negócio, autorização, persistência e integrações externas. | Revisar a estrutura quando a aplicação existir; documentar uma decisão quando a separação exigir uma exceção. |
| RNF-09 Auditabilidade | Registrar ações municipais e de moderação com ator, escopo, item, motivo e data. | Conferir os registros ao conceder/revogar papel, moderar e revisar; definir retenção e acesso aos logs. |
| RNF-10 Compatibilidade | Suportar os navegadores e versões escolhidos pela equipe para a implantação. | Publicar a matriz de navegadores e guardar os resultados do roteiro de verificação. |

## Limites da assistência de IA

A IA pode sugerir somente categoria e redação de aviso. Não verifica verdade, urgência ou segurança; não identifica pessoas; não decide denúncia ou sanção; não encaminha demanda; e não publica. A interface mantém modo manual. A equipe ainda precisa escolher provedor, retenção, política de dados e mensagens finais de consentimento antes de usar serviço real.
