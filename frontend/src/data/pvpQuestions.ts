import { SupportedLanguage } from '../i18n/translations';

export interface PvpLocalizedQuestion {
  question: string;
  options: [string, string, string, string];
  insight: string;
}

export interface PvpQuestionItem {
  id: string;
  categoryEmoji: string;
  correctIndex: number;
  translations: Record<SupportedLanguage, PvpLocalizedQuestion>;
}

export interface PvpCharacterSkin {
  id: string;
  icon: string;
  title: string;
  rarity: string;
  badgeClass: string;
  description: string;
}

export const PVP_CHARACTER_SKINS: PvpCharacterSkin[] = [
  {
    id: 'cyber-strategist',
    icon: '🕶️',
    title: 'Кибер-Стратег Уолл-Стрит',
    rarity: 'Эпический PvP-Скин',
    badgeClass: 'from-sky-600 to-indigo-700 text-white',
    description: 'Голографический визор анализа капитала и защита от рыночного шума.',
  },
  {
    id: 'golden-architect',
    icon: '👑',
    title: 'Золотой Архитектор',
    rarity: 'Легендарный PvP-Скин',
    badgeClass: 'from-amber-500 to-yellow-600 text-slate-950',
    description: 'Золотая мантия создателя фамильного капитала и 100% дисциплины.',
  },
  {
    id: 'neuro-tuxedo',
    icon: '🎩',
    title: 'Нейро-Смокинг Limitless',
    rarity: 'Редкий PvP-Скин',
    badgeClass: 'from-emerald-600 to-teal-700 text-white',
    description: 'Безупречный костюм переговоров со 100% ясностью ума Эдди и Алии Морра.',
  },
  {
    id: 'neon-investor',
    icon: '⚡',
    title: 'Неоновый Инвестор',
    rarity: 'Эпический PvP-Скин',
    badgeClass: 'from-fuchsia-600 to-indigo-600 text-white',
    description: 'Молниеносная реакция в сделках и иммунитет к фейковым скидкам.',
  },
  {
    id: 'platinum-grandmaster',
    icon: '♟️',
    title: 'Платиновый Гроссмейстер',
    rarity: 'Легендарный PvP-Скин',
    badgeClass: 'from-slate-800 to-indigo-950 text-amber-300',
    description: 'Видит финансовую доску на 5 ходов вперёд в любой ситуации.',
  },
  {
    id: 'emerald-magnate',
    icon: '💎',
    title: 'Изумрудный Магнат',
    rarity: 'Мифический PvP-Скин',
    badgeClass: 'from-emerald-500 to-cyan-600 text-white',
    description: 'Символ полного доминирования на PvP-Арене OnPul.',
  },
];

export const PVP_RARE_TIPS: string[] = [
  '💡 Секрет переговоров: никогда не соглашайся на финансовые условия в первые 10 минут — пауза экономит до 25% суммы сделки.',
  '💡 Правило 72: раздели 72 на годовой процент доходности, чтобы за секунду узнать, за сколько лет удвоится твой капитал.',
  '💡 Анти-рассрочка: перед покупкой в рассрочку раздели цену вещи на свой дневной доход — ты сразу увидишь, сколько дней жизни отдаёшь.',
  '💡 Принцип двух счетов: держи деньги на текущие траты и резервный капитал в разных местах, чтобы не тратить подушку импульсивно.',
  '💡 Эффект латте в масштабе: оптимизация 3 регулярных подписок и комиссий сохраняет больше денег за год, чем разовые акции.',
  '💡 Защита от P2P-мошенников: проверяй поступление средств только внутри официального приложения банка, а не по SMS или скриншотам.',
];

