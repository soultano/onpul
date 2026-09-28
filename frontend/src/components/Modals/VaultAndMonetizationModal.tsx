import React from 'react';
import { VAULT_LEVELS } from '../../data/limitlessContent';
import { LimitlessGameState } from '../../types/game';
import { useTelegram } from '../../hooks/useTelegram';

interface VaultAndMonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: LimitlessGameState;
  onUpgradeVault: () => void;
  onRedeemNiyatBoost: () => void;
  onRedeemRaffleTicket: () => void;
  onActivateProPass: () => void;
}

export const VaultAndMonetizationModal: React.FC<
  VaultAndMonetizationModalProps
> = ({
  isOpen,
  onClose,
  state,
  onUpgradeVault,
  onRedeemNiyatBoost,
  onRedeemRaffleTicket,
  onActivateProPass,
}) => {
  const { haptics } = useTelegram();

  if (!isOpen) return null;

  const safeVaultIdx = Math.max(
    0,
    Math.min(VAULT_LEVELS.length - 1, (state.vaultLevel || 1) - 1)
  );
  const currentVaultMeta = VAULT_LEVELS[safeVaultIdx];
  const nextVaultMeta =
    VAULT_LEVELS[Math.min(VAULT_LEVELS.length - 1, safeVaultIdx + 1)];
  const yieldMultiplier = state.proPassActive ? 2 : 1;

  return (
    <div
      data-testid="vault-monetization-modal"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3.5 animate-float-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border-2 border-emerald-500 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Шапка */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 px-4 py-3.5 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
              <span>💰 Улучшай • Зарабатывай • Монетизируй</span>
            </div>
            <h3 className="text-base font-black mt-0.5">
              Нейро-Сейф, Выгоды и PRO-Статус
            </h3>
          </div>
          <button
            type="button"
            data-testid="close-vault-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-black flex items-center justify-center shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Контент */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Сводка балансов игрока */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-2.5 border border-slate-200 text-center">
            <div>
              <div className="text-[10px] font-bold text-slate-500">
                Капитал Coins
              </div>
              <div className="text-xs font-black text-amber-700">
                💰 {state.onpulCoins}
              </div>
            </div>
            <div className="border-x border-slate-200">
              <div className="text-[10px] font-bold text-slate-500">
                Кристаллы NZT
              </div>
              <div className="text-xs font-black text-indigo-700">
                💎 {state.nztGems} NZT
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500">
                Кубки Лиги
              </div>
              <div className="text-xs font-black text-emerald-700">
                🏆 {state.arenaTrophies}
              </div>
            </div>
          </div>

          {/* БЛОК 1: ПРОКАЧКА НЕЙРО-СЕЙФА (УР. 1 → 10) */}
          <div className="rounded-2xl p-3.5 border-2 border-emerald-300 bg-emerald-50/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-emerald-700 uppercase">
                  1. Генератор пассивного дохода (24/7)
                </span>
                <h4 className="text-xs font-black text-slate-900">
                  🏦 {currentVaultMeta.title}
                </h4>
              </div>
              <span
                data-testid="vault-current-level"
                className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs"
              >
                Ур. {state.vaultLevel}/10
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-2.5 border border-emerald-200/80 text-[11px]">
              <div>
                <div className="text-slate-500 font-semibold">
                  Текущий доход:
                </div>
                <div className="font-black text-emerald-700">
                  +{currentVaultMeta.dailyYieldCoins * yieldMultiplier} 💰/день
                </div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">
                  На Ур. {Math.min(10, state.vaultLevel + 1)}:
                </div>
                <div className="font-black text-sky-700">
                  +{nextVaultMeta.dailyYieldCoins * yieldMultiplier} 💰/день (+
                  {nextVaultMeta.trophyBonusPercent}% 🏆)
                </div>
              </div>
            </div>

            <button
              type="button"
              data-testid="upgrade-vault-btn"
              onClick={() => {
                haptics.notification('success');
                onUpgradeVault();
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all"
            >
              {state.vaultLevel >= 10
                ? '👑 Максимальный 10 уровень Сейфа достигнут! (+40 XP)'
                : '⬆️ Улучшить Сейф (300 💰 Coins → Ур. ' +
                  (state.vaultLevel + 1) +
                  ' + 40 XP)'}
            </button>
          </div>

          {/* БЛОК 2: ОБМЕННИК ВЫГОД И НАГРАД (ЧТО ЗАРАБАТЫВАЕТ ИГРОК) */}
          <div className="rounded-2xl p-3.5 border-2 border-amber-300 bg-amber-50/40 space-y-3">
            <div>
              <span className="text-[10px] font-black text-amber-800 uppercase">
                2. Реальные Выгоды и Призы за 💰 Coins
              </span>
              <h4 className="text-xs font-black text-slate-900">
                🎁 На что обменять заработанные монеты Сейфа
              </h4>
            </div>

            {/* Награда А: Промо-Буст +2% Niyat Application */}
            <div className="bg-white rounded-xl p-3 border border-amber-200 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-black text-slate-900">
                    📈 Промо-Буст +2% к целевым сбережениям Niyat Application (36% → 38% годовых)
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Реальная финтех-привилегия для твоих накоплений у партнёров + мгновенно <strong>+50 XP</strong>!
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-1 rounded-lg shrink-0">
                  200 💰
                </span>
              </div>

              {state.niyatBoostRedeemed && (
                <div
                  data-testid="niyat-promo-code"
                  className="bg-emerald-50 border border-emerald-400 text-emerald-900 rounded-xl px-3 py-2 text-xs font-black flex items-center justify-between"
                >
                  <span>Промокод: ONPUL-NIYAT-38</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    Активирован ✓
                  </span>
                </div>
              )}

              <button
                type="button"
                data-testid="redeem-niyat-boost-btn"
                onClick={() => {
                  haptics.notification('success');
                  onRedeemNiyatBoost();
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                  state.niyatBoostRedeemed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                }`}
              >
                {state.niyatBoostRedeemed
                  ? '✓ Промокод ONPUL-NIYAT-38 получен (+50 XP)'
                  : '🎁 Получить Буст +2% Niyat (200 💰 Coins → +50 XP)'}
              </button>
            </div>

            {/* Награда Б: Билет Еженедельного Призового Розыгрыша */}
            <div className="bg-white rounded-xl p-3 border border-amber-200 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-black text-slate-900">
                    🎟️ Билет Еженедельного Розыгрыша (Смартфоны, Сертификаты Uzum, 1 000 💎 NZT)
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Каждое воскресенье среди держателей билетов разыгрываются ценные призы + <strong>+30 XP</strong> за билет!
                  </p>
                </div>
                <span
                  data-testid="raffle-tickets-count"
                  className="bg-sky-100 text-sky-900 text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0"
                >
                  🎟️ Билетов: {state.raffleTickets}
                </span>
              </div>

              <button
                type="button"
                data-testid="redeem-raffle-ticket-btn"
                onClick={() => {
                  haptics.notification('success');
                  onRedeemRaffleTicket();
                }}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-xs transition-all"
              >
                🎟️ Купить Билет Розыгрыша (150 💰 Coins → +1 🎟️ и +30 XP)
              </button>
            </div>
          </div>

          {/* БЛОК 3: PRO-МОНЕТИЗАЦИЯ (TELEGRAM STARS ⭐ & NZT PASS) */}
          <div className="rounded-2xl p-4 border-2 border-indigo-400 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  ⭐ Telegram Stars • VIP-Монетизация
                </span>
                <h4 className="text-sm font-black mt-1">
                  👑 NZT Pass (Сверхчеловек PRO)
                </h4>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-amber-300">
                  250 ⭐ Stars
                </div>
                <div className="text-[10px] text-indigo-200">59 000 сум/мес</div>
              </div>
            </div>

            <ul className="text-[11px] text-indigo-100 space-y-1 font-medium">
              <li>• <strong>×2 Доход Нейро-Сейфа</strong> каждые 24 часа;</li>
              <li>• <strong>×2 XP Бустер</strong> и <strong>Золотая VIP-Аура</strong> в Лидерборде;</li>
              <li>• <strong>Безлимитный Нейро-Блиц</strong> для борьбы за 🥇 Топ-1 Лиги;</li>
              <li>• <strong>Мгновенный бонус:</strong> +100 XP, +2 💎 NZT и +500 💰 Coins!</li>
            </ul>

            {state.proPassActive && (
              <div
                data-testid="pro-pass-active-badge"
                className="bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-xl px-3 py-2 text-xs font-black flex items-center justify-between"
              >
                <span>👑 Статус NZT Pass PRO Активен!</span>
                <span>×2 Доход & ×2 XP ✓</span>
              </div>
            )}

            <button
              type="button"
              data-testid="activate-pro-pass-btn"
              onClick={() => {
                haptics.notification('success');
                onActivateProPass();
              }}
              className={`w-full py-3 rounded-xl text-xs font-black transition-all ${
                state.proPassActive
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md'
              }`}
            >
              {state.proPassActive
                ? '👑 NZT Pass (Сверхчеловек PRO) Активен ✓'
                : '⭐ Активировать NZT Pass PRO (250 ⭐ / 59 000 сум → +100 XP + 2 💎 + 500 💰)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
