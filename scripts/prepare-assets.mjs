import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
await mkdir('public/images', { recursive: true });
// Only size/format optimization; originals in materoial remain unchanged.
for (const [input, output] of [['Логотип.jpg', 'logo'], ['2 блок.jpg', 'dance'], ['4 блок.jpg', 'founder'], ['6 блок.jpg', 'trial']]) {
  await sharp(`materoial/${input}`).rotate().webp({ quality: 88 }).toFile(`public/images/${output}.webp`);
}
await sharp('materoial/Логотип.jpg').resize(1200, 630, { fit: 'contain', background: '#f6dbd9' }).jpeg({ quality: 90 }).toFile('public/images/social.jpg');
console.log('Оптимизированы четыре фото и изображение для социальных сетей.');
