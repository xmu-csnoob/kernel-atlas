export function isValidLang(lang: string): lang is 'en' | 'zh' {
  return lang === 'en' || lang === 'zh';
}

export function getLangFromURL(): 'en' | 'zh' | null {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (lang && isValidLang(lang)) {
    return lang;
  }
  return null;
}

export function getLangFromStorage(): 'en' | 'zh' | null {
  const lang = localStorage.getItem('kernel-atlas-lang');
  if (lang && isValidLang(lang)) {
    return lang;
  }
  return null;
}
