import type { Metadata } from 'next';
import { LegalDocument } from '@/components/legal-document';
import { siteUrl } from '@/lib/site';
export const metadata: Metadata = { title: 'Политика обработки персональных данных', description: 'Порядок обработки данных посетителей школы VOLTA.', robots: { index: false, follow: true }, openGraph: { title: 'Политика обработки персональных данных | VOLTA', ...(siteUrl ? { url: `${siteUrl}/privacy` } : {}) }, ...(siteUrl ? { alternates: { canonical: `${siteUrl}/privacy` } } : {}) };
export default function Privacy() { return <LegalDocument />; }
