import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { BookingButton } from '@/components/booking';
import { TrackedLink } from '@/components/analytics';
import { Arrow, Star } from '@/components/icons';
import { SchoolMap } from '@/components/map';
import { site, siteUrl, directions, programDetails, organizationSchema, metrikaId } from '@/lib/site';

export const metadata: Metadata = { ...(siteUrl ? { alternates: { canonical: siteUrl } } : {}) };
const benefits = [
  ['У каждого свой ритм', 'Индивидуальный подход к каждому ученику. Мы верим: в нашей школе затанцует каждый.'],
  ['Тренер и родитель — команда', 'Наша концепция «тренер–родитель»: обратная связь по каждому ученику после занятий.'],
  ['В надёжных руках', 'Квалифицированные педагоги, которые помогают развивать технику и уверенность в себе.'],
  ['Больше, чем занятия', 'Участие в мероприятиях и соревнованиях — новые впечатления и пространство для роста.'],
];

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()).replace(/</g, '\\u003c') }} />
    <Header />
    <main id="main">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow"><span className="location-dot" /> МОСКВА, МИТИНО</p>
          <h1 id="hero-title">Школа танцев{' '}<br /><span className="hero-brand">VOLTA</span><span className="hero-city">в Москве</span></h1>
          <p className="hero-tagline">Место, где танец{' '}<br />становится <em>частью тебя.</em></p>
          <p className="hero-description">Для маленьких открытий и больших мечтаний.<br className="desktop-break" /> Для детей и взрослых. Для вас.</p>
          <BookingButton>Бесплатное пробное занятие <Arrow /></BookingButton>
          <p className="hero-note">Индивидуально · С вниманием к вам</p>
        </div>
        <div className="hero-art"><div className="hero-logo-wrap"><Image src="/images/logo.webp" alt="Логотип школы танцев VOLTA" width={1254} height={1254} loading="eager" fetchPriority="high" sizes="(max-width: 767px) 92vw, 48vw" className="hero-logo" /></div><div className="hero-art-footer"><span>У каждого танца есть начало</span><Star /></div></div>
        <a className="scroll-link" href="#directions">НАЙДИТЕ СВОЙ ТАНЕЦ <span aria-hidden="true">↓</span></a>
      </section>

      <section className="directions section-pad" id="directions" aria-labelledby="directions-title"><div className="container direction-grid">
        <div><p className="eyebrow">ДВИЖЕНИЕ, КОТОРОЕ ВДОХНОВЛЯЕТ</p><h2 id="directions-title">Какой танец{' '}<br /><em>ближе вам?</em></h2>
          <div className="direction-list">{directions.map((item, index) => <article className="direction-item" key={item.id}>
            <span className="direction-number" aria-hidden="true">0{index + 1}</span><div><p className="direction-subtitle">{item.subtitle}</p><h3>{item.name}</h3><p>{item.description}</p>{programDetails[item.id] && <p className="program-details">{Object.values(programDetails[item.id]!).filter(Boolean).join(' · ')}</p>}<BookingButton className="text-button" direction={item.id}>Попробовать <Arrow /></BookingButton></div>
          </article>)}</div>
        </div><figure className="direction-photo"><Image src="/images/dance.webp" alt="Пара исполняет латиноамериканский танец на паркете" width={800} height={1200} sizes="(max-width: 767px) 92vw, 45vw" /><figcaption><span>Чувствовать. Двигаться. Быть собой.</span><Star /></figcaption></figure>
      </div></section>

      <section className="benefits section-pad" id="about" aria-labelledby="benefits-title"><div className="container"><div className="section-heading"><p className="eyebrow">ТАНЕЦ НАЧИНАЕТСЯ С ДОВЕРИЯ</p><h2 id="benefits-title">Почему выбирают{' '}<br /><em>нашу школу</em></h2><p>Здесь важны не только шаги.{' '}<br />Здесь важны вы.</p></div><div className="benefits-grid">{benefits.map(([title, text], index) => <article key={title}><div className={`benefit-symbol symbol-${index}`} aria-hidden="true"><Star /></div><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section className="teacher section-pad" id="teacher" aria-labelledby="teacher-title"><div className="container teacher-grid"><div className="teacher-photo"><Image src="/images/founder.webp" alt="Маврина Анастасия, основатель и тренер школы танцев VOLTA" width={902} height={1280} sizes="(max-width: 767px) 92vw, 42vw" /><span className="photo-caption">МАСТЕРСТВО. ВНИМАНИЕ. ЛЮБОВЬ К ТАНЦУ.</span></div><div className="teacher-copy"><p className="eyebrow">ВАШ ПРОВОДНИК В МИР ТАНЦА</p><h2 id="teacher-title">Анастасия{' '}<br /><em>Маврина</em></h2><p className="teacher-role">Руководитель и основатель VOLTA,{' '}<br />тренер по танцевальному спорту</p><div className="teacher-highlight"><span>12<span>+</span></span><p>лет преподавания{' '}<br />и любви к своему делу</p></div><ul className="achievements"><li>Победитель международных и всероссийских соревнований</li><li>М-класс — наивысший класс мастерства в танцах</li><li>Кандидат в мастера спорта</li><li>Серебряный призёр Чемпионата Самарской области</li><li>Сертифицированный специалист «Тренер по танцевальному спорту»</li></ul><BookingButton className="text-button">Познакомиться на пробном занятии <Arrow /></BookingButton></div></div></section>

      <section className="video-section section-pad" aria-labelledby="video-title"><div className="container video-grid"><div className="video-copy"><p className="eyebrow">МАЛЕНЬКИЙ ВЗГЛЯД В НАШ МИР</p><h2 id="video-title">Танец — это{' '}<br /><em>то, что чувствуешь.</em></h2><p>Первые движения. Знакомый ритм.{' '}<br />Радость, которой хочется поделиться.</p><span className="video-caption"><span className="small-play" aria-hidden="true">▷</span> Моменты из жизни VOLTA</span></div><div className="video-player"><video controls playsInline preload="none" poster="/images/video-poster.jpg" width={720} height={1280} aria-label="Видео занятий в школе танцев VOLTA"><source src="/video/volta.mp4" type="video/mp4" />Ваш браузер не поддерживает видео. <a href="/video/volta.mp4">Скачать ролик</a></video></div></div></section>

      <section className="trial" id="trial" aria-labelledby="trial-title"><Image src="/images/trial.webp" alt="Ученица школы VOLTA на занятии в танцевальном зале" fill sizes="100vw" className="trial-image" /><div className="trial-overlay" /><div className="trial-copy container"><p className="eyebrow">ПЕРВЫЙ ШАГ — САМЫЙ ВАЖНЫЙ</p><h2 id="trial-title">«А у меня{' '}<br /><em>получится?»</em></h2><p>Приходите на бесплатный пробный урок.{' '}<br />Давайте найдём ваш ритм вместе.</p><div className="trial-details"><span>Индивидуальное занятие</span><Star /><span>Обратная связь от тренера</span></div><BookingButton className="button button-light">Хочу попробовать <Arrow /></BookingButton></div></section>

      <section className="location section-pad" id="location" aria-labelledby="location-title"><div className="container location-grid"><div><p className="eyebrow">ДО ВСТРЕЧИ НА ПАРКЕТЕ</p><h2 id="location-title">Ваш танец{' '}<br /><em>начинается здесь</em></h2><div className="address-block"><span className="metro-label"><span aria-hidden="true">М</span> Митино</span><address>Москва,{' '}<br />Пятницкое шоссе, 25к1</address><p>Ждём учеников из Москвы{' '}<br />и Московской области.</p></div><TrackedLink href={site.mapUrl} goal="route_click" metrikaId={metrikaId} className="text-button" external>Построить маршрут <Arrow /></TrackedLink></div><SchoolMap /></div></section>
    </main>

    <footer className="footer" id="contacts"><div className="container"><div className="footer-top"><div><Link href="/" className="footer-logo" aria-label="VOLTA — на главную">VOLTA</Link><p>Танец становится частью тебя.</p></div><div className="footer-contacts"><h2>Будем на связи</h2>{site.phone && <TrackedLink href={`tel:${site.phone.replace(/[^+\d]/g, '')}`} goal="phone_click" metrikaId={metrikaId}>{site.phone}</TrackedLink>}{site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}<span>{site.address}</span><div className="social-links">{site.vk && <a href={site.vk} target="_blank" rel="noopener noreferrer">ВКонтакте ↗</a>}{site.telegram && <a href={site.telegram} target="_blank" rel="noopener noreferrer">Telegram ↗</a>}</div><BookingButton className="text-button footer-booking">Записаться на знакомство <Arrow /></BookingButton></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} VOLTA</span><div><Link href="/privacy">Политика обработки данных</Link><Link href="/consent">Согласие на обработку данных</Link></div></div>{site.operator && <p className="legal-details">{site.operator}{site.inn && ` · ИНН ${site.inn}`}{site.legalAddress && ` · ${site.legalAddress}`}</p>}</div></footer>
  </>;
}
