import React from 'react';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '../../i18n/translations';
import { useTelegram } from '../../hooks/useTelegram';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
  compact = false,
}) => {
  const { haptics } = useTelegram();

  return (
    <div
      data-testid="language-selector"
      data-active-lang={currentLanguage}
      className={`flex items-center justify-center flex-wrap gap-1 ${
        compact ? '' : 'bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-2xs'
      }`}
    >
      <span
        data-testid="active-language-code"
        data-active-lang={currentLanguage}
        className="sr-only"
      >
        {currentLanguage}
      </span>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = currentLanguage === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            data-testid={`lang-btn-${lang.code}`}
            aria-pressed={isActive}
            onClick={() => {
              haptics.selection();
              onSelectLanguage(lang.code);
            }}
            className={`px-2 py-1 rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1 ${
              isActive
                ? 'bg-emerald-600 text-white shadow-2xs scale-[1.02]'
                : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80'
            }`}
            title={lang.label}
          >
            <span>{lang.flag}</span>
            <span>{compact ? lang.shortLabel : lang.label}</span>
          </button>
        );
      })}
    </div>
  );
};
