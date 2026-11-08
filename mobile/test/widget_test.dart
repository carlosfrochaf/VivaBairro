import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:vivabairro/visual.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vivabairro/api.dart';
import 'package:vivabairro/screens/auth.dart';
import 'package:vivabairro/screens/account_security.dart';
import 'package:vivabairro/screens/editor.dart';
import 'package:vivabairro/screens/detail.dart';
import 'package:vivabairro/screens/profile.dart';
import 'package:vivabairro/screens/home.dart';
import 'package:vivabairro/ui.dart';

class FakeApi extends Api {
  int calls = 0;
  bool failPublish = false;
  FakeApi() {
    account = {
      'id': 'person',
      'name': 'Morador',
      'neighborhood_id': 'a',
      'roles': [],
      'email': 'morador@vivabairro.test',
      'follows': <String>[],
    };
  }
  @override
  Future<Json> call(String path, {String method = 'GET', Json? body}) async {
    calls++;
    if (path == '/api/neighborhoods') {
      return {
        'items': [
          {'id': 'a', 'name': 'Bairro A', 'municipality_name': 'Município'},
        ],
      };
    }
    if (path == '/api/me/overview') {
      return {
        'counts': {'activities': 0, 'notices': 0, 'neighborhoods': 1},
        'activities': [],
        'notices': [],
      };
    }
    if (path == '/api/moderation' ||
        path == '/api/moderation/appeals' ||
        path == '/api/admin/moderators' ||
        path == '/api/notifications') {
      return {'items': []};
    }
    if (path.startsWith('/api/posts?')) {
      return {'items': [], 'hasMore': false};
    }
    if (failPublish) {
      throw ApiError('Falha de conexão. Seu rascunho continua salvo.');
    }
    return {'id': 'post'};
  }
}

