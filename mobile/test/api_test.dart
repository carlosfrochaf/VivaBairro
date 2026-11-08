import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:vivabairro/api.dart';

void main() {
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
