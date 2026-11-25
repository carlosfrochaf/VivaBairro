import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

typedef Json = Map<String, dynamic>;

class ApiError implements Exception {
  final String message;
  final Json fields;
  ApiError(this.message, [this.fields = const {}]);
  @override
  String toString() => message;
}

class Api extends ChangeNotifier {
  static const fair = bool.fromEnvironment('EXPOUNA');
  static final baseUrl = kIsWeb && fair
      ? Uri.base.origin
      : const String.fromEnvironment(
          'API_URL',
          defaultValue: kIsWeb
              ? 'http://127.0.0.1:3001'
              : 'http://10.0.2.2:3001',
        );
  final FlutterSecureStorage _storage;
  final http.Client _client;
  Api({http.Client? client, FlutterSecureStorage? storage})
    : _client = client ?? http.Client(),
      _storage = storage ?? const FlutterSecureStorage();
  String? _token;
  Json? account;
  bool demo = false;
  Map<String, String> get imageHeaders => {
    if (_token != null) 'Authorization': 'Bearer $_token',
  };
  bool get isAdmin =>
      (account?['roles'] as List? ?? []).any((r) => r['role'] == 'admin');
  bool get canModerate => (account?['roles'] as List? ?? []).isNotEmpty;
  Future<Json> call(String path, {String method = 'GET', Json? body}) async {
    try {
      final request = http.Request(method, Uri.parse('$baseUrl$path'));
      if (body != null) request.headers['Content-Type'] = 'application/json';
      if (_token != null) request.headers['Authorization'] = 'Bearer $_token';
      if (body != null) request.body = jsonEncode(body);
      final response =
          await (() async => http.Response.fromStream(
            await _client.send(request),
          ))().timeout(
            Duration(
              seconds: path == '/api/config' && method == 'GET' ? 60 : 15,
            ),
          );
      if (response.headers['cf-mitigated'] == 'challenge') {
        throw ApiError(
          'O serviço está exigindo uma verificação que o aplicativo não consegue concluir. Tente mais tarde. Se continuar, avise a equipe do VivaBairro.',
        );
      }
      final data = jsonDecode(response.body) as Json;
      if (response.statusCode >= 400) {
        if (response.statusCode == 401 && !path.startsWith('/api/auth')) {
          _token = null;
          account = null;
          await _storage.delete(key: 'session');
          notifyListeners();
        }
        throw ApiError(
          data['message'] ?? 'Não foi possível concluir.',
          Map<String, dynamic>.from(data['fields'] ?? {}),
        );
      }
      return data;
    } on ApiError {
      rethrow;
    } on TimeoutException {
      throw ApiError(
        method == 'GET'
            ? 'O servidor demorou para responder. No primeiro acesso, ele pode levar cerca de um minuto para iniciar. Tente novamente.'
            : 'A resposta demorou e não foi possível confirmar o resultado. Confira se a ação foi concluída antes de repetir.',
      );
    } on FormatException {
      throw ApiError(
        'O serviço enviou uma resposta inesperada. Tente mais tarde. Se continuar, avise a equipe do VivaBairro.',
      );
    } catch (_) {
      throw ApiError(
        'Não foi possível conectar. Confira sua conexão e tente novamente.',
      );
    }
  }

  Future<void> restore() async {
    demo = (await call('/api/config'))['demo'] == true;
    _token = await _storage.read(key: 'session');
    if (_token == null) return;
    try {
      account = await call('/api/me');
    } on ApiError {
      if (_token != null) rethrow;
    }
  }

  Future<void> authenticate(bool register, Json data) async {
    final result = await call(
      '/api/auth/${register ? 'register' : 'login'}',
      method: 'POST',
      body: data,
    );
    await saveSession(result);
  }

  Future<void> visitFair() async {
    await saveSession(await call('/api/fair/visitors', method: 'POST'));
  }

  Future<void> saveSession(Json result) async {
    _token = result['token'];
    await _storage.write(key: 'session', value: _token);
    account = await call('/api/me');
    notifyListeners();
  }

  Future<void> refreshProfile() async {
    account = await call('/api/me');
    notifyListeners();
  }

  Future<void> logout() async {
    await call('/api/auth/session', method: 'DELETE');
    await clearSession();
  }

  Future<void> clearSession() async {
    _token = null;
    account = null;
    await _storage.delete(key: 'session');
    notifyListeners();
  }

  @override
  void dispose() {
    _client.close();
    super.dispose();
  }
}
