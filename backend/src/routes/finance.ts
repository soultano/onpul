import { Router } from 'express';
import { FinanceService } from '../services/financeService.js';

const router = Router();

/**
 * GET /finance
 * Получение всех финансовых элементов пользователя и аналитической сводки
 */
router.get('/finance', async (req, res) => {
  try {
    const userId = req.user!.id;
    const data = await FinanceService.getUserFinances(userId);
    res.json(data);
  } catch (error: any) {
    console.error('Get /finance error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * POST /finance
 * Добавление или обновление статьи финансов с начислением XP
 */
router.post('/finance', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { category, subtype, title, amount, rate, term, monthlyPayment, extra } = req.body;

    if (!category || !subtype || !title || amount === undefined) {
      return res.status(400).json({ error: 'Missing required fields (category, subtype, title, amount)' });
    }

    const result = await FinanceService.addFinanceItem(userId, {
      category,
      subtype,
      title,
      amount: parseFloat(amount) || 0,
      rate: rate ? parseFloat(rate) : undefined,
      term: term ? parseInt(term, 10) : undefined,
      monthlyPayment: monthlyPayment ? parseFloat(monthlyPayment) : undefined,
      extra,
    });

    res.json({
      item: result.item,
      xpGained: result.xpResult.xpGained,
      totalXp: result.xpResult.totalXp,
      level: result.xpResult.level,
      levelUp: result.xpResult.levelUp,
      title: result.xpResult.title,
    });
  } catch (error: any) {
    console.error('Post /finance error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * DELETE /finance/:id
 * Удаление статьи финансов
 */
router.delete('/finance/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const itemId = parseInt(req.params.id, 10);

    const result = await FinanceService.deleteFinanceItem(userId, itemId);
    res.json(result);
  } catch (error: any) {
    console.error('Delete /finance/:id error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
