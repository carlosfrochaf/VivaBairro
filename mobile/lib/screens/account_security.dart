import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../api.dart';
import '../ui.dart';

class RecoveryScreen extends StatefulWidget {
  final Api api;
  const RecoveryScreen({required this.api, super.key});
  @override
  State<RecoveryScreen> createState() => _RecoveryScreenState();
}

class _RecoveryScreenState extends State<RecoveryScreen> {
  final email = TextEditingController(),
      code = TextEditingController(),
      password = TextEditingController(),
      repeat = TextEditingController();
  bool reset = false, busy = false, failed = false;
  String? message;
  Future<void> submit() async {
    if (reset && (password.text.length < 12 || password.text != repeat.text)) {
      feedback(context, 'Use pelo menos 12 caracteres e repita a mesma senha.');
      return;
    }
    setState(() {
      busy = true;
      failed = false;
    });
    try {
      final data = await widget.api.call(
        reset ? '/api/auth/reset' : '/api/auth/forgot',
        method: 'POST',
        body: reset
            ? {'token': code.text.trim(), 'password': password.text}
            : {'email': email.text.trim()},
      );
      if (!mounted) return;
      if (reset) {
        feedback(context, 'Senha atualizada. Entre novamente.');
        Navigator.pop(context);
      } else {
        setState(() => message = data['message']);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          message = e.toString();
          failed = true;
        });
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  void dispose() {
    for (final c in [email, code, password, repeat]) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Recuperar acesso')),
    body: PageBody(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            reset ? 'Escolha uma nova senha' : 'Esqueceu sua senha?',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 12),
          const Text(
            'O código vale por 30 minutos e pode ser usado uma única vez.',
          ),
          const SizedBox(height: 24),
          if (!reset)
            TextField(
              controller: email,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'E-mail da conta'),
            ),
          if (reset) ...[
            TextField(
              controller: code,
              decoration: const InputDecoration(labelText: 'Código recebido'),
              autocorrect: false,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: password,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Nova senha',
                helperText: 'Pelo menos 12 caracteres.',
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: repeat,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Repita a nova senha',
              ),
            ),
          ],
          if (message != null)
            failed
                ? ErrorBox(message!)
                : Semantics(
                    liveRegion: true,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Text(message!),
                    ),
                  ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: busy ? null : submit,
            child: Text(
              busy
                  ? 'Aguarde…'
                  : reset
                  ? 'Salvar nova senha'
                  : 'Solicitar código',
            ),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: busy
                ? null
                : () => setState(() {
                    reset = !reset;
                    message = null;
                  }),
            child: Text(
              reset ? 'Solicitar outro código' : 'Já tenho um código',
            ),
          ),
          if (widget.api.demo) ...[
            const Divider(),
            const Text(
              'Demonstração: os e-mails de contas fictícias ficam na caixa local. Nenhum e-mail real é enviado.',
            ),
            TextButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => DemoMailboxScreen(
                    api: widget.api,
                    email: email.text.trim(),
                  ),
                ),
              ),
              child: const Text('Abrir caixa de e-mails da demonstração'),
            ),
          ],
        ],
      ),
    ),
  );
}

class DemoMailboxScreen extends StatefulWidget {
  final Api api;
  final String email;
  const DemoMailboxScreen({required this.api, required this.email, super.key});
  @override
  State<DemoMailboxScreen> createState() => _DemoMailboxScreenState();
}

