export const site = {
  name: 'VOLTA',
  title: 'Школа танцев VOLTA в Митино, Москва — бальные танцы, Baby-dance, латина',
  description: 'Танцевальный спорт, Baby-dance и латина для детей и взрослых в школе VOLTA в Митино. Индивидуальный подход и бесплатное пробное занятие. Москва, Пятницкое шоссе, 25к1.',
  address: 'Москва, Пятницкое шоссе, 25к1',
  mapUrl: 'https://yandex.ru/maps/?text=' + encodeURIComponent('Москва, Пятницкое шоссе, 25к1'),
  phone: process.env.CONTACT_PHONE || '',
  email: process.env.CONTACT_EMAIL || '',
  operator: process.env.LEGAL_OPERATOR || '',
  inn: process.env.LEGAL_INN || '',
  legalAddress: process.env.LEGAL_ADDRESS || '',
  privacyEmail: process.env.PRIVACY_EMAIL || '',
  retention: process.env.LEGAL_RETENTION || '',
  vk: process.env.SOCIAL_VK || '',
  telegram: process.env.SOCIAL_TELEGRAM || '',
};

export const siteUrl = process.env.SITE_URL?.replace(/\/$/, '') || undefined;
export const indexable = process.env.INDEXABLE === 'true' && !!siteUrl;
export const legalReady = process.env.LEGAL_APPROVED === 'true' &&
  !!site.operator && !!site.inn && !!site.legalAddress && !!site.privacyEmail && !!site.retention;
export const leadsEnabled = process.env.LEADS_ENABLED === 'true' && legalReady;
export const metrikaId = process.env.METRIKA_ENABLED === 'true' && legalReady && /^\d+$/.test(process.env.METRIKA_ID || '')
  ? Number(process.env.METRIKA_ID) : undefined;

export const directions = [
  { id: 'sport', name: 'Танцевальный спорт', subtitle: 'Бальные танцы', description: 'Движение в паре, музыкальность и красота каждого шага. От первых танцевальных движений — к выступлениям и соревнованиям.' },
  { id: 'baby', name: 'Baby-dance', subtitle: 'Знакомство с танцем', description: 'Первые шаги в мире музыки и движения. Бережное знакомство с танцем и внимание к каждому маленькому ученику.' },
  { id: 'latina', name: 'Латина', subtitle: 'Ритм и характер', description: 'Выразительность, энергия и свобода движения. Откройте для себя танец, в котором можно быть собой.' },
] as const;

// Add confirmed ages, prices and schedule here when provided. Never render placeholders.
export const programDetails: Partial<Record<typeof directions[number]['id'], { age?: string; price?: string; schedule?: string }>> = {};

export function organizationSchema() {
  return {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'Школа танцев VOLTA',
    description: site.description,
    ...(siteUrl ? { url: siteUrl, image: `${siteUrl}/images/logo.webp` } : {}),
    ...(site.phone ? { telephone: site.phone } : {}),
    ...(site.email ? { email: site.email } : {}),
    address: { '@type': 'PostalAddress', streetAddress: 'Пятницкое шоссе, 25к1', addressLocality: 'Москва', addressCountry: 'RU' },
    sameAs: [site.vk, site.telegram].filter(Boolean),
  };
}
