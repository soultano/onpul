import { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { useTelegram } from './hooks/useTelegram';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { HomeTab } from './components/Home/HomeTab';
import { FinanceTab } from './components/Finance/FinanceTab';
import { ProfileTab } from './components/Profile/ProfileTab';
import { DailyQuizModal } from './components/DailyQuiz/DailyQuizModal';
import { LevelUpModal } from './components/LevelUpModal';

export function App() {
  const { haptics } = useTelegram();

  // Основное состояние приложения
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [levelInfo, setLevelInfo] = useState<any>(null);
  const [todayQuiz, setTodayQuiz] = useState<any>(null);
  const [finances, setFinances] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Навигация (3 вкладки)
  const [currentTab, setCurrentTab] = useState<'finance' | 'home' | 'profile'>('home');

  // Модальные окна
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ isOpen: boolean; level: number; title: string } | null>(null);

  // Всплывающий тост XP
  const [toastXp, setToastXp] = useState<number | null>(null);

  const showXpToast = (xp: number) => {
    if (xp <= 0) return;
    setToastXp(xp);
    setTimeout(() => setToastXp(null), 2500);
  };

  // Загрузка данных пользователя
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const authRes = await api.auth();
      setUser(authRes.user);
      setLevelInfo(authRes.levelInfo);

      // Параллельно подгружаем квиз и финансы
      const [qData, fData, mData, achData, histData] = await Promise.all([
        api.getTodayQuiz().catch(() => null),
        api.getFinances().catch(() => null),
        api.getMe().catch(() => null),
        api.getAchievements().catch(() => ({ achievements: [] })),
        api.getHistory().catch(() => ({ history: [] })),
      ]);

      setTodayQuiz(qData);
      setFinances(fData);
      if (mData) {
        setUser(mData.user);
        setLevelInfo(mData.levelInfo);
        setStats(mData.stats);
      }
      setAchievements(achData.achievements || []);
      setHistory(histData.history || []);
    } catch (err) {
      console.error('Initial load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Обработка начисления XP из любого места приложения
  const handleXpAwarded = (xpGained: number, levelUp: boolean, newLevel: number, newTitle: string) => {
    if (xpGained > 0) {
      showXpToast(xpGained);
    }

    // Обновляем локальное состояние пользователя
    if (user) {
      setUser((prev: any) => ({
        ...prev,
        xp: (prev.xp || 0) + xpGained,
        level: newLevel || prev.level,
      }));
    }

    if (levelUp) {
      setLevelUpData({
        isOpen: true,
        level: newLevel,
        title: newTitle,
      });
    }

    // Обновляем данные с сервера
    loadData();
  };

  // Завершение онбординга
  const handleOnboardingComplete = (updatedUser: any, newLevelInfo: any, xpGained: number) => {
    setUser(updatedUser);
    setLevelInfo(newLevelInfo);
    if (xpGained > 0) {
      showXpToast(xpGained);
    }
    loadData();
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-tg-bg text-tg-text flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mb-4"></div>
        <div className="text-sm font-extrabold text-tg-text">Загрузка игры ФинУровень...</div>
        <div className="text-xs text-tg-hint mt-1">Зеркало ваших личных финансов</div>
      </div>
    );
  }

  // Если у пользователя не выбран персонаж — запускаем онбординг
  if (!user || user.gender === 'none') {
    return (
      <OnboardingFlow
        initialUser={user || {}}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text max-w-md mx-auto relative flex flex-col justify-between">
      {/* ПЛАВАЮЩИЙ ТОСТ НАЧИСЛЕНИЯ ОПЫТА */}
      {toastXp && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary-600 text-white font-black text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-float-up">
          <span>⚡</span>
          <span>+{toastXp} XP получено!</span>
        </div>
      )}

      {/* ОСНОВНОЙ КОНТЕНТ ВКЛАДОК */}
      <main className="p-4 flex-1">
        {currentTab === 'finance' && (
          <FinanceTab
            user={user}
            financeData={finances}
            onRefresh={loadData}
            onXpAwarded={handleXpAwarded}
          />
        )}

        {currentTab === 'home' && (
          <HomeTab
            user={user}
            levelInfo={levelInfo}
            todayQuizData={todayQuiz}
            financeSummary={finances?.summary}
            onOpenQuiz={() => setIsQuizModalOpen(true)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileTab
            user={user}
            levelInfo={levelInfo}
            stats={stats}
            achievements={achievements}
            history={history}
            onRefresh={loadData}
            onResetAll={loadData}
          />
        )}
      </main>

      {/* НИЖНЯЯ ФИКСИРОВАННАЯ ПАНЕЛЬ (3 ВКЛАДКИ) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-tg-bg/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex justify-between items-center z-40">
        {/* 1. Мои финансы (слева) */}
        <button
          onClick={() => {
            setCurrentTab('finance');
            haptics.selection();
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'finance' ? 'text-primary-600 font-extrabold' : 'text-tg-hint'
          }`}
        >
          <span className="text-lg">📊</span>
          <span className="text-[11px] font-bold">Мои финансы</span>
        </button>

        {/* 2. Главная (по центру, по умолчанию) */}
        <button
          onClick={() => {
            setCurrentTab('home');
            haptics.selection();
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'home' ? 'text-primary-600 font-extrabold' : 'text-tg-hint'
          }`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[11px] font-bold">Главная</span>
        </button>

        {/* 3. Профиль (справа) */}
        <button
          onClick={() => {
            setCurrentTab('profile');
            haptics.selection();
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'profile' ? 'text-primary-600 font-extrabold' : 'text-tg-hint'
          }`}
        >
          <span className="text-lg">👤</span>
          <span className="text-[11px] font-bold">Профиль</span>
        </button>
      </nav>

      {/* МОДАЛКА ЗАДАНИЯ ДНЯ */}
      {isQuizModalOpen && todayQuiz && (
        <DailyQuizModal
          isOpen={isQuizModalOpen}
          quizData={todayQuiz}
          onClose={() => setIsQuizModalOpen(false)}
          onFinish={(finishResult) => {
            handleXpAwarded(
              finishResult.xpGained,
              finishResult.levelUp,
              finishResult.level,
              finishResult.title
            );
          }}
        />
      )}

      {/* МОДАЛКА ПОВЫШЕНИЯ УРОВНЯ */}
      {levelUpData?.isOpen && (
        <LevelUpModal
          isOpen={levelUpData.isOpen}
          level={levelUpData.level}
          title={levelUpData.title}
          gender={user?.gender || 'male'}
          onClose={() => setLevelUpData(null)}
        />
      )}
    </div>
  );
}
