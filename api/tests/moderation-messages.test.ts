import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moderationMessage, readableNotification } from '../src/moderation-messages.js';
test('notificações de moderação informam resultado e caminho para revisão', () => {
  for (const [action, label] of Object.entries({
    keep: 'Conteúdo mantido',
    hide: 'Conteúdo ocultado',
    remove: 'Conteúdo removido',
    restore: 'Conteúdo restaurado',
    'request-change': 'Correção solicitada',
  })) {
    const text = moderationMessage(action, 'Motivo com acentuação.');
    assert.ok(text.startsWith(label));
    assert.ok(text.includes('Motivo com acentuação.'));
    assert.equal(
      text.includes('Você pode pedir revisão'),
      ['hide', 'remove', 'request-change'].includes(action),
    );
    assert.equal(
      readableNotification('Decisão de moderação (' + action + '): Motivo com acentuação.'),
      text,
    );
  }
  assert.equal(
    readableNotification('Nova resposta no aviso: Teste'),
    'Nova resposta no aviso: Teste',
  );
});
