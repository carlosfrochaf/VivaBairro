import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:vivabairro/api.dart';

void main() {
  testWidgets(
    'abertura aguarda serviço lento além do limite das outras chamadas',
    (tester) async {
      final api = Api(
        client: MockClient((_) async {
          await Future<void>.delayed(const Duration(seconds: 30));
          return http.Response('{"demo":false}', 200);
        }),
      );
      Json? result;
      final request = api.call('/api/config').then((value) => result = value);
      await tester.pump();
      await tester.pump(const Duration(seconds: 30));
      await request;
      expect(result, {'demo': false});
      api.dispose();
    },
  );
  test(
    'desafio de hospedagem não é apresentado como senha ou internet inválida',
    () async {
      final api = Api(
        client: MockClient(
          (_) async => http.Response(
            '<html>Just a moment...</html>',
            403,
            headers: {'cf-mitigated': 'challenge', 'content-type': 'text/html'},
          ),
        ),
      );
      await expectLater(
        api.call('/api/config'),
        throwsA(
          isA<ApiError>().having(
            (e) => e.message,
            'message',
            contains('verificação que o aplicativo não consegue concluir'),
          ),
        ),
      );
      api.dispose();
    },
  );
  test('resposta HTML inesperada tem mensagem recuperável', () async {
    final api = Api(
      client: MockClient(
        (_) async => http.Response('<html>Unavailable</html>', 503),
      ),
    );
    await expectLater(
      api.call('/api/config'),
      throwsA(
        isA<ApiError>().having(
          (e) => e.message,
          'message',
          contains('resposta inesperada'),
        ),
      ),
    );
    api.dispose();
  });
  test(
    'timeout de escrita orienta conferir o resultado antes de repetir',
    () async {
      final api = Api(
        client: MockClient((_) async => throw TimeoutException('teste')),
      );
      await expectLater(
        api.call('/api/posts', method: 'POST', body: {'title': 'Teste'}),
        throwsA(
          isA<ApiError>().having(
            (e) => e.message,
            'message',
            contains('Confira se a ação foi concluída'),
          ),
        ),
      );
      api.dispose();
    },
  );
  test('ações sem corpo não enviam Content-Type JSON vazio', () async {
    final api = Api(
      client: MockClient((request) async {
        expect(request.method, 'POST');
        expect(request.headers.containsKey('content-type'), isFalse);
        expect(request.body, isEmpty);
        return http.Response('{"ok":true}', 200);
      }),
    );
    expect(await api.call('/api/posts/id/attendance', method: 'POST'), {
      'ok': true,
    });
    api.dispose();
  });
  test(
    'erros de validação preservam a mensagem e os campos do servidor',
    () async {
      final api = Api(
        client: MockClient((request) async {
          expect(request.headers['content-type'], contains('application/json'));
          return http.Response(
            '{"message":"Confira o título.","fields":{"title":"Muito curto."}}',
            422,
            headers: {'content-type': 'application/json; charset=utf-8'},
          );
        }),
      );
      await expectLater(
        api.call('/api/posts', method: 'POST', body: {'title': 'a'}),
        throwsA(
          isA<ApiError>().having(
            (e) => e.fields['title'],
            'title',
            'Muito curto.',
          ),
        ),
      );
      api.dispose();
    },
  );
}
