import { useState, useEffect, useCallback } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { api } from './services/api';
import {
  LIMITLESS_XP_REWARDS,
  calculateLevelAndProgress,
} from './config/xp';
import {
  CharacterGender,
  LimitlessGameState,
  STORAGE_KEY,
  createInitialGameState,
} from './types/game';
import { CHARACTER_PROFILES } from './data/limitlessContent';
import { CharacterSelectScreen } from './components/Onboarding/CharacterSelectScreen';
import { ArrowTutorialOverlay } from './components/Tutorial/ArrowTutorialOverlay';
import { MainCharacterScreen } from './components/Home/MainCharacterScreen';
import { FinanceAndTasksScreen } from './components/Finance/FinanceAndTasksScreen';
import { SettingsAndKycScreen } from './components/Profile/SettingsAndKycScreen';
import { LeaderboardModal } from './components/Modals/LeaderboardModal';
import {
  FriendsModal,
  GoalsAndDebtsModal,
  PaydayModal,
} from './components/Modals/QuickActionModals';
import { LevelUpModal } from './components/LevelUpModal';

function loadInitialState(defaultName?: string, defaultUsername?: string): LimitlessGameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'hasSelectedCharacter' in parsed) {
        return parsed as LimitlessGameState;
      }
    }
  } catch (e) {}
  return createInitialGameState(defaultName, defaultUsername);
}

