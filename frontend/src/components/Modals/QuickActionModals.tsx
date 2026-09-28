import React, { useState } from 'react';
import {
  GoalOrDebtItem,
  LimitlessGameState,
  formatUzs,
} from '../../types/game';
import {
  GOAL_CATEGORY_PRESETS,
  TRANSLATIONS,
} from '../../i18n/translations';
import { useTelegram } from '../../hooks/useTelegram';

interface PaydayModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: LimitlessGameState;
  onSavePayday: (balance: number, daysUntilPayday: number) => void;
}

export const PaydayModal: React.FC<PaydayModalProps> = ({
  isOpen,
  onClose,
  state,
  onSavePayday,
}) => {
  const { haptics } = useTelegram();
  const [balanceInput, setBalanceInput] = useState(String(state.balance));
  const [daysInput, setDaysInput] = useState(String(state.daysUntilPayday));

  if (!isOpen) return null;

  const t = TRANSLATIONS[state.language || 'ru'];
  const parsedBalance = Math.max(0, Number(balanceInput) || 0);
  const parsedDays = Math.max(1, Math.min(60, Number(daysInput) || 1));

  const mandatoryDebts = state.goalsAndDebts
    .filter((g) => g.kind === 'debt' && !g.completed)
    .reduce((acc, g) => acc + g.amount, 0);

  const previewFree = Math.max(0, parsedBalance - mandatoryDebts);
  const previewDaily = Math.round(previewFree / parsedDays);

  const handleSave = () => {
    haptics.notification('success');
    onSavePayday(parsedBalance, parsedDays);
    onClose();
  };

  return (
    <div
      data-testid="payday-modal"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-float-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mb-1">
              📊 Калькулятор ясности • +50 XP
            </span>
            <h3 className="text-base font-black text-slate-900">
              {t.safeLimitTitle}
            </h3>
          </div>
          <button
            type="button"
            data-testid="close-payday-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Укажи текущий остаток на картах/наличными и сколько дней осталось до следующей выплаты. Мы вычтем обязательные платежи и покажем твой безопасный дневной лимит.
        </p>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Текущий баланс (сум):
            </label>
            <input
              type="number"
              data-testid="modal-payday-balance-input"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Дней до следующей зарплаты:
            </label>
            <input
              type="number"
              data-testid="modal-payday-days-input"
              value={daysInput}
              onChange={(e) => setDaysInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Предпросмотр расчёта */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 mb-4">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>{t.mandatoryPaymentsLabel}:</span>
            <span className="font-bold text-slate-800">
              {formatUzs(mandatoryDebts)} сум
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-600 mb-2">
            <span>{t.freeUntilPayday}:</span>
            <span className="font-bold text-emerald-700">
              {formatUzs(previewFree)} сум
            </span>
          </div>
          <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900">
              {t.dailyLimitLabel}:
            </span>
            <span className="text-sm font-black text-emerald-700">
              {formatUzs(previewDaily)} сум / день
            </span>
          </div>
        </div>

        <button
          type="button"
          data-testid="modal-save-payday-btn"
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition-all"
        >
          Сохранить лимит до ЗП {!state.profileQuests.paydayClaimed ? '(+50 XP)' : ''}
        </button>
      </div>
    </div>
  );
};

interface GoalsAndDebtsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: LimitlessGameState;
  goalsAndDebts: GoalOrDebtItem[];
  onAddGoalOrDebt: (
    kind: 'goal' | 'debt',
    title: string,
    amount: number,
    dueDateOrTarget: string,
    category?: string
  ) => void;
}

