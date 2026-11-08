import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:vivabairro/api.dart';
import 'package:vivabairro/main.dart' as app;

// Somente API local e banco de demonstração: nunca executar contra produção.
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('Android: entrar, publicar, editar, resolver e remover aviso', (
    tester,
  ) async {
    final host = Uri.parse(Api.baseUrl).host;
    expect(['127.0.0.1', 'localhost', '10.0.2.2'], contains(host));
    const storage = FlutterSecureStorage();
    final previousSession = await storage.read(key: 'session');
    final api = Api();
    final suffix = DateTime.now().microsecondsSinceEpoch;
    final email = 'teste-$suffix@vivabairro.test';
    const password = 'Teste-Android-local-2026';
    final title = 'Aviso de teste $suffix';
    bool created = false;

    Future<void> waitFor(Finder target) async {
      for (
        var attempt = 0;
        attempt < 100 && target.evaluate().isEmpty;
        attempt++
      ) {
        await tester.pump(const Duration(milliseconds: 200));
      }
      expect(
        target,
        findsWidgets,
        reason: tester
            .widgetList<Text>(find.byType(Text))
            .map((w) => w.data)
            .join(' | '),
      );
    }

    Future<void> tapText(String text) async {
      final button = find.ancestor(
        of: find.text(text),
        matching: find.byWidgetPredicate((w) => w is ButtonStyleButton),
      );
      final target = button.evaluate().isNotEmpty
          ? button.last
          : find.text(text).last;
      await waitFor(target);
      await tester.ensureVisible(target);
      await tester.pumpAndSettle();
      await tester.tap(target);
      await tester.pumpAndSettle();
    }

    Future<void> fill(String label, String value) async {
      final target = find.byWidgetPredicate(
        (w) => w is TextField && w.decoration?.labelText == label,
      );
      await tester.ensureVisible(target);
      await tester.enterText(target, value);
      FocusManager.instance.primaryFocus?.unfocus();
      await tester.pumpAndSettle();
    }

    try {
      await api.authenticate(true, {
        'name': 'Teste automatizado Android',
        'email': email,
        'password': password,
        'neighborhood_id': 'aurora',
      });
      created = true;
      await api.logout();
      app.main();
      await tester.pumpAndSettle();
      await tapText('Entrar');
      await fill('E-mail', email);
      await fill('Senha', password);
      await tapText('Entrar');
      await waitFor(find.text('VivaBairro'));
      await tapText('Publicar');
      await fill('Título', title);
      await fill('Local', 'Praça fictícia de teste');
      await fill(
        'O que aconteceu?',
        'Publicação fictícia criada pelo teste automatizado Android.',
      );
      await tapText('Revisar e publicar');
      await tapText('Confirmar');
      await tapText('Meu perfil');
      await tapText(title);
      await tapText('Editar publicação');
      await fill('Título', '$title editado');
      await tapText('Salvar alterações');
      await tapText('Confirmar');
      expect(find.text('$title editado'), findsOneWidget);
      await tapText('Marcar como resolvido');
      expect(find.text('Jardim Aurora • Resolvido'), findsOneWidget);
      await tapText('Remover publicação');
      await tapText('Confirmar');
      expect(find.text('Jardim Aurora • Removido'), findsOneWidget);
      expect(tester.takeException(), isNull);
    } finally {
      await tester.pumpWidget(const SizedBox.shrink());
      if (created) {
        await api.authenticate(false, {'email': email, 'password': password});
        await api.call(
          '/api/me',
          method: 'DELETE',
          body: {'password': password, 'confirmation': 'EXCLUIR'},
        );
      }
      if (previousSession == null) {
        await storage.delete(key: 'session');
      } else {
        await storage.write(key: 'session', value: previousSession);
      }
      api.dispose();
    }
  });
}
