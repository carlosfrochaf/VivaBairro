import 'package:flutter/material.dart';

import 'ui.dart';

/// Formas vetoriais do protótipo, sem baixar imagens ou simular fotos de eventos.
class NeighborhoodMark extends StatelessWidget {
  const NeighborhoodMark({super.key});
  @override
  Widget build(BuildContext context) => const SizedBox(
    width: 88,
    height: 88,
    child: CustomPaint(painter: _MarkPainter()),
  );
}

class _MarkPainter extends CustomPainter {
  const _MarkPainter();
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawCircle(const Offset(44, 44), 44, Paint()..color = yellow);
    final line = Paint()
      ..color = navy
      ..style = PaintingStyle.stroke
      ..strokeWidth = 5
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(
      Path()
        ..moveTo(20, 49)
        ..cubicTo(37, 18, 50, 17, 68, 49),
      line,
    );
    canvas.drawLine(const Offset(24, 58), const Offset(64, 58), line);
    canvas.drawLine(const Offset(32, 34), const Offset(32, 17), line);
    canvas.drawLine(const Offset(56, 34), const Offset(56, 17), line);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class EventCover extends StatelessWidget {
  final bool green;
  final double height;
  const EventCover({this.green = false, this.height = 88, super.key});
  @override
  Widget build(BuildContext context) => ExcludeSemantics(
    child: ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: SizedBox(
        height: height,
        width: double.infinity,
        child: CustomPaint(painter: _CoverPainter(green)),
      ),
    ),
  );
}

class _CoverPainter extends CustomPainter {
  final bool green;
  const _CoverPainter(this.green);
  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    canvas.drawRect(
      rect,
      Paint()
        ..shader = LinearGradient(
          colors: green
              ? const [Color(0xFF9ADAC4), Color(0xFF4B9BA2)]
              : const [Color(0xFFFFB36B), Color(0xFFFF765F)],
        ).createShader(rect),
    );
    canvas.drawCircle(
      Offset(size.width * .82, size.height * .35),
      size.height * .19,
      Paint()..color = (green ? Colors.white : yellow).withValues(alpha: .7),
    );
    canvas.drawPath(
      Path()
        ..moveTo(0, size.height * .87)
        ..cubicTo(
          size.width * .25,
          size.height * .65,
          size.width * .4,
          size.height * .92,
          size.width * .55,
          size.height * .75,
        )
        ..cubicTo(
          size.width * .7,
          size.height * .6,
          size.width * .8,
          size.height * .72,
          size.width,
          size.height * .55,
        )
        ..lineTo(size.width, size.height)
        ..lineTo(0, size.height)
        ..close(),
      Paint()
        ..color = (green ? teal : const Color(0xFFE47A43)).withValues(
          alpha: .3,
        ),
    );
  }

  @override
  bool shouldRepaint(covariant _CoverPainter oldDelegate) =>
      oldDelegate.green != green;
}

class SectionTitle extends StatelessWidget {
  final String text;
  const SectionTitle(this.text, {super.key});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 24, bottom: 12),
    child: Semantics(
      header: true,
      child: Text(
        text,
        style: Theme.of(context).textTheme.titleLarge
            ?.copyWith(fontWeight: FontWeight.w800),
      ),
    ),
  );
}
