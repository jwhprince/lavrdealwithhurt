import type { Metadata } from 'next';
import { LegalDocument } from '@/components/legal-document';
import { siteUrl } from '@/lib/site';
export const metadata: Metadata = { title: 'Согласие на обработку персональных данных', description: 'Согласие на обработку данных при записи в школу VOLTA.', robots: { index: false, follow: true }, openGraph: { title: 'Согласие на обработку персональных данных | VOLTA', ...(siteUrl ? { url: `${siteUrl}/consent` } : {}) }, ...(siteUrl ? { alternates: { canonical: `${siteUrl}/consent` } } : {}) };
export default function Consent() { return <LegalDocument consent />; }
