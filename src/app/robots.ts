import type { MetadataRoute } from 'next';
import { indexable, siteUrl } from '@/lib/site';
export default function robots(): MetadataRoute.Robots {
  return indexable ? { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }], sitemap: `${siteUrl}/sitemap.xml` } : { rules: { userAgent: '*', disallow: '/' } };
}
