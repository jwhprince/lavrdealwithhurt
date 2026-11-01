import type { SVGProps } from 'react';
export function Arrow(props: SVGProps<SVGSVGElement>) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" /></svg>;
}
export function Star(props: SVGProps<SVGSVGElement>) {
  return <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}><path d="M16 0c2.5 10 6 13.5 16 16-10 2.5-13.5 6-16 16C13.5 22 10 18.5 0 16 10 13.5 13.5 10 16 0Z" fill="currentColor" /></svg>;
}
