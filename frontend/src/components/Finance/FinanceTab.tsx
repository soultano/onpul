import React, { useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import { api } from '../../services/api';

interface FinanceTabProps {
  user: any;
  financeData: any;
  onRefresh: () => void;
  onXpAwarded: (xpGained: number, levelUp: boolean, newLevel: number, newTitle: string) => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  user,
  financeData,
  onRefresh,
  onXpAwarded,
}) => {
  const { haptics } = useTelegram();
  const currency = user?.currency || 'UZS';
  const claimedKeys = new Set(financeData?.claimedKeys || []);
  const items = financeData?.items || [];
  const summary = financeData?.summary || {};

  // Состояния открытия модалок / форм быстрого ввода
  const [activeModal, setActiveModal] = useState<
    'salary' | 'additional' | 'fixed' | 'daily' | 'deposit' | 'loan' | null
  >(null);

  const [inputTitle, setInputTitle] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [inputRate, setInputRate] = useState('');
  const [inputTerm, setInputTerm] = useState('');
  const [inputMonthlyPayment, setInputMonthlyPayment] = useState('');
  const [inputSubtype, setInputSubtype] = useState('');
  const [loading, setLoading] = useState(false);

  // Форматирование чисел с разделителем тысяч
  const formatMoney = (val: number) => {
    return val.toLocaleString('ru-RU') + ' ' + currency;
  };

  const handleSaveItem = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      alert('Укажите сумму');
      return;
    }

    setLoading(true);
    haptics.impact('medium');

    try {
      let category = 'fixed_expense';
      let subtype = inputSubtype || 'other';

      if (activeModal === 'salary') {
        category = 'income';
        subtype = 'salary';
      } else if (activeModal === 'additional') {
        category = 'income';
        subtype = 'additional';
      } else if (activeModal === 'daily') {
        category = 'daily_expense';
      } else if (activeModal === 'deposit') {
        category = 'deposit';
      } else if (activeModal === 'loan') {
        category = 'loan';
      }

      const res = await api.addFinanceItem({
        category,
        subtype,
        title: inputTitle || subtype,
        amount: parseFloat(inputAmount),
        rate: inputRate ? parseFloat(inputRate) : undefined,
        term: inputTerm ? parseInt(inputTerm, 10) : undefined,
        monthlyPayment: inputMonthlyPayment ? parseFloat(inputMonthlyPayment) : undefined,
      });

      if (res.xpGained > 0) {
        haptics.notification('success');
        onXpAwarded(res.xpGained, res.levelUp, res.level, res.title);
      }

      setActiveModal(null);
      resetForm();
      onRefresh();
    } catch (e) {
      console.error(e);
      alert('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNone = async (category: 'deposit' | 'loan') => {
    haptics.impact('medium');
    try {
      const res = await api.addFinanceItem({
        category,
        subtype: category === 'deposit' ? 'none_deposit' : 'none_loan',
        title: category === 'deposit' ? 'Нет открытых вкладов' : 'Нет кредитов и долгов',
        amount: 0,
      });

      if (res.xpGained > 0) {
        haptics.notification('success');
        onXpAwarded(res.xpGained, res.levelUp, res.level, res.title);
      }
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    haptics.impact('light');
    if (!confirm('Удалить эту запись?')) return;
    try {
      await api.deleteFinanceItem(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setInputTitle('');
    setInputAmount('');
    setInputRate('');
    setInputTerm('');
    setInputMonthlyPayment('');
    setInputSubtype('');
  };

  // Поиск существующих записей
  const salaryItem = items.find((i: any) => i.category === 'income' && i.subtype === 'salary');
  const additionalItem = items.find((i: any) => i.category === 'income' && i.subtype === 'additional');
  const fixedExpenses = items.filter((i: any) => i.category === 'fixed_expense');
  const dailyExpenses = items.filter((i: any) => i.category === 'daily_expense');
  const deposits = items.filter((i: any) => i.category === 'deposit');
  const loans = items.filter((i: any) => i.category === 'loan');

  const hasNoDeposits = deposits.some((i: any) => i.subtype === 'none_deposit');
  const hasNoLoans = loans.some((i: any) => i.subtype === 'none_loan');

  return (
    <div className="space-y-4 pb-28 animate-float-up">
      {/* ЗАГОЛОВОК И ДИСКЛЕЙМЕР */}
      <div className="px-1">
        <h1 className="text-xl font-black text-tg-text">Мои финансы</h1>
        <p className="text-xs text-tg-hint">
          Честные данные для самоанализа. Суммы не влияют на уровень — XP начисляется за сам факт заполнения.
        </p>
      </div>

      {/* 1. ДОХОДЫ */}
      <div className="bg-tg-secondaryBg rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💵</span>
            <span className="font-extrabold text-sm text-tg-text">Доходы</span>
          </div>
          {!claimedKeys.has('field:income.salary') && (
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-2 py-0.5 rounded-full">
              +50 XP
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {/* Зарплата */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-tg-bg border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-tg-text">Месячная зарплата</div>
              <div className="text-xs text-primary-600 font-extrabold mt-0.5">
                {salaryItem ? formatMoney(salaryItem.amount) : 'Не указана'}
              </div>
            </div>
            <button
              onClick={() => {
                setActiveModal('salary');
                setInputAmount(salaryItem ? String(salaryItem.amount) : '');
                setInputTitle('Основная зарплата');
              }}
              className="text-xs font-bold text-primary-600 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/40"
            >
              {salaryItem ? 'Изменить' : 'Указать'}
            </button>
          </div>

          {/* Доп. доход */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-tg-bg border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-tg-text">Дополнительный доход</div>
              <div className="text-xs text-primary-600 font-extrabold mt-0.5">
                {additionalItem ? formatMoney(additionalItem.amount) : 'Нет или не указан'}
              </div>
            </div>
            <button
              onClick={() => {
                setActiveModal('additional');
                setInputAmount(additionalItem ? String(additionalItem.amount) : '');
                setInputTitle('Дополнительный доход');
              }}
              className="text-xs font-bold text-primary-600 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/40"
            >
              {additionalItem ? 'Изменить' : 'Указать (+20 XP)'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. ПОСТОЯННЫЕ РАСХОДЫ */}
      <div className="bg-tg-secondaryBg rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📌</span>
            <span className="font-extrabold text-sm text-tg-text">Постоянные расходы (в месяц)</span>
          </div>
          <span className="text-[11px] text-tg-hint font-bold">
            {fixedExpenses.length} статей
          </span>
        </div>

        {fixedExpenses.length > 0 && (
          <div className="space-y-2 mb-3">
            {fixedExpenses.map((f: any) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-tg-bg border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <div className="font-bold text-tg-text">{f.title}</div>
                  <div className="text-rose-600 font-extrabold">{formatMoney(f.amount)}</div>
                </div>
                <button onClick={() => handleDelete(f.id)} className="text-tg-hint hover:text-rose-600 p-1">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => {
            setActiveModal('fixed');
            resetForm();
            setInputSubtype('rent');
            setInputTitle('Аренда / Ипотека');
          }}
          className="w-full py-2.5 rounded-xl border border-dashed border-primary-500/40 text-primary-600 text-xs font-bold hover:bg-primary-50/50"
        >
          + Добавить постоянный расход (+20 XP)
        </button>
      </div>

      {/* 3. ЕЖЕДНЕВНЫЕ РАСХОДЫ */}
      <div className="bg-tg-secondaryBg rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">☕</span>
            <span className="font-extrabold text-sm text-tg-text">Ежедневные расходы (в день)</span>
          </div>
          <span className="text-[11px] text-tg-hint font-bold">
            {dailyExpenses.length} статей
          </span>
        </div>

        {dailyExpenses.length > 0 && (
          <div className="space-y-2 mb-3">
            {dailyExpenses.map((d: any) => (
              <div
                key={d.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-tg-bg border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <div className="font-bold text-tg-text">{d.title}</div>
                  <div className="text-amber-600 font-extrabold">
                    {formatMoney(d.amount)} / день (~{formatMoney(d.amount * 30)}/мес)
                  </div>
                </div>
                <button onClick={() => handleDelete(d.id)} className="text-tg-hint hover:text-rose-600 p-1">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => {
            setActiveModal('daily');
            resetForm();
            setInputSubtype('food');
            setInputTitle('Питание и продукты');
          }}
          className="w-full py-2.5 rounded-xl border border-dashed border-primary-500/40 text-primary-600 text-xs font-bold hover:bg-primary-50/50"
        >
          + Добавить ежедневный расход (+20 XP)
        </button>
      </div>

      {/* 4. ВКЛАДЫ И СБЕРЕЖЕНИЯ */}
      <div className="bg-tg-secondaryBg rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🏦</span>
            <span className="font-extrabold text-sm text-tg-text">Вклады и сбережения</span>
          </div>
          {!claimedKeys.has('field:deposit.first') && (
            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black px-2 py-0.5 rounded-full">
              +50 XP
            </span>
          )}
        </div>

        {deposits.length > 0 && (
          <div className="space-y-2 mb-3">
            {deposits.map((dep: any) => (
              <div
                key={dep.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-tg-bg border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <div className="font-bold text-tg-text">{dep.title}</div>
                  <div className="text-primary-600 font-extrabold">
                    {dep.subtype === 'none_deposit' ? 'Отметка «Нет вкладов»' : formatMoney(dep.amount)}
                    {dep.rate ? ` • ${dep.rate}% годовых` : ''}
                  </div>
                </div>
                <button onClick={() => handleDelete(dep.id)} className="text-tg-hint hover:text-rose-600 p-1">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveModal('deposit');
              resetForm();
              setInputTitle('Депозит в банке');
            }}
            className="flex-1 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold text-xs"
          >
            + Добавить вклад
          </button>
          {!hasNoDeposits && deposits.length === 0 && (
            <button
              onClick={() => handleToggleNone('deposit')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-tg-hint font-bold text-xs"
            >
              Нет вкладов (+50 XP)
            </button>
          )}
        </div>
      </div>

      {/* 5. КРЕДИТЫ И ДОЛГИ */}
      <div className="bg-tg-secondaryBg rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💳</span>
            <span className="font-extrabold text-sm text-tg-text">Кредиты и рассрочки</span>
          </div>
          {!claimedKeys.has('field:loan.first') && (
            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black px-2 py-0.5 rounded-full">
              +50 XP
            </span>
          )}
        </div>

        {loans.length > 0 && (
          <div className="space-y-2 mb-3">
            {loans.map((ln: any) => (
              <div
                key={ln.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-tg-bg border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <div className="font-bold text-tg-text">{ln.title}</div>
                  <div className="text-rose-600 font-extrabold">
                    {ln.subtype === 'none_loan'
                      ? 'Отметка «Нет кредитов»'
                      : `Остаток: ${formatMoney(ln.amount)} • Платёж: ${formatMoney(ln.monthlyPayment || 0)}/мес`}
                  </div>
                </div>
                <button onClick={() => handleDelete(ln.id)} className="text-tg-hint hover:text-rose-600 p-1">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveModal('loan');
              resetForm();
              setInputTitle('Рассрочка / Кредит');
            }}
            className="flex-1 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold text-xs"
          >
            + Добавить кредит
          </button>
          {!hasNoLoans && loans.length === 0 && (
            <button
              onClick={() => handleToggleNone('loan')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-tg-hint font-bold text-xs"
            >
              Нет кредитов (+50 XP)
            </button>
          )}
        </div>
      </div>

      {/* 6. ФИНАНСОВАЯ СВОДКА (БЕЗ ОЦЕНОК, ТОЛЬКО ЦИФРЫ) */}
      <div className="bg-tg-secondaryBg rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="font-extrabold text-sm text-tg-text mb-3 flex items-center gap-1.5">
          <span>📊</span>
          <span>Финансовая сводка (самоанализ)</span>
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-tg-bg border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] text-tg-hint font-bold">Свободный остаток в месяц</div>
            <div className={`text-sm font-black mt-0.5 ${summary.netCashflow >= 0 ? 'text-primary-600' : 'text-rose-600'}`}>
              {formatMoney(summary.netCashflow || 0)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-tg-bg border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] text-tg-hint font-bold">Доля платежей по кредитам</div>
            <div className="text-sm font-black mt-0.5 text-tg-text">
              {summary.debtToIncomePercent || 0}% дохода
            </div>
          </div>
        </div>

        {/* Простая диаграмма расходов */}
        {summary.totalMonthlyExpenses > 0 && (
          <div className="p-3 rounded-2xl bg-tg-bg border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-bold text-tg-hint mb-2">Структура расходов в месяц:</div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>📌 Постоянные расходы:</span>
                <span className="font-bold">{formatMoney(summary.totalMonthlyFixedExpenses || 0)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>☕ Ежедневные (за месяц):</span>
                <span className="font-bold">{formatMoney(summary.totalDailyExpensesMonthly || 0)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>💳 Платежи по кредитам:</span>
                <span className="font-bold">{formatMoney(summary.totalLoansMonthlyPayment || 0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* МОДАЛЬНОЕ ОКНО ВВОДА */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-float-up">
          <div className="w-full max-w-sm rounded-3xl bg-tg-bg border border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
            <h3 className="font-black text-base text-tg-text mb-3">
              {activeModal === 'salary' && 'Месячная зарплата'}
              {activeModal === 'additional' && 'Дополнительный доход'}
              {activeModal === 'fixed' && 'Постоянный расход'}
              {activeModal === 'daily' && 'Ежедневный расход'}
              {activeModal === 'deposit' && 'Вклад / Сбережения'}
              {activeModal === 'loan' && 'Кредит / Рассрочка'}
            </h3>

            <div className="space-y-3 mb-4">
              {activeModal !== 'salary' && activeModal !== 'additional' && (
                <div>
                  <label className="block text-[11px] font-bold text-tg-hint mb-1">Название / Статья</label>
                  <input
                    type="text"
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    placeholder="Например: Аренда, Такси, SQB вклад..."
                    className="w-full p-2.5 rounded-xl bg-tg-secondaryBg border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-primary-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-tg-hint mb-1">
                  Сумма ({currency})
                </label>
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="0"
                  className="w-full p-2.5 rounded-xl bg-tg-secondaryBg border border-slate-200 dark:border-slate-700 text-base font-extrabold focus:outline-none focus:border-primary-600"
                />
              </div>

              {activeModal === 'deposit' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-tg-hint mb-1">Ставка %</label>
                    <input
                      type="number"
                      value={inputRate}
                      onChange={(e) => setInputRate(e.target.value)}
                      placeholder="22"
                      className="w-full p-2 rounded-xl bg-tg-secondaryBg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-tg-hint mb-1">Срок (мес.)</label>
                    <input
                      type="number"
                      value={inputTerm}
                      onChange={(e) => setInputTerm(e.target.value)}
                      placeholder="12"
                      className="w-full p-2 rounded-xl bg-tg-secondaryBg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>
                </div>
              )}

              {activeModal === 'loan' && (
                <div>
                  <label className="block text-[10px] font-bold text-tg-hint mb-1">
                    Ежемесячный платёж ({currency})
                  </label>
                  <input
                    type="number"
                    value={inputMonthlyPayment}
                    onChange={(e) => setInputMonthlyPayment(e.target.value)}
                    placeholder="0"
                    className="w-full p-2 rounded-xl bg-tg-secondaryBg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-tg-hint"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveItem}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md active:scale-95 disabled:opacity-50"
              >
                {loading ? '...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
