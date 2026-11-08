import 'package:flutter/material.dart';

import '../api.dart';
import '../ui.dart';
import '../post_image.dart';
import 'home.dart';
import 'editor.dart';

class DetailScreen extends StatefulWidget {
  final Api api;
  final String id;
  const DetailScreen({required this.api, required this.id, super.key});
  @override
  State<DetailScreen> createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen> {
  Json? post;
  String? error;
  bool busy = false;
  final reply = TextEditingController();
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final d = await widget.api.call('/api/posts/${widget.id}');
      if (mounted) {
        setState(() {
          post = d;
          error = null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<bool> action(
    String path, {
    String method = 'POST',
    Json? body,
    String message = 'Alteração salva.',
  }) async {
    setState(() => busy = true);
    try {
      await widget.api.call(path, method: method, body: body);
      await load();
      if (mounted) feedback(context, message);
      return true;
    } catch (e) {
      if (mounted) feedback(context, e.toString());
      return false;
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> report({String? replyId, String? actionId}) async {
    final reason = await askReason(
      context,
      actionId == null ? 'Denunciar conteúdo' : 'Pedir revisão',
      'Explique o motivo. A análise será feita por uma pessoa.',
    );
    if (reason == null || !mounted) return;
    await action(
      actionId == null ? '/api/posts/${widget.id}/reports' : '/api/appeals',
      body: {'reason': reason, 'reply_id': ?replyId, 'action_id': ?actionId},
      message: 'Solicitação enviada para análise.',
    );
  }

  @override
  void dispose() {
    reply.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = post;
    final own = p?['author_id'] == widget.api.account?['id'];
    return Scaffold(
      appBar: AppBar(
        title: Text(p == null ? 'Publicação' : kindLabel(p['kind'])),
      ),
      body: p == null
          ? (error != null
                ? ErrorBox(error!, retry: load)
                : const Center(child: CircularProgressIndicator()))
          : PageBody(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (p['kind'] == 'event' || p['photo_id'] != null) ...[
                    PostImage(api: widget.api, id: p['photo_id'], height: 220),
                    const SizedBox(height: 22),
                    Text(
                      '${kindLabel(p['kind']).toUpperCase()} · ${p['neighborhood_name'].toString().toUpperCase()}',
                      style: const TextStyle(
                        fontSize: 11,
                        letterSpacing: 1,
                        fontWeight: FontWeight.w800,
                        color: teal,
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                  Semantics(
                    header: true,
                    child: Text(
                      p['title'],
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '${p['neighborhood_name']} • ${postState(p)}',
                    style: const TextStyle(
                      color: teal,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Por ${p['author_name']} • ${dateLabel(p['created_at'])}',
                  ),
                  if (p['issuer'] != null) Text('Órgão: ${p['issuer']}'),
                  const SizedBox(height: 24),
                  Text(
                    p['description'],
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: mint,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'PONTO DE ENCONTRO',
                                style: TextStyle(
                                  fontSize: 10,
                                  letterSpacing: 1,
                                  color: teal,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(p['location']),
                            ],
                          ),
                        ),
                        const Icon(Icons.location_on_outlined, color: teal),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (p['kind'] == 'event') ...[
                    Text('Início: ${dateLabel(p['starts_at'])}'),
                    Text('Término: ${dateLabel(p['ends_at'])}'),
                    Text(
                      '${p['participants']} participantes${p['capacity'] == null ? '' : ' / ${p['capacity']} vagas'}',
                    ),
                    const SizedBox(height: 20),
                    FilledButton.icon(
                      onPressed:
                          busy ||
                              p['attending'] != true &&
                                  postState(p) != 'Inscrições abertas'
                          ? null
                          : () async {
                              final attending = p['attending'] == true;
                              if (!await confirm(
                                context,
                                attending
                                    ? 'Cancelar sua presença?'
                                    : 'Confirmar presença?',
                                attending
                                    ? 'Sua vaga será liberada para outra pessoa.'
                                    : 'O evento será incluído em Meus eventos.',
                              )) {
                                return;
                              }
                              if (!mounted) return;
                              final succeeded = await action(
                                '/api/posts/${widget.id}/attendance',
                                method: attending ? 'DELETE' : 'POST',
                                message: attending
                                    ? 'Presença cancelada.'
                                    : 'Presença confirmada.',
                              );
                              if (succeeded && !attending && context.mounted) {
                                await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => ParticipationScreen(
                                      api: widget.api,
                                      post: p,
                                    ),
                                  ),
                                );
                              }
                            },
                      icon: Icon(
                        p['attending'] == true
                            ? Icons.event_busy
                            : Icons.event_available,
                      ),
                      label: Text(
                        p['attending'] == true
                            ? 'Cancelar minha presença'
                            : 'Quero participar',
                      ),
                    ),
                  ],
                  if (own && p['visibility'] == 'visible') ...[
                    const SizedBox(height: 16),
                    OutlinedButton.icon(
                      onPressed: busy
                          ? null
                          : () async {
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) =>
                                      EditorScreen(api: widget.api, post: p),
                                ),
                              );
                              if (mounted) load();
                            },
                      icon: const Icon(Icons.edit_outlined),
                      label: const Text('Editar publicação'),
                    ),
                    const SizedBox(height: 12),
                    if (p['kind'] == 'notice')
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        spacing: 12,
                        children: [
                          for (final s
                              in (p['state'] == 'aberto'
                                  ? ['em-andamento', 'resolvido', 'encerrado']
                                  : p['state'] == 'em-andamento'
                                  ? ['aberto', 'resolvido', 'encerrado']
                                  : ['aberto']))
                            OutlinedButton(
                              onPressed: busy
                                  ? null
                                  : () => action(
                                      '/api/posts/${widget.id}/state',
                                      method: 'PATCH',
                                      body: {'state': s},
                                    ),
                              child: Text(
                                'Marcar como ${states[s]!.toLowerCase()}',
                              ),
                            ),
                        ],
                      ),
                    const SizedBox(height: 16),
                    if (p['kind'] == 'event' && p['state'] != 'cancelado')
                      TextButton(
                        onPressed: busy
                            ? null
                            : () async {
                                if (await confirm(
                                  context,
                                  'Cancelar o evento?',
                                  'Todos os participantes receberão uma notificação no aplicativo. Essa ação não pode ser desfeita.',
                                )) {
                                  await action(
                                    '/api/posts/${widget.id}/state',
                                    method: 'PATCH',
                                    body: {'state': 'cancelado'},
                                  );
                                }
                              },
                        child: const Text('Cancelar evento'),
                      ),
                    TextButton(
                      onPressed: busy
                          ? null
                          : () async {
                              if (await confirm(
                                context,
                                'Remover publicação?',
                                'Ela deixará de aparecer no bairro. O histórico será preservado.',
                              )) {
                                await action(
                                  '/api/posts/${widget.id}',
                                  method: 'DELETE',
                                );
                              }
                            },
                      child: const Text('Remover publicação'),
                    ),
                  ],
                  if (!own && p['visibility'] == 'visible')
                    TextButton.icon(
                      onPressed: busy ? null : report,
                      icon: const Icon(Icons.flag_outlined),
                      label: const Text('Denunciar publicação'),
                    ),
                  if (p['kind'] == 'notice') ...[
                    const Divider(height: 40),
                    Text(
                      'Conversa da comunidade',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 12),
                    for (final r in p['replies'])
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                r['author_name'],
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(r['body']),
                              const SizedBox(height: 8),
                              Text(dateLabel(r['created_at'])),
                              if (r['author_id'] != widget.api.account?['id'])
                                TextButton(
                                  onPressed: busy
                                      ? null
                                      : () => report(replyId: r['id']),
                                  child: const Text('Denunciar resposta'),
                                ),
                            ],
                          ),
                        ),
                      ),
                    if (p['visibility'] == 'visible') ...[
                      const SizedBox(height: 12),
                      TextField(
                        controller: reply,
                        maxLength: 1000,
                        minLines: 2,
                        maxLines: 5,
                        decoration: const InputDecoration(
                          labelText: 'Escrever uma resposta',
                        ),
                      ),
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed: busy
                            ? null
                            : () async {
                                if (reply.text.trim().length < 2) {
                                  feedback(
                                    context,
                                    'Escreva uma resposta com pelo menos 2 caracteres.',
                                  );
                                  return;
                                }
                                setState(() => busy = true);
                                try {
                                  await widget.api.call(
                                    '/api/posts/${widget.id}/replies',
                                    method: 'POST',
                                    body: {'body': reply.text.trim()},
                                  );
                                  reply.clear();
                                  await load();
                                } catch (e) {
                                  if (context.mounted) {
                                    feedback(context, e.toString());
                                  }
                                } finally {
                                  if (mounted) setState(() => busy = false);
                                }
                              },
                        child: const Text('Enviar resposta'),
                      ),
                    ],
                  ],
                  if ((p['history'] as List).isNotEmpty) ...[
                    const Divider(height: 40),
                    Text(
                      'Histórico',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    for (final h in p['history'])
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(h['reason']),
                        subtitle: Text(dateLabel(h['created_at'])),
                        trailing:
                            own &&
                                [
                                  'hide',
                                  'remove',
                                  'request-change',
                                ].contains(h['action'])
                            ? IconButton(
                                tooltip: 'Pedir revisão',
                                icon: const Icon(Icons.undo),
                                onPressed: busy
                                    ? null
                                    : () => report(actionId: h['id']),
                              )
                            : null,
                      ),
                  ],
                  if (busy) const LinearProgressIndicator(),
                  if (error != null) ErrorBox(error!, retry: load),
                ],
              ),
            ),
    );
  }
}

