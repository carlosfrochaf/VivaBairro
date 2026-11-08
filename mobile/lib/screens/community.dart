import 'package:flutter/material.dart';

import '../api.dart';
import '../ui.dart';
import 'detail.dart';

class MyModerationScreen extends StatefulWidget {
  final Api api;
  const MyModerationScreen({required this.api, super.key});
  @override
  State<MyModerationScreen> createState() => _MyModerationState();
}

class _MyModerationState extends State<MyModerationScreen> {
  List<dynamic>? items;
  String? error;
  bool busy = false;
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final data = await widget.api.call('/api/me/moderation');
      if (mounted) {
        setState(() {
          items = data['items'];
          error = null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> appeal(Json item) async {
    final reason = await askReason(
      context,
      'Pedir revisão',
      'Explique por que a decisão deve ser revista. Outra pessoa da equipe fará a análise.',
    );
    if (reason == null || !mounted) return;
    setState(() => busy = true);
    try {
      await widget.api.call(
        '/api/appeals',
        method: 'POST',
        body: {'action_id': item['id'], 'reason': reason},
      );
      await load();
      if (mounted) feedback(context, 'Pedido de revisão enviado.');
    } catch (e) {
      if (mounted) feedback(context, e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Revisões de moderação')),
    body: PageBody(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Acompanhe decisões sobre suas publicações e respostas. Cada ação permite um pedido de revisão.',
          ),
          if (error != null) ErrorBox(error!, retry: load),
          if (items == null && error == null) const LinearProgressIndicator(),
          if (items != null && items!.isEmpty)
            const Padding(
              padding: EdgeInsets.all(24),
              child: Text('Nenhuma ação de moderação sobre seu conteúdo.'),
            ),
          for (final item in items ?? [])
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  spacing: 8,
                  children: [
                    Text(
                      item['title'],
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    if (item['reply_body'] != null)
                      Text('Sua resposta: ${item['reply_body']}'),
                    Text('Motivo: ${item['reason']}'),
                    Text(dateLabel(item['created_at'])),
                    if (item['appeal_state'] == null)
                      OutlinedButton(
                        onPressed: busy ? null : () => appeal(Json.from(item)),
                        child: const Text('Pedir revisão'),
                      )
                    else
                      Text(
                        item['appeal_state'] == 'open'
                            ? 'Revisão aguardando análise'
                            : 'Revisão encerrada',
                      ),
                  ],
                ),
              ),
            ),
        ],
      ),
    ),
  );
}

class TerritoriesScreen extends StatefulWidget {
  final Api api;
  const TerritoriesScreen({required this.api, super.key});
  @override
  State<TerritoriesScreen> createState() => _TerritoriesState();
}

class _TerritoriesState extends State<TerritoriesScreen> {
  Json? data;
  String? error;
  bool busy = false;
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final result = await widget.api.call('/api/admin/territories');
      if (mounted) {
        setState(() {
          data = result;
          error = null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> change(String path, Json body, {String method = 'PATCH'}) async {
    setState(() => busy = true);
    try {
      await widget.api.call(path, method: method, body: body);
      await load();
      if (mounted) feedback(context, 'Cadastro atualizado.');
    } catch (e) {
      if (mounted) feedback(context, e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<String?> nameDialog(String title, String initial) async {
    final controller = TextEditingController(text: initial);
    final form = GlobalKey<FormState>();
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        scrollable: true,
        title: Text(title),
        content: Form(
          key: form,
          child: TextFormField(
            controller: controller,
            autofocus: true,
            maxLength: 80,
            decoration: const InputDecoration(labelText: 'Nome'),
            validator: (v) => v!.trim().length < 2
                ? 'Informe pelo menos 2 caracteres.'
                : null,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              if (form.currentState!.validate()) {
                Navigator.pop(context, controller.text.trim());
              }
            },
            child: const Text('Salvar'),
          ),
        ],
      ),
    );
    // O diálogo ainda pode estar concluindo sua animação de saída.
    await Future<void>.delayed(const Duration(milliseconds: 300));
    controller.dispose();
    return result;
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Município e bairros')),
    body: PageBody(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Bairros desativados deixam de aceitar novas publicações. O histórico é preservado.',
          ),
          if (error != null) ErrorBox(error!, retry: load),
          if (data == null && error == null) const LinearProgressIndicator(),
          for (final town in data?['municipalities'] ?? []) ...[
            ListTile(
              title: Text(town['name']),
              trailing: IconButton(
                tooltip: 'Renomear município',
                icon: const Icon(Icons.edit_outlined),
                onPressed: busy
                    ? null
                    : () async {
                        final name = await nameDialog(
                          'Nome do município',
                          town['name'],
                        );
                        if (name != null && mounted) {
                          await change(
                            '/api/admin/municipalities/${town['id']}',
                            {'name': name},
                          );
                        }
                      },
              ),
            ),
            for (final n in (data!['neighborhoods'] as List).where(
              (n) => n['municipality_id'] == town['id'],
            ))
              Card(
                child: Column(
                  children: [
                    ListTile(
                      title: Text(n['name']),
                      subtitle: Text(n['active'] ? 'Ativo' : 'Desativado'),
                      trailing: IconButton(
                        tooltip: 'Renomear bairro',
                        icon: const Icon(Icons.edit_outlined),
                        onPressed: busy
                            ? null
                            : () async {
                                final name = await nameDialog(
                                  'Nome do bairro',
                                  n['name'],
                                );
                                if (name != null && mounted) {
                                  await change(
                                    '/api/admin/neighborhoods/${n['id']}',
                                    {'name': name, 'active': n['active']},
                                  );
                                }
                              },
                      ),
                    ),
                    SwitchListTile(
                      title: const Text('Bairro ativo'),
                      value: n['active'],
                      onChanged: busy
                          ? null
                          : (v) async {
                              if (await confirm(
                                context,
                                v ? 'Reativar bairro?' : 'Desativar bairro?',
                                v ? 'O bairro voltará a receber publicações.' : 'Novas publicações serão bloqueadas. O conteúdo existente continuará no histórico.',
                              )) {
                                if (mounted) {
                                  await change(
                                    '/api/admin/neighborhoods/${n['id']}',
                                    {'name': n['name'], 'active': v},
                                  );
                                }
                              }
                            },
                    ),
                  ],
                ),
              ),
            OutlinedButton.icon(
              icon: const Icon(Icons.add),
              label: const Text('Cadastrar bairro'),
              onPressed: busy
                  ? null
                  : () async {
                      final name = await nameDialog('Novo bairro', '');
                      if (name != null && mounted) {
                        await change('/api/admin/neighborhoods', {
                          'municipality_id': town['id'],
                          'name': name,
                        }, method: 'POST');
                      }
                    },
            ),
          ],
        ],
      ),
    ),
  );
}
