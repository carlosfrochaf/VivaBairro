import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'api.dart';
import 'visual.dart';
import 'post_image.dart';

const navy = Color(0xFF14253D),
    teal = Color(0xFF286A72),
    mint = Color(0xFFE4F3F1),
    coral = Color(0xFFFF8A5B),
    yellow = Color(0xFFFFD166);
const categories = {
  'infraestrutura': 'Infraestrutura',
  'transito': 'Trânsito',
  'achados-perdidos': 'Achados e perdidos',
  'utilidade-publica': 'Utilidade pública',
  'ajuda': 'Ajuda e serviços',
};
const states = {
  'aberto': 'Aberto',
  'em-andamento': 'Em andamento',
  'resolvido': 'Resolvido',
  'encerrado': 'Encerrado',
  'cancelado': 'Cancelado',
};
String kindLabel(String kind) =>
    {
      'event': 'Evento',
      'notice': 'Aviso',
      'official': 'Comunicado oficial',
    }[kind] ??
    kind;
String dateLabel(dynamic value) => value == null
    ? ''
    : DateFormat('dd/MM/yyyy • HH:mm')
          .format(DateTime.parse(value.toString()).toLocal());
String postState(Json p) {
  if (p['visibility'] == 'hidden') return 'Oculto pela moderação';
  if (p['visibility'] == 'removed') return 'Removido';
  if (p['state'] == 'cancelado') return 'Cancelado';
  if (p['kind'] == 'event') {
    if (DateTime.parse(p['ends_at']).isBefore(DateTime.now())) {
      return 'Encerrado';
    }
    if (DateTime.parse(p['starts_at']).isBefore(DateTime.now())) {
      return 'Em andamento';
    }
    if (p['capacity'] != null && p['participants'] >= p['capacity']) {
      return 'Lotado';
    }
    return 'Inscrições abertas';
  }
  return states[p['state']] ?? 'Publicado';
}

void feedback(BuildContext context, String text) =>
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
Future<bool> confirm(BuildContext context, String title, String text) async =>
    await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        scrollable: true,
        title: Text(title),
        content: Text(text),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Voltar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirmar'),
          ),
        ],
      ),
    ) ??
    false;

class ErrorBox extends StatelessWidget {
  final String message;
  final VoidCallback? retry;
  const ErrorBox(this.message, {this.retry, super.key});
  @override
  Widget build(BuildContext context) => Semantics(
    liveRegion: true,
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const Icon(Icons.error_outline),
          const SizedBox(height: 8),
          Text(message),
          if (retry != null)
            TextButton(onPressed: retry, child: const Text('Tentar novamente')),
        ],
      ),
    ),
  );
}

class PageBody extends StatelessWidget {
  final Widget child;
  const PageBody({required this.child, super.key});
  @override
  Widget build(BuildContext context) => SafeArea(
    top: false,
    child: SingleChildScrollView(
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.all(20),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 680),
          child: child,
        ),
      ),
    ),
  );
}

class PostCard extends StatelessWidget {
  final Json post;
  final VoidCallback onTap;
  final bool green;
  final Api? api;
  const PostCard(
    this.post, {
    required this.onTap,
    this.green = false,
    this.api,
    super.key,
  });
  @override
  Widget build(BuildContext context) {
    final event = post['kind'] == 'event';
    return Semantics(
      container: true,
      button: true,
      excludeSemantics: true,
      label: [
        kindLabel(post['kind']),
        post['title'],
        if (event) dateLabel(post['starts_at']).replaceAll(' • ', ' às '),
        if (event) "${post['participants']} participantes confirmados",
        if (!event) "Por ${post['author_name']}",
        post['attending'] == true ? 'Presença confirmada' : postState(post),
      ].join('. '),
      hint: 'Abrir detalhes',
      onTap: onTap,
      child: Card(
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFDCE4EC)),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: EdgeInsets.all(event ? 12 : 14),
            child: event
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      api == null
                          ? EventCover(green: green)
                          : PostImage(
                              api: api!,
                              id: post['photo_id'],
                              green: green,
                            ),
                      const SizedBox(height: 12),
                      Text(
                        post['title'],
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        dateLabel(post['starts_at']),
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF5F6D7E),
                        ),
                      ),
                      Text(
                        '${post['participants']} confirmados',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF5F6D7E),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: green ? mint : const Color(0xFFFFE9D8),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          post['attending'] == true
                              ? 'Presença confirmada'
                              : postState(post),
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  )
                : Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: const Color(0xFFFFF0D9),
                        child: Icon(
                          post['kind'] == 'official'
                              ? Icons.verified_outlined
                              : Icons.priority_high,
                          size: 20,
                          color: const Color(0xFFB85A27),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              post['title'],
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 5),
                            Text(
                              'Por ${post['author_name']}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF5F6D7E),
                              ),
                            ),
                            Text(
                              postState(post),
                              style: const TextStyle(fontSize: 12, color: teal),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