class _DemoMailboxScreenState extends State<DemoMailboxScreen> {
  late final email = TextEditingController(text: widget.email);
  List<dynamic> items = [];
  String? error;
  bool busy = false;
  Future<void> load() async {
    setState(() => busy = true);
    try {
      final d = await widget.api.call(
        '/api/demo/mail?${Uri(queryParameters: {'email': email.text.trim()}).query}',
      );
      if (mounted) {
        setState(() {
          items = d['items'];
          error = null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.email.endsWith('@vivabairro.test')) load();
  }

  @override
  void dispose() {
    email.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('E-mails de demonstração')),
    body: PageBody(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Caixa local, exclusiva de contas fictícias @vivabairro.test. Não representa entrega por e-mail.',
          ),
          const SizedBox(height: 16),
          TextField(
            controller: email,
            decoration: const InputDecoration(labelText: 'Conta fictícia'),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: busy ? null : load,
            child: Text(busy ? 'Carregando…' : 'Atualizar caixa'),
          ),
          if (error != null) ErrorBox(error!),
          if (items.isEmpty && !busy)
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'Nenhuma mensagem recente. Solicite um código primeiro.',
              ),
            ),
          for (final mail in items)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      mail['subject'],
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    SelectableText(mail['body']),
                    TextButton(
                      onPressed: () async {
                        final match = RegExp(r'Código: ([A-Za-z0-9_-]+)')
                            .firstMatch(mail['body']);
                        if (match != null) {
                          await Clipboard.setData(
                            ClipboardData(text: match.group(1)!),
                          );
                          if (context.mounted) {
                            feedback(context, 'Código copiado.');
                          }
                        }
                      },
                      child: const Text('Copiar código'),
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

class AccountSecurityScreen extends StatefulWidget {
  final Api api;
  const AccountSecurityScreen({required this.api, super.key});
  @override
  State<AccountSecurityScreen> createState() => _AccountSecurityScreenState();
}

class _AccountSecurityScreenState extends State<AccountSecurityScreen> {
  final code = TextEditingController(),
      current = TextEditingController(),
      password = TextEditingController(),
      repeat = TextEditingController(),
      deletion = TextEditingController();
  bool busy = false;
  String? message;
  Future<void> run(
    String path,
    Json data, {
    String method = 'POST',
    bool leave = false,
  }) async {
    setState(() => busy = true);
    try {
      await widget.api.call(path, method: method, body: data);
      if (leave) {
        final id = widget.api.account!['id'];
        final prefs = await SharedPreferences.getInstance();
        for (final key in prefs.getKeys().where(
          (k) => method == 'DELETE' && k.startsWith('draft:$id:'),
        )) {
          await prefs.remove(key);
        }
        await widget.api.clearSession();
        if (mounted) Navigator.popUntil(context, (r) => r.isFirst);
      } else {
        await widget.api.refreshProfile();
        if (mounted) setState(() => message = 'Solicitação concluída.');
      }
    } catch (e) {
      if (mounted) setState(() => message = e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  void dispose() {
    for (final c in [code, current, password, repeat, deletion]) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Segurança da conta')),
    body: PageBody(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            widget.api.account?['email_verified_at'] != null
                ? 'E-mail confirmado'
                : 'Confirme seu e-mail',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 12),
          Text(widget.api.account?['email'] ?? ''),
          const SizedBox(height: 16),
          if (widget.api.account?['email_verified_at'] == null) ...[
            OutlinedButton(
              onPressed: busy ? null : () => run('/api/me/verification', {}),
              child: const Text('Solicitar código de confirmação'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: code,
              decoration: const InputDecoration(
                labelText: 'Código de confirmação',
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: busy
                  ? null
                  : () => run('/api/me/verification/confirm', {
                      'token': code.text.trim(),
                    }),
              child: const Text('Confirmar e-mail'),
            ),
          ],
          if (widget.api.demo)
            TextButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => DemoMailboxScreen(
                    api: widget.api,
                    email: widget.api.account!['email'],
                  ),
                ),
              ),
              child: const Text('Caixa de e-mails da demonstração'),
            ),
          const Divider(height: 40),
          Text('Alterar senha', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          TextField(
            controller: current,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Senha atual'),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: password,
            obscureText: true,
            decoration: const InputDecoration(
              labelText: 'Nova senha',
              helperText: 'Pelo menos 12 caracteres.',
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: repeat,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Repita a nova senha'),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: busy
                ? null
                : () {
                    if (password.text.length < 12 ||
                        password.text != repeat.text) {
                      feedback(
                        context,
                        'Confira a nova senha e a confirmação.',
                      );
                      return;
                    }
                    run('/api/me/password', {
                      'current_password': current.text,
                      'password': password.text,
                    }, leave: true);
                  },
            child: const Text('Salvar senha e sair'),
          ),
          const Divider(height: 40),
          ExpansionTile(
            title: const Text('Excluir minha conta'),
            childrenPadding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            children: [
              const Text(
                'Seu perfil será desativado, seus dados de acesso apagados e suas publicações e respostas removidas. Registros de auditoria permanecem sem seu nome. Essa ação não pode ser desfeita.',
              ),
              const SizedBox(height: 16),
              TextField(
                controller: deletion,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Senha atual',
                  helperText: 'Confirme sua senha para excluir a conta.',
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: busy
                    ? null
                    : () async {
                        if (await confirm(
                          context,
                          'Excluir definitivamente a conta?',
                          'Seu conteúdo será removido e você perderá o acesso.',
                        )) {
                          await run(
                            '/api/me',
                            {
                              'password': deletion.text,
                              'confirmation': 'EXCLUIR',
                            },
                            method: 'DELETE',
                            leave: true,
                          );
                        }
                      },
                child: const Text('Excluir minha conta'),
              ),
            ],
          ),
          if (message != null) ErrorBox(message!),
          if (busy) const LinearProgressIndicator(),
        ],
      ),
    ),
  );
}
