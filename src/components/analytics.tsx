'use client';
import Script from 'next/script';
export function trackGoal(id: number | undefined, goal: 'lead_success' | 'phone_click' | 'route_click') {
  if (!id) return;
  const win = window as typeof window & { ym?: (...args: unknown[]) => void };
  win.ym?.(id, 'reachGoal', goal);
}
export function Analytics({ id }: { id: number }) {
  return <Script id="yandex-metrika" strategy="lazyOnload">{`
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a)})
    (window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
    ym(${id},'init',{clickmap:false,trackLinks:false,accurateTrackBounce:true,webvisor:false});
  `}</Script>;
}
export function TrackedLink({ href, goal, metrikaId, children, className, external = false }: {
  href: string; goal: 'phone_click' | 'route_click'; metrikaId?: number; children: React.ReactNode; className?: string; external?: boolean;
}) {
  return <a href={href} className={className} onClick={() => trackGoal(metrikaId, goal)} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>;
}
