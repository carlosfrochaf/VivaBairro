import 'package:flutter/material.dart';

import '../api.dart';
import '../ui.dart';
import '../visual.dart';
import 'home.dart';
import 'account_security.dart';
import 'community.dart';
import 'detail.dart';

class ProfileScreen extends StatefulWidget {
  final Api api;
  const ProfileScreen({required this.api, super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late final name = TextEditingController(text: widget.api.account!['name']);
  late String neighborhood = widget.api.account!['neighborhood_id'];
  late List<String> follows = List<String>.from(widget.api.account!['follows']);
  List<dynamic> neighborhoods = [];
  Json? overview;
  late bool reminders = widget.api.account!['reminders'] == true;
  bool busy = false;
  String? error;
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final d = await widget.api.call('/api/neighborhoods');
      final summary = await widget.api.call('/api/me/overview');
      if (mounted) {
        setState(() {
          neighborhoods = d['items'];
          overview = summary;
          error = null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> save() async {
    if (name.text.trim().length < 2) {
      feedback(context, 'Informe um nome com pelo menos 2 caracteres.');
      return;
    }
    setState(() => busy = true);
    try {
      await widget.api.call(
        '/api/me',
        method: 'PATCH',
        body: {
          'name': name.text.trim(),
          'neighborhood_id': neighborhood,
          'reminders': reminders,
          'follows': follows.where((n) => n != neighborhood).toList(),
        },
      );
      await widget.api.refreshProfile();
      if (mounted) feedback(context, 'Perfil atualizado.');
    } catch (e) {
      if (mounted) feedback(context, e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> openPost(String id) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => DetailScreen(api: widget.api, id: id),
      ),
    );
    if (mounted) load();
  }

  @override
  void dispose() {
    name.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => PageBody(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Semantics(
          header: true,
          child: Text(
            'Meu espaço',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            CircleAvatar(
              radius: 36,
              backgroundColor: mint,
              child: Text(
                widget.api.account!['name']
                    .toString()
                    .substring(0, 1)
                    .toUpperCase(),
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: teal,
                ),
              ),
            ),
            const SizedBox(width: 18),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.api.account!['name'],
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    neighborhoods
                        .where(
                          (n) =>
                              n['id'] == widget.api.account!['neighborhood_id'],
                        )
                        .map((n) => n['name'])
                        .join(),
                    style: const TextStyle(color: Color(0xFF5F6D7E)),
                  ),
                  Text(
                    widget.api.account!['email'],
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF5F6D7E),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const Divider(height: 36),
        if (overview != null) ...[
          Row(
            children: [
              for (final entry in {
                'activities': 'atividades',
                'notices': 'avisos',
                'neighborhoods': 'bairros',
              }.entries)
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        overview!['counts'][entry.key].toString(),
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      Text(
                        entry.value,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF5F6D7E),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SectionTitle('Próximas atividades'),
          if ((overview!['activities'] as List).isEmpty)
            const Text('Você ainda não confirmou presença em eventos.'),
          for (final p in overview!['activities'])
            Card(
              child: ListTile(
                title: Text(
                  p['title'],
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                subtitle: Text('${dateLabel(p['starts_at'])} · Confirmada'),
                trailing: const Icon(Icons.chevron_right, color: teal),
                onTap: () => openPost(p['id']),
              ),
            ),
          const SectionTitle('Seus avisos'),
          if ((overview!['notices'] as List).isEmpty)
            const Text('Você ainda não publicou avisos.'),
          for (final p in overview!['notices'])
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: PostCard(Json.from(p), onTap: () => openPost(p['id'])),
            ),
        ] else if (error == null)
          const LinearProgressIndicator(),
        const SizedBox(height: 20),
        ExpansionTile(
          tilePadding: EdgeInsets.zero,
          title: const Text('Editar perfil e preferências'),
          childrenPadding: const EdgeInsets.symmetric(vertical: 16),
          children: [
            TextField(
              controller: name,
              maxLength: 60,
              decoration: const InputDecoration(labelText: 'Nome público'),
            ),
            const SizedBox(height: 16),
            if (neighborhoods.isNotEmpty)
              DropdownButtonFormField<String>(
                itemHeight: null,
                initialValue: neighborhoods.any((n) => n['id'] == neighborhood)
                    ? neighborhood
                    : null,
                isExpanded: true,
                decoration: const InputDecoration(
                  labelText: 'Bairro principal',
                ),
                items: neighborhoods
                    .map(
                      (n) => DropdownMenuItem<String>(
                        value: n['id'],
                        child: Text(n['name']),
                      ),
                    )
                    .toList(),
                onChanged: (v) => setState(() => neighborhood = v!),
              ),
            if (error != null) ErrorBox(error!, retry: load),
            const SizedBox(height: 16),
            SwitchListTile(
              title: const Text('Lembretes de eventos'),
              subtitle: const Text(
                'Na caixa de notificações do aplicativo, até 24 horas antes. Push ainda não configurado.',
              ),
              value: reminders,
              onChanged: (v) => setState(() => reminders = v),
            ),
            const Text('Bairros que acompanho (até 5)'),
            for (final n in neighborhoods.where((n) => n['id'] != neighborhood))
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(n['name']),
                value: follows.contains(n['id']),
                onChanged: (v) {
                  if (v == true && follows.length >= 5) {
                    feedback(context, 'Você pode acompanhar até 5 bairros.');
                    return;
                  }
                  setState(() {
                    if (v == true) {
                      follows.add(n['id']);
                    } else {
                      follows.remove(n['id']);
                    }
                  });
                },
              ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: busy ? null : save,
              child: Text(busy ? 'Salvando…' : 'Salvar perfil'),
            ),
          ],
        ),
        ListTile(
          leading: const Icon(Icons.lock_outline),
          title: const Text('Conta e segurança'),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => AccountSecurityScreen(api: widget.api),
            ),
          ),
        ),
        ListTile(
          leading: const Icon(Icons.fact_check_outlined),
          title: const Text('Revisões de moderação'),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => MyModerationScreen(api: widget.api),
            ),
          ),
        ),
        if (widget.api.isAdmin)
          ListTile(
            leading: const Icon(Icons.location_city),
            title: const Text('Município e bairros'),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => TerritoriesScreen(api: widget.api),
              ),
            ),
          ),
        const Divider(height: 40),
        ListTile(
          leading: const Icon(Icons.article_outlined),
          title: const Text('Minhas publicações'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => Scaffold(
                appBar: AppBar(title: const Text('Minhas publicações')),
                body: FeedScreen(api: widget.api, mode: 'mine'),
              ),
            ),
          ),
        ),
        ListTile(
          leading: const Icon(Icons.event_available),
          title: const Text('Meus eventos'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => Scaffold(
                appBar: AppBar(title: const Text('Meus eventos')),
                body: FeedScreen(api: widget.api, mode: 'attending'),
              ),
            ),
          ),
        ),
        if (widget.api.canModerate)
          ListTile(
            leading: const Icon(Icons.shield_outlined),
            title: const Text('Moderação'),
            subtitle: const Text(
              'Análises dos bairros sob sua responsabilidade',
            ),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ModerationScreen(api: widget.api),
              ),
            ),
          ),
        if (widget.api.isAdmin)
          ListTile(
            leading: const Icon(Icons.admin_panel_settings_outlined),
            title: const Text('Administrar moderadores'),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ModeratorsScreen(api: widget.api),
              ),
            ),
          ),
        const Divider(height: 32),
        const Text(
          'Privacidade e ajuda',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        const Text(
          'Seu e-mail não aparece nas publicações. Denúncias são avaliadas por pessoas, sem expor quem denunciou. Não solicitamos GPS. As notificações desta versão ficam dentro do aplicativo.',
        ),
        const SizedBox(height: 20),
        OutlinedButton(
          onPressed: busy
              ? null
              : () async {
                  if (!await confirm(
                    context,
                    'Sair da conta?',
                    'Seus rascunhos continuam neste dispositivo.',
                  )) {
                    return;
                  }
                  try {
                    await widget.api.logout();
                  } catch (e) {
                    if (context.mounted) feedback(context, e.toString());
                  }
                },
          child: const Text('Sair da conta'),
        ),
      ],
    ),
  );
}