void main() {
  testWidgets('saudação do feed tem foco limitado ao próprio título', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    try {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(body: FeedScreen(api: FakeApi())),
        ),
      );
      await tester.pumpAndSettle();
      final node = tester.getSemantics(find.text('Olá!'));
      expect(node.getSemanticsData().label, 'Olá!');
      expect(node.rect.height, lessThan(80));
      expect(node.getSemanticsData().flagsCollection.isHeader, isTrue);
    } finally {
      handle.dispose();
    }
  });

  testWidgets('cartão anuncia ação, título e estado ao leitor de tela', (
    tester,
  ) async {
    final semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: PostCard({
            'kind': 'notice',
            'title': 'Árvore caída na praça',
            'author_name': 'Morador',
            'state': 'aberto',
            'visibility': 'visible',
          }, onTap: () {}),
        ),
      ),
    );
    final node = tester.getSemantics(find.byType(PostCard));
    expect(node.getSemanticsData().flagsCollection.isButton, isTrue);
    expect(node.getSemanticsData().label, contains('Árvore caída na praça'));
    expect(node.getSemanticsData().label, contains('Aberto'));
    expect(node.getSemanticsData().hasAction(SemanticsAction.tap), isTrue);
    semantics.dispose();
  });
  testWidgets('títulos de seção são identificados como cabeçalhos', (
    tester,
  ) async {
    final semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: SectionTitle('Seus avisos'))),
    );
    expect(
      tester
          .getSemantics(find.text('Seus avisos'))
          .getSemanticsData()
          .flagsCollection
          .isHeader,
      isTrue,
    );
    semantics.dispose();
  });

  for (final name in [
    'perfil',
    'segurança',
    'moderadores',
    'moderação',
    'notificações',
  ]) {
    testWidgets('$name com fonte ampliada em tela estreita', (tester) async {
      tester.view.physicalSize = const Size(320, 800);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      final api = FakeApi();
      final screen = switch (name) {
        'perfil' => Scaffold(body: ProfileScreen(api: api)),
        'segurança' => AccountSecurityScreen(api: api),
        'moderadores' => ModeratorsScreen(api: api),
        'moderação' => ModerationScreen(api: api),
        _ => NotificationsScreen(api: api),
      };
      await tester.pumpWidget(
        MaterialApp(
          builder: (context, child) => MediaQuery(
            data: MediaQuery.of(context)
                .copyWith(textScaler: const TextScaler.linear(2)),
            child: child!,
          ),
          home: screen,
        ),
      );
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      if (find.byType(Scrollable).evaluate().isNotEmpty) {
        await tester.drag(
          find.byType(Scrollable).first,
          const Offset(0, -1500),
        );
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
      }
    });
  }

  testWidgets(
    'motivo com fonte ampliada e teclado permite rolar sem overflow',
    (tester) async {
      tester.view.physicalSize = const Size(360, 800);
      tester.view.devicePixelRatio = 1;
      tester.view.viewInsets = const FakeViewPadding(bottom: 300);
      addTearDown(tester.view.reset);
      await tester.pumpWidget(
        MaterialApp(
          builder: (context, child) => MediaQuery(
            data: MediaQuery.of(context)
                .copyWith(textScaler: const TextScaler.linear(2)),
            child: child!,
          ),
          home: Scaffold(
            body: Builder(
              builder: (context) => TextButton(
                onPressed: () => askReason(
                  context,
                  'Denunciar publicação',
                  'Explique o motivo. A moderação vai analisar o contexto antes de decidir.',
                ),
                child: const Text('Abrir'),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Abrir'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      await tester.ensureVisible(find.text('Enviar'));
      expect(tester.getRect(find.text('Enviar')).bottom, lessThan(500));
    },
  );
  testWidgets('categoria de aviso cabe em tela estreita com fonte ampliada', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({});
    tester.view.physicalSize = const Size(320, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        builder: (context, child) => MediaQuery(
          data: MediaQuery.of(context)
              .copyWith(textScaler: const TextScaler.linear(2)),
          child: child!,
        ),
        home: EditorScreen(api: FakeApi()),
      ),
    );
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Ajuda e serviços'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
  });
  testWidgets('recuperação impede senha curta sem fazer requisição', (
    tester,
  ) async {
    final api = FakeApi();
    await tester.pumpWidget(MaterialApp(home: RecoveryScreen(api: api)));
    await tester.tap(find.text('Já tenho um código'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Salvar nova senha'));
    await tester.pumpAndSettle();
    expect(
      find.text('Use pelo menos 12 caracteres e repita a mesma senha.'),
      findsOneWidget,
    );
    expect(api.calls, 0);
  });
  testWidgets('login indica erros sem enviar dados inválidos', (tester) async {
    final api = FakeApi();
    await tester.pumpWidget(MaterialApp(home: AuthScreen(api: api)));
    await tester.tap(find.widgetWithText(FilledButton, 'Entrar'));
    await tester.pumpAndSettle();
    expect(find.text('Informe um e-mail válido.'), findsOneWidget);
    expect(find.text('Informe sua senha.'), findsOneWidget);
    expect(api.calls, 0);
  });
  testWidgets(
    'boas-vindas com texto ampliado não transborda e permite cadastrar',
    (tester) async {
      tester.view.physicalSize = const Size(360, 800);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      await tester.pumpWidget(
        MaterialApp(
          builder: (context, child) => MediaQuery(
            data: MediaQuery.of(context)
                .copyWith(textScaler: const TextScaler.linear(2)),
            child: child!,
          ),
          home: WelcomeScreen(api: FakeApi()),
        ),
      );
      expect(tester.takeException(), isNull);
      await tester.ensureVisible(find.text('Criar minha conta'));
      await tester.pumpAndSettle();
      expect(find.text('Criar minha conta'), findsOneWidget);
    },
  );
  testWidgets(
    'rascunho é recuperado e continua salvo quando a publicação falha',
    (tester) async {
      SharedPreferences.setMockInitialValues({
        'draft:person:new': '{"kind":"notice","title":"Título recuperado","description":"Descrição do rascunho salvo","location":"Praça central","neighborhood_id":"a","category":"ajuda"}',
      });
      final api = FakeApi()..failPublish = true;
      await tester.pumpWidget(MaterialApp(home: EditorScreen(api: api)));
      await tester.pumpAndSettle();
      expect(find.text('Título recuperado'), findsOneWidget);
      await tester.ensureVisible(find.text('Revisar e publicar'));
      await tester.tap(find.text('Revisar e publicar'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Confirmar'));
      await tester.pumpAndSettle();
      expect(
        find.text('Falha de conexão. Seu rascunho continua salvo.'),
        findsOneWidget,
      );
      final prefs = await SharedPreferences.getInstance();
      expect(
        prefs.getString('draft:person:new'),
        contains('Título recuperado'),
      );
    },
  );
  test('estado de evento comunica lotação e cancelamento por texto', () {
    final p = {
      'kind': 'event',
      'visibility': 'visible',
      'state': 'aberto',
      'starts_at': DateTime.now()
          .add(const Duration(days: 1))
          .toIso8601String(),
      'ends_at': DateTime.now().add(const Duration(days: 2)).toIso8601String(),
      'capacity': 1,
      'participants': 1,
    };
    expect(postState(p), 'Lotado');
    p['state'] = 'cancelado';
    expect(postState(p), 'Cancelado');
  });
  testWidgets(
    'card do evento mantém título e estado legíveis com texto ampliado',
    (tester) async {
      tester.view.physicalSize = const Size(360, 800);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      final post = <String, dynamic>{
        'kind': 'event',
        'title': 'Mutirão para cuidar dos espaços públicos do nosso bairro',
        'starts_at': DateTime.now()
            .add(const Duration(days: 1))
            .toIso8601String(),
        'ends_at': DateTime.now()
            .add(const Duration(days: 2))
            .toIso8601String(),
        'participants': 20,
        'capacity': 20,
        'visibility': 'visible',
        'state': 'aberto',
      };
      await tester.pumpWidget(
        MaterialApp(
          builder: (context, child) => MediaQuery(
            data: MediaQuery.of(context)
                .copyWith(textScaler: const TextScaler.linear(2)),
            child: child!,
          ),
          home: Scaffold(
            body: SingleChildScrollView(child: PostCard(post, onTap: () {})),
          ),
        ),
      );
      expect(tester.takeException(), isNull);
      expect(find.text(post['title']), findsOneWidget);
      expect(find.text('Lotado'), findsOneWidget);
    },
  );
}