export function App() {
  const { user: tgUser, haptics } = useTelegram();

  const [gameState, setGameState] = useState<LimitlessGameState>(() =>
    loadInitialState(tgUser?.first_name, tgUser?.username)
  );

  // Вкладки нижнего меню: 'finance' (слева) | 'character' (центр) | 'settings' (справа)
  const [currentTab, setCurrentTab] = useState<'finance' | 'character' | 'settings'>('character');

  // Пошаговый гид со стрелками (5 шагов)
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Модальные окна кругляшков и лидерборда
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isPaydayModalOpen, setIsPaydayModalOpen] = useState<boolean>(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState<boolean>(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState<boolean>(false);

  // Тост XP и Модалка Level Up
  const [toastXp, setToastXp] = useState<number | null>(null);
  const [levelUpBanner, setLevelUpBanner] = useState<{
    isOpen: boolean;
    level: number;
    title: string;
  } | null>(null);

  // Мгновенное сохранение в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {}
  }, [gameState]);

  // Фоновая синхронизация с бэкендом (не блокирует UI)
  useEffect(() => {
    api.auth().catch(() => null);
  }, []);

  const triggerXpToast = useCallback((xpAmount: number) => {
    if (xpAmount <= 0) return;
    setToastXp(xpAmount);
  }, []);

  useEffect(() => {
    if (!toastXp) return;
    const t = setTimeout(() => setToastXp(null), 2600);
    return () => clearTimeout(t);
  }, [toastXp]);

  // Универсальная функция обновления состояния с проверкой повышения уровня
  const updateStateWithXp = useCallback(
    (
      xpDelta: number,
      updater: (prev: LimitlessGameState) => LimitlessGameState
    ) => {
      setGameState((prev) => {
        const oldLvl = calculateLevelAndProgress(prev.xp).level;
        const updated = updater(prev);
        const finalXp = updated.xp + xpDelta;
        const newLvlInfo = calculateLevelAndProgress(finalXp);

        if (xpDelta > 0) {
          triggerXpToast(xpDelta);
        }

        if (newLvlInfo.level > oldLvl) {
          setLevelUpBanner({
            isOpen: true,
            level: newLvlInfo.level,
            title: newLvlInfo.stageShortTitle,
          });
        }

        return {
          ...updated,
          xp: finalXp,
        };
      });
    },
    [triggerXpToast]
  );

  // 1. Выбор персонажа при первом входе
  const handleStartGame = (gender: CharacterGender, playerName: string) => {
    setGameState((prev) => ({
      ...prev,
      hasSelectedCharacter: true,
      gender,
      playerName,
      profileQuests: {
        ...prev.profileQuests,
        kycFullName:
          gender === 'female' ? `${playerName} Каримова` : `${playerName} Каримов`,
      },
    }));
    setCurrentTab('character');
    setIsTutorialOpen(true);
  };

  // 2. Завершение 5-шагового обучения со стрелками (+25 XP)
  const handleTutorialComplete = () => {
    setIsTutorialOpen(false);
    const reward = gameState.tutorialRewardClaimed
      ? 0
      : LIMITLESS_XP_REWARDS.TUTORIAL_COMPLETE;
    updateStateWithXp(reward, (prev) => ({
      ...prev,
      tutorialCompleted: true,
      tutorialRewardClaimed: true,
    }));
  };

  const handleTutorialSkip = () => {
    setIsTutorialOpen(false);
    setGameState((prev) => ({
      ...prev,
      tutorialCompleted: true,
    }));
  };

  // 3. Добавление Прихода (+15 XP) или Расхода (+10 XP)
  const handleAddTransaction = (
    type: 'income' | 'expense',
    amount: number,
    category: string,
    categoryLabel: string,
    categoryIcon: string
  ) => {
    const xpReward =
      type === 'income'
        ? LIMITLESS_XP_REWARDS.ADD_INCOME
        : LIMITLESS_XP_REWARDS.ADD_EXPENSE;

    updateStateWithXp(xpReward, (prev) => {
      const newBalance =
        type === 'income'
          ? prev.balance + amount
          : Math.max(0, prev.balance - amount);

      const newTx = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        amount,
        category,
        categoryLabel,
        categoryIcon,
        createdAt: 'Только что',
        xpEarned: xpReward,
      };

      return {
        ...prev,
        balance: newBalance,
        transactions: [newTx, ...prev.transactions],
      };
    });
  };

  // 4. Выполнение Ежедневного задания (+100 XP)
  const handleCompleteDailyTask = (dayNumber: number) => {
    const alreadyDone = gameState.completedDailyTasks.includes(dayNumber);
    const xpReward = alreadyDone
      ? 0
      : LIMITLESS_XP_REWARDS.COMPLETE_DAILY_TASK;

    updateStateWithXp(xpReward, (prev) => ({
      ...prev,
      streak: alreadyDone ? prev.streak : prev.streak + 1,
      completedDailyTasks: alreadyDone
        ? prev.completedDailyTasks
        : [...prev.completedDailyTasks, dayNumber],
    }));
  };

  // 5. Добавление Цели или Обязательного платежа/Долга (+40 XP)
  const handleAddGoalOrDebt = (
    kind: 'goal' | 'debt',
    title: string,
    amount: number,
    dueDateOrTarget: string
  ) => {
    const xpReward = LIMITLESS_XP_REWARDS.ADD_GOAL_OR_DEBT;
    updateStateWithXp(xpReward, (prev) => ({
      ...prev,
      goalsAndDebts: [
        {
          id: `gd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          kind,
          title,
          amount,
          dueDateOrTarget,
          completed: false,
        },
        ...prev.goalsAndDebts,
      ],
    }));
  };

  // 6. Сохранение настройки «Доступно до зарплаты» (+50 XP)
  const handleSavePayday = (balance: number, daysUntilPayday: number) => {
    const xpReward = gameState.profileQuests.paydayClaimed
      ? 0
      : LIMITLESS_XP_REWARDS.SETUP_PAYDAY;

    updateStateWithXp(xpReward, (prev) => ({
      ...prev,
      balance,
      daysUntilPayday,
      profileQuests: {
        ...prev.profileQuests,
        paydayClaimed: true,
      },
    }));
  };

  // 7. Приглашение друга (+50 XP)
  const handleInviteFriend = () => {
    updateStateWithXp(LIMITLESS_XP_REWARDS.INVITE_FRIEND, (prev) => ({
      ...prev,
      invitedFriendsCount: prev.invitedFriendsCount + 1,
    }));
  };

  // 8. Квесты профиля: @username (+25 XP), Email (+30 XP), KYC (+80 XP)
  const handleClaimUsername = (username: string) => {
    const xpReward = gameState.profileQuests.usernameClaimed
      ? 0
      : LIMITLESS_XP_REWARDS.CLAIM_USERNAME;
    updateStateWithXp(xpReward, (prev) => ({
      ...prev,
      profileQuests: {
        ...prev.profileQuests,
        username: username.startsWith('@') ? username : `@${username}`,
        usernameClaimed: true,
      },
    }));
  };

  const handleClaimEmail = (email: string) => {
    const xpReward = gameState.profileQuests.emailClaimed
      ? 0
      : LIMITLESS_XP_REWARDS.CLAIM_EMAIL;
    updateStateWithXp(xpReward, (prev) => ({
      ...prev,
      profileQuests: {
        ...prev.profileQuests,
        email,
        emailClaimed: true,
      },
    }));
  };

  const handleClaimKyc = (fullName: string, city: string, occupation: string) => {
    const xpReward = gameState.profileQuests.kycClaimed
      ? 0
      : LIMITLESS_XP_REWARDS.CLAIM_KYC;
    updateStateWithXp(xpReward, (prev) => ({
      ...prev,
      profileQuests: {
        ...prev.profileQuests,
        kycFullName: fullName,
        kycCity: city,
        kycOccupation: occupation,
        kycClaimed: true,
      },
    }));
  };

  // 9. Переключение пола персонажа в 1 клик
  const handleSwitchGender = () => {
    setGameState((prev) => {
      const nextGender: CharacterGender =
        prev.gender === 'male' ? 'female' : 'male';
      const nextDefaultName = CHARACTER_PROFILES[nextGender].defaultPlayerName;
      const shouldUpdateName =
        prev.playerName === 'Тимур' ||
        prev.playerName === 'Алия' ||
        prev.playerName === 'Эдди';

      return {
        ...prev,
        gender: nextGender,
        playerName: shouldUpdateName ? nextDefaultName : prev.playerName,
      };
    });
  };

  // 10. Сброс демо-прогресса
  const handleResetProgress = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setIsTutorialOpen(false);
    setLevelUpBanner(null);
    setGameState(createInitialGameState(tgUser?.first_name, tgUser?.username));
  };

  const closeAllModals = () => {
    setIsLeaderboardOpen(false);
    setIsPaydayModalOpen(false);
    setIsGoalsModalOpen(false);
    setIsFriendsModalOpen(false);
  };

  // Если персонаж ещё не выбран — показываем стартовый экран выбора героя
  if (!gameState.hasSelectedCharacter) {
    return (
      <CharacterSelectScreen
        initialName={gameState.playerName}
        onStartGame={handleStartGame}
      />
    );
  }

  const levelInfo = calculateLevelAndProgress(gameState.xp);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 max-w-md mx-auto relative flex flex-col justify-between">
      {/* ВСПЛЫВАЮЩИЙ БЕЙДЖ НАЧИСЛЕНИЯ ОПЫТА (+XX XP ⚡) */}
      {toastXp !== null && (
        <div
          data-testid="xp-toast"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none bg-emerald-600 text-white font-black text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-float-up"
        >
          <span>+{toastXp} XP ⚡</span>
        </div>
      )}

      {/* ОСНОВНОЙ КОНТЕНТ ТЕКУЩЕГО ЭКРАНА */}
      <main className="p-3.5 flex-1">
        {currentTab === 'finance' && (
          <FinanceAndTasksScreen
            state={gameState}
            onAddTransaction={handleAddTransaction}
            onCompleteDailyTask={handleCompleteDailyTask}
            onAddGoalOrDebt={handleAddGoalOrDebt}
          />
        )}

        {currentTab === 'character' && (
          <MainCharacterScreen
            state={gameState}
            levelInfo={levelInfo}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
            onOpenPaydayModal={() => setIsPaydayModalOpen(true)}
            onOpenFriendsModal={() => setIsFriendsModalOpen(true)}
            onNavigateKyc={() => setCurrentTab('settings')}
            onNavigateFinance={() => setCurrentTab('finance')}
            onRestartTutorial={() => setIsTutorialOpen(true)}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsAndKycScreen
            state={gameState}
            levelInfo={levelInfo}
            onClaimUsername={handleClaimUsername}
            onClaimEmail={handleClaimEmail}
            onClaimKyc={handleClaimKyc}
            onClaimPayday={handleSavePayday}
            onSwitchGender={handleSwitchGender}
            onRestartTutorial={() => {
              setCurrentTab('character');
              setIsTutorialOpen(true);
            }}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>

      {/* НИЖНЕЕ МЕНЮ ИЗ 3 КНОПОК С БОЛЬШОЙ ЦЕНТРАЛЬНОЙ КНОПКОЙ ПЕРСОНАЖА */}
      <nav
        data-testid="bottom-navigation"
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-end justify-between z-40 shadow-[0_-4px_20px_rgba(15,23,42,0.05)]"
      >
        {/* 1. Кнопка Слева: «Учёт и Задания» */}
        <button
          type="button"
          data-testid="nav-finance-tasks"
          onClick={() => {
            closeAllModals();
            setCurrentTab('finance');
            haptics.selection();
          }}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1 rounded-2xl transition-colors ${
            currentTab === 'finance'
              ? 'text-emerald-600 font-black'
              : 'text-slate-500 hover:text-slate-800 font-bold'
          }`}
        >
          <span className="text-lg leading-none">⚡</span>
          <span className="text-[11px]">Учёт и Задания</span>
        </button>

        {/* 2. Кнопка По Центру (Большая круглая/выступающая кнопка): «Персонаж (Главный)» */}
        <div className="flex-1 flex justify-center">
          <button
            type="button"
            data-testid="nav-character-main"
            onClick={() => {
              closeAllModals();
              setCurrentTab('character');
              haptics.selection();
            }}
            className="group -mt-6 flex flex-col items-center focus:outline-none"
          >
            <div
              className={`w-15 h-15 w-[60px] h-[60px] rounded-full flex items-center justify-center border-4 transition-all shadow-lg ${
                currentTab === 'character'
                  ? 'bg-gradient-to-tr from-emerald-600 to-sky-500 border-white scale-105 shadow-emerald-600/30'
                  : 'bg-white border-emerald-500 hover:scale-105'
              }`}
            >
              <img
                src={CHARACTER_PROFILES[gameState.gender].imageUrl}
                alt="Персонаж"
                className="w-full h-full rounded-full object-cover object-top"
              />
            </div>
            <span
              className={`text-[11px] mt-0.5 ${
                currentTab === 'character'
                  ? 'text-emerald-700 font-black'
                  : 'text-slate-600 font-bold'
              }`}
            >
              Персонаж
            </span>
          </button>
        </div>

        {/* 3. Кнопка Справа: «Настройки и KYC (+XP)» */}
        <button
          type="button"
          data-testid="nav-settings-kyc"
          onClick={() => {
            closeAllModals();
            setCurrentTab('settings');
            haptics.selection();
          }}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1 rounded-2xl transition-colors ${
            currentTab === 'settings'
              ? 'text-emerald-600 font-black'
              : 'text-slate-500 hover:text-slate-800 font-bold'
          }`}
        >
          <span className="text-lg leading-none">🛡️</span>
          <span className="text-[11px]">Настройки и KYC</span>
        </button>
      </nav>

      {/* ИНТЕРАКТИВНОЕ ОБУЧЕНИЕ СО СТРЕЛКАМИ (5 ШАГОВ) */}
      <ArrowTutorialOverlay
        isOpen={isTutorialOpen}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />

      {/* МОДАЛКА ЛИДЕРБОРДА (ТОП 1-2-3 МЕСТО) */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        playerName={gameState.playerName}
        playerGender={gameState.gender}
        playerCity={gameState.profileQuests.kycCity}
        playerXp={gameState.xp}
        playerStreak={gameState.streak}
      />

      {/* МОДАЛКА КАЛЬКУЛЯТОРА «ДОСТУПНО ДО ЗАРПЛАТЫ» */}
      <PaydayModal
        isOpen={isPaydayModalOpen}
        onClose={() => setIsPaydayModalOpen(false)}
        state={gameState}
        onSavePayday={handleSavePayday}
      />

      {/* МОДАЛКА ЦЕЛЕЙ И ДОЛГОВ */}
      <GoalsAndDebtsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        goalsAndDebts={gameState.goalsAndDebts}
        onAddGoalOrDebt={handleAddGoalOrDebt}
      />

      {/* МОДАЛКА ПРИГЛАШЕНИЯ ДРУЗЕЙ (+50 XP) */}
      <FriendsModal
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
        invitedCount={gameState.invitedFriendsCount}
        onInviteFriend={handleInviteFriend}
      />

      {/* МОДАЛКА / БАННЕР ПОВЫШЕНИЯ УРОВНЯ (LEVEL UP!) */}
      {levelUpBanner?.isOpen && (
        <LevelUpModal
          isOpen={levelUpBanner.isOpen}
          level={levelUpBanner.level}
          title={levelUpBanner.title}
          gender={gameState.gender}
          onClose={() => setLevelUpBanner(null)}
        />
      )}
    </div>
  );
}