Future<String?> askReason(
  BuildContext context,
  String title,
  String help,
) async {
  final controller = TextEditingController();
  final form = GlobalKey<FormState>();
  final value = await showDialog<String>(
    context: context,
    builder: (context) => AlertDialog(
      scrollable: true,
      title: Text(title),
      content: Form(
        key: form,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(help),
            const SizedBox(height: 16),
            TextFormField(
              controller: controller,
              minLines: 2,
              maxLines: 5,
              maxLength: 500,
              decoration: const InputDecoration(labelText: 'Motivo'),
              validator: (v) => v!.trim().length < 5
                  ? 'Explique com pelo menos 5 caracteres.'
                  : null,
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Voltar'),
        ),
        FilledButton(
          onPressed: () {
            if (form.currentState!.validate()) {
              Navigator.pop(context, controller.text.trim());
            }
          },
          child: const Text('Enviar'),
        ),
      ],
    ),
  );
  // O controlador deve permanecer vivo durante a animação de saída do diálogo.
  await Future<void>.delayed(const Duration(milliseconds: 300));
  controller.dispose();
  return value;
}

class ParticipationScreen extends StatelessWidget {
  final Api api;
  final Json post;
  const ParticipationScreen({required this.api, required this.post, super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Inscrição')),
    body: PageBody(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 50),
          const Center(
            child: CircleAvatar(
              radius: 58,
              backgroundColor: mint,
              child: CircleAvatar(
                radius: 38,
                backgroundColor: teal,
                child: Icon(Icons.check_rounded, color: Colors.white, size: 48),
              ),
            ),
          ),
          const SizedBox(height: 32),
          Text(
            'Inscrição confirmada!',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 10),
          const Text(
            'Sua presença no evento está confirmada.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF5F6D7E)),
          ),
          const SizedBox(height: 32),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'SUA PRÓXIMA ATIVIDADE',
                    style: TextStyle(
                      fontSize: 10,
                      letterSpacing: 1,
                      color: teal,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    post['title'],
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 6),
                  Text(dateLabel(post['starts_at'])),
                  Text(post['location']),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: () => Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (_) => Scaffold(
                  appBar: AppBar(title: const Text('Minhas atividades')),
                  body: FeedScreen(api: api, mode: 'attending'),
                ),
              ),
            ),
            child: const Text('Ver minhas atividades'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () =>
                Navigator.popUntil(context, (route) => route.isFirst),
            child: const Text('Voltar ao início'),
          ),
          const SizedBox(height: 24),
          const Text(
            'Você pode cancelar sua presença nos detalhes do evento.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF5F6D7E)),
          ),
        ],
      ),
    ),
  );
}
