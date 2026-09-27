const API_BASE = '/api';

function getInitDataHeader(): string {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
    return encodeURI(window.Telegram.WebApp.initData);
  }
  return 'mock:77712345:Nodirbek:nodir_finance';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-telegram-init-data', getInitDataHeader());

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'Ошибка сервера';
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  auth: () => request<{ user: any; levelInfo: any; isNewUser: boolean }>('/auth', {
    method: 'POST',
    body: JSON.stringify({ initData: getInitDataHeader() }),
  }),

  // Me
  getMe: () => request<any>('/me'),
  updateMe: (data: any) => request<any>('/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Finance
  getFinances: () => request<any>('/finance'),
  addFinanceItem: (item: any) => request<any>('/finance', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  deleteFinanceItem: (id: number) => request<any>(`/finance/${id}`, {
    method: 'DELETE',
  }),

  // Quiz
  getTodayQuiz: () => request<any>('/quiz/today'),
  answerQuestion: (quizId: number, questionId: number, selectedIndex: number) =>
    request<any>('/quiz/today/answer', {
      method: 'POST',
      body: JSON.stringify({ quizId, questionId, selectedIndex }),
    }),
  finishQuiz: (quizId: number, answers: number[]) =>
    request<any>('/quiz/today/finish', {
      method: 'POST',
      body: JSON.stringify({ quizId, answers }),
    }),

  // History & Achievements & Settings
  getHistory: () => request<any>('/history'),
  getAchievements: () => request<any>('/achievements'),
  resetData: () => request<any>('/settings/reset', {
    method: 'POST',
    body: JSON.stringify({ confirm: true }),
  }),
};