export const PVP_QUESTIONS: PvpQuestionItem[] = [
  {
    id: 'q1',
    categoryEmoji: '🧮',
    correctIndex: 0,
    translations: {
      ru: {
        question: 'Рассрочка «0% на 12 мес.» на смартфон за 12 млн сум требует страховку 180 000 сум/мес. Какова реальная переплата за год?',
        options: [
          '2 160 000 сум (+18% скрытой переплаты)',
          '0 сум, ведь рассрочка бесплатная',
          '180 000 сум за весь год',
          '500 000 сум',
        ],
        insight: '180 000 сум × 12 месяцев = 2 160 000 сум скрытой переплаты (+18% к цене смартфона)!',
      },
      uz: {
        question: '12 mln so‘mlik smartfon uchun «0% muddatli to‘lov» oyiga 180 000 so‘m sug‘urta talab qiladi. Yillik asl ortiqcha to‘lov qancha?',
        options: [
          '2 160 000 so‘m (+18% yashirin ortiqcha to‘lov)',
          '0 so‘m, chunki muddatli to‘lov bepul',
          'Butun yil uchun 180 000 so‘m',
          '500 000 so‘m',
        ],
        insight: '180 000 so‘m × 12 oy = 2 160 000 so‘m yashirin ortiqcha to‘lov!',
      },
      en: {
        question: 'A "0% for 12 months" phone installment (12M UZS) requires 180,000 UZS/month insurance. What is the real annual overpayment?',
        options: [
          '2,160,000 UZS (+18% hidden cost)',
          '0 UZS because it says 0%',
          '180,000 UZS total',
          '500,000 UZS',
        ],
        insight: '180,000 UZS × 12 months = 2,160,000 UZS in hidden fees (+18%)!',
      },
      de: {
        question: 'Eine „0%-Finanzierung für 12 Monate“ (12 Mio. UZS) verlangt 180.000 UZS/Monat Versicherung. Wie hoch ist der Aufpreis pro Jahr?',
        options: [
          '2.160.000 UZS (+18% versteckte Kosten)',
          '0 UZS, da 0% Zinsen',
          '180.000 UZS insgesamt',
          '500.000 UZS',
        ],
        insight: '180.000 UZS × 12 Monate = 2.160.000 UZS versteckte Mehrkosten!',
      },
      ko: {
        question: '1,200만 숨 스마트폰의 "12개월 무이자 할부"에 월 18만 숨 보험이 필수라면 1년 실제 추가 비용은?',
        options: [
          '2,160,000 숨 (+18% 숨겨진 비용)',
          '무이자이므로 0 숨',
          '연간 총 180,000 숨',
          '500,000 숨',
        ],
        insight: '180,000 숨 × 12개월 = 2,160,000 숨의 숨겨진 할부 수수료가 발생합니다!',
      },
      es: {
        question: 'Un plan "0% a 12 meses" por un teléfono de 12M UZS exige seguro de 180.000 UZS/mes. ¿Cuál es el sobrecosto anual real?',
        options: [
          '2.160.000 UZS (+18% de costo oculto)',
          '0 UZS porque es sin intereses',
          '180.000 UZS en total',
          '500.000 UZS',
        ],
        insight: '¡180.000 UZS × 12 meses = 2.160.000 UZS de sobrecosto oculto!',
      },
    },
  },
  {
    id: 'q2',
    categoryEmoji: '📊',
    correctIndex: 0,
    translations: {
      ru: {
        question: 'Как по «Правилу 72» быстрее всего посчитать, за сколько лет удвоится капитал при доходности 24% годовых?',
        options: [
          '72 / 24 = ровно за 3 года',
          '100 / 24 = за 4,1 года',
          'За 10 лет',
          'За 1 год',
        ],
        insight: 'Правило 72: делим 72 на годовую ставку (72 / 24% = 3 года до удвоения капитала с учётом сложного процента).',
      },
      uz: {
        question: '«72 qoidasi» bo‘yicha yillik 24% daromad bilan kapital necha yilda 2 barobar oshishini qanday topish mumkin?',
        options: [
          '72 / 24 = 3 yilda',
          '100 / 24 = 4,1 yilda',
          '10 yilda',
          '1 yilda',
        ],
        insight: '72 qoidasi: 72 sonini yillik foizga bo‘lamiz (72 / 24 = 3 yil).',
      },
      en: {
        question: 'Using the "Rule of 72", how many years does it take to double your money at 24% annual return?',
        options: [
          '72 / 24 = 3 years',
          '100 / 24 = 4.1 years',
          '10 years',
          '1 year',
        ],
        insight: 'The Rule of 72: divide 72 by the annual return rate (72 / 24 = 3 years to double).',
      },
      de: {
        question: 'Wie lange dauert es nach der „72er-Regel“, bis sich das Kapital bei 24% Jahresrendite verdoppelt?',
        options: [
          '72 / 24 = 3 Jahre',
          '100 / 24 = 4,1 Jahre',
          '10 Jahre',
          '1 Jahr',
        ],
        insight: '72 geteilt durch 24% Jahresrendite ergibt genau 3 Jahre bis zur Verdopplung.',
      },
      ko: {
        question: '"72의 법칙"에 따라 연 24% 복리 수익률로 자산이 2배가 되는 데 걸리는 기간은?',
        options: [
          '72 / 24 = 3년',
          '100 / 24 = 4.1년',
          '10년',
          '1년',
        ],
        insight: '72의 법칙: 72를 연 수익률로 나누면(72 / 24 = 3년) 원금 2배 도달 기간을 즉시 알 수 있습니다.',
      },
      es: {
        question: 'Según la "Regla del 72", ¿en cuántos años se duplica el capital con un rendimiento anual del 24%?',
        options: [
          '72 / 24 = 3 años',
          '100 / 24 = 4,1 años',
          '10 años',
          '1 año',
        ],
        insight: 'Regla del 72: divide 72 entre la tasa anual (72 / 24 = 3 años).',
      },
    },
  },
  {
    id: 'q3',
    categoryEmoji: '🛡️',
    correctIndex: 0,
    translations: {
      ru: {
        question: 'На балансе 4 500 000 сум, обязательный платёж за ЖКХ — 450 000 сум, до зарплаты 15 дней. Каков безопасный дневной лимит?',
        options: [
          '270 000 сум / день',
          '300 000 сум / день',
          '450 000 сум / день',
          '150 000 сум / день',
        ],
        insight: '(4 500 000 − 450 000) / 15 дней = 4 050 000 / 15 = 270 000 сум в день без риска уйти в минус!',
      },
      uz: {
        question: 'Balansda 4 500 000 so‘m, majburiy to‘lov 450 000 so‘m, oylikkacha 15 kun qoldi. Kunlik xavfsiz limit qancha?',
        options: [
          '270 000 so‘m / kun',
          '300 000 so‘m / kun',
          '450 000 so‘m / kun',
          '150 000 so‘m / kun',
        ],
        insight: '(4 500 000 − 450 000) / 15 kun = kuniga 270 000 so‘m!',
      },
      en: {
        question: 'Balance is 4,500,000 UZS, mandatory bills are 450,000 UZS, and payday is in 15 days. What is your safe daily limit?',
        options: [
          '270,000 UZS / day',
          '300,000 UZS / day',
          '450,000 UZS / day',
          '150,000 UZS / day',
        ],
        insight: '(4,500,000 − 450,000) / 15 days = 270,000 UZS per day!',
      },
      de: {
        question: 'Kontostand 4.500.000 UZS, Fixkosten 450.000 UZS, noch 15 Tage bis zum Gehalt. Wie hoch ist das sichere Tageslimit?',
        options: [
          '270.000 UZS / Tag',
          '300.000 UZS / Tag',
          '450.000 UZS / Tag',
          '150.000 UZS / Tag',
        ],
        insight: '(4.500.000 − 450.000) / 15 Tage = 270.000 UZS pro Tag!',
      },
      ko: {
        question: '잔액 450만 숨, 필수 고정지출 45만 숨, 월급날까지 15일 남았다면 오늘의 안전 일일 한도는?',
        options: [
          '270,000 숨 / 일',
          '300,000 숨 / 일',
          '450,000 숨 / 일',
          '150,000 숨 / 일',
        ],
        insight: '(4,500,000 − 450,000) / 15일 = 하루 270,000 숨입니다!',
      },
      es: {
        question: 'Saldo de 4.500.000 UZS, pagos fijos de 450.000 UZS y faltan 15 días para el sueldo. ¿Cuál es el límite diario seguro?',
        options: [
          '270.000 UZS / día',
          '300.000 UZS / día',
          '450.000 UZS / día',
          '150.000 UZS / día',
        ],
        insight: '(4.500.000 − 450.000) / 15 días = ¡270.000 UZS por día!',
      },
    },
  },
  {
    id: 'q4',
    categoryEmoji: '🚨',
    correctIndex: 0,
    translations: {
      ru: {
        question: 'Покупатель в интернете прислал скриншот перевода на 1 млн сум больше цены и просит срочно вернуть «лишнее» на другую карту. Твой ход?',
        options: [
          'Проверить реальный баланс в приложении банка и ничего не переводить на чужие карты',
          'Сразу перевести 1 млн сум по номеру из чата',
          'Отправить половину суммы',
          'Продиктовать код из SMS',
        ],
        insight: 'Фейковый скриншот и «треугольный возврат» — главная схема P2P-мошенников. Доверяй только балансу внутри своего банка!',
      },
      uz: {
        question: 'Xaridor 1 mln so‘m ko‘p o‘tkazib yuborgani haqida skrinshot tashlab, farqni boshqa kartaga qaytarishni so‘radi. Nima qilasiz?',
        options: [
          'Bank ilovasida haqiqiy balansni tekshirish va begona kartaga pul o‘tkazmaslik',
          'Darhol 1 mln so‘mni aytilgan kartaga o‘tkazish',
          'Yarmini o‘tkazib berish',
          'SMS-kodni aytish',
        ],
        insight: 'Soxta skrinshot — firibgarlarning eng ko‘p ishlatadigan P2P tuzog‘i!',
      },
      en: {
        question: 'An online buyer sends a screenshot of overpaying by 1M UZS and asks you to refund the difference to another card. Your move?',
        options: [
          'Check actual bank app balance and never send funds to third-party cards',
          'Immediately send 1M UZS to the requested card',
          'Send half the amount',
          'Share your SMS verification code',
        ],
        insight: 'Fake screenshots and third-party refunds are classic P2P triangulation scams!',
      },
      de: {
        question: 'Ein Online-Käufer schickt einen Screenshot über 1 Mio. UZS zu viel und bittet um Rückzahlung auf eine andere Karte. Was tust du?',
        options: [
          'Echten Kontostand in der Bank-App prüfen und nichts an fremde Karten senden',
          'Sofort 1 Mio. UZS überweisen',
          'Die Hälfte senden',
          'SMS-Code weitergeben',
        ],
        insight: 'Gefälschte Screenshots und Drittkarten-Rückbuchungen sind ein klassischer P2P-Betrug!',
      },
      ko: {
        question: '중고거래 구매자가 100만 숨을 더 보냈다며 캡처 화면을 보내고 다른 계좌로 환불을 요구합니다. 올바른 대처는?',
        options: [
          '은행 앱에서 실제 입금을 확인하고 제3자 계좌로 절대 송금하지 않는다',
          '즉시 요청한 계좌로 100만 숨을 보낸다',
          '절반만 보낸다',
          'SMS 인증번호를 알려준다',
        ],
        insight: '가짜 입금 캡처와 제3자 계좌 환불 요구는 전형적인 3자 사기 수법입니다!',
      },
      es: {
        question: 'Un comprador envía captura de pago con 1M UZS de más y pide devolver la diferencia a otra tarjeta. ¿Qué haces?',
        options: [
          'Verificar el saldo real en la app del banco y no transferir a tarjetas de terceros',
          'Transferir 1M UZS de inmediato',
          'Enviar la mitad',
          'Dar el código SMS',
        ],
        insight: '¡Las capturas falsas y reembolsos a terceros son la estafa P2P más común!',
      },
    },
  },
  {
    id: 'q5',
    categoryEmoji: '💡',
    correctIndex: 0,
    translations: {
      ru: {
        question: 'У тебя есть свободные 8 млн сум и одновременно долг по кредитке 8 млн сум под 36% годовых. Что математически выгоднее?',
        options: [
          'Полностью погасить долг под 36%, получив гарантированную экономию 36% годовых',
          'Положить 8 млн на вклад под 20%, продолжая платить 36% по кредиту',
          'Потратить половину на шопинг',
          'Оставить деньги на карте без процентов',
        ],
        insight: 'Погашение долга под 36% мгновенно останавливает утечку процентов и эквивалентно безрисковой доходности 36% годовых!',
      },
      uz: {
        question: 'Qo‘lingizda 8 mln so‘m bor va ayni paytda yillik 36% li 8 mln so‘m kredit qarzingiz bor. Qaysi qaror matematik jihatdan eng foydali?',
        options: [
          '36% li qarzni to‘liq yopib, yillik 36% kafolatlangan tejashga erishish',
          '36% kredit to‘lab turib, pulni 20% li omonatga qo‘yish',
          'Yarmini xaridga ishlatish',
          'Kartada foizsiz qoldirish',
        ],
        insight: 'Qimmat qarzni yopish — eng yuqori va xavfsiz moliyaviy foydadir!',
      },
      en: {
        question: 'You have 8M UZS cash and an 8M UZS credit debt at 36% APR. What is mathematically smartest?',
        options: [
          'Pay off the 36% debt immediately for a guaranteed 36% annual savings',
          'Put 8M into a 20% deposit while paying 36% on the debt',
          'Spend half on shopping',
          'Keep cash idle at 0%',
        ],
        insight: 'Eliminating a 36% debt equals a guaranteed, risk-free 36% return on your money!',
      },
      de: {
        question: 'Du hast 8 Mio. UZS Bonus und 8 Mio. UZS Kreditkartenschulden zu 36% Zinsen. Was ist mathematisch am besten?',
        options: [
          'Die 36%-Schuld sofort tilgen (garantierte 36% Ersparnis)',
          'Zu 20% anlegen und weiter 36% Kreditzinsen zahlen',
          'Die Hälfte ausgeben',
          'Unverzinst liegen lassen',
        ],
        insight: 'Das Tilgen teurer Schulden (36%) bringt sofort eine garantierte Rendite in Höhe des Kreditzinses!',
      },
      ko: {
        question: '보너스 800만 숨이 생겼고 연 36% 고금리 대출 800만 숨이 있다면 수학적으로 가장 현명한 선택은?',
        options: [
          '연 36% 고금리 부채를 즉시 상환하여 확정 36% 이자 비용을 아낀다',
          '연 20% 예금에 넣고 36% 대출 이자를 계속 낸다',
          '절반을 쇼핑에 쓴다',
          '그냥 통장에 둔다',
        ],
        insight: '36% 고금리 부채 상환은 무위험 확정 36% 수익률을 얻는 것과 같습니다!',
      },
      es: {
        question: 'Tienes 8M UZS disponibles y una deuda de tarjeta de 8M UZS al 36% anual. ¿Qué es matemáticamente mejor?',
        options: [
          'Liquidar la deuda del 36% de inmediato (ahorro garantizado del 36%)',
          'Poner 8M en un depósito al 20% mientras pagas 36% de deuda',
          'Gastar la mitad',
          'Dejar el efectivo sin rendimiento',
        ],
        insight: '¡Pagar una deuda del 36% equivale a una rentabilidad libre de riesgo del 36%!',
      },
    },
  },
  {
    id: 'q6',
    categoryEmoji: '💰',
    correctIndex: 0,
    translations: {
      ru: {
        question: 'В чём суть «Правила Первого Дня Зарплаты» у финансово осознанных людей?',
        options: [
          'Сразу в день дохода отложить 10–15% в резерв («Заплати сначала себе»), а жить на остаток',
          'Тратить весь месяц и откладывать то, что случайно останется в последний день',
          'Брать аванс каждую неделю',
          'Хранить всю зарплату наличными в кармане',
        ],
        insight: 'У 92% людей к концу месяца «остаётся» 0 сум. Перевод в резерв в первые 5 минут после зарплаты создаёт капитал автоматически!',
      },
      uz: {
        question: 'Moliyaviy intizomli insonlarning «Oylikning birinchi kuni qoidasi» nimadan iborat?',
        options: [
          'Daromad tushgan zahoti 10–15% qismini zaxiraga olib qo‘yish («Avval o‘zingga to‘la»)',
          'Oy oxirida ortib qolgan pulnigina yig‘ish',
          'Har hafta qarz olish',
          'Hammasini bir kunda ishlatish',
        ],
        insight: 'Daromad kelgan birinchi daqiqada 10–15% zaxiraga olib qo‘yish kapitalni kafolatlaydi!',
      },
      en: {
        question: 'What is the "First Payday Rule" practiced by financially clear people?',
        options: [
          'Pay yourself first: move 10–15% to savings immediately when income arrives',
          'Spend all month and save whatever is left on the last day',
          'Borrow before every payday',
          'Spend bonuses before receiving them',
        ],
        insight: 'Automating 10–15% on day one builds wealth effortlessly without end-of-month stress!',
      },
      de: {
        question: 'Was besagt die „Regel des ersten Gehaltstages“ („Bezahle dich selbst zuerst“)?',
        options: [
          'Direkt bei Gehaltseingang 10–15% in die Reserve legen und vom Rest leben',
          'Erst am Monatsende sparen, falls etwas übrig bleibt',
          'Jede Woche Dispo nutzen',
          'Alles sofort ausgeben',
        ],
        insight: 'Wer zuerst 10–15% zur Seite legt, baut jeden Monat garantiert Vermögen auf!',
      },
      ko: {
        question: '금융 초인들이 실천하는 "월급날 첫 5분 법칙(Pay Yourself First)"은 무엇인가요?',
        options: [
          '급여 입금 즉시 10~15%를 저축/비상금 계좌로 먼저 이체하고 남은 돈으로 생활한다',
          '한 달 동안 다 쓰고 마지막 날 남는 돈을 저축한다',
          '매주 현금서비스를 받는다',
          '예산 없이 지출한다',
        ],
        insight: '급여일 첫 5분에 먼저 저축을 분리하면 스트레스 없이 매년 목돈이 쌓입니다!',
      },
      es: {
        question: '¿En qué consiste la "Regla del Primer Día de Sueldo" ("Págate a ti mismo primero")?',
        options: [
          'Separar el 10–15% para ahorro apenas llega el ingreso y vivir con el resto',
          'Gastar todo el mes y ahorrar solo si sobra algo el último día',
          'Pedir prestado cada mes',
          'No llevar presupuesto',
        ],
        insight: '¡Apartar el 10–15% el primer día garantiza construir capital todos los meses!',
      },
    },
  },
  {
    id: 'q7',
    categoryEmoji: '🎁',
    correctIndex: 0,
    translations: {
      ru: {
        question: 'Акция: «Потрать в ресторане 1 000 000 сум и получи кэшбэк 15% (150 000 сум)!» Если ты планировал поужинать дома, каков финансовый итог похода ради кэшбэка?',
        options: [
          'Чистый минус 850 000 сум незапланированных расходов',
          'Чистая прибыль +150 000 сум',
          'Экономия 1 000 000 сум',
          'Расход 0 сум',
        ],
        insight: 'Кэшбэк выгоден только на запланированные покупки. Потратить 1 млн ради возврата 150 тыс. — это минус 850 000 сум из бюджета!',
      },
      uz: {
        question: 'Aksiya: «Restoranda 1 000 000 so‘m ishlat va 15% (150 000 so‘m) keshbek ol!» Agar uyda ovqatlanmoqchi bo‘lsangiz, keshbek uchun borishning natijasi qanday?',
        options: [
          'Byudjetdan sof minus 850 000 so‘m rejadan tashqari xarajat',
          'Sof foyda +150 000 so‘m',
          '1 000 000 so‘m tejash',
          'Xarajat 0 so‘m',
        ],
        insight: '150 000 so‘m bonus uchun rejasiz 1 mln so‘m sarflash — cho‘ntakdan sof 850 000 so‘m yo‘qotishdir!',
      },
      en: {
        question: 'Promo: "Spend 1,000,000 UZS at a restaurant to get 15% cashback (150,000 UZS)!" If you planned to eat at home, what is the net result?',
        options: [
          'A net loss of 850,000 UZS in unplanned spending',
          'A net profit of +150,000 UZS',
          'Savings of 1,000,000 UZS',
          'Zero cost',
        ],
        insight: 'Cashback only saves money on planned expenses. Spending 1M UZS to get 150K back costs you 850,000 UZS net!',
      },
      de: {
        question: 'Aktion: „Gib 1.000.000 UZS im Restaurant aus für 15% Cashback (150.000 UZS)!“ Was ist das Netto-Ergebnis bei einem ungeplanten Besuch?',
        options: [
          'Ein Nettoverlust von 850.000 UZS im Budget',
          'Reingewinn von +150.000 UZS',
          '1.000.000 UZS gespart',
          'Null Kosten',
        ],
        insight: 'Cashback lohnt sich nur bei geplanten Ausgaben — sonst verlierst du netto 850.000 UZS!',
      },
      ko: {
        question: '"레스토랑에서 100만 숨 결제 시 15%(15만 숨) 캐시백!" 집밥을 먹으려다 캐시백 때문에 외식했다면 실제 결과는?',
        options: [
          '계획에 없던 850,000 숨 순지출 발생',
          '+150,000 숨 순이익',
          '1,000,000 숨 절약',
          '지출 0 숨',
        ],
        insight: '15만 숨 보너스를 위해 계획 없던 100만 숨을 쓰면 예산에서 85만 숨이 순손실됩니다!',
      },
      es: {
        question: 'Promo: "¡Gasta 1.000.000 UZS en restaurante y recibe 15% cashback (150.000 UZS)!" Si ibas a cenar en casa, ¿cuál es el resultado neto?',
        options: [
          'Pérdida neta de 850.000 UZS en gasto no planificado',
          'Ganancia neta de +150.000 UZS',
          'Ahorro de 1.000.000 UZS',
          'Costo cero',
        ],
        insight: '¡El cashback solo sirve en gastos ya planificados; gastar 1M por 150K resta 850.000 UZS a tu bolsillo!',
      },
    },
  },
  {
    id: 'q8',
    categoryEmoji: '⏳',
    correctIndex: 0,
    translations: {
      ru: {
        question: 'Как работает «Правило 24 часов» против ночного импульсивного шопинга на маркетплейсах?',
        options: [
          'Положить вещь в корзину и подождать 24 часа — в 7 из 10 случаев эмоция спадает',
          'Купить вещь за 24 секунды с кредитки',
          'Покупать товары только после полуночи',
          'Брат максимальную рассрочку',
        ],
        insight: 'Импульсивная дофаминовая вспышка длится 15–20 минут. Пауза 24 часа сохраняет миллионы сум в год!',
      },
      uz: {
        question: 'Marketpleyslardagi tungi impulsiv xaridlarga qarshi «24 soat qoidasi» qanday ishlaydi?',
        options: [
          'Buyumni savatchaga solib 24 soat kutish — 10 tadan 7 holatda hissiyot soviydi',
          '24 soniya ichida kredit kartadan sotib olish',
          'Faqat yarim tunda xarid qilish',
          'Muddatli to‘lovga olish',
        ],
        insight: '24 soatlik tanaffus keraksiz xaridlardan millionlab so‘mni asrab qoladi!',
      },
      en: {
        question: 'How does the "24-Hour Rule" protect you from impulse online shopping?',
        options: [
          'Leave the item in your cart for 24 hours — in 7 out of 10 cases the urge fades',
          'Buy within 24 seconds using credit',
          'Only shop at midnight',
          'Use installment plans for everything',
        ],
        insight: 'Impulse emotions last 15 minutes; a 24-hour pause filters out 70% of unnecessary purchases!',
      },
      de: {
        question: 'Wie schützt dich die „24-Stunden-Regel“ vor Impulskäufen im Internet?',
        options: [
          'Artikel 24 Stunden im Warenkorb lassen — in 7 von 10 Fällen verschwindet der Kaufdrang',
          'In 24 Sekunden auf Kredit kaufen',
          'Nur nachts einkaufen',
          'Sofort per Ratenkauf bestellen',
        ],
        insight: 'Eine 24-Stunden-Pause schaltet Kaufimpulse aus und schützt dein Tageslimit!',
      },
      ko: {
        question: '심야 충동구매를 막아주는 "24시간 법칙"은 어떻게 작동하나요?',
        options: [
          '장바구니에 담고 24시간 기다리면 10번 중 7번은 불필요한 구매 욕구가 사라진다',
          '24초 안에 할부로 결제한다',
          '자정에만 쇼핑한다',
          '무조건 쿠폰을 쓴다',
        ],
        insight: '충동적인 구매 감정은 15분이면 식습니다. 24시간 대기는 최고의 예산 방어막입니다!',
      },
      es: {
        question: '¿Cómo funciona la "Regla de las 24 horas" contra las compras impulsivas nocturnas?',
        options: [
          'Dejar el producto en el carrito 24 horas: en 7 de cada 10 casos el impulso desaparece',
          'Comprar en 24 segundos a crédito',
          'Comprar solo a medianoche',
          'Usar cuotas para todo',
        ],
        insight: '¡La emoción impulsiva dura 15 minutos; esperar 24 horas evita el 70% de gastos innecesarios!',
      },
    },
  },
];
