import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../api.dart';
import '../ui.dart';
import '../post_image.dart';

class EditorScreen extends StatefulWidget {
  final Api api;
  final Json? post;
  const EditorScreen({required this.api, this.post, super.key});
  @override
  State<EditorScreen> createState() => _EditorScreenState();
}

class _EditorScreenState extends State<EditorScreen> {
  final form = GlobalKey<FormState>();
  final title = TextEditingController(),
      description = TextEditingController(),
      location = TextEditingController(),
      capacity = TextEditingController(),
      issuer = TextEditingController();
  String kind = 'notice', category = 'ajuda';
  String? neighborhood, error;
  String? photoId;
  Uint8List? pendingPhoto;
  bool uploading = false;
  DateTime? start, end;
  List<dynamic> neighborhoods = [];
  bool busy = false, ready = false, restored = false, published = false;
  Json fields = {};
  Timer? timer;
  String get draftKey =>
      'draft:${widget.api.account!['id']}:${widget.post?['id'] ?? 'new'}';
  late final String key;
  @override
  void initState() {
    super.initState();
    key = draftKey;
    initialize();
  }

  Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(key);
      final d = saved == null ? widget.post : jsonDecode(saved) as Json;
      if (d != null) {
        kind = d['kind'];
        photoId = d['photo_id'];
        if (d['_pending_photo'] != null) {
          pendingPhoto = base64Decode(d['_pending_photo']);
        }
        title.text = d['title'] ?? '';
        description.text = d['description'] ?? '';
        location.text = d['location'] ?? '';
        capacity.text = d['capacity']?.toString() ?? '';
        issuer.text = d['issuer'] ?? '';
        category = d['category'] ?? 'ajuda';
        neighborhood = d['neighborhood_id'];
        start = DateTime.tryParse(d['starts_at'] ?? '')?.toLocal();
        end = DateTime.tryParse(d['ends_at'] ?? '')?.toLocal();
      }
      neighborhood ??= widget.api.account!['neighborhood_id'];
      final response = await widget.api.call('/api/neighborhoods');
      if (mounted) {
        setState(() {
          neighborhoods = response['items'];
          if (!neighborhoods.any((n) => n['id'] == neighborhood)) {
            neighborhood = null;
          }
          ready = true;
          restored = saved != null;
          error = null;
        });
      }
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
        final lost = await ImagePicker().retrieveLostData();
        if (lost.files?.isNotEmpty == true) {
          await acceptPhoto(lost.files!.first);
        }
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Json data() => {
    'kind': kind,
    'title': title.text.trim(),
    'description': description.text.trim(),
    'location': location.text.trim(),
    'neighborhood_id': neighborhood,
    'category': category,
    'starts_at': start?.toUtc().toIso8601String(),
    'ends_at': end?.toUtc().toIso8601String(),
    'capacity': int.tryParse(capacity.text),
    'issuer': issuer.text.isEmpty ? null : issuer.text.trim(),
    'photo_id': photoId,
  };
  void changed() {
    timer?.cancel();
    timer = Timer(const Duration(milliseconds: 350), saveDraft);
  }

  Future<void> saveDraft() async {
    if (!ready || published) return;
    final snapshot = jsonEncode({
      ...data(),
      if (pendingPhoto != null) '_pending_photo': base64Encode(pendingPhoto!),
    });
    final prefs = await SharedPreferences.getInstance();
    if (!published) await prefs.setString(key, snapshot);
  }

  Future<void> pickDate(bool first) async {
    final now = DateTime.now();
    final initial = (first ? start : end) ?? now.add(const Duration(days: 1));
    final date = await showDatePicker(
      context: context,
      initialDate: initial.isBefore(now) ? now : initial,
      firstDate: DateTime(now.year, now.month, now.day),
      lastDate: now.add(const Duration(days: 730)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(initial),
    );
    if (time == null || !mounted) return;
    setState(() {
      final value = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );
      if (first) {
        start = value;
      } else {
        end = value;
      }
    });
    changed();
  }

  Future<void> acceptPhoto(XFile file) async {
    final bytes = await file.readAsBytes();
    if (!mounted) return;
    if (bytes.length > 2000000) {
      feedback(context, 'Escolha uma imagem de até 2 MB.');
      return;
    }
    setState(() => pendingPhoto = bytes);
    await saveDraft();
    await uploadPhoto();
  }

