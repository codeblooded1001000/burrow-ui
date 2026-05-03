export type ConversationTabParam = 'active' | 'requests' | 'all';

export function isConversationTabParam(v: string | null): v is ConversationTabParam {
  return v === 'active' || v === 'requests' || v === 'all';
}

export function parseConversationTab(v: string | null | undefined): ConversationTabParam {
  if (v && isConversationTabParam(v)) return v;
  return 'active';
}
