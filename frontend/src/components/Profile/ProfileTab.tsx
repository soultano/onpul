import React, { useState } from 'react';
import { AvatarDisplay } from '../AvatarDisplay';
import { useTelegram } from '../../hooks/useTelegram';
import { api } from '../../services/api';
import { getAvatarStage } from '../../config/xp';

interface ProfileTabProps {
  user: any;
  levelInfo: any;
  stats: any;
  achievements: any[];
  history: any[];
  onRefresh: () => void;
  onResetAll: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  levelInfo,
  stats,
  achievements,
  history,
  onRefresh,
  onResetAll,
}) => {
  const { haptics } = useTelegram();

  const [activeSubView, setActiveSubView] = useState<'profile' | 'history' | 'achievements' | 'settings'>('profile');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);

  // Редактирование профиля
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.firstName || '');
  const [gender, setGender] = useState(user?.gender || 'male');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [city, setCity] = useState(user?.city || '');
  const [occupation, setOccupation] = useState(user?.occupation || 'найм');
  const [currency, setCurrency] = useState(user?.currency || 'UZS');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    haptics.impact('medium');
    try {
      await api.updateMe({
        firstName: name,
        gender,
        age: age ? parseInt(age, 10) : undefined,
        city,
        occupation,
        currency,
      });
      haptics.notification('success');
      setIsEditing(false);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert('Ошибка при сохранении данных');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    haptics.impact('heavy');
    if (!confirm('Вы уверены, что хотите сбросить ВСЕ свои финансовые данные, уровень и прогресс квизов? Это действие необратимо!')) {
      return;
    }
    try {
      await api.resetData();
      alert('Данные успешно сброшены');
      onResetAll();
    } catch (e) {
      console.error(e);
      alert('Ошибка сброса данных');
    }
  };

  const avatarStage = getAvatarStage(levelInfo?.level || 1);

  return (
    <div className="space-y-4 pb-28 animate-float-up">
      {/* ПЕРЕКЛЮЧАТЕЛЬ ПОДРАЗДЕЛОВ ПРОФИЛЯ */}
      <div className="flex bg-tg-secondaryBg p-1 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => {
            setActiveSubView('profile');
            haptics.selection();
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeSubView === 'profile' ? 'bg-primary-600 text-white shadow-sm' : 'text-tg-hint'
          }`}
        >
          👤 Профиль
        </button>
        <button
          onClick={() => {
            setActiveSubView('history');
            haptics.selection();
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeSubView === 'history' ? 'bg-primary-600 text-white shadow-sm' : 'text-tg-hint'
          }`}
        >
          📜 История
        </button>
        <button
          onClick={() => {
            setActiveSubView('achievements');
            haptics.selection();
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeSubView === 'achievements' ? 'bg-primary-600 text-white shadow-sm' : 'text-tg-hint'
          }`}
        >
          🏆 Бейджи
        </button>
        <button
          onClick={() => {
            setActiveSubView('settings');
            haptics.selection();
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeSubView === 'settings' ? 'bg-primary-600 text-white shadow-sm' : 'text-tg-hint'
          }`}
        >
          ⚙️ Опции
        </button>
      </div>

      {/* 1. ПОДРАЗДЕЛ: ПРОФИЛЬ И СТАТИСТИКА */}
      {activeSubView === 'profile' && (
        <div className="space-y-4 animate-float-up">
          <div className="bg-tg-secondaryBg rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <div className="flex justify-center mb-3">
              <AvatarDisplay gender={user?.gender || 'male'} stage={avatarStage} size={84} />
            </div>

            <h2 className="text-lg font-black text-tg-text">{user?.firstName}</h2>
            <div className="text-xs text-primary-600 font-extrabold mb-1">
              Уровень {levelInfo?.level} • {levelInfo?.title}
            </div>
            <div className="text-[11px] text-tg-hint mb-4">
              {user?.username ? `@${user.username}` : 'Telegram аккаунт'}
            </div>

            {/* Карточки статистики */}
            <div className="grid grid-cols-2 gap-2 text-left mb-4">
              <div className="p-3 rounded-2xl bg-tg-bg border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-tg-hint font-bold">Суммарный опыт</div>
                <div className="text-sm font-black text-primary-600 mt-0.5">{user?.xp} XP</div>
              </div>
              <div className="p-3 rounded-2xl bg-tg-bg border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-tg-hint font-bold">Дней в игре</div>
                <div className="text-sm font-black text-tg-text mt-0.5">{stats?.completedDays || 0} дн.</div>
              </div>
              <div className="p-3 rounded-2xl bg-tg-bg border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-tg-hint font-bold">Точность ответов</div>
                <div className="text-sm font-black text-tg-text mt-0.5">{stats?.accuracyPercent || 0}%</div>
              </div>
              <div className="p-3 rounded-2xl bg-tg-bg border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-tg-hint font-bold">Рекорд стрика</div>
                <div className="text-sm font-black text-amber-600 mt-0.5">🔥 {stats?.bestStreak || 0} дн.</div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-tg-text hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {isEditing ? 'Скрыть редактирование' : 'Редактировать данные профиля'}
            </button>
          </div>

          {/* Форма редактирования */}
          {isEditing && (
            <div className="bg-tg-secondaryBg rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 animate-float-up">
              <h3 className="text-xs font-extrabold text-tg-text uppercase">Личные данные</h3>

              <div>
                <label className="block text-[10px] font-bold text-tg-hint mb-1">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-tg-bg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-tg-hint mb-1">Персонаж</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGender('male')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                      gender === 'male' ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-600' : 'border-slate-200'
                    }`}
                  >
                    Парень
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                      gender === 'female' ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-600' : 'border-slate-200'
                    }`}
                  >
                    Девушка
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-tg-hint mb-1">Возраст</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-tg-bg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-tg-hint mb-1">Город</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-tg-bg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-tg-hint mb-1">Род занятий</label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-tg-bg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  <option value="найм">Работа в найме</option>
                  <option value="свой бизнес">Свой бизнес</option>
                  <option value="фриланс">Фриланс</option>
                  <option value="студент">Студент</option>
                  <option value="другое">Другое</option>
                </select>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. ПОДРАЗДЕЛ: ИСТОРИЯ КВИЗОВ */}
      {activeSubView === 'history' && (
        <div className="space-y-3 animate-float-up">
          <div className="px-1 text-xs text-tg-hint font-bold">
            Всего пройдено квизов: {history.length}
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-xs text-tg-hint bg-tg-secondaryBg rounded-3xl border border-slate-100 dark:border-slate-800">
              Пока нет пройденных квизов. Пройдите задание дня на главной вкладке!
            </div>
          ) : (
            history.map((h: any) => (
              <div
                key={h.id}
                onClick={() => {
                  setSelectedHistoryItem(h);
                  haptics.selection();
                }}
                className="p-4 rounded-2xl bg-tg-secondaryBg border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary-500/40 transition-all flex items-center justify-between"
              >
                <div className="pr-3">
                  <div className="font-extrabold text-xs text-tg-text line-clamp-1 mb-1">
                    {h.newsTitle}
                  </div>
                  <div className="text-[10px] text-tg-hint">
                    {new Date(h.date).toLocaleDateString('ru-RU')} • Результат: {h.correctCount} из {h.totalQuestions}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-primary-600">+{h.xpEarned} XP</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. ПОДРАЗДЕЛ: ДОСТИЖЕНИЯ (БЕЙДЖИ) */}
      {activeSubView === 'achievements' && (
        <div className="space-y-3 animate-float-up">
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((ach: any) => (
              <div
                key={ach.code}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  ach.isUnlocked
                    ? 'bg-tg-secondaryBg border-primary-500/40 shadow-sm'
                    : 'bg-tg-secondaryBg/40 border-slate-100 dark:border-slate-800 opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl mb-2">{ach.icon}</div>
                <div className="font-black text-xs text-tg-text mb-1">{ach.title}</div>
                <div className="text-[10px] text-tg-hint leading-tight mb-2">{ach.desc}</div>
                {ach.isUnlocked ? (
                  <span className="inline-block bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    Разблокировано ✓
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-tg-hint">В процессе</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ПОДРАЗДЕЛ: ОПЦИИ И СБРОС */}
      {activeSubView === 'settings' && (
        <div className="space-y-4 animate-float-up">
          <div className="bg-tg-secondaryBg rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-tg-text">Настройки приложения</h3>

            <div>
              <label className="block text-xs font-bold text-tg-hint mb-1">Основная валюта</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  api.updateMe({ currency: e.target.value }).then(onRefresh);
                }}
                className="w-full p-2.5 rounded-xl bg-tg-bg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                <option value="UZS">UZS (Узбекский сум)</option>
                <option value="USD">USD (Доллар США)</option>
                <option value="RUB">RUB (Российский рубль)</option>
                <option value="KZT">KZT (Казахстанский тенге)</option>
                <option value="EUR">EUR (Евро)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-extrabold text-tg-text mb-1">Опасная зона</div>
              <p className="text-[11px] text-tg-hint mb-3">
                Сброс удалит все введенные доходы, расходы, кредиты и историю квизов, вернув профиль к 1 уровню.
              </p>
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors"
              >
                Удалить все данные и начать заново
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ПРОСМОТРА ИСТОРИИ КВИЗА */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-float-up">
          <div className="w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl bg-tg-bg border border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-extrabold text-xs text-primary-600 uppercase">
                Архив квиза • {selectedHistoryItem.correctCount} из 3 верных
              </h3>
              <button onClick={() => setSelectedHistoryItem(null)} className="text-tg-hint font-bold text-sm">
                ✕
              </button>
            </div>

            <div className="font-black text-sm text-tg-text mb-2">{selectedHistoryItem.newsTitle}</div>
            <p className="text-xs text-tg-hint leading-relaxed bg-tg-secondaryBg p-3 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
              {selectedHistoryItem.newsText}
            </p>

            <div className="space-y-3 mb-4">
              {selectedHistoryItem.questions.map((q: any, idx: number) => {
                const userAns = selectedHistoryItem.userAnswers[idx];
                const isCorrect = userAns === q.correctIndex;
                return (
                  <div key={idx} className="p-3 rounded-2xl bg-tg-secondaryBg border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="font-bold text-tg-text mb-1">
                      {idx + 1}. {q.text}
                    </div>
                    <div className={`text-[11px] font-extrabold mb-1.5 ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isCorrect ? '✓ Ваш ответ был правильным' : `✗ Ваш выбор: "${q.options[userAns]}"`}
                    </div>
                    <div className="text-[11px] text-tg-hint bg-tg-bg p-2 rounded-xl">
                      <strong>Правильно:</strong> {q.options[q.correctIndex]}
                      <div className="mt-0.5 opacity-90">{q.explanation}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSelectedHistoryItem(null)}
              className="w-full py-3 rounded-2xl bg-tg-secondaryBg border border-slate-200 dark:border-slate-700 font-bold text-xs text-tg-text"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
