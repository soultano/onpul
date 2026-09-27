import React, { useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import { api } from '../../services/api';

interface DailyQuizModalProps {
  isOpen: boolean;
  quizData: any;
  onClose: () => void;
  onFinish: (finishResult: any) => void;
}

export const DailyQuizModal: React.FC<DailyQuizModalProps> = ({
  isOpen,
  quizData,
  onClose,
  onFinish,
}) => {
  const { haptics } = useTelegram();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [currentAnswerFeedback, setCurrentAnswerFeedback] = useState<{
    isCorrect: boolean;
    correctIndex: number;
    explanation: string;
  } | null>(null);

  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishResult, setFinishResult] = useState<any>(null);

  if (!isOpen || !quizData) return null;

  const questions = quizData.questions || [];
  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = async (optionIndex: number) => {
    if (currentAnswerFeedback || loadingAnswer) return;

    setLoadingAnswer(true);
    haptics.impact('medium');

    try {
      const feedback = await api.answerQuestion(quizData.quizId, currentQ.id, optionIndex);
      setCurrentAnswerFeedback(feedback);

      const newAnswers = [...selectedAnswers, optionIndex];
      setSelectedAnswers(newAnswers);

      if (feedback.isCorrect) {
        haptics.notification('success');
      } else {
        haptics.notification('warning');
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка при проверке ответа');
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleNextQuestion = async () => {
    haptics.impact('light');
    setCurrentAnswerFeedback(null);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Все 3 вопроса отвечены — завершаем квиз на сервере
      setIsFinishing(true);
      try {
        const res = await api.finishQuiz(quizData.quizId, selectedAnswers);
        setFinishResult(res);
        onFinish(res);
      } catch (err) {
        console.error(err);
        alert('Ошибка при сохранении результатов квиза');
      } finally {
        setIsFinishing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-float-up">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-tg-bg border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shadow-2xl">
        {/* РЕЗУЛЬТАТ КВИЗА */}
        {finishResult ? (
          <div className="text-center py-6 animate-float-up">
            <div className="text-5xl mb-3">
              {finishResult.correctCount === 3 ? '🔥' : finishResult.correctCount >= 1 ? '🎯' : '🌱'}
            </div>

            <h2 className="text-2xl font-black text-tg-text mb-1">Задание дня завершено!</h2>
            <p className="text-xs text-tg-hint mb-6">
              Результат: <strong className="text-tg-text">{finishResult.correctCount} из 3</strong>
            </p>

            {/* Карточка наград */}
            <div className="bg-primary-50/70 border border-primary-500/30 rounded-2xl p-4 mb-6 text-center">
              <div className="text-3xl font-black text-primary-600 mb-1">
                +{finishResult.xpGained} XP
              </div>
              <div className="text-xs text-tg-hint">
                {finishResult.streakBonus > 0 && `(Включая бонус стрика: +${finishResult.streakBonus} XP)`}
              </div>

              {finishResult.currentStreak > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                  <span>🔥 Стрик: {finishResult.currentStreak} дн.</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-600/30 transition-transform active:scale-95"
            >
              Отлично!
            </button>
          </div>
        ) : (
          /* ИНТЕРФЕЙС ПРОХОЖДЕНИЯ */
          <div>
            {/* Шапка квиза */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="text-xs font-black text-primary-600 uppercase tracking-wider">
                Задание дня • Вопрос {currentQuestionIndex + 1} из {questions.length}
              </div>
              <button
                onClick={onClose}
                className="text-tg-hint text-sm font-bold p-1 hover:text-tg-text"
              >
                ✕
              </button>
            </div>

            {/* Текст новости */}
            <div className="bg-tg-secondaryBg rounded-2xl p-3.5 mb-4 border border-slate-100 dark:border-slate-800">
              <div className="font-extrabold text-xs text-tg-text mb-1.5 flex items-center gap-1.5">
                <span>📰</span>
                <span>{quizData.newsTitle}</span>
              </div>
              <p className="text-[11px] text-tg-hint leading-relaxed max-h-36 overflow-y-auto">
                {quizData.newsText}
              </p>
            </div>

            {/* Вопрос */}
            <div className="mb-4">
              <h3 className="text-sm font-extrabold text-tg-text leading-snug mb-3">
                {currentQ?.text}
              </h3>

              {/* Варианты ответов */}
              <div className="space-y-2">
                {currentQ?.options.map((opt: string, idx: number) => {
                  let btnStyle = 'border-slate-200 dark:border-slate-700 bg-tg-bg text-tg-text';

                  if (currentAnswerFeedback) {
                    if (idx === currentAnswerFeedback.correctIndex) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold';
                    } else if (idx === selectedAnswers[currentQuestionIndex]) {
                      btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-bold';
                    } else {
                      btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={Boolean(currentAnswerFeedback) || loadingAnswer}
                      className={`w-full text-left p-3 rounded-xl border text-xs leading-normal transition-all flex items-start gap-2.5 ${btnStyle}`}
                    >
                      <span className="font-bold text-tg-hint shrink-0">
                        {String.fromCharCode(65 + idx)})
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Блок моментального пояснения */}
            {currentAnswerFeedback && (
              <div
                className={`p-3.5 rounded-2xl mb-4 text-xs animate-float-up ${
                  currentAnswerFeedback.isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/50 border border-amber-500/30 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <span>{currentAnswerFeedback.isCorrect ? '✅ Верно!' : 'ℹ️ Не совсем так:'}</span>
                </div>
                <p className="leading-relaxed opacity-95">{currentAnswerFeedback.explanation}</p>
              </div>
            )}

            {/* Кнопка далее */}
            {currentAnswerFeedback && (
              <button
                onClick={handleNextQuestion}
                disabled={isFinishing}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md transition-transform active:scale-95"
              >
                {isFinishing
                  ? 'Подсчет результатов...'
                  : currentQuestionIndex + 1 < questions.length
                  ? 'Следующий вопрос →'
                  : 'Завершить задание 🏁'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
