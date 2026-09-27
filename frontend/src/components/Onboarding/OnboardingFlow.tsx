import React, { useState } from 'react';
import { AvatarDisplay } from '../AvatarDisplay';
import { useTelegram } from '../../hooks/useTelegram';
import { api } from '../../services/api';

interface OnboardingFlowProps {
  initialUser: any;
  onComplete: (updatedUser: any, levelInfo: any, xpGained: number) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ initialUser, onComplete }) => {
  const { haptics } = useTelegram();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Форма онбординга
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [name, setName] = useState(initialUser.firstName || 'Нодирбек');
  const [username] = useState(initialUser.username || '');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [occupation, setOccupation] = useState('найм');
  const [currency, setCurrency] = useState('UZS');
  const [loading, setLoading] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const handleNext = () => {
    haptics.impact('light');
    setStep((prev) => Math.min(4, prev + 1) as any);
  };

  const handleSubmitPersonalData = async () => {
    setLoading(true);
    haptics.impact('medium');

    try {
      const payload: any = {
        firstName: name.trim(),
        gender,
        currency,
        timezone: 'Asia/Tashkent',
      };

      if (age) payload.age = parseInt(age, 10);
      if (city.trim()) payload.city = city.trim();
      if (occupation) payload.occupation = occupation;

      const res = await api.updateMe(payload);
      setEarnedXp(res.xpGained || 35);
      setStep(4);
      haptics.notification('success');

      // Даем пользователю полюбоваться праздничной анимацией перед переходом
      setTimeout(() => {
        onComplete(res.user, res.levelInfo, res.xpGained);
      }, 2400);
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении данных. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text p-5 flex flex-col justify-between max-w-md mx-auto">
      {/* ЭКРАН 1: ПРИВЕТСТВИЕ И ДИСКЛЕЙМЕР */}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-center animate-float-up">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-3xl mb-6 shadow-sm">
            🌱
          </div>

          <h1 className="text-2xl font-black mb-3 text-tg-text leading-tight">
            Добро пожаловать в игру <span className="text-primary-600">«ФинУровень»</span>
          </h1>

          <p className="text-sm text-tg-hint mb-6 leading-relaxed">
            Здесь вы прокачиваете свою реальную финансовую грамотность, шаг за шагом увеличивая уровень от 1 до 80.
          </p>

          {/* Большое важное предупреждение */}
          <div className="bg-primary-50/80 border border-primary-500/30 rounded-2xl p-4 mb-8 text-xs text-tg-text leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-primary-700 mb-1.5 text-sm">
              <span>🛡️</span>
              <span>ПРАВИЛО ЗЕРКАЛА ФИНАНСОВ:</span>
            </div>
            Вводите только свои настоящие данные: реальную зарплату, расходы, вклады и кредиты.
            Игра работает как зеркало ваших финансов — чем честнее данные, тем больше пользы.
            <div className="mt-2 text-tg-hint">
              <strong>Суммы не влияют на ваш уровень</strong>, баллы начисляются только за заполнение.
              Ваши данные видите только вы. Приложение не является финансовой консультацией.
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base shadow-lg shadow-primary-600/25 transition-transform active:scale-95"
          >
            Начать путешествие →
          </button>
        </div>
      )}

      {/* ЭКРАН 2: ВЫБОР ПЕРСОНАЖА */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-center animate-float-up text-center">
          <h2 className="text-xl font-black mb-1 text-tg-text">Выберите персонажа</h2>
          <p className="text-xs text-tg-hint mb-8">
            Внешний вид персонажа будет эволюционировать каждые 10 уровней. Выбор можно изменить в любой момент.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Мужской */}
            <div
              onClick={() => {
                setGender('male');
                haptics.selection();
              }}
              className={`p-5 rounded-3xl border-2 flex flex-col items-center cursor-pointer transition-all ${
                gender === 'male'
                  ? 'border-primary-600 bg-primary-50/50 shadow-md scale-105'
                  : 'border-slate-200 dark:border-slate-700 bg-tg-secondaryBg opacity-70'
              }`}
            >
              <AvatarDisplay gender="male" stage={1} size={84} />
              <div className="mt-3 font-bold text-sm text-tg-text">Парень</div>
              <div className="text-[11px] text-primary-600 font-semibold">+20 XP</div>
            </div>

            {/* Женский */}
            <div
              onClick={() => {
                setGender('female');
                haptics.selection();
              }}
              className={`p-5 rounded-3xl border-2 flex flex-col items-center cursor-pointer transition-all ${
                gender === 'female'
                  ? 'border-primary-600 bg-primary-50/50 shadow-md scale-105'
                  : 'border-slate-200 dark:border-slate-700 bg-tg-secondaryBg opacity-70'
              }`}
            >
              <AvatarDisplay gender="female" stage={1} size={84} />
              <div className="mt-3 font-bold text-sm text-tg-text">Девушка</div>
              <div className="text-[11px] text-primary-600 font-semibold">+20 XP</div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base shadow-lg shadow-primary-600/25 transition-transform active:scale-95"
          >
            Далее (+20 XP) →
          </button>
        </div>
      )}

      {/* ЭКРАН 3: ЛИЧНЫЕ ДАННЫЕ */}
      {step === 3 && (
        <div className="flex-1 flex flex-col justify-center animate-float-up">
          <h2 className="text-xl font-black mb-1 text-tg-text">Личные данные</h2>
          <p className="text-xs text-tg-hint mb-6">
            За каждое заполненное поле начисляется <strong>+15 XP</strong>. Необязательные поля можно заполнить позже.
          </p>

          <div className="space-y-3.5 mb-6">
            {/* Имя */}
            <div>
              <label className="block text-xs font-bold text-tg-hint mb-1">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full p-3 rounded-xl bg-tg-secondaryBg border border-slate-200 dark:border-slate-700 text-tg-text text-sm font-semibold focus:outline-none focus:border-primary-600"
              />
            </div>

            {/* Telegram Username (read-only) */}
            <div>
              <label className="block text-xs font-bold text-tg-hint mb-1">Telegram username</label>
              <input
                type="text"
                value={username ? `@${username}` : '—'}
                readOnly
                className="w-full p-3 rounded-xl bg-tg-secondaryBg/50 border border-slate-200 dark:border-slate-700 text-tg-hint text-sm font-medium cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Возраст */}
              <div>
                <label className="block text-xs font-bold text-tg-hint mb-1">Возраст (+15 XP)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Напр. 28"
                  className="w-full p-3 rounded-xl bg-tg-secondaryBg border border-slate-200 dark:border-slate-700 text-tg-text text-sm font-semibold focus:outline-none focus:border-primary-600"
                />
              </div>

              {/* Город */}
              <div>
                <label className="block text-xs font-bold text-tg-hint mb-1">Город (+15 XP)</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ташкент"
                  className="w-full p-3 rounded-xl bg-tg-secondaryBg border border-slate-200 dark:border-slate-700 text-tg-text text-sm font-semibold focus:outline-none focus:border-primary-600"
                />
              </div>
            </div>

            {/* Род занятий */}
            <div>
              <label className="block text-xs font-bold text-tg-hint mb-1">Род занятий (+15 XP)</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full p-3 rounded-xl bg-tg-secondaryBg border border-slate-200 dark:border-slate-700 text-tg-text text-sm font-semibold focus:outline-none focus:border-primary-600"
              >
                <option value="найм">Работа в найме</option>
                <option value="свой бизнес">Свой бизнес / Предприниматель</option>
                <option value="фриланс">Фриланс / Удаленная работа</option>
                <option value="студент">Студент</option>
                <option value="другое">Другое</option>
              </select>
            </div>

            {/* Валюта */}
            <div>
              <label className="block text-xs font-bold text-tg-hint mb-1">Основная валюта</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-3 rounded-xl bg-tg-secondaryBg border border-slate-200 dark:border-slate-700 text-tg-text text-sm font-semibold focus:outline-none focus:border-primary-600"
              >
                <option value="UZS">UZS (Узбекский сум)</option>
                <option value="USD">USD (Доллар США)</option>
                <option value="RUB">RUB (Российский рубль)</option>
                <option value="KZT">KZT (Казахстанский тенге)</option>
                <option value="EUR">EUR (Евро)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmitPersonalData}
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base shadow-lg shadow-primary-600/25 transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : 'Завершить онбординг 🚀'}
          </button>
        </div>
      )}

      {/* ЭКРАН 4: АНИМАЦИЯ НАЧИСЛЕНИЯ ОПЫТА */}
      {step === 4 && (
        <div className="flex-1 flex flex-col items-center justify-center animate-float-up text-center">
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-5xl mb-6 animate-pulse-glow">
            ✨
          </div>

          <h2 className="text-2xl font-black text-tg-text mb-2">Отличное начало!</h2>
          <div className="text-4xl font-extrabold text-primary-600 mb-2">+{earnedXp} XP</div>
          <p className="text-xs text-tg-hint max-w-xs mb-6">
            Персонаж создан, базовые данные внесены. Переходим на главную панель...
          </p>

          <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};
