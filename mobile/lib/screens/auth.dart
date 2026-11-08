import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../api.dart';
import '../ui.dart';
import '../visual.dart';
import 'account_security.dart';

class WelcomeScreen extends StatelessWidget {
  final Api api;
  const WelcomeScreen({required this.api, super.key});
  @override
  Widget build(BuildContext context) => AnnotatedRegion<SystemUiOverlayStyle>(
    value: SystemUiOverlayStyle.light,
    child: Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [navy, teal],
          ),
        ),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) => SingleChildScrollView(
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 28,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      SizedBox(height: constraints.maxHeight * .12),
                      const Center(child: NeighborhoodMark()),
                      const SizedBox(height: 36),
                      const Text(
                        'VivaBairro',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 18),
                      const Text(
                        'Veja o que acontece no bairro.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 23,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'Eventos, avisos e iniciativas locais.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Color(0xFFE8F5F4),
                          fontSize: 15,
                        ),
                      ),
                      SizedBox(height: constraints.maxHeight * .15),
                      FilledButton(
                        style: FilledButton.styleFrom(
                          backgroundColor: yellow,
                          foregroundColor: navy,
                        ),
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => AuthScreen(api: api),
                          ),
                        ),
                        child: const Text('Entrar'),
                      ),
                      const SizedBox(height: 14),
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: .12),
                          foregroundColor: Colors.white,
                          side: BorderSide(
                            color: Colors.white.withValues(alpha: .4),
                          ),
                        ),
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                AuthScreen(api: api, register: true),
                          ),
                        ),
                        child: const Text('Criar minha conta'),
                      ),
                      const SizedBox(height: 32),
                      const Text(
                        'Escolha um bairro para começar.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Não pedimos GPS nem endereço residencial.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Color(0xFFE8F5F4),
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 24),
                      if (api.demo)
                        const Text(
                          'DADOS DE DEMONSTRAÇÃO',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: yellow,
                            fontSize: 10,
                            letterSpacing: 1,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

class AuthScreen extends StatefulWidget {
  final Api api;
  final bool register;
  const AuthScreen({required this.api, this.register = false, super.key});
  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final form = GlobalKey<FormState>();
  final name = TextEditingController(),
      email = TextEditingController(),
      password = TextEditingController(),
      repeat = TextEditingController();
  List<dynamic> neighborhoods = [];
  String? neighborhood, error;
  bool busy = false, visible = false;
  @override
  void initState() {
    super.initState();
    if (widget.register) load();
  }

  Future<void> load() async {
    try {
      final data = await widget.api.call('/api/neighborhoods');
      if (mounted) {
        setState(() {
          neighborhoods = data['items'];
          error = null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> submit() async {
    if (!form.currentState!.validate()) return;
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await widget.api.authenticate(widget.register, {
        'email': email.text.trim(),
        'password': password.text,
        if (widget.register) ...{
          'name': name.text.trim(),
          'neighborhood_id': neighborhood,
        },
      });
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  void dispose() {
    name.dispose();
    email.dispose();
    password.dispose();
    repeat.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(widget.register ? 'Criar minha conta' : 'Entrar'),
    ),
    body: PageBody(
      child: Form(
        key: form,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (widget.register) ...[
              TextFormField(
                controller: name,
                decoration: const InputDecoration(
                  labelText: 'Nome público',
                  helperText: 'Como podemos chamar você?',
                ),
                maxLength: 60,
                validator: (v) =>
                    v!.trim().length < 2 ? 'Informe seu nome.' : null,
              ),
              const SizedBox(height: 16),
            ],
            TextFormField(
              controller: email,
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              decoration: const InputDecoration(labelText: 'E-mail'),
              validator: (v) =>
                  !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(v!.trim())
                  ? 'Informe um e-mail válido.'
                  : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: password,
              obscureText: !visible,
              decoration: InputDecoration(
                labelText: 'Senha',
                helperText: widget.register
                    ? 'Use pelo menos 12 caracteres.'
                    : null,
                suffixIcon: IconButton(
                  tooltip: visible ? 'Ocultar senha' : 'Mostrar senha',
                  onPressed: () => setState(() => visible = !visible),
                  icon: Icon(visible ? Icons.visibility_off : Icons.visibility),
                ),
              ),
              validator: (v) => v!.isEmpty
                  ? 'Informe sua senha.'
                  : widget.register && v.length < 12
                  ? 'Use pelo menos 12 caracteres.'
                  : null,
            ),
            if (widget.register) ...[
              const SizedBox(height: 16),
              TextFormField(
                controller: repeat,
                obscureText: !visible,
                decoration: const InputDecoration(labelText: 'Repita a senha'),
                validator: (v) => v != password.text
                    ? 'As senhas precisam ser iguais.'
                    : null,
              ),
              const SizedBox(height: 20),
              DropdownButtonFormField<String>(
                itemHeight: null,
                initialValue: neighborhood,
                isExpanded: true,
                decoration: const InputDecoration(
                  labelText: 'Seu bairro principal',
                ),
                items: neighborhoods
                    .map(
                      (n) => DropdownMenuItem<String>(
                        value: n['id'],
                        child: Text('${n['name']} • ${n['municipality_name']}'),
                      ),
                    )
                    .toList(),
                onChanged: (v) => neighborhood = v,
                validator: (v) => v == null ? 'Escolha seu bairro.' : null,
              ),
              const SizedBox(height: 12),
              const Text(
                'Seu nome aparecerá nas publicações. Evite divulgar endereço residencial ou telefone.',
              ),
            ],
            if (error != null)
              ErrorBox(
                error!,
                retry: widget.register && neighborhoods.isEmpty ? load : null,
              ),
            if (!widget.register) const SizedBox(height: 16),
            if (!widget.register && widget.api.demo)
              OutlinedButton.icon(
                icon: const Icon(Icons.science_outlined),
                onPressed: busy
                    ? null
                    : () => setState(() {
                        email.text = 'morador@vivabairro.test';
                        password.text = 'VivaBairro-local-2026';
                      }),
                label: const Text('Preencher conta de demonstração'),
              ),
            if (!widget.register)
              TextButton(
                onPressed: busy
                    ? null
                    : () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => RecoveryScreen(api: widget.api),
                        ),
                      ),
                child: const Text('Esqueci minha senha'),
              ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: busy ? null : submit,
              child: Text(
                busy
                    ? 'Aguarde…'
                    : widget.register
                    ? 'Criar conta'
                    : 'Entrar',
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
