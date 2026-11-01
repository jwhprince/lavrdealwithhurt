import Link from 'next/link';
export default function NotFound() {
  return <main id="main" className="container not-found"><p className="eyebrow">VOLTA · 404</p><h1>Кажется, сбились с ритма</h1><p>Такой страницы нет. Вернёмся к танцам?</p><Link href="/" className="button">На главную →</Link></main>;
}