class ModerationScreen extends StatefulWidget {
  final Api api;
  const ModerationScreen({required this.api, super.key});
  @override
  State<ModerationScreen> createState() => _ModerationScreenState();
}

class _ModerationScreenState extends State<ModerationScreen> {
  List<dynamic>? reports, appeals;
  String? error;
  bool busy = false;
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final d = await widget.api.call('/api/moderation');
      final a = await widget.api.call('/api/moderation/appeals');
      if (mounted) {
        setState(() {
          reports = d['items'];
          appeals = a['items'];
          error = null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> decide(Json item, String action, {bool appeal = false}) async {
    final reason = await askReason(
      context,
      'Registrar decisão',
      'Explique o motivo. O autor será informado e a decisão ficará no histórico.',
    );
    if (reason == null || !mounted) return;
    setState(() => busy = true);
    try {
      await widget.api.call(
        appeal
            ? '/api/moderation/appeals/${item['id']}'
            : '/api/moderation/${item['id']}',
        method: 'POST',
        body: {'action': action, 'reason': reason},
      );
      await load();
      if (mounted) feedback(context, 'Decisão registrada.');
    } catch (e) {
      if (mounted) feedback(context, e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Moderação')),
    body: error != null
        ? ErrorBox(error!, retry: load)
        : reports == null
        ? const Center(child: CircularProgressIndicator())
        : PageBody(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Analise o contexto antes de decidir. Denúncias não retiram conteúdo automaticamente.',
                ),
                const SizedBox(height: 24),
                Text(
                  'Denúncias (${reports!.length})',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                if (reports!.isEmpty) const Text('Nenhuma denúncia pendente.'),
                for (final r in reports!)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            r['title'],
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          Text(r['neighborhood_name']),
                          Text('Motivo: ${r['reason']}'),
                          if (r['reply_body'] != null)
                            Text('Resposta denunciada: ${r['reply_body']}'),
                          TextButton(
                            onPressed: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => DetailScreen(
                                  api: widget.api,
                                  id: r['post_id'],
                                ),
                              ),
                            ),
                            child: const Text('Ver contexto'),
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 12,
                            children: [
                              for (final a in {
                                'keep': 'Manter',
                                'request-change': 'Pedir correção',
                                'hide': 'Ocultar',
                                'remove': 'Remover',
                              }.entries)
                                OutlinedButton(
                                  onPressed: busy
                                      ? null
                                      : () => decide(Json.from(r), a.key),
                                  child: Text(a.value),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 24),
                Text(
                  'Pedidos de revisão (${appeals!.length})',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                for (final a in appeals!)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(a['title']),
                          Text('Decisão anterior: ${a['original_reason']}'),
                          Text('Pedido: ${a['reason']}'),
                          Wrap(
                            spacing: 8,
                            runSpacing: 12,
                            children: [
                              OutlinedButton(
                                onPressed: busy
                                    ? null
                                    : () => decide(
                                        Json.from(a),
                                        'restore',
                                        appeal: true,
                                      ),
                                child: const Text('Restaurar conteúdo'),
                              ),
                              OutlinedButton(
                                onPressed: busy
                                    ? null
                                    : () => decide(
                                        Json.from(a),
                                        'keep',
                                        appeal: true,
                                      ),
                                child: const Text('Manter decisão'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                if (busy) const LinearProgressIndicator(),
              ],
            ),
          ),
  );
}

class ModeratorsScreen extends StatefulWidget {
  final Api api;
  const ModeratorsScreen({required this.api, super.key});
  @override
  State<ModeratorsScreen> createState() => _ModeratorsScreenState();
}

class _ModeratorsScreenState extends State<ModeratorsScreen> {
  final email = TextEditingController();
  List<dynamic> neighborhoods = [], moderators = [];
  String? neighborhood, error;
  bool busy = false;
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final n = await widget.api.call('/api/neighborhoods');
      final m = await widget.api.call('/api/admin/moderators');
      final scopes = (widget.api.account!['roles'] as List)
          .where((r) => r['role'] == 'admin')
          .map((r) => r['municipality_id'])
          .toSet();
      if (mounted) {
        setState(() {
          neighborhoods = (n['items'] as List)
              .where((n) => scopes.contains(n['municipality_id']))
              .toList();
          moderators = m['items'];
          error = null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> assign(String target, String? area, bool revoke) async {
    if (area == null || !target.contains('@')) {
      feedback(context, 'Informe o e-mail da conta e escolha um bairro.');
      return;
    }
    if (!await confirm(
      context,
      revoke ? 'Revogar moderação?' : 'Designar moderador?',
      '$target ${revoke ? 'perderá' : 'receberá'} permissão para analisar conteúdo do bairro selecionado.',
    )) {
      return;
    }
    setState(() => busy = true);
    try {
      await widget.api.call(
        '/api/admin/moderators',
        method: 'POST',
        body: {'email': target, 'neighborhood_id': area, 'revoke': revoke},
      );
      await load();
      if (mounted) feedback(context, 'Permissões atualizadas.');
    } catch (e) {
      if (mounted) feedback(context, e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  void dispose() {
    email.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Moderadores')),
    body: PageBody(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'A conta precisa estar cadastrada. A permissão vale apenas para o bairro escolhido.',
          ),
          const SizedBox(height: 20),
          TextField(
            controller: email,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: 'E-mail do moderador'),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            itemHeight: null,
            initialValue: neighborhood,
            isExpanded: true,
            decoration: const InputDecoration(labelText: 'Bairro'),
            items: neighborhoods
                .map(
                  (n) => DropdownMenuItem<String>(
                    value: n['id'],
                    child: Text(n['name']),
                  ),
                )
                .toList(),
            onChanged: (v) => neighborhood = v,
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: busy
                ? null
                : () => assign(email.text.trim(), neighborhood, false),
            child: const Text('Designar moderador'),
          ),
          if (error != null) ErrorBox(error!, retry: load),
          const Divider(height: 40),
          for (final m in moderators)
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(m['name']),
              subtitle: Text('${m['email']} • ${m['neighborhood_name']}'),
              trailing: IconButton(
                tooltip: 'Revogar permissão',
                onPressed: busy
                    ? null
                    : () => assign(m['email'], m['neighborhood_id'], true),
                icon: const Icon(Icons.person_remove_outlined),
              ),
            ),
        ],
      ),
    ),
  );
}
