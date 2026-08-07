import { getCookie } from 'h3';

export function readCookie(event: any, name: string): string | undefined {
  return getCookie(event, name);
}