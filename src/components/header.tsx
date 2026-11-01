'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BookingButton } from './booking';
const links = [['#directions', 'Направления'], ['#about', 'О школе'], ['#teacher', 'Педагог'], ['#contacts', 'Контакты']];
export function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); } };
    const outside = (e: PointerEvent) => { if (header.current && !header.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', escape); document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', escape); document.removeEventListener('pointerdown', outside); };
  }, [open]);
  return <header className="site-header" ref={header}><div className="header-inner container">
    <Link className="wordmark" href="/" aria-label="VOLTA — на главную">VOLTA<span>ШКОЛА ТАНЦЕВ</span></Link>
    <nav className={`nav ${open ? 'is-open' : ''}`} id="navigation" aria-label="Основная навигация">
      {links.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      <span className="mobile-booking"><BookingButton onClick={() => setOpen(false)}>Пробное занятие</BookingButton></span>
    </nav>
    <div className="header-actions"><span className="desktop-booking"><BookingButton className="button button-small button-outline">Записаться <span aria-hidden="true">↗</span></BookingButton></span>
    <button ref={toggle} data-booking-focus-fallback className="menu-toggle" aria-expanded={open} aria-controls="navigation" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} onClick={() => setOpen(!open)}><span /><span /></button></div>
  </div></header>;
}
