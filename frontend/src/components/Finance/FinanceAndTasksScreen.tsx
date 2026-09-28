import React, { useState } from 'react';
import {
  DAILY_LITERACY_TASKS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  QUICK_AMOUNT_CHIPS,
} from '../../data/limitlessContent';
import {
  LimitlessGameState,
  calculateSafePaydayMetrics,
  formatUzs,
} from '../../types/game';
import { useTelegram } from '../../hooks/useTelegram';

interface FinanceAndTasksScreenProps {
  state: LimitlessGameState;
  onAddTransaction: (
    type: 'income' | 'expense',
    amount: number,
    category: string,
    categoryLabel: string,
    categoryIcon: string
  ) => void;
  onCompleteDailyTask: (dayNumber: number) => void;
  onAddGoalOrDebt: (
    kind: 'goal' | 'debt',
    title: string,
    amount: number,
    dueDateOrTarget: string
  ) => void;
}

export const FinanceAndTasksScreen: React.FC<FinanceAndTasksScreenProps> = ({
  state,
  onAddTransaction,
  onCompleteDailyTask,
  onAddGoalOrDebt,
}) => {
  const { haptics } = useTelegram();

  // Состояние быстрого трекера Приходов / Расходов
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [amountStr, setAmountStr] = useState<string>('50000');
  const [selectedExpenseCat, setSelectedExpenseCat] = useState<string>(
    EXPENSE_CATEGORIES[0].id
  );
  const [selectedIncomeCat, setSelectedIncomeCat] = useState<string>(
    INCOME_CATEGORIES[0].id
  );

  // Состояние Ежедневных заданий (7 дней)
  const firstUncompletedDay =
    DAILY_LITERACY_TASKS.find(
      (t) => !state.completedDailyTasks.includes(t.day)
    )?.day || 1;
  const [activeDay, setActiveDay] = useState<number>(firstUncompletedDay);
  const currentTask =
    DAILY_LITERACY_TASKS.find((t) => t.day === activeDay) ||
    DAILY_LITERACY_TASKS[0];
  const [selectedQuizOption, setSelectedQuizOption] = useState<number>(
    currentTask.correctIndex
  );

  // Состояние блока Целей и Долгов
  const [goalKind, setGoalKind] = useState<'goal' | 'debt'>('goal');
  const [goalTitle, setGoalTitle] = useState<string>('Подушка безопасности');
  const [goalAmount, setGoalAmount] = useState<string>('500000');
  const [goalDue, setGoalDue] = useState<string>('До конца месяца');

  const paydayMetrics = calculateSafePaydayMetrics(state);

  const handleTxSubmit = () => {
    haptics.notification('success');
    const numericAmount = Math.max(1000, Number(amountStr) || 50000);

    if (txType === 'expense') {
      const cat =
        EXPENSE_CATEGORIES.find((c) => c.id === selectedExpenseCat) ||
        EXPENSE_CATEGORIES[0];
      onAddTransaction(
        'expense',
        numericAmount,
        cat.id,
        cat.label,
        cat.icon
      );
    } else {
      const cat =
        INCOME_CATEGORIES.find((c) => c.id === selectedIncomeCat) ||
        INCOME_CATEGORIES[0];
      onAddTransaction(
        'income',
        numericAmount,
        cat.id,
        cat.label,
        cat.icon
      );
    }
  };

  const handleCompleteTask = () => {
    haptics.notification('success');
    onCompleteDailyTask(currentTask.day);
    // Переключаем на следующий невыполненный день, если есть
    const nextTask = DAILY_LITERACY_TASKS.find(
      (t) =>
        t.day !== currentTask.day && !state.completedDailyTasks.includes(t.day)
    );
    if (nextTask) {
      setActiveDay(nextTask.day);
      setSelectedQuizOption(nextTask.correctIndex);
    }
  };

  const handleAddGoalSubmit = () => {
    haptics.notification('success');
    const cleanTitle =
      goalTitle.trim() ||
      (goalKind === 'goal' ? 'Цель без рассрочки' : 'Обязательный платёж');
    const cleanAmount = Math.max(10000, Number(goalAmount) || 300000);
    onAddGoalOrDebt(goalKind, cleanTitle, cleanAmount, goalDue || 'Планово');
  };

  const isCurrentTaskCompleted = state.completedDailyTasks.includes(
    currentTask.day
  );

  return (
    <div
      data-testid="finance-tasks-screen"
      className="space-y-4 pb-28 animate-float-up"
    >
      {/* ВЕРХНЯЯ ПЛАШКА: ЖИВОЙ ПУЛЬС БЮДЖЕТА ДО ЗАРПЛАТЫ */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-4 text-white shadow-lg shadow-emerald-600/20">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-100 mb-1">
          <span>⚡ Пульт управления деньгами</span>
          <span>До ЗП: {paydayMetrics.daysUntilPayday} дн.</span>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="text-[11px] text-emerald-100">
              Свободно до зарплаты
            </div>
            <div
              data-testid="finance-free-balance"
              className="text-base font-black"
            >
              {formatUzs(paydayMetrics.freeBalance)} сум
            </div>
          </div>
          <div className="border-l border-emerald-400/40 pl-3">
            <div className="text-[11px] text-emerald-100">
              Безопасный лимит в день
            </div>
            <div
              data-testid="finance-daily-limit"
              className="text-base font-black text-amber-300"
            >
              {formatUzs(paydayMetrics.safeDailyLimit)} сум / день
            </div>
          </div>
        </div>
      </div>

      {/* БЛОК 1: БЫСТРЫЙ ТРЕКЕР «ПРИХОДЫ И РАСХОДЫ ЗА 5 СЕКУНД» */}
      <section
        data-testid="quick-tracker-section"
        className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-soft"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Приходы и Расходы за 5 секунд
            </h2>
            <p className="text-[11px] text-slate-500">
              Каждая запись обновляет дневной лимит и качает героя
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black px-2.5 py-1 rounded-full">
            {txType === 'income' ? '+15 XP' : '+10 XP'}
          </span>
        </div>

        {/* Переключатель: - Расход (+10 XP) / + Приход (+15 XP) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-3">
          <button
            type="button"
            data-testid="tx-type-expense"
            onClick={() => {
              haptics.selection();
              setTxType('expense');
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all ${
              txType === 'expense'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            - Расход (+10 XP)
          </button>

          <button
            type="button"
            data-testid="tx-type-income"
            onClick={() => {
              haptics.selection();
              setTxType('income');
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all ${
              txType === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Приход (+15 XP)
          </button>
        </div>

        {/* Поле суммы */}
        <div className="mb-2.5">
          <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
            Сумма (в сумах):
          </label>
          <input
            type="number"
            data-testid="tx-amount-input"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder="Например: 50000"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-black text-base focus:outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        {/* Быстрые чипсы сумм */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {QUICK_AMOUNT_CHIPS.map((chipValue) => (
            <button
              key={chipValue}
              type="button"
              data-testid={`tx-chip-${chipValue}`}
              onClick={() => {
                haptics.selection();
                setAmountStr(String(chipValue));
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-colors ${
                Number(amountStr) === chipValue
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {formatUzs(chipValue)}
            </button>
          ))}
        </div>

        {/* Категории в 1 тап */}
        <div className="mb-3.5">
          <div className="text-[11px] font-extrabold text-slate-600 mb-1.5">
            Категория в 1 тап:
          </div>
          {txType === 'expense' ? (
            <div className="flex flex-wrap gap-1.5">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  data-testid={`tx-cat-${cat.id}`}
                  onClick={() => {
                    haptics.selection();
                    setSelectedExpenseCat(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                    selectedExpenseCat === cat.id
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {INCOME_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  data-testid={`tx-cat-${cat.id}`}
                  onClick={() => {
                    haptics.selection();
                    setSelectedIncomeCat(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                    selectedIncomeCat === cat.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка отправки записи */}
        <button
          type="button"
          data-testid="submit-tx-btn"
          onClick={handleTxSubmit}
          className={`w-full py-3.5 px-5 rounded-2xl text-white font-black text-xs shadow-md transition-all active:scale-95 ${
            txType === 'income'
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/15'
          }`}
        >
          {txType === 'income'
            ? 'Записать приход и получить +15 XP ⚡'
            : 'Записать расход и получить +10 XP ⚡'}
        </button>

        {/* Последние записи */}
        {state.transactions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-extrabold text-slate-500 mb-2">
              Последние записи ({state.transactions.length}):
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {state.transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  data-testid="tx-history-item"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span>{tx.categoryIcon}</span>
                    <div>
                      <span className="font-bold text-slate-800">
                        {tx.categoryLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1.5">
                        +{tx.xpEarned} XP
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-black ${
                      tx.type === 'income'
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatUzs(tx.amount)} сум
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* БЛОК 2: ЕЖЕДНЕВНЫЕ ЗАДАНИЯ ПО ФИНАНСОВОЙ ГРАМОТНОСТИ (7 ДНЕЙ) */}
      <section
        data-testid="daily-tasks-section"
        className="bg-white rounded-3xl p-4 border-2 border-sky-500/50 shadow-soft"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
            <span>🧠 Задания дня • 1 раз в день</span>
          </div>
          <span className="text-xs font-black text-emerald-600">
            +100 XP за задание
          </span>
        </div>

        <h2 className="text-base font-black text-slate-900 mb-2">
          7 шагов к полной финансовой ясности
        </h2>

        {/* Переключатель 7 дней */}
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {DAILY_LITERACY_TASKS.map((t) => {
            const done = state.completedDailyTasks.includes(t.day);
            const active = activeDay === t.day;
            return (
              <button
                key={t.day}
                type="button"
                data-testid={`daily-task-day-${t.day}`}
                onClick={() => {
                  haptics.selection();
                  setActiveDay(t.day);
                  setSelectedQuizOption(t.correctIndex);
                }}
                className={`py-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center ${
                  active
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : done
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <span>Д{t.day}</span>
                <span className="text-[9px]">{done ? '✓' : '•'}</span>
              </button>
            );
          })}
        </div>

        {/* Карточка выбранного задания дня */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/90 space-y-2.5 mb-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
              {currentTask.painTag}
            </span>
            {isCurrentTaskCompleted && (
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Выполнено ✓
              </span>
            )}
          </div>

          <h3
            data-testid="daily-task-title"
            className="text-sm font-black text-slate-900 leading-snug"
          >
            {currentTask.title}
          </h3>

          <div className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Ситуация:</strong>{' '}
            {currentTask.hook}
          </div>

          <div className="bg-white rounded-xl p-2.5 border border-sky-200/80 text-xs text-slate-700 leading-relaxed">
            <strong className="text-sky-700">💡 Инсайт «Ясность»:</strong>{' '}
            {currentTask.clarityInsight}
          </div>

          {/* Проверочный мини-квиз из 3 вариантов */}
          <div className="pt-1">
            <div className="text-xs font-extrabold text-slate-900 mb-2">
              ❓ Мини-квиз: {currentTask.quizQuestion}
            </div>
            <div className="space-y-1.5">
              {currentTask.options.map((optionText, idx) => {
                const isSelected = selectedQuizOption === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    data-testid={`quiz-option-${idx}`}
                    onClick={() => {
                      haptics.selection();
                      setSelectedQuizOption(idx);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span>{optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          data-testid="complete-daily-task-btn"
          onClick={handleCompleteTask}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white font-black text-xs shadow-lg shadow-sky-600/20 transition-all active:scale-95"
        >
          {isCurrentTaskCompleted
            ? `Повторить инсайт Дня ${currentTask.day} (+100 XP получен)`
            : `Выполнить задание Дня ${currentTask.day} и забрать +100 XP 🚀`}
        </button>
      </section>

      {/* БЛОК 3: ЦЕЛИ И ОБЯЗАТЕЛЬНЫЕ ПЛАТЕЖИ (ДОЛГИ) */}
      <section
        data-testid="goals-debts-section"
        className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-soft"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Цели и Обязательные платежи (Долги)
            </h2>
            <p className="text-[11px] text-slate-500">
              Обязательные платежи сразу бронируются из денег до ЗП
            </p>
          </div>
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-black px-2.5 py-1 rounded-full">
            +40 XP
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <button
            type="button"
            onClick={() => {
              setGoalKind('goal');
              setGoalTitle('Цель без кредита');
            }}
            className={`py-2 rounded-xl text-xs font-extrabold border ${
              goalKind === 'goal'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            🎯 Накопительная цель
          </button>
          <button
            type="button"
            onClick={() => {
              setGoalKind('debt');
              setGoalTitle('Обязательный платёж / Долг');
            }}
            className={`py-2 rounded-xl text-xs font-extrabold border ${
              goalKind === 'debt'
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            💳 Платёж / Долг
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2.5">
          <input
            type="text"
            data-testid="goal-title-input"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            placeholder="Название (Подушка безопасности...)"
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
          />
          <input
            type="number"
            data-testid="goal-amount-input"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            placeholder="Сумма (сум)"
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
          />
          <input
            type="text"
            data-testid="goal-due-input"
            value={goalDue}
            onChange={(e) => setGoalDue(e.target.value)}
            placeholder="Дата / срок"
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
          />
        </div>

        <button
          type="button"
          data-testid="add-goal-btn"
          onClick={handleAddGoalSubmit}
          className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs mb-3 transition-all"
        >
          + Добавить {goalKind === 'goal' ? 'цель' : 'обязательный платёж'} (+40 XP)
        </button>

        <div className="space-y-1.5">
          {state.goalsAndDebts.map((item) => (
            <div
              key={item.id}
              data-testid="goal-debt-item"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
            >
              <div>
                <div className="font-bold text-slate-900">
                  {item.kind === 'goal' ? '🎯' : '💳'} {item.title}
                </div>
                <div className="text-[10px] text-slate-500">
                  {item.dueDateOrTarget}
                </div>
              </div>
              <div className="font-black text-slate-800">
                {formatUzs(item.amount)} сум
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
