import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'api.dart';
import 'ui.dart';
import 'screens/auth.dart';
import 'screens/home.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const VivaBairroApp());
}

class VivaBairroApp extends StatelessWidget {
  const VivaBairroApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'VivaBairro',
    locale: const Locale('pt', 'BR'),
    supportedLocales: const [Locale('pt', 'BR')],
    localizationsDelegates: GlobalMaterialLocalizations.delegates,
    debugShowCheckedModeBanner: false,
    builder: (context, child) => LayoutBuilder(
      builder: (context, constraints) {
        final framed = kIsWeb && constraints.maxWidth > 540;
        return ColoredBox(
          color: const Color(0xFFF1F4F8),
          child: Center(
            child: Container(
              width: framed ? 480 : constraints.maxWidth,
              margin: framed
                  ? const EdgeInsets.symmetric(vertical: 24)
                  : EdgeInsets.zero,
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(framed ? 28 : 0),
                boxShadow: framed
                    ? [
                        const BoxShadow(
                          color: Color(0x2214253D),
                          blurRadius: 24,
                          offset: Offset(0, 10),
                        ),
                      ]
                    : [],
              ),
              child: MediaQuery(
                data: MediaQuery.of(context).copyWith(
                  size: Size(
                    framed ? 480 : constraints.maxWidth,
                    constraints.maxHeight - (framed ? 48 : 0),
                  ),
                ),
                child: child!,
              ),
            ),
          ),
        );
      },
    ),
    theme: ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: teal,
        primary: teal,
        secondary: navy,
      ),
      scaffoldBackgroundColor: const Color(0xFFFBFCFE),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFFFBFCFE),
        foregroundColor: navy,
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          fontSize: 27,
          fontWeight: FontWeight.w800,
          color: navy,
        ),
        headlineSmall: TextStyle(
          fontSize: 26,
          fontWeight: FontWeight.w800,
          color: navy,
        ),
        titleLarge: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w800,
          color: navy,
        ),
        titleMedium: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w700,
          color: navy,
        ),
        bodyLarge: TextStyle(fontSize: 15, color: navy),
      ),
      navigationBarTheme: const NavigationBarThemeData(
        backgroundColor: Colors.white,
        indicatorColor: mint,
        height: 76,
      ),
      inputDecorationTheme: InputDecorationTheme(
        helperMaxLines: 4,
        errorMaxLines: 4,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFC4CFDB)),
        ),
        filled: true,
        fillColor: Colors.white,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(0, 56),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(0, 52),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFD9E5E5)),
        ),
      ),
    ),
    home: const SessionGate(),
  );
}

class SessionGate extends StatefulWidget {
  const SessionGate({super.key});
  @override
  State<SessionGate> createState() => _SessionGateState();
}

class _SessionGateState extends State<SessionGate> {
  final api = Api();
  bool loading = true;
  String? error;
  @override
  void initState() {
    super.initState();
    restore();
  }

  Future<void> restore() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      await api.restore();
    } catch (e) {
      error = e.toString();
    }
    if (mounted) setState(() => loading = false);
  }

  @override
  void dispose() {
    api.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (error != null) {
      return Scaffold(
        body: Center(child: ErrorBox(error!, retry: restore)),
      );
    }
    return ListenableBuilder(
      listenable: api,
      builder: (context, _) => api.account == null
          ? WelcomeScreen(api: api)
          : HomeScreen(key: ValueKey(api.account!['id']), api: api),
    );
  }
}
