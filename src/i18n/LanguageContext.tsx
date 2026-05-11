import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getLangFromURL, getLangFromStorage, isValidLang } from './utils';

export interface LanguageContextValue {
  lang: 'en' | 'zh';
  setLang: (lang: string) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    const urlLang = getLangFromURL();
    if (urlLang) {
      setLangState(urlLang);
      return;
    }

    const storageLang = getLangFromStorage();
    if (storageLang) {
      setLangState(storageLang);
      return;
    }

    setLangState('en');
  }, []);

  const setLang = useCallback((newLang: string) => {
    if (!isValidLang(newLang)) {
      return;
    }

    setLangState(newLang);
    localStorage.setItem('kernel-atlas-lang', newLang);

    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLang);
    window.history.replaceState({}, '', url.toString());
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
