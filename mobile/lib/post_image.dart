import 'package:flutter/material.dart';

import 'api.dart';
import 'visual.dart';

class PostImage extends StatelessWidget {
  final Api api;
  final String? id;
  final double height;
  final bool green;
  const PostImage({
    required this.api,
    this.id,
    this.height = 100,
    this.green = false,
    super.key,
  });
  @override
  Widget build(BuildContext context) => id == null
      ? EventCover(height: height, green: green)
      : ClipRRect(
          borderRadius: BorderRadius.circular(14),
          child: Image.network(
            '${Api.baseUrl}/api/media/$id',
            headers: api.imageHeaders,
            height: height,
            width: double.infinity,
            fit: BoxFit.cover,
            semanticLabel: 'Imagem da publicação',
            loadingBuilder: (context, child, progress) => progress == null
                ? child
                : SizedBox(
                    height: height,
                    child: const Center(child: CircularProgressIndicator()),
                  ),
            errorBuilder: (_, error, stack) => SizedBox(
              height: height,
              child: const Center(child: Text('Imagem indisponível')),
            ),
          ),
        );
}
