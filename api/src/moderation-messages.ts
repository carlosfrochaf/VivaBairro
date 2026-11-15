const outcomes: Record<string, string> = {
  keep: 'Conteúdo mantido',
  hide: 'Conteúdo ocultado',
  remove: 'Conteúdo removido',
  restore: 'Conteúdo restaurado',
  'request-change': 'Correção solicitada',
};
export function moderationMessage(action: string, reason: string): string {
  const review = ['hide', 'remove', 'request-change'].includes(action)
    ? ' Você pode pedir revisão em Meu perfil, em Revisões de moderação.'
    : '';
  return (outcomes[action] ?? 'Decisão de moderação registrada') + '. Motivo: ' + reason + review;
}
export function readableNotification(message: string): string {
  const legacy =
    /^Decisão de moderação \((keep|hide|remove|restore|request-change)\): ([\s\S]*)$/.exec(message);
  return legacy ? moderationMessage(legacy[1]!, legacy[2]!) : message;
}
