import 'package:flutter/material.dart';

import '../api.dart';
import '../ui.dart';
import '../visual.dart';
import 'editor.dart';
import 'detail.dart';
import 'profile.dart';

class HomeScreen extends StatefulWidget {
  final Api api;
  const HomeScreen({required this.api, super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int index = 0, revision = 0;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text(
        'VivaBairro',
        style: TextStyle(
          color: teal,
          fontWeight: FontWeight.w800,
          fontSize: 22,
        ),
      ),
      actions: [
        IconButton(
          tooltip: 'Notificações',
          icon: const Icon(Icons.notifications_outlined),
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => NotificationsScreen(api: widget.api),
            ),
          ),
        ),
      ],
    ),
    body: index == 0
        ? FeedScreen(key: ValueKey(revision), api: widget.api)
        : ProfileScreen(api: widget.api),
    bottomNavigationBar: NavigationBar(
      selectedIndex: index == 0 ? 0 : 2,
      destinations: const [
        NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Início'),
        NavigationDestination(
          icon: Icon(Icons.add_circle_outline),
          label: 'Publicar',
        ),
        NavigationDestination(
          icon: Icon(Icons.person_outline),
          label: 'Meu perfil',
        ),
      ],
      onDestinationSelected: (value) async {
        if (value == 1) {
          final changed = await Navigator.push<bool>(
            context,
            MaterialPageRoute(builder: (_) => EditorScreen(api: widget.api)),
          );
          if (changed == true && mounted) {
            setState(() {
              index = 0;
              revision++;
            });
          }
        } else {
          setState(() {
            index = value == 0 ? 0 : 1;
            revision++;
          });
        }
      },
    ),
  );
}

class FeedScreen extends StatefulWidget {
  final Api api;
  final String? mode;
  const FeedScreen({required this.api, this.mode, super.key});
  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  List<dynamic> items = [], neighborhoods = [];
  final search = TextEditingController();
  String? neighborhood, kind, category, error;
  DateTimeRange? period;
  bool loading = true, more = false;
  int generation = 0;
  @override
  void initState() {
    super.initState();
    neighborhood = widget.api.account!['neighborhood_id'];
    load();
    loadNeighborhoods();
  }

  Future<void> loadNeighborhoods() async {
    try {
      final d = await widget.api.call('/api/neighborhoods');
      if (mounted) {
        setState(() {
          neighborhoods = d['items'];
          if (neighborhood != 'followed' &&
              !neighborhoods.any((n) => n['id'] == neighborhood)) {
            neighborhood = null;
          }
        });
      }
    } catch (_) {}
  }

