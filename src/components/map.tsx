'use client';
import { useState } from 'react';
import { Arrow } from './icons';
export function SchoolMap() {
  const [loaded, setLoaded] = useState(false);
  return <div className="map-frame">{loaded ? <iframe title="Яндекс Карта: Москва, Пятницкое шоссе, 25к1" src="https://yandex.ru/map-widget/v1/?text=Москва%2C%20Пятницкое%20шоссе%2C%2025к1&z=16" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" /> : <div className="map-placeholder"><div className="map-pin" aria-hidden="true"><span>V</span></div><p>Москва · Митино</p><strong>Пятницкое шоссе, 25к1</strong><button className="button button-outline" onClick={() => setLoaded(true)}>Показать Яндекс Карту <Arrow /></button><small>Карта загрузится после нажатия</small></div>}</div>;
}
