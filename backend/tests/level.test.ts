import { describe, it, expect } from 'vitest';
import {
  xpRequiredForNextLevel,
  calculateLevelAndProgress,
  getTitleForLevel,
  getAvatarStage,
  MAX_LEVEL,
  LEVEL_THRESHOLDS,
} from '../src/config/xp.js';

describe('Формула уровней и званий ФинУровень', () => {
  it('должна правильно рассчитывать XP для перехода на следующий уровень: 50 + 15 * L', () => {
    expect(xpRequiredForNextLevel(1)).toBe(65); // 50 + 15 * 1
    expect(xpRequiredForNextLevel(2)).toBe(80); // 50 + 15 * 2
    expect(xpRequiredForNextLevel(10)).toBe(200); // 50 + 15 * 10
    expect(xpRequiredForNextLevel(79)).toBe(1235); // 50 + 15 * 79
    expect(xpRequiredForNextLevel(80)).toBe(0); // На 80-м уровне рост останавливается
  });

  it('должна корректно вычислять уровень 1 при 0 XP', () => {
    const res = calculateLevelAndProgress(0);
    expect(res.level).toBe(1);
    expect(res.title).toBe('Новичок');
    expect(res.minXp).toBe(0);
    expect(res.maxXp).toBe(65);
    expect(res.xpToNext).toBe(65);
    expect(res.avatarStage).toBe(1);
  });

  it('должна переходить на уровень 2 ровно при 65 XP', () => {
    const res = calculateLevelAndProgress(65);
    expect(res.level).toBe(2);
    expect(res.title).toBe('Новичок');
    expect(res.minXp).toBe(65);
    expect(res.maxXp).toBe(145); // 65 + 80
    expect(res.xpToNext).toBe(80);
  });

  it('должна корректно присваивать звания на границах диапазонов', () => {
    expect(getTitleForLevel(1)).toBe('Новичок');
    expect(getTitleForLevel(9)).toBe('Новичок');
    expect(getTitleForLevel(10)).toBe('Считающий');
    expect(getTitleForLevel(19)).toBe('Считающий');
    expect(getTitleForLevel(20)).toBe('Планировщик');
    expect(getTitleForLevel(29)).toBe('Планировщик');
    expect(getTitleForLevel(30)).toBe('Сберегатель');
    expect(getTitleForLevel(39)).toBe('Сберегатель');
    expect(getTitleForLevel(40)).toBe('Инвестор-стажёр');
    expect(getTitleForLevel(49)).toBe('Инвестор-стажёр');
    expect(getTitleForLevel(50)).toBe('Стратег');
    expect(getTitleForLevel(59)).toBe('Стратег');
    expect(getTitleForLevel(60)).toBe('Финансист');
    expect(getTitleForLevel(69)).toBe('Финансист');
    expect(getTitleForLevel(70)).toBe('Эксперт');
    expect(getTitleForLevel(79)).toBe('Эксперт');
    expect(getTitleForLevel(80)).toBe('Мастер финансов');
  });

  it('уровень не должен превышать 80 даже при огромном количестве XP', () => {
    const res = calculateLevelAndProgress(99999999);
    expect(res.level).toBe(80);
    expect(res.title).toBe('Мастер финансов');
    expect(res.xpToNext).toBe(0);
    expect(res.avatarStage).toBe(8);
  });

  it('должна корректно менять стадию аватара каждые 10 уровней (1..8)', () => {
    expect(getAvatarStage(1)).toBe(1);
    expect(getAvatarStage(9)).toBe(1);
    expect(getAvatarStage(10)).toBe(2);
    expect(getAvatarStage(20)).toBe(3);
    expect(getAvatarStage(30)).toBe(4);
    expect(getAvatarStage(40)).toBe(5);
    expect(getAvatarStage(50)).toBe(6);
    expect(getAvatarStage(60)).toBe(7);
    expect(getAvatarStage(70)).toBe(8);
    expect(getAvatarStage(80)).toBe(8);
  });
});
