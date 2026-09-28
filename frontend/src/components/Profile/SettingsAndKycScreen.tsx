import React, { useState } from 'react';
import {
  CHARACTER_PROFILES,
  UZBEKISTAN_CITIES,
} from '../../data/limitlessContent';
import { LimitlessGameState, formatUzs } from '../../types/game';
import { LevelInfo, calculateReputationPoints } from '../../config/xp';
import { SupportedLanguage, TRANSLATIONS } from '../../i18n/translations';
import { LanguageSelector } from '../Common/LanguageSelector';
import { useTelegram } from '../../hooks/useTelegram';

interface SettingsAndKycScreenProps {
  state: LimitlessGameState;
  levelInfo: LevelInfo;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onClaimUsername: (username: string) => void;
  onClaimEmail: (email: string) => void;
  onClaimKyc: (fullName: string, city: string, occupation: string) => void;
  onClaimPayday: (balance: number, daysUntilPayday: number) => void;
  onSwitchGender: () => void;
  onRestartTutorial: () => void;
  onResetProgress: () => void;
  onOpenNztLab: () => void;
  onOpenFriendsModal: () => void;
}

export const SettingsAndKycScreen: React.FC<SettingsAndKycScreenProps> = ({
  state,
  levelInfo,
  onSelectLanguage,
  onClaimUsername,
  onClaimEmail,
  onClaimKyc,
  onClaimPayday,
  onSwitchGender,
  onRestartTutorial,
  onResetProgress,
  onOpenNztLab,
  onOpenFriendsModal,
}) => {
  const { haptics } = useTelegram();
  const lang = state.language || 'ru';
  const t = TRANSLATIONS[lang];

  const [isFaqOpen, setIsFaqOpen] = useState<boolean>(false);

  const [username, setUsername] = useState<string>(
    state.profileQuests.username || '@timur_limitless'
  );
  const [email, setEmail] = useState<string>(
    state.profileQuests.email || 'timur@onpul.uz'
  );
  const [kycName, setKycName] = useState<string>(
    state.profileQuests.kycFullName || `${state.playerName} Каримов`
  );
  const [kycCity, setKycCity] = useState<string>(
    state.profileQuests.kycCity || 'Ташкент'
  );
  const [kycOccupation, setKycOccupation] = useState<string>(
    state.profileQuests.kycOccupation || 'Специалист / Предприниматель'
  );
  const [paydayBalance, setPaydayBalance] = useState<string>(
    String(state.balance)
  );
  const [paydayDays, setPaydayDays] = useState<string>(
    String(state.daysUntilPayday)
  );

  const profile = CHARACTER_PROFILES[state.gender];
  const rp = calculateReputationPoints(
    state.xp,
    state.streak,
    state.arenaTrophies
  );

  const completedQuestsCount = [
    state.profileQuests.usernameClaimed,
    state.profileQuests.emailClaimed,
    state.profileQuests.kycClaimed,
    state.profileQuests.paydayClaimed,
  ].filter(Boolean).length;

  return (
    <div
      data-testid="settings-kyc-screen"
      className="space-y-3.5 pb-28 animate-float-up"
    >
      {/* ВЫБОР ЯЗЫКА ИНТЕРФЕЙСА (6 ЯЗЫКОВ) */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-soft">
        <div className="text-xs font-black text-slate-800 mb-2 text-center">
          🌍 Язык игры / Til / Language / Sprache / 언어 / Idioma
        </div>
        <LanguageSelector
          currentLanguage={lang}
          onSelectLanguage={onSelectLanguage}
        />
      </div>

      {/* КАРТОЧКА ПРОФИЛЯ И ТЕКУЩЕГО УРОВНЯ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-soft flex items-center gap-3.5">
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-emerald-500 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900 truncate">
              {state.playerName}
            </h2>
            <span
              data-testid="profile-level-badge"
              className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0"
            >
              Уровень {levelInfo.level}
            </span>
          </div>
          <div className="text-xs font-bold text-emerald-700 truncate">
            {levelInfo.stageTitle}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
            Опыт: <strong className="text-slate-800">{state.xp} XP</strong> •{' '}
            <strong className="text-indigo-700">💎 {state.nztGems} NZT</strong> •
            Рейтинг: <strong className="text-amber-700">{rp} RP</strong> ({completedQuestsCount}/4)
          </div>
        </div>
      </div>

      {/* КНОПКА / ВКЛАДКА ОТКРЫТИЯ ОТДЕЛЬНОГО РАЗДЕЛА F.A.Q. ВНУТРИ НАСТРОЕК */}
      <div className="bg-white rounded-3xl p-3.5 border-2 border-sky-400/60 shadow-soft">
        <button
          type="button"
          data-testid="settings-faq-tab"
          onClick={() => {
            haptics.selection();
            setIsFaqOpen((prev) => !prev);
          }}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-xs flex items-center justify-between shadow-sm transition-all"
        >
          <span>{t.faqTabButton}</span>
          <span>{isFaqOpen ? '▲' : '▼'}</span>
        </button>

        {isFaqOpen && (
          <div
            data-testid="faq-section"
            className="mt-3 space-y-2.5 pt-2 border-t border-slate-100 animate-float-up"
          >
            <h3 className="text-xs font-black text-slate-900 px-1">
              {t.faqSectionTitle}
            </h3>
            {t.faqItems.map((item, idx) => (
              <div
                key={idx}
                data-testid={`faq-item-${idx + 1}`}
                className="bg-slate-50 rounded-2xl p-3 border border-slate-200/90"
              >
                <div className="text-xs font-black text-slate-900 mb-1">
                  {item.q}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onOpenFriendsModal}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-black"
              >
                🤝 Открыть Win-Win Рефералку
              </button>
              <button
                type="button"
                onClick={onOpenNztLab}
                className="py-2.5 px-3 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-800 text-[11px] font-black"
              >
                💎 Открыть Лабораторию NZT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ЗАГОЛОВОК КВЕСТОВ ПРОФИЛЯ */}
      <div className="px-1">
        <h3 className="text-sm font-black text-slate-900">
          🛡️ {t.settingsTitle} (до +185 XP и +1 💎 NZT!)
        </h3>
        <p className="text-xs text-slate-500">
          Каждое заполненное поле закрепляет за тобой прогресс и начисляет опыт
        </p>
      </div>

      {/* 1. TELEGRAM @USERNAME (+25 XP) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">📱</span>
            <span className="text-xs font-black text-slate-900">
              Telegram @username
            </span>
          </div>
          <span
            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
              state.profileQuests.usernameClaimed
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-sky-50 text-sky-700 border border-sky-200'
            }`}
          >
            {state.profileQuests.usernameClaimed ? 'Получено +25 XP ✓' : '+25 XP'}
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            data-testid="input-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@username"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-600"
          />
          <button
            type="button"
            data-testid="claim-username-xp-btn"
            onClick={() => {
              haptics.notification('success');
              onClaimUsername(username.trim() || '@timur_limitless');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
              state.profileQuests.usernameClaimed
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            {state.profileQuests.usernameClaimed
              ? 'Сохранено (+25 XP ✓)'
              : 'Сохранить и получить +25 XP'}
          </button>
        </div>
      </div>

      {/* 2. EMAIL АДРЕС (+30 XP) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">✉️</span>
            <span className="text-xs font-black text-slate-900">
              Email адрес для резервной копии
            </span>
          </div>
          <span
            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
              state.profileQuests.emailClaimed
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-sky-50 text-sky-700 border border-sky-200'
            }`}
          >
            {state.profileQuests.emailClaimed ? 'Получено +30 XP ✓' : '+30 XP'}
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            data-testid="input-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-600"
          />
          <button
            type="button"
            data-testid="claim-email-xp-btn"
            onClick={() => {
              haptics.notification('success');
              onClaimEmail(email.trim() || 'player@onpul.uz');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
              state.profileQuests.emailClaimed
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
            }`}
          >
            {state.profileQuests.emailClaimed
              ? 'Подтверждено (+30 XP ✓)'
              : 'Подтвердить и получить +30 XP'}
          </button>
        </div>
      </div>

      {/* 3. KYC ВЕРИФИКАЦИЯ ПРОФИЛЯ (+80 XP + 300 💰) */}
      <div className="bg-white rounded-3xl p-4 border-2 border-indigo-500/40 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <div>
              <div className="text-xs font-black text-slate-900">
                KYC Верификация профиля
              </div>
              <div className="text-[10px] text-slate-500">
                Даёт +80 XP и +300 💰 OnPul Coins в Нейро-Сейф!
              </div>
            </div>
          </div>
          <span
            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
              state.profileQuests.kycClaimed
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
          >
            {state.profileQuests.kycClaimed
              ? 'KYC Пройден +80 XP + 300 💰 ✓'
              : '+80 XP + 300 💰'}
          </span>
        </div>

        <div className="space-y-2.5 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              ФИО:
            </label>
            <input
              type="text"
              data-testid="input-kyc-name"
              value={kycName}
              onChange={(e) => setKycName(e.target.value)}
              placeholder="Тимур Каримов"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Город (Узбекистан):
              </label>
              <select
                data-testid="select-kyc-city"
                value={kycCity}
                onChange={(e) => setKycCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
              >
                {UZBEKISTAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Род деятельности:
              </label>
              <input
                type="text"
                data-testid="input-kyc-occupation"
                value={kycOccupation}
                onChange={(e) => setKycOccupation(e.target.value)}
                placeholder="IT / Бизнес / Образование"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          data-testid="claim-kyc-xp-btn"
          onClick={() => {
            haptics.notification('success');
            onClaimKyc(
              kycName.trim() || 'Тимур Каримов',
              kycCity || 'Ташкент',
              kycOccupation.trim() || 'Специалист'
            );
          }}
          className={`w-full py-3 rounded-2xl text-xs font-black transition-all ${
            state.profileQuests.kycClaimed
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
          }`}
        >
          {state.profileQuests.kycClaimed
            ? '✓ KYC Верификация подтверждена (+80 XP) • +300 💰'
            : '🛡️ Пройти KYC и получить +80 XP (+300 💰 Coins)'}
        </button>
      </div>

      {/* 4. НАСТРОЙКА «ДОСТУПНО ДО ЗАРПЛАТЫ» (+50 XP) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <span className="text-xs font-black text-slate-900">
              Настройка «Доступно до зарплаты»
            </span>
          </div>
          <span
            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
              state.profileQuests.paydayClaimed
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {state.profileQuests.paydayClaimed ? 'Получено +50 XP ✓' : '+50 XP'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Текущий баланс (сум):
            </label>
            <input
              type="number"
              data-testid="input-payday-balance"
              value={paydayBalance}
              onChange={(e) => setPaydayBalance(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Дней до следующей ЗП:
            </label>
            <input
              type="number"
              data-testid="input-payday-days"
              value={paydayDays}
              onChange={(e) => setPaydayDays(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
            />
          </div>
        </div>

        <button
          type="button"
          data-testid="claim-payday-xp-btn"
          onClick={() => {
            haptics.notification('success');
            onClaimPayday(
              Math.max(0, Number(paydayBalance) || 4500000),
              Math.max(1, Number(paydayDays) || 15)
            );
          }}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition-all"
        >
          {state.profileQuests.paydayClaimed
            ? `Обновить лимит (${formatUzs(Number(paydayBalance) || state.balance)} сум)`
            : 'Рассчитать лимит (+50 XP)'}
        </button>
      </div>

      {/* НАСТРОЙКИ ПЕРСОНАЖА И ИГРЫ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-soft space-y-2.5">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          Настройки персонажа и игры
        </h3>

        {/* Переключатель образа героя в 1 клик */}
        <button
          type="button"
          data-testid="switch-gender-btn"
          onClick={() => {
            haptics.selection();
            onSwitchGender();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs flex items-center justify-between transition-colors"
        >
          <span>🔄 Образ героя:</span>
          <span
            data-testid="current-gender-label"
            className="text-emerald-700 font-black"
          >
            {state.gender === 'male'
              ? 'Мужской (Эдди / Тимур Морра) → Сменить на Алию'
              : 'Женский (Алия Морра) → Сменить на Эдди'}
          </span>
        </button>

        {/* Перезапуск обучения со стрелками */}
        <button
          type="button"
          data-testid="restart-tutorial-btn"
          onClick={() => {
            haptics.selection();
            onRestartTutorial();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <span>🧭</span>
          <span>Запустить обучение со стрелками заново</span>
        </button>

        {/* Сброс прогресса (Демо) */}
        <button
          type="button"
          data-testid="reset-progress-btn"
          onClick={() => {
            haptics.notification('warning');
            onResetProgress();
          }}
          className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
        >
          Сбросить прогресс (Демо)
        </button>
      </div>
    </div>
  );
};
