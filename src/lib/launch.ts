export function launchErrors(env: Record<string, string | undefined>, requireProduction = false): string[] {
  const errors: string[] = [];
  const requireKeys = (keys: string[]) => { for (const key of keys) if (!env[key]?.trim()) errors.push(`Не заполнено ${key}`); };
  if (env.SITE_URL) {
    try {
      const url = new URL(env.SITE_URL);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') errors.push('SITE_URL должен содержать только http(s) origin, без пути и параметров');
      if (env.INDEXABLE === 'true' || requireProduction) {
        if (url.protocol !== 'https:' || !url.hostname.includes('.') || /(^localhost$|\.example$|\.test$|\.localhost$|\.invalid$|^127\.|^0\.|^192\.168\.|^10\.)/.test(url.hostname)) errors.push('Для публикации нужен реальный публичный HTTPS-домен');
      }
    } catch { errors.push('SITE_URL не является корректным URL'); }
  }
  if (env.LEGAL_APPROVED === 'true' || env.LEADS_ENABLED === 'true' || env.INDEXABLE === 'true' || requireProduction) {
    requireKeys(['LEGAL_OPERATOR', 'LEGAL_INN', 'LEGAL_ADDRESS', 'PRIVACY_EMAIL', 'LEGAL_RETENTION']);
  }
  if (env.LEADS_ENABLED === 'true' || env.INDEXABLE === 'true' || requireProduction) {
    requireKeys(['SITE_URL', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'LEADS_EMAIL']);
    if (env.LEGAL_APPROVED !== 'true') errors.push('Документы должны быть проверены: LEGAL_APPROVED=true');
    if (!['true', 'false'].includes(env.SMTP_SECURE || '')) errors.push('SMTP_SECURE должен быть true или false');
    const port = Number(env.SMTP_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) errors.push('SMTP_PORT должен быть от 1 до 65535');
  }
  if (env.INDEXABLE === 'true' || requireProduction) {
    requireKeys(['SITE_URL', 'CONTACT_PHONE', 'CONTACT_EMAIL']);
    if (env.LEADS_ENABLED !== 'true') errors.push('Перед публикацией включите и проверьте LEADS_ENABLED');
    if (env.TRUST_PROXY !== 'true') errors.push('Для production настройте доверенный reverse proxy и TRUST_PROXY=true');
  }
  for (const field of ['CONTACT_EMAIL', 'PRIVACY_EMAIL', 'MAIL_FROM', 'LEADS_EMAIL']) {
    if (env[field] && !/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(env[field]!)) errors.push(`Некорректный адрес ${field}`);
  }
  if (env.CONTACT_PHONE && !/^\+?[\d\s()-]{10,24}$/.test(env.CONTACT_PHONE)) errors.push('Некорректный CONTACT_PHONE');
  for (const field of ['SOCIAL_VK', 'SOCIAL_TELEGRAM']) {
    if (env[field]) { try { if (new URL(env[field]!).protocol !== 'https:') errors.push(`${field} должен использовать HTTPS`); } catch { errors.push(`Некорректный ${field}`); } }
  }
  if (env.METRIKA_ENABLED === 'true') {
    if (!/^\d+$/.test(env.METRIKA_ID || '')) errors.push('Укажите числовой METRIKA_ID');
    if (env.LEGAL_APPROVED !== 'true') errors.push('Метрика требует согласованной политики обработки данных');
  }
  return [...new Set(errors)];
}