  Future<void> load({bool append = false}) async {
    final current = ++generation;
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final query = Uri(
        queryParameters: {
          'q': search.text.trim(),
          if (period != null) 'from': period!.start.toUtc().toIso8601String(),
          if (period != null)
            'to': period!.end
                .add(const Duration(days: 1))
                .toUtc()
                .toIso8601String(),
          if (widget.mode == null && neighborhood != null)
            'neighborhood': neighborhood!,
          'kind': ?kind,
          'category': ?category,
          if (widget.mode != null) widget.mode!: 'true',
          'offset': append ? '${items.length}' : '0',
        },
      ).query;
      final data = await widget.api.call('/api/posts?$query');
      if (mounted && current == generation) {
        setState(() {
          items = append ? [...items, ...data['items']] : data['items'];
          more = data['hasMore'];
        });
      }
    } catch (e) {
      if (mounted && current == generation) {
        setState(() => error = e.toString());
      }
    } finally {
      if (mounted && current == generation) setState(() => loading = false);
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
    search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => RefreshIndicator(
    onRefresh: load,
    child: ListView(
      padding: const EdgeInsets.all(20),
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (widget.mode == null) ...[
                  Semantics(
                    container: true,
                    header: true,
                    child: Text(
                      'Olá!',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (neighborhoods.isNotEmpty)
                    DropdownButtonFormField<String>(
                      itemHeight: null,
                      initialValue: neighborhood,
                      isExpanded: true,
                      decoration: const InputDecoration(
                        labelText: 'Bairro selecionado',
                        isDense: true,
                      ),
                      items: [
                        const DropdownMenuItem<String>(
                          value: 'followed',
                          child: Text('Todos os meus bairros'),
                        ),
                        ...neighborhoods.map(
                          (n) => DropdownMenuItem<String>(
                            value: n['id'],
                            child: Text(n['name']),
                          ),
                        ),
                      ],
                      onChanged: (v) {
                        neighborhood = v;
                        load();
                      },
                    ),
                  const SizedBox(height: 16),
                ],
                if (widget.api.demo)
                  const Padding(
                    padding: EdgeInsets.only(bottom: 12),
                    child: Text(
                      'DEMONSTRAÇÃO · Contas e publicações fictícias',
                      style: TextStyle(
                        fontSize: 11,
                        color: teal,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                Wrap(
                  spacing: 8,
                  runSpacing: 12,
                  children: [
                    OutlinedButton.icon(
                      onPressed: () async {
                        final range = await showDateRangePicker(
                          context: context,
                          firstDate: DateTime(2020),
                          lastDate: DateTime.now().add(
                            const Duration(days: 730),
                          ),
                          initialDateRange: period,
                        );
                        if (range != null && mounted) {
                          setState(() => period = range);
                          load();
                        }
                      },
                      icon: const Icon(Icons.date_range, size: 18),
                      label: Text(
                        period == null
                            ? 'Filtrar por data'
                            : '${dateLabel(period!.start.toIso8601String()).split(' • ')[0]} até ${dateLabel(period!.end.toIso8601String()).split(' • ')[0]}',
                      ),
                    ),
                    if (period != null)
                      TextButton(
                        onPressed: () {
                          setState(() => period = null);
                          load();
                        },
                        child: const Text('Limpar período'),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: search,
                  decoration: InputDecoration(
                    labelText: 'Buscar no bairro',
                    hintText: 'Evento, aviso ou local',
                    suffixIcon: IconButton(
                      tooltip: 'Buscar',
                      icon: const Icon(Icons.search),
                      onPressed: load,
                    ),
                  ),
                  onSubmitted: (_) => load(),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 12,
                  children: [
                    ChoiceChip(
                      label: const Text('Tudo'),
                      selected: kind == null,
                      onSelected: (_) {
                        setState(() {
                          kind = null;
                          category = null;
                        });
                        load();
                      },
                    ),
                    for (final k in ['event', 'notice', 'official'])
                      ChoiceChip(
                        label: Text(kindLabel(k)),
                        selected: kind == k,
                        onSelected: (_) {
                          setState(() {
                            kind = k;
                            category = null;
                          });
                          load();
                        },
                      ),
                  ],
                ),
                if (kind == 'notice') const SizedBox(height: 12),
                if (kind == 'notice')
                  DropdownButtonFormField<String>(
                    itemHeight: null,
                    isExpanded: true,
                    key: ValueKey(category),
                    initialValue: category,
                    decoration: const InputDecoration(labelText: 'Categoria'),
                    items: [
                      const DropdownMenuItem(value: '', child: Text('Todas')),
                      ...categories.entries.map(
                        (e) => DropdownMenuItem(
                          value: e.key,
                          child: Text(e.value),
                        ),
                      ),
                    ],
                    onChanged: (v) {
                      category = v == '' ? null : v;
                      load();
                    },
                  ),
                const SizedBox(height: 16),
                if (loading) const LinearProgressIndicator(),
                if (error != null) ErrorBox(error!, retry: load),
                if (!loading && error == null && items.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 32),
                    child: Text(
                      'Nenhuma publicação por aqui ainda. Experimente outro filtro ou compartilhe algo com a comunidade.',
                    ),
                  ),
                if (items.any((p) => p['kind'] == 'event')) ...[
                  Container(
                    padding: const EdgeInsets.all(20),
                    margin: const EdgeInsets.only(bottom: 18),
                    decoration: BoxDecoration(
                      color: mint,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'NO SEU BAIRRO',
                          style: TextStyle(
                            fontSize: 10,
                            letterSpacing: 1.2,
                            fontWeight: FontWeight.w800,
                            color: teal,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Semantics(
                          container: true,
                          header: true,
                          child: Text(
                            'Atividades do bairro',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                        ),
                        const SizedBox(height: 5),
                        const Text(
                          'Encontre um evento e participe.',
                          style: TextStyle(
                            color: Color(0xFF5F6D7E),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final events = items
                          .where((p) => p['kind'] == 'event')
                          .toList();
                      final columns =
                          constraints.maxWidth >= 330 &&
                              MediaQuery.textScalerOf(context).scale(14) < 21
                          ? 2
                          : 1;
                      return Wrap(
                        spacing: 14,
                        runSpacing: 14,
                        children: [
                          for (var i = 0; i < events.length; i++)
                            SizedBox(
                              width:
                                  (constraints.maxWidth - (columns - 1) * 14) /
                                  columns,
                              child: PostCard(
                                Json.from(events[i]),
                                api: widget.api,
                                green: i.isOdd,
                                onTap: () => openPost(events[i]['id']),
                              ),
                            ),
                        ],
                      );
                    },
                  ),
                ],
                for (final type in ['notice', 'official'])
                  if (items.any((p) => p['kind'] == type)) ...[
                    SectionTitle(
                      type == 'notice'
                          ? 'Avisos do bairro'
                          : 'Comunicados municipais',
                    ),
                    for (final p in items.where((p) => p['kind'] == type))
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: PostCard(
                          Json.from(p),
                          api: widget.api,
                          onTap: () => openPost(p['id']),
                        ),
                      ),
                  ],
                if (more)
                  OutlinedButton(
                    onPressed: loading ? null : () => load(append: true),
                    child: const Text('Carregar mais'),
                  ),
              ],
            ),
          ),
        ),
      ],
    ),
  );
}

class NotificationsScreen extends StatefulWidget {
  final Api api;
  const NotificationsScreen({required this.api, super.key});
  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<dynamic>? items;
  String? error;
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final d = await widget.api.call('/api/notifications');
      if (mounted) {
        setState(() {
          items = d['items'];
          error = null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Notificações')),
    body: error != null
        ? ErrorBox(error!, retry: load)
        : items == null
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            children: [
              if (items!.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(24),
                  child: Text('Nenhuma notificação por enquanto.'),
                ),
              for (final n in items!)
                ListTile(
                  leading: Icon(
                    n['read_at'] == null
                        ? Icons.mark_email_unread_outlined
                        : Icons.drafts_outlined,
                    semanticLabel: n['read_at'] == null ? 'Não lida' : 'Lida',
                  ),
                  title: Text(n['message']),
                  subtitle: Text(dateLabel(n['created_at'])),
                  onTap: () async {
                    try {
                      await widget.api.call(
                        '/api/notifications/${n['id']}',
                        method: 'PATCH',
                      );
                      if (!context.mounted) return;
                      if (n['post_id'] != null) {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                DetailScreen(api: widget.api, id: n['post_id']),
                          ),
                        );
                      }
                      load();
                    } catch (e) {
                      if (context.mounted) feedback(context, e.toString());
                    }
                  },
                ),
            ],
          ),
  );
}