  Future<void> pickPhoto() async {
    await saveDraft();
    try {
      final file = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 80,
      );
      if (file != null) await acceptPhoto(file);
    } catch (e) {
      if (mounted) {
        setState(
          () => error = 'Não foi possível abrir a imagem. Tente outra foto.',
        );
      }
    }
  }

  Future<void> uploadPhoto() async {
    if (pendingPhoto == null) return;
    setState(() => uploading = true);
    try {
      final result = await widget.api.call(
        '/api/media',
        method: 'POST',
        body: {'data': base64Encode(pendingPhoto!)},
      );
      if (mounted) {
        setState(() {
          photoId = result['id'];
          pendingPhoto = null;
          error = null;
        });
      }
      await saveDraft();
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    } finally {
      if (mounted) setState(() => uploading = false);
    }
  }

  Future<void> submit() async {
    if (pendingPhoto != null) {
      await uploadPhoto();
      if (pendingPhoto != null) return;
    }
    setState(() => fields = {});
    if (!form.currentState!.validate()) return;
    if (kind == 'event' &&
        (start == null ||
            end == null ||
            !start!.isAfter(DateTime.now()) ||
            !end!.isAfter(start!))) {
      setState(
        () => error = 'Escolha um início futuro e um término depois do início.',
      );
      return;
    }
    await saveDraft();
    if (!mounted) return;
    final accepted = await confirm(
      context,
      widget.post == null ? 'Publicar para o bairro?' : 'Salvar alterações?',
      'Confira o local e as informações. Seu nome aparecerá como responsável pela publicação.',
    );
    if (!accepted || !mounted) return;
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await widget.api.call(
        widget.post == null ? '/api/posts' : '/api/posts/${widget.post!['id']}',
        method: widget.post == null ? 'POST' : 'PUT',
        body: data(),
      );
      published = true;
      timer?.cancel();
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(key);
      if (mounted) {
        feedback(context, 'Publicação salva.');
        Navigator.pop(context, true);
      }
    } on ApiError catch (e) {
      if (mounted) {
        setState(() {
          error = e.message;
          fields = e.fields;
        });
        form.currentState!.validate();
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Widget input(
    TextEditingController controller,
    String label,
    String field,
    int min,
    int max, {
    int lines = 1,
    String? help,
  }) => Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: TextFormField(
      controller: controller,
      minLines: lines,
      maxLines: lines,
      maxLength: max,
      decoration: InputDecoration(
        labelText: label,
        helperText: help,
        alignLabelWithHint: lines > 1,
      ),
      validator: (v) =>
          fields[field]?.toString() ??
          (v!.trim().length < min ? 'Use pelo menos $min caracteres.' : null),
    ),
  );
  @override
  void dispose() {
    timer?.cancel();
    if (!published) unawaited(saveDraft());
    for (final c in [title, description, location, capacity, issuer]) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(
        widget.post == null
            ? (kind == 'notice' ? 'Criar aviso' : 'Criar evento')
            : 'Editar publicação',
      ),
    ),
    body: !ready
        ? (error != null
              ? ErrorBox(error!, retry: initialize)
              : const Center(child: CircularProgressIndicator()))
        : PageBody(
            child: Form(
              key: form,
              onChanged: changed,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    widget.post != null
                        ? 'Editar publicação'
                        : kind == 'notice'
                        ? 'Criar aviso'
                        : kind == 'event'
                        ? 'Criar evento'
                        : 'Comunicado municipal',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    kind == 'notice'
                        ? 'Conte algo importante para o bairro.'
                        : 'Convide a comunidade para participar.',
                    style: const TextStyle(color: Color(0xFF5F6D7E)),
                  ),
                  const SizedBox(height: 24),
                  if (restored)
                    const Padding(
                      padding: EdgeInsets.only(bottom: 16),
                      child: Text('Rascunho recuperado neste dispositivo.'),
                    ),
                  if (widget.post == null) ...[
                    Wrap(
                      spacing: 8,
                      runSpacing: 12,
                      children: [
                        for (final k in [
                          'notice',
                          'event',
                          if (widget.api.isAdmin) 'official',
                        ])
                          ChoiceChip(
                            label: Text(kindLabel(k)),
                            selected: kind == k,
                            onSelected: busy
                                ? null
                                : (_) {
                                    setState(() => kind = k);
                                    changed();
                                  },
                          ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],
                  DropdownButtonFormField<String>(
                    itemHeight: null,
                    initialValue: neighborhood,
                    isExpanded: true,
                    decoration: const InputDecoration(
                      labelText: 'Bairro da publicação',
                    ),
                    items: neighborhoods
                        .map(
                          (n) => DropdownMenuItem<String>(
                            value: n['id'],
                            child: Text(n['name']),
                          ),
                        )
                        .toList(),
                    onChanged: (v) {
                      neighborhood = v;
                      changed();
                    },
                    validator: (v) => v == null ? 'Escolha um bairro.' : null,
                  ),
                  const SizedBox(height: 16),
                  input(title, 'Título', 'title', 5, 80),
                  input(
                    location,
                    'Local',
                    'location',
                    3,
                    120,
                    help: 'Informe um local ou ponto de referência.',
                  ),

                  input(
                    description,
                    kind == 'event' ? 'Detalhes do evento' : 'O que aconteceu?',
                    'description',
                    10,
                    1000,
                    lines: 5,
                  ),
                  if (kind == 'notice')
                    DropdownButtonFormField<String>(
                      itemHeight: null,
                      initialValue: category,
                      isExpanded: true,
                      decoration: const InputDecoration(labelText: 'Categoria'),
                      items: categories.entries
                          .map(
                            (e) => DropdownMenuItem(
                              value: e.key,
                              child: Text(e.value),
                            ),
                          )
                          .toList(),
                      onChanged: (v) {
                        category = v!;
                        changed();
                      },
                    ),
                  if (kind == 'event') ...[
                    OutlinedButton.icon(
                      onPressed: () => pickDate(true),
                      icon: const Icon(Icons.event),
                      label: Text(
                        start == null
                            ? 'Escolher início'
                            : 'Início: ${dateLabel(start!.toIso8601String())}',
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: () => pickDate(false),
                      icon: const Icon(Icons.schedule),
                      label: Text(
                        end == null
                            ? 'Escolher término'
                            : 'Término: ${dateLabel(end!.toIso8601String())}',
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: capacity,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Vagas (opcional)',
                        helperText: 'Em branco: sem limite de participantes.',
                      ),
                      validator: (v) =>
                          v!.isNotEmpty &&
                              (int.tryParse(v) == null ||
                                  int.parse(v) < 1 ||
                                  int.parse(v) > 5000)
                          ? 'Informe de 1 a 5.000 vagas.'
                          : null,
                    ),
                  ],
                  if (kind == 'official')
                    input(issuer, 'Órgão responsável', 'issuer', 2, 100),
                  const SizedBox(height: 20),
                  if (pendingPhoto != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.memory(
                        pendingPhoto!,
                        height: 180,
                        fit: BoxFit.cover,
                      ),
                    ),
                  if (pendingPhoto == null && photoId != null)
                    PostImage(api: widget.api, id: photoId, height: 180),
                  if (pendingPhoto != null || photoId != null)
                    const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: busy || uploading ? null : pickPhoto,
                    icon: const Icon(Icons.add_photo_alternate_outlined),
                    label: Text(
                      uploading
                          ? 'Enviando imagem…'
                          : photoId == null
                          ? 'Adicionar foto (opcional)'
                          : 'Trocar foto',
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'JPG, PNG ou WebP, até 2 MB. Evite rostos e dados pessoais sem autorização.',
                    style: TextStyle(fontSize: 12),
                  ),
                  if (photoId != null || pendingPhoto != null)
                    TextButton(
                      onPressed: uploading
                          ? null
                          : () {
                              setState(() {
                                photoId = null;
                                pendingPhoto = null;
                              });
                              changed();
                            },
                      child: const Text('Remover foto'),
                    ),
                  const SizedBox(height: 20),
                  const Text(
                    'Não divulgue dados pessoais de terceiros. Este espaço não substitui atendimento de emergência.',
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'O rascunho fica salvo neste dispositivo. A assistência de IA ainda não está disponível.',
                  ),
                  if (error != null) ErrorBox(error!),
                  const SizedBox(height: 24),
                  FilledButton(
                    style: kind == 'notice'
                        ? FilledButton.styleFrom(
                            backgroundColor: coral,
                            foregroundColor: navy,
                          )
                        : null,
                    onPressed: busy || uploading ? null : submit,
                    child: Text(
                      busy
                          ? 'Salvando…'
                          : widget.post == null
                          ? 'Revisar e publicar'
                          : 'Salvar alterações',
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: busy
                        ? null
                        : () async {
                            if (!await confirm(
                              context,
                              'Descartar rascunho?',
                              'O texto salvo neste dispositivo será apagado.',
                            )) {
                              return;
                            }
                            published = true;
                            timer?.cancel();
                            final prefs = await SharedPreferences.getInstance();
                            await prefs.remove(key);
                            if (context.mounted) Navigator.pop(context);
                          },
                    child: const Text('Descartar rascunho'),
                  ),
                ],
              ),
            ),
          ),
  );
}
