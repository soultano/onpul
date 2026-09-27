import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем сидирование базы данных ФинУровень...');

  // 1. Загрузка 60 квизов из content/daily_quizzes.json
  const quizzesPath = path.resolve(__dirname, '../../content/daily_quizzes.json');
  if (!fs.existsSync(quizzesPath)) {
    console.error(`❌ Файл ${quizzesPath} не найден!`);
    return;
  }

  const rawData = fs.readFileSync(quizzesPath, 'utf-8');
  const quizzes = JSON.parse(rawData);

  console.log(`Загружаем ${quizzes.length} квизов в базу данных...`);

  for (const q of quizzes) {
    await prisma.quiz.upsert({
      where: { dayIndex: q.dayIndex },
      update: {
        newsTitle: q.newsTitle,
        newsText: q.newsText,
        questions: JSON.stringify(q.questions),
      },
      create: {
        dayIndex: q.dayIndex,
        newsTitle: q.newsTitle,
        newsText: q.newsText,
        questions: JSON.stringify(q.questions),
      },
    });
  }

  console.log(`✅ Успешно сидировано ${quizzes.length} заданий дня!`);
}

main()
  .catch((e) => {
    console.error('Ошибка сидирования:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
