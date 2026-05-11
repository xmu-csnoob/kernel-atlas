import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

export function useLanguage() {
  const { lang, setLang } = useContext(LanguageContext);
  return { lang, setLang };
}
