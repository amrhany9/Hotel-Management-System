import { Injectable, signal, computed, effect } from '@angular/core';
import { TRANSLATIONS, TranslationDictionary } from '../constants/translations.constants';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly storageKey = 'app_language';

  readonly currentLang = signal<Language>(this.getInitialLanguage());
  readonly direction = computed<Direction>(() => (this.currentLang() === 'ar' ? 'rtl' : 'ltr'));
  readonly currentTranslations = computed<TranslationDictionary>(() => TRANSLATIONS[this.currentLang()]);

  constructor() {
    // Apply initial direction and language attribute to DOM
    this.updateDomAttributes(this.currentLang(), this.direction());

    // Watch for language changes
    effect(() => {
      const lang = this.currentLang();
      const dir = this.direction();
      this.updateDomAttributes(lang, dir);
      try {
        localStorage.setItem(this.storageKey, lang);
      } catch (e) {
        console.warn('Could not save language to localStorage', e);
      }
    });
  }

  setLanguage(lang: Language): void {
    if (this.currentLang() !== lang) {
      this.currentLang.set(lang);
    }
  }

  toggleLanguage(): void {
    const next = this.currentLang() === 'en' ? 'ar' : 'en';
    this.setLanguage(next);
  }

  /**
   * Translates a dot-notated key e.g. "nav.dashboard" or "common.save"
   */
  translate(key: string): string {
    const parts = key.split('.');
    let current: any = this.currentTranslations();

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return key; // fallback to key itself if not found
      }
    }

    return typeof current === 'string' ? current : key;
  }

  private getInitialLanguage(): Language {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved === 'en' || saved === 'ar') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'en';
  }

  private updateDomAttributes(lang: Language, dir: Direction): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', dir);
      if (dir === 'rtl') {
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
      }
    }
  }
}
