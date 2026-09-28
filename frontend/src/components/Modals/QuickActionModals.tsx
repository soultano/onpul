import React, { useState } from 'react';
import {
  GoalOrDebtItem,
  LimitlessGameState,
  calculateSafePaydayMetrics,
  formatUzs,
} from '../../types/game';
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
              Сколько доступно до зарплаты?
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
            <span>Обязательные платежи впереди:</span>
            <span className="font-bold text-slate-800">
              {formatUzs(mandatoryDebts)} сум
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-600 mb-2">
            <span>Свободно до зарплаты:</span>
            <span className="font-bold text-emerald-700">
              {formatUzs(previewFree)} сум
            </span>
          </div>
          <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900">
              Безопасный лимит в день:
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
  goalsAndDebts: GoalOrDebtItem[];
  onAddGoalOrDebt: (kind: 'goal' | 'debt', title: string, amount: number, dueDateOrTarget: string) => void;
}

export const GoalsAndDebtsModal: React.FC<GoalsAndDebtsModalProps> = ({
  isOpen,
  onClose,
  goalsAndDebts,
  onAddGoalOrDebt,
}) => {
  const { haptics } = useTelegram();
  const [kind, setKind] = useState<'goal' | 'debt'>('goal');
  const [title, setTitle] = useState('Подушка безопасности');
  const [amount, setAmount] = useState('1000000');
  const [due, setDue] = useState('В этом месяце');

  if (!isOpen) return null;

  const handleAdd = () => {
    haptics.notification('success');
    const cleanTitle =
      title.trim() ||
      (kind === 'goal' ? 'Финансовая цель без рассрочки' : 'Обязательный платёж');
    const cleanAmount = Math.max(10000, Number(amount) || 500000);
    onAddGoalOrDebt(kind, cleanTitle, cleanAmount, due || 'Планово');
    setTitle('');
  };

  return (
    <div
      data-testid="goals-modal"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-float-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="inline-block bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mb-1">
              🎯 Шахматное зрение • +40 XP
            </span>
            <h3 className="text-base font-black text-slate-900">
              Цели и Обязательные платежи
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
              setTitle('Покупка без рассрочки');
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
              placeholder="Срок (напр. до 15 числа)"
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
          {goalsAndDebts.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
            >
              <div>
                <div className="text-xs font-extrabold text-slate-900">
                  {item.kind === 'goal' ? '🎯' : '💳'} {item.title}
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
          ))}
        </div>
      </div>
    </div>
  );
};

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitedCount: number;
  onInviteFriend: () => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  invitedCount,
  onInviteFriend,
}) => {
  const { haptics } = useTelegram();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const referralLink = 'https://t.me/OnPulBot?start=limitless_777';

  const handleInvite = () => {
    haptics.notification('success');
    try {
      navigator.clipboard?.writeText(referralLink);
    } catch (e) {}
    setCopied(true);
    onInviteFriend();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      data-testid="friends-modal"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-float-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 text-center"
      >
        <div className="flex justify-end">
          <button
            type="button"
            data-testid="close-friends-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl mx-auto mb-3">
          🤝
        </div>

        <h3 className="text-lg font-black text-slate-900 mb-1">
          Пригласи друзей в «ФинУровень»
        </h3>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Делись финансовой ясностью с друзьями и близкими! За каждого приглашённого друга ты мгновенно получаешь <strong className="text-emerald-700">+50 XP</strong> к уровню героя и очки репутации в Лидерборде.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-4 flex items-center justify-between text-left">
          <div className="truncate pr-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase">
              Твоя реферальная ссылка
            </div>
            <div className="text-xs font-extrabold text-slate-800 truncate">
              {referralLink}
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-1 rounded-lg shrink-0">
            Приглашено: {invitedCount}
          </span>
        </div>

        <button
          type="button"
          data-testid="invite-friend-btn"
          onClick={handleInvite}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition-all"
        >
          {copied
            ? '✓ Ссылка скопирована! (+50 XP начислено)'
            : '🤝 Пригласить друга / Скопировать ссылку (+50 XP)'}
        </button>
      </div>
    </div>
  );
};
