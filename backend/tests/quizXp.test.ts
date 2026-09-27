import { describe, it, expect } from 'vitest';
import { calculateQuizXp, QUIZ_XP_REWARDS } from '../src/config/xp.js';

describe('Начисление XP за Задание дня и винстрик', () => {
  it('должна начислять базовые 100 XP за результат 3 из 3 при первом дне стрика', () => {
    const res = calculateQuizXp(3, 1);
    expect(res.base).toBe(100);
    expect(res.streakBonus).toBe(10); // 1 день * 10 XP
    expect(res.total).toBe(110);
  });

  it('должна начислять стрик-бонус пропорционально дням: +10 за день, максимум +50', () => {
    expect(calculateQuizXp(3, 2).streakBonus).toBe(20);
    expect(calculateQuizXp(3, 3).streakBonus).toBe(30);
    expect(calculateQuizXp(3, 4).streakBonus).toBe(40);
    expect(calculateQuizXp(3, 5).streakBonus).toBe(50);
    expect(calculateQuizXp(3, 6).streakBonus).toBe(50); // кап на 50
    expect(calculateQuizXp(3, 20).streakBonus).toBe(50); // кап на 50
  });

  it('должна начислять ровно 60 XP за 2 из 3 без бонуса стрика', () => {
    const res = calculateQuizXp(2, 5);
    expect(res.base).toBe(60);
    expect(res.streakBonus).toBe(0); // стрик не дается при < 3
    expect(res.total).toBe(60);
  });

  it('должна начислять ровно 30 XP за 1 из 3 без бонуса стрика', () => {
    const res = calculateQuizXp(1, 10);
    expect(res.base).toBe(30);
    expect(res.streakBonus).toBe(0);
    expect(res.total).toBe(30);
  });

  it('должна начислять ровно 10 XP за 0 из 3 (просто прошел) без бонуса стрика', () => {
    const res = calculateQuizXp(0, 10);
    expect(res.base).toBe(10);
    expect(res.streakBonus).toBe(0);
    expect(res.total).toBe(10);
  });
});