export const GoalsAndDebtsModal: React.FC<GoalsAndDebtsModalProps> = ({
  isOpen,
  onClose,
  state,
  goalsAndDebts,
  onAddGoalOrDebt,
}) => {
  const { haptics } = useTelegram();
  const lang = state.language || 'ru';
  const t = TRANSLATIONS[lang];

  const [kind, setKind] = useState<'goal' | 'debt'>('goal');
  const [selectedGoalCat, setSelectedGoalCat] = useState<string>('car');
  const [title, setTitle] = useState<string>('Автомобиль мечты');
  const [amount, setAmount] = useState<string>('150000000');
  const [due, setDue] = useState<string>('Через 12 месяцев');

  if (!isOpen) return null;

  const handleCategoryChange = (catId: string) => {
    haptics.selection();
    setSelectedGoalCat(catId);
    const preset = GOAL_CATEGORY_PRESETS.find((p) => p.id === catId);
    if (preset) {
      setTitle(preset.defaultTitles[lang] || preset.defaultTitles.ru);
      setAmount(String(preset.recommendedAmount));
    }
  };

  const handleAdd = () => {
    haptics.notification('success');
    const cleanTitle =
      title.trim() ||
      (kind === 'goal' ? 'Финансовая цель без рассрочки' : 'Обязательный платёж');
    const cleanAmount = Math.max(10000, Number(amount) || 500000);
    onAddGoalOrDebt(
      kind,
      cleanTitle,
      cleanAmount,
      due || 'Планово',
      selectedGoalCat
    );
  };

  return (
    <div
      data-testid="goals-modal"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-float-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 max-h-[88vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="inline-block bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mb-1">
              🎯 Шахматное зрение • +40 XP
            </span>
            <h3 className="text-base font-black text-slate-900">
              {t.goalsSectionTitle}
            </h3>
          </div>
          <button
            type="button"
            data-testid="close-goals-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Переключатель: Цель или Долг/Платёж */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              setKind('goal');
              handleCategoryChange(selectedGoalCat);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold border transition-colors ${
              kind === 'goal'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            🎯 Финансовая цель
          </button>
          <button
            type="button"
            onClick={() => {
              setKind('debt');
              setTitle('Оплата ЖКХ / Долг');
              setAmount('450000');
            }}
            className={`py-2 rounded-xl text-xs font-extrabold border transition-colors ${
              kind === 'debt'
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            💳 Платёж / Долг
          </button>
        </div>

        <div className="space-y-2.5 mb-3">
          {/* Выпадающее меню выбора категории цели (Автомобиль, Квартира, Путешествие и т.д.) */}
          {kind === 'goal' && (
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                {t.selectGoalCategoryLabel}
              </label>
              <select
                data-testid="goal-category-select"
                value={selectedGoalCat}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/70 border border-emerald-300 text-slate-900 font-extrabold text-xs focus:outline-none focus:border-emerald-600"
              >
                {GOAL_CATEGORY_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.labels[lang] || preset.labels.ru}
                  </option>
                ))}
              </select>
            </div>
          )}

          <input
            type="text"
            data-testid="modal-goal-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название цели или платежа..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              data-testid="modal-goal-amount-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Сумма (сум)"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
            />
            <input
              type="text"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              placeholder="Срок (напр. 12 мес.)"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
            />
          </div>
          <button
            type="button"
            data-testid="modal-add-goal-btn"
            onClick={handleAdd}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all"
          >
            + Добавить и получить +40 XP
          </button>
        </div>

        {/* Текущий список */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {goalsAndDebts.map((item) => {
            const presetIcon =
              GOAL_CATEGORY_PRESETS.find((p) => p.id === item.category)?.icon ||
              (item.kind === 'goal' ? '🎯' : '💳');
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    {presetIcon} {item.title}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {item.dueDateOrTarget} •{' '}
                    {item.kind === 'debt'
                      ? 'Бронируется из баланса до ЗП'
                      : 'Накопительная цель'}
                  </div>
                </div>
                <div className="text-xs font-black text-slate-800">
                  {formatUzs(item.amount)} сум
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: LimitlessGameState;
  invitedCount: number;
  onInviteFriend: () => void;
  onClaimFriendInviteCode: (code: string) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  state,
  invitedCount,
  onInviteFriend,
  onClaimFriendInviteCode,
}) => {
  const { haptics } = useTelegram();
  const [copied, setCopied] = useState(false);
  const [friendCode, setFriendCode] = useState('LIMITLESS-777');

  if (!isOpen) return null;

  const lang = state.language || 'ru';
  const t = TRANSLATIONS[lang];
  const referralLink = 'https://t.me/OnPulBot?start=limitless_777';

  const partnerRank =
    invitedCount >= 5
      ? '👑 Партнёр Синдиката'
      : invitedCount >= 2
      ? '🌟 Амбассадор Ясности'
      : '🧭 Проводник Фокуса';

  const handleInvite = () => {
    haptics.notification('success');
    try {
      navigator.clipboard?.writeText(referralLink);
    } catch (e) {}
    setCopied(true);
    onInviteFriend();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaimFriendCode = () => {
    haptics.notification('success');
    onClaimFriendInviteCode(friendCode.trim() || 'LIMITLESS-777');
  };

  return (
    <div
      data-testid="friends-modal"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-float-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 text-left max-h-[90vh] overflow-y-auto"
      >
        {/* Шапка */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl shrink-0">
              🤝
            </div>
            <div>
              <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                {partnerRank}
              </span>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                {t.friendsWinWinTitle}
              </h3>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-friends-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0"
          >
            ✕
          </button>
        </div>

        {/* БЛОК 1: ЧТО ПОЛУЧАЕШЬ ТЫ (ПРИГЛАШАЮЩИЙ ПАРТНЁР) */}
        <div
          data-testid="referral-inviter-rewards"
          className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 mb-3"
        >
          <div className="text-xs font-black text-emerald-950 mb-1.5">
            {t.inviterRewardsTitle}
          </div>
          <ul className="text-[11px] font-semibold text-slate-700 space-y-1">
            <li>
              • <strong className="text-emerald-700">+50 XP</strong> сразу за каждого приглашённого друга;
            </li>
            <li>
              • <strong className="text-emerald-700">+150 XP + 1 💎 NZT-Кристалл</strong> когда друг проходит базовую настройку / KYC;
            </li>
            <li>
              • <strong className="text-emerald-700">+10% пассивного XP</strong> от ежедневной дисциплины друзей + партнёрские статусы (<em>Проводник → Амбассадор → Партнёр Синдиката</em>).
            </li>
          </ul>
        </div>

        {/* БЛОК 2: ЧТО ПОЛУЧАЕТ ТВОЙ ДРУГ (ПРИГЛАШЁННЫЙ) */}
        <div
          data-testid="referral-friend-rewards"
          className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3.5 mb-3.5"
        >
          <div className="text-xs font-black text-sky-950 mb-1.5">
            {t.friendRewardsTitle}
          </div>
          <ul className="text-[11px] font-semibold text-slate-700 space-y-1">
            <li>
              • <strong className="text-sky-700">Стартовый буст «Быстрый старт»: +100 XP</strong> сразу при входе по твоей ссылке (мгновенный 2-й уровень!);
            </li>
            <li>
              • <strong className="text-sky-700">+1 редкий 💎 NZT-Кристалл</strong> на баланс для активации супер-фич в Лаборатории NZT;
            </li>
            <li>
              • <strong className="text-sky-700">Крио-Щит Стрика на 3 дня</strong> для защиты ударного режима.
            </li>
          </ul>
        </div>

        {/* Ссылка для приглашения друга */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-3 flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase">
              Твоя партнёрская ссылка Win-Win
            </div>
            <div className="text-xs font-extrabold text-slate-800 truncate">
              {referralLink}
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-1 rounded-lg shrink-0">
            Друзей: {invitedCount}
          </span>
        </div>

        <button
          type="button"
          data-testid="invite-friend-btn"
          onClick={handleInvite}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition-all mb-4"
        >
          {copied
            ? '✓ Ссылка скопирована! (+50 XP и +1 💎 NZT начислено)'
            : '🤝 Пригласить друга / Скопировать ссылку (+50 XP + 1 💎 NZT)'}
        </button>

        {/* АКТИВАЦИЯ ИНВАЙТ-КОДА ДРУГА (НАГРАДА ПРИГЛАШЁННОГО: +100 XP + 1 💎 NZT) */}
        <div className="pt-3 border-t border-slate-200">
          <div className="text-xs font-black text-slate-900 mb-1">
            🎟️ Пришёл от друга? Активируй инвайт-код!
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Введи код друга и забери приветственный пакет «Быстрый старт»: <strong>+100 XP</strong>, <strong>+1 💎 NZT</strong> и Крио-Щит!
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              data-testid="friend-code-input"
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value)}
              placeholder="Код друга (напр. LIMITLESS-777)"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
            />
            <button
              type="button"
              data-testid="claim-friend-invite-btn"
              onClick={handleClaimFriendCode}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
                state.referralWelcomeClaimed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
              }`}
            >
              {state.referralWelcomeClaimed
                ? 'Бонус получен (+100 XP ✓)'
                : 'Активировать (+100 XP + 1 💎)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NztLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: LimitlessGameState;
  onBuyNeuroBoost: () => void;
  onBuyStreakShield: () => void;
  onBuyVipAura: () => void;
}

export const NztLabModal: React.FC<NztLabModalProps> = ({
  isOpen,
  onClose,
  state,
  onBuyNeuroBoost,
  onBuyStreakShield,
  onBuyVipAura,
}) => {
  const { haptics } = useTelegram();

  if (!isOpen) return null;

  const lang = state.language || 'ru';
  const t = TRANSLATIONS[lang];

  const primaryGoal =
    state.goalsAndDebts.find((g) => g.kind === 'goal') || {
      title: 'Автомобиль / Квартира мечты',
      amount: 150000000,
    };

  return (
    <div
      data-testid="nzt-lab-modal"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 animate-float-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border-2 border-indigo-400 shadow-2xl p-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Шапка Лаборатории NZT */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black px-2.5 py-0.5 rounded-full mb-1">
              <span>💎 Редкая валюта Сверхчеловека</span>
            </div>
            <h3 className="text-base font-black text-slate-900">
              {t.nztLabTitle}
            </h3>
          </div>
          <button
            type="button"
            data-testid="close-nzt-lab-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Баланс 💎 NZT и как его фармить */}
        <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 rounded-2xl p-4 text-white mb-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-100">
              Твой запас Кристаллов Ясности:
            </span>
            <span
              data-testid="nzt-lab-balance"
              className="bg-white text-indigo-900 font-black text-sm px-3 py-1 rounded-full shadow-xs"
            >
              💎 {state.nztGems} NZT
            </span>
          </div>
          <div className="text-[11px] text-indigo-100 leading-snug">
            <strong>Почему 💎 NZT сложно добыть:</strong> кристаллы выдаются только за реальные рубежи: прохождение KYC (<strong>+1 💎</strong>), партнёрский инвайт друга Win-Win (<strong>+1 💎</strong>) и выполнение 3 ежедневных заданий (<strong>+1 💎</strong>).
          </div>
        </div>

        {/* Персональный ИИ-Аудит при активном Нейро-Импульсе */}
        {state.xpMultiplier > 1 && (
          <div
            data-testid="nzt-ai-audit-result"
            className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-3.5 mb-3.5 text-xs"
          >
            <div className="font-black text-emerald-900 mb-1">
              🧠 ИИ-Аудит Сверхчеловека активирован (Бустер ×{state.xpMultiplier} XP):
            </div>
            <p className="text-slate-700 leading-relaxed">
              Цель <strong>«{primaryGoal.title}» ({formatUzs(primaryGoal.amount)} сум)</strong> будет достигнута на <strong>32% быстрее</strong> при сохранении безопасного дневного лимита и откладывании 15% с каждого прихода!
            </p>
          </div>
        )}

        {/* СПИСОК 3 СУПЕР-ФИЧ ЛАБОРАТОРИИ NZT */}
        <div className="space-y-3">
          {/* 1. Нейро-Импульс 100% Фокус */}
          <div className="rounded-2xl p-3.5 border border-indigo-200 bg-indigo-50/40 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-black text-slate-900">
                  🧠 Нейро-Импульс «100% Фокус» (×2 XP Бустер + ИИ-Аудит Целей)
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Удваивает весь получаемый опыт (×2 XP), открывает ИИ-расчёт ускорения твоих целей и мгновенно даёт <strong>+60 XP</strong>!
                </p>
              </div>
              <span className="bg-indigo-100 text-indigo-800 text-[11px] font-black px-2.5 py-1 rounded-xl shrink-0">
                1 💎 NZT
              </span>
            </div>
            <button
              type="button"
              data-testid="buy-nzt-neuroboost-btn"
              disabled={state.nztGems < 1}
              onClick={() => {
                haptics.notification('success');
                onBuyNeuroBoost();
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                state.xpMultiplier > 1
                  ? 'bg-emerald-600 text-white'
                  : state.nztGems >= 1
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {state.xpMultiplier > 1
                ? '✓ Нейро-Импульс ×2 XP Активен! (Продлить +60 XP за 1 💎)'
                : state.nztGems >= 1
                ? '⚡ Активировать Нейро-Импульс (1 💎 NZT → ×2 XP + 60 XP)'
                : 'Нужен 1 💎 NZT (Пройди KYC или пригласи друга)'}
            </button>
          </div>

          {/* 2. Крио-Щит Стрика */}
          <div className="rounded-2xl p-3.5 border border-sky-200 bg-sky-50/40 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-black text-slate-900">
                  🧊 Крио-Щит Стрика (Защита серии 🔥 и рейтинга RP)
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Замораживает твой ударный режим и защищает очки репутации в Лидерборде от сгорания при пропуске дня.
                </p>
              </div>
              <span className="bg-sky-100 text-sky-800 text-[11px] font-black px-2.5 py-1 rounded-xl shrink-0">
                1 💎 NZT
              </span>
            </div>
            <button
              type="button"
              data-testid="buy-nzt-shield-btn"
              disabled={state.nztGems < 1 && !state.streakShieldActive}
              onClick={() => {
                haptics.notification('success');
                onBuyStreakShield();
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                state.streakShieldActive
                  ? 'bg-emerald-100 text-emerald-800'
                  : state.nztGems >= 1
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {state.streakShieldActive
                ? '✓ Крио-Щит Стрика Активен 🧊'
                : state.nztGems >= 1
                ? '🧊 Включить Крио-Щит Стрика (1 💎 NZT)'
                : 'Нужен 1 💎 NZT'}
            </button>
          </div>

          {/* 3. Золотая VIP-Аура «Архитектор Синдиката» */}
          <div className="rounded-2xl p-3.5 border border-amber-200 bg-amber-50/40 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-black text-slate-900">
                  👑 Золотая VIP-Аура «Архитектор Синдиката»
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Включает золотое свечение вокруг карточки твоего героя и корону VIP-статуса в Лидерборде Топ 1–2–3.
                </p>
              </div>
              <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-2.5 py-1 rounded-xl shrink-0">
                2 💎 NZT
              </span>
            </div>
            <button
              type="button"
              data-testid="buy-nzt-aura-btn"
              disabled={state.nztGems < 2 && !state.vipAuraUnlocked}
              onClick={() => {
                haptics.notification('success');
                onBuyVipAura();
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                state.vipAuraUnlocked
                  ? 'bg-amber-400 text-slate-950'
                  : state.nztGems >= 2
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {state.vipAuraUnlocked
                ? '👑 Золотая VIP-Аура Активна!'
                : state.nztGems >= 2
                ? '👑 Открыть Золотую VIP-Ауру (2 💎 NZT)'
                : 'Нужно 2 💎 NZT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
