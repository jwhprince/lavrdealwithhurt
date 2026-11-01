'use client';
import { createContext, useContext, useRef, useState, useEffect, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { Arrow } from './icons';
import { trackGoal } from './analytics';

const BookingContext = createContext<(direction?: string) => void>(() => {});
export function BookingButton({ children, className = 'button', direction = '', onClick }: { children: ReactNode; className?: string; direction?: string; onClick?: () => void }) {
  const open = useContext(BookingContext);
  return <button type="button" className={className} onClick={() => { onClick?.(); open(direction); }}>{children}</button>;
}

export function BookingProvider({ children, enabled, phone, email, metrikaId }: { children: ReactNode; enabled: boolean; phone: string; email: string; metrikaId?: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const submitting = useRef(false);
  const [direction, setDirection] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');
  const [isOpen, setOpen] = useState(false);
  useEffect(() => { if (!isOpen) return; const old = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = old; }; }, [isOpen]);
  function open(selected = '') {
    returnFocus.current = document.activeElement as HTMLElement;
    setDirection(selected);
    if (status !== 'pending') { setStatus('idle'); setMessage(''); }
    dialog.current?.showModal(); setOpen(true);
  }
  function close() { dialog.current?.close(); }
  function restoreFocus() {
    setOpen(false);
    const trigger = returnFocus.current;
    if (trigger?.getClientRects().length) trigger.focus();
    else document.querySelector<HTMLElement>('[data-booking-focus-fallback]')?.focus();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitting.current || !enabled) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    submitting.current = true; setStatus('pending'); setMessage('');
    try {
      const response = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.get('name'), phone: data.get('phone'), direction: data.get('direction'), consent: data.get('consent') === 'on', website: data.get('website') }) });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || result.ok !== true) throw new Error(result.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
      setStatus('success'); setMessage('Заявка отправлена. Мы свяжемся с вами, чтобы подобрать время занятия.');
      form.reset(); trackGoal(metrikaId, 'lead_success');
    } catch (error) {
      setStatus('error'); setMessage(error instanceof Error && error.message !== 'Failed to fetch' ? error.message : 'Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.');
    } finally { submitting.current = false; }
  }
  return <BookingContext.Provider value={open}>{children}
    <dialog ref={dialog} className="booking-dialog" aria-labelledby="booking-title" onClose={restoreFocus} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); } }}>
      <button type="button" className="dialog-close" onClick={close} aria-label="Закрыть форму">×</button>
      <p className="eyebrow">ВАШ ПЕРВЫЙ ШАГ</p><h2 id="booking-title">Начнём<br /><em>с одного танца?</em></h2>
      {status === 'success' ? <div className="form-success" role="status"><span className="success-mark" aria-hidden="true">✓</span><p>{message}</p><button className="button" onClick={close}>До встречи в VOLTA <Arrow /></button></div> : <>
        <p className="dialog-intro">Бесплатное индивидуальное занятие и обратная связь от тренера.</p>
        {!enabled ? <div className="booking-unavailable" role="status"><p>Онлайн-запись скоро откроется.</p>{phone ? <p>Записаться можно по телефону <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>.</p> : email ? <p>Напишите нам: <a href={`mailto:${email}`}>{email}</a>.</p> : <p>Будем рады встретиться с вами в школе: Москва, Пятницкое шоссе, 25к1.</p>}</div> : <form onSubmit={submit} aria-busy={status === 'pending'}>
          <label htmlFor="booking-name">Ваше имя</label><input id="booking-name" name="name" autoComplete="given-name" minLength={2} maxLength={80} required placeholder="Как к вам обращаться?" />
          <label htmlFor="booking-phone">Телефон</label><input id="booking-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" minLength={10} maxLength={24} required placeholder="+7 (___) ___-__-__" />
          <label htmlFor="booking-direction">Направление <span className="optional">— по желанию</span></label><select id="booking-direction" name="direction" value={direction} onChange={e => setDirection(e.target.value)}><option value="">Помогите выбрать</option><option value="sport">Танцевальный спорт</option><option value="baby">Baby-dance</option><option value="latina">Латина</option></select>
          <div className="honeypot" aria-hidden="true"><label htmlFor="booking-website">Ваш сайт</label><input id="booking-website" name="website" tabIndex={-1} autoComplete="off" /></div>
          <label className="consent-label"><input type="checkbox" name="consent" required /><span>Даю <Link href="/consent" target="_blank">согласие на обработку персональных данных</Link> и ознакомлен(а) с <Link href="/privacy" target="_blank">политикой обработки</Link>.</span></label>
          {message && <p className="form-error" role="alert">{message}{phone && <> Можно позвонить: <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>.</>}</p>}
          <button className="button submit-button" type="submit" disabled={status === 'pending'}>{status === 'pending' ? 'Отправляем…' : 'Записаться бесплатно'}<Arrow /></button>
        </form>}
      </>}
    </dialog>
  </BookingContext.Provider>;
}
