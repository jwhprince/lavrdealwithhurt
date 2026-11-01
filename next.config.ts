import type { NextConfig } from 'next';
import { launchErrors } from './src/lib/launch';
const errors = launchErrors(process.env);
if (errors.length) throw new Error(`Ошибка конфигурации VOLTA:\n${errors.join('\n')}`);
const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ['image/webp'] },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ...(process.env.INDEXABLE === 'true' ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
    ] }];
  },
};
export default nextConfig;
