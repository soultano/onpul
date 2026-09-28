import React, { useState } from 'react';
import { CHARACTER_PROFILES } from '../../data/limitlessContent';
import { CharacterGender } from '../../types/game';
import { SupportedLanguage, TRANSLATIONS } from '../../i18n/translations';
import { LanguageSelector } from '../Common/LanguageSelector';
import { useTelegram } from '../../hooks/useTelegram';

interface CharacterSelectScreenProps {
  initialName?: string;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onStartGame: (gender: CharacterGender, playerName: string) => void;
}

export const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({
  initialName,
  currentLanguage,
  onSelectLanguage,
  onStartGame,
}) => {
  const { haptics } = useTelegram();
  const [selectedGender, setSelectedGender] = useState<CharacterGender>('male');
  const [playerName, setPlayerName] = useState<string>(
    initialName && initialName !== 'Нодирбек' ? initialName : 'Тимур'
  );

  const t = TRANSLATIONS[currentLanguage];

  const handleSelectGender = (gender: CharacterGender) => {
    haptics.selection();
    setSelectedGender(gender);
    if (playerName === 'Тимур' || playerName === 'Алия' || !playerName.trim()) {
      setPlayerName(CHARACTER_PROFILES[gender].defaultPlayerName);
    }
  };

  const handleStart = () => {
    haptics.notification('success');
    const finalName =
      playerName.trim() || CHARACTER_PROFILES[selectedGender].defaultPlayerName;
    onStartGame(selectedGender, finalName);
  };

  return (
    <div
      data-testid="character-select-screen"
      data-active-lang={currentLanguage}
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between max-w-md mx-auto px-4 py-5"
    >
      {/* Переключатель 6 языков */}
      <div className="mb-2">
        <LanguageSelector
          currentLanguage={currentLanguage}
          onSelectLanguage={onSelectLanguage}
          compact
        />
      </div>

      {/* Шапка приветствия */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold px-3.5 py-1 rounded-full mb-2 shadow-sm">
          <span>🧠</span>
          <span>{t.onboardingBadge}</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          {t.onboardingTitle}
        </h1>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xs mx-auto">
          {t.onboardingSubtitle}
        </p>
      </div>

      {/* Две карточки персонажей (Мужской и Женский) */}
      <div className="grid grid-cols-2 gap-3 my-2">
        {(['male', 'female'] as CharacterGender[]).map((genderKey) => {
          const profile = CHARACTER_PROFILES[genderKey];
          const isSelected = selectedGender === genderKey;
          const roleLabel =
            genderKey === 'male' ? t.maleRoleLabel : t.femaleRoleLabel;
          const localizedName =
            genderKey === 'male' ? t.maleName : t.femaleName;
          const superpowerBadge =
            genderKey === 'male'
              ? t.maleSuperpowerBadge
              : t.femaleSuperpowerBadge;
          const superpowerShort =
            genderKey === 'male'
              ? t.maleSuperpowerShort
              : t.femaleSuperpowerShort;

          return (
            <div
              key={genderKey}
              data-testid={`char-card-${genderKey}`}
              onClick={() => handleSelectGender(genderKey)}
              className={`cursor-pointer rounded-3xl p-3 transition-all duration-200 flex flex-col justify-between border-2 bg-white ${
                isSelected
                  ? 'border-emerald-600 shadow-lg shadow-emerald-600/15 scale-[1.01]'
                  : 'border-slate-200/90 shadow-sm hover:border-slate-300 opacity-90'
              }`}
            >
              <div>
                {/* Портрет персонажа */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[4/5] mb-2.5 border border-slate-100">
                  <img
                    src={profile.imageUrl}
                    alt={localizedName}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/90 text-slate-400'
                      }`}
                    >
                      {isSelected ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 via-slate-900/35 to-transparent p-2 pt-6">
                    <span className="inline-block text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
                      {roleLabel}
                    </span>
                    <div className="text-xs font-black text-white leading-tight">
                      {localizedName}
                    </div>
                  </div>
                </div>

                {/* Описание суперсилы */}
                <div className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200/70 rounded-lg px-2 py-0.5 text-[10px] font-extrabold mb-1.5">
                  <span>⚡</span>
                  <span className="truncate">{superpowerBadge}</span>
                </div>

                <p className="text-[11px] font-semibold text-slate-700 leading-snug mb-3">
                  {superpowerShort}
                </p>
              </div>

              <button
                type="button"
                data-testid={`select-${genderKey}-btn`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectGender(genderKey);
                }}
                className={`w-full py-2 rounded-xl text-xs font-extrabold transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSelected ? t.selectedHeroBtn : t.selectHeroBtn}
              </button>
            </div>
          );
        })}
      </div>

      {/* Детали выбранного персонажа + Ввод имени */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-soft mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-slate-800">
            {t.heroNameLabel}
          </span>
          <span className="text-[11px] font-bold text-emerald-600">
            {selectedGender === 'male' ? t.maleArchetype : t.femaleArchetype}
          </span>
        </div>

        <input
          type="text"
          data-testid="player-name-input"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder={t.heroNamePlaceholder}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors mb-3"
        />

        <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
          {selectedGender === 'male' ? t.maleDescription : t.femaleDescription}
        </p>

        <button
          type="button"
          data-testid="start-game-btn"
          onClick={handleStart}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>{t.startGameBtn}</span>
        </button>
      </div>
    </div>
  );
};
