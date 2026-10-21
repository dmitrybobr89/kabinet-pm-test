'use strict';
/* Кабинет мастера ПМ: прототип 0.6.
   Учёт и управление бизнесом мастера. Всё хранится только в этом браузере (localStorage).
   Серверов и ИИ нет: «диктовка» разбирает текст правилами прямо на телефоне. */
(() => {
  const KEY = 'pmu_cabinet_v1';
  const VERSION_LABEL = 'Кабинет мастера, прототип 0.6';

  // Что бесплатно, а что нет. Меняется в одном месте.
  const PLAN = {
    freeProcedureLimit: 10, // процедур бесплатно (0 = только в PRO)
    freeTaskLimit: 30,      // активных задач бесплатно
  };

  const CURRENCIES = { BYN: 'BYN', RUB: '₽', KZT: '₸', UAH: '₴', USD: '$', EUR: '€' };
  const VISITS = ['Первичка', 'Коррекция', 'Обновление'];
  const CATS = { brows: 'Брови', lips: 'Губы', eyes: 'Веки', tech: 'Техника' };
  const ZONE_TAGS = { brows: 'Брови', lips: 'Губы', eyes: 'Веки' };
  const CAT_ICO = { brows: 'brow', lips: 'lips', eyes: 'eye', tech: 'drop' };
  const TASK_TAGS = { clients: 'Клиенты', buy: 'Закупки', content: 'Контент', study: 'Учёба', life: 'Личное' };
  const KNOWN_BRANDS = ['Absolute Ink', 'AJ Sorelle', 'AMIEA', 'AS Pigments', 'Biocolors', 'Biotek', 'BioTouch', 'Brovi', 'Brow Daddy', 'Donda', 'Doreme', 'Dual Color', 'Dynamic', 'Etalon Mix', 'Everlasting', 'Goochie', 'Hanafy', 'Kolorsource'];
  const PIG_COLORS = ['#3b2a22', '#5a3c2c', '#7b5238', '#9a6b47', '#b88a63', '#c9a27c', '#d88c7a', '#c25f6c', '#a63d4f', '#2a2a2e'];

  // Фоны: меняют только фон, акценты остаются фирменными (как в эталоне)
  const BGS = [
    { id: 'emerald', name: 'Изумруд', mode: 'dark', v: { bg: '#001a16', mid: '#00322c', glow: 'rgba(26,154,144,.55)', wtop: 'rgba(0,22,19,.55)', wbot: 'rgba(24,150,142,.55)', crest: 'rgba(170,252,242,.4)', streak: 'rgba(190,255,246,.13)' } },
    { id: 'violet', name: 'Фиолет', mode: 'dark', v: { bg: '#0b0a1a', mid: '#1c1640', glow: 'rgba(120,90,220,.5)', wtop: 'rgba(8,6,22,.55)', wbot: 'rgba(110,80,210,.5)', crest: 'rgba(200,180,255,.4)', streak: 'rgba(215,200,255,.12)' } },
    { id: 'graphite', name: 'Графит', mode: 'dark', v: { bg: '#0b0d10', mid: '#1a1f26', glow: 'rgba(150,160,175,.35)', wtop: 'rgba(8,10,12,.6)', wbot: 'rgba(120,130,145,.4)', crest: 'rgba(230,235,245,.35)', streak: 'rgba(255,255,255,.09)' } },
    { id: 'sandgreen', name: 'Песок и зелень', mode: 'dark', v: { bg: '#0c1612', mid: '#222d26', glow: 'rgba(160,150,105,.42)', wtop: 'rgba(8,14,11,.55)', wbot: 'rgba(120,135,100,.45)', crest: 'rgba(240,230,195,.35)', streak: 'rgba(240,235,205,.1)' } },
    { id: 'deep', name: 'Глубокий', mode: 'dark', v: { bg: '#000f0e', mid: '#003029', glow: 'rgba(0,170,150,.5)', wtop: 'rgba(0,12,10,.6)', wbot: 'rgba(0,150,135,.6)', crest: 'rgba(120,255,235,.4)', streak: 'rgba(160,255,240,.12)' } },
    { id: 'wine', name: 'Бордо', mode: 'dark', v: { bg: '#0d0a0b', mid: '#2a1019', glow: 'rgba(138,46,77,.5)', wtop: 'rgba(13,10,11,.6)', wbot: 'rgba(138,46,77,.5)', crest: 'rgba(240,200,160,.35)', streak: 'rgba(255,225,200,.09)' } },
    { id: 'white', name: 'Белый', mode: 'light', v: { bg: '#edf2f1', mid: '#dce8e6', glow: 'rgba(120,200,190,.35)', wtop: 'rgba(255,255,255,.55)', wbot: 'rgba(150,210,200,.45)', crest: 'rgba(60,140,130,.25)', streak: 'rgba(255,255,255,.7)' } },
    { id: 'beige', name: 'Беж', mode: 'light', v: { bg: '#f3ede4', mid: '#e7dccd', glow: 'rgba(210,170,120,.35)', wtop: 'rgba(255,252,245,.55)', wbot: 'rgba(212,178,135,.42)', crest: 'rgba(150,110,60,.22)', streak: 'rgba(255,250,240,.75)' } },
    { id: 'mint', name: 'Мята', mode: 'light', v: { bg: '#e8f4ef', mid: '#d2eae2', glow: 'rgba(80,190,170,.35)', wtop: 'rgba(250,255,253,.55)', wbot: 'rgba(110,200,180,.42)', crest: 'rgba(30,130,115,.25)', streak: 'rgba(255,255,255,.7)' } },
  ];

  const ICONS = {
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    users: '<path d="M16 19v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1"/><circle cx="10" cy="8" r="3"/><path d="M20 19v-1a3 3 0 00-2-2.8M16 5.2a3 3 0 010 5.6"/>',
    book: '<path d="M4 5a2 2 0 012-2h13v15H6a2 2 0 00-2 2V5z"/><path d="M4 20a2 2 0 002 1h13v-3M8 7h7M8 11h7"/>',
    sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M19 11a7 7 0 01-14 0M12 18v3"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    crown: '<path d="M4 8l4 4 4-6 4 6 4-4-2 11H6L4 8z"/>',
    home: '<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-9z"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    brow: '<path d="M3 15c4-8 12-9 18-6-6-1-13 1-18 6z"/>',
    lips: '<path d="M3 12c3-3 6-3 9-1 3-2 6-2 9 1-3 5-6 6-9 6s-6-1-9-6z"/><path d="M3 12h18"/>',
    eye: '<path d="M2 12c4-6 16-6 20 0-4 6-16 6-20 0z"/><circle cx="12" cy="12" r="3"/>',
    drop: '<path d="M12 3s-6 7-6 11a6 6 0 0012 0c0-4-6-11-6-11z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
    board: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.1 0-2-.4-2.5-1.2M12 6.5V8M12 16v1.5"/>',
    trend: '<path d="M3 17l6-6 4 4 8-9M15 6h6v6"/>',
    bell: '<path d="M6 16v-5a6 6 0 0112 0v5l1.5 2h-15L6 16z"/><path d="M10 20a2 2 0 004 0"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    palette: '<path d="M12 3a9 9 0 100 18c1.2 0 1.8-.8 1.8-1.7 0-.9-.6-1.3-.6-2.1 0-.9.7-1.5 1.7-1.5H17a4 4 0 004-4c0-4.4-4-8.7-9-8.7z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0114 0"/>',
    userplus: '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20a6.5 6.5 0 0113 0M18 8v6M15 11h6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.1"/>',
    msg: '<path d="M4 5h16v11H9l-5 4V5z"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.1M4.5 12h.1M4.5 18h.1"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13 7l4 4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>',
    moon: '<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
    upload: '<path d="M12 16V5M7 10l5-5 5 5M5 19h14"/>',
    shield: '<path d="M12 3l7 3v6c0 4.2-2.8 7.3-7 9-4.2-1.7-7-4.8-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1-1.5 2M12 17v.1"/>',
    calcheck: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>',
    tasks: '<path d="M4 7h3M4 12h3M4 17h3M10 7h10M10 12h10M10 17h10"/><path d="M5 7l.8.8L7 6.5" stroke-width="1.4"/>',
    save: '<path d="M5 4h11l3 3v13H5V4z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
    up: '<path d="M6 15l6-6 6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
  };
  const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  const art = (id, vb) => `<svg viewBox="${vb}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const ART = { pen: art('a-pen', '0 0 420 120'), cart: art('a-cart', '0 0 120 200'), bottle: art('a-bottle', '0 0 140 190') };
  const logo = (cls = 'logo') => `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true"><use href="#a-logo"/></svg>`;

  // ---------- Памятки и уроки (образец оформления, не готовое содержание) ----------
  const demoSections = [
    { h: 'Подготовка', t: 'Здесь будет текст автора: что подготовить перед работой.' },
    { h: 'Настройка и ход работы', t: 'Здесь будут шаги и параметры, которые даёт мастер-консультант.' },
    { h: 'Частые ошибки', t: 'Здесь будет список типичных ошибок и как их избежать.' },
    { h: 'После процедуры', t: 'Здесь будет, что сказать клиенту и что записать в карточку.' },
  ];
  const SEED_LESSONS = [
    { id: 's1', title: 'Настройка аппарата и иглы', cat: 'tech', type: 'video', free: true, video: '', sections: demoSections, demo: true },
    { id: 's2', title: 'Брови: порядок работы (памятка)', cat: 'brows', type: 'memo', free: true, video: '', sections: demoSections, demo: true },
    { id: 's3', title: 'Брови: перекрытие старой работы', cat: 'brows', type: 'video', free: false, video: '', sections: demoSections, demo: true },
    { id: 's4', title: 'Губы: порядок работы (памятка)', cat: 'lips', type: 'memo', free: false, video: '', sections: demoSections, demo: true },
    { id: 's5', title: 'Веки: безопасность и порядок работы', cat: 'eyes', type: 'video', free: false, video: '', sections: demoSections, demo: true },
    { id: 's6', title: 'Чек-лист подготовки кабинета', cat: 'tech', type: 'table', free: false, video: '', sections: [{ h: 'Чек-лист', t: 'Пункт 1 (пример)\nПункт 2 (пример)\nПункт 3 (пример)' }], demo: true },
  ];
  const TYPE_LABEL = { video: 'Видео', memo: 'Памятка', table: 'Таблица' };

  // Набор услуг для быстрого старта (цены примерные, их нужно заменить своими)
  const SERVICE_SET = [
    { key: 'mb', group: 'Перманентный макияж', name: 'Брови (микроблейдинг)', mins: 120, price: 250, kw: ['микроблей'], drops: 6, on: true },
    { key: 'pb', group: 'Перманентный макияж', name: 'Брови (пудровое напыление)', mins: 120, price: 260, kw: ['бров', 'пудр'], drops: 6, on: true },
    { key: 'li', group: 'Перманентный макияж', name: 'Губы (акварель, блик)', mins: 120, price: 280, kw: ['губ'], drops: 8, on: true },
    { key: 'ey', group: 'Перманентный макияж', name: 'Межресничка и стрелка', mins: 90, price: 200, kw: ['век', 'межресн', 'стрелк'], drops: 4, on: true },
    { key: 'rm', group: 'Перманентный макияж', name: 'Удаление (ремувер)', mins: 60, price: 150, kw: ['удален', 'ремувер'], drops: 0, on: false },
    { key: 't1', group: 'Татуировка', name: 'Небольшая работа', mins: 120, price: 200, kw: ['татуиров', 'тату'], drops: 0, on: false },
    { key: 't2', group: 'Татуировка', name: 'Сеанс (час работы)', mins: 60, price: 100, kw: ['сеанс'], drops: 0, on: false },
  ];

  // Набор материалов для быстрого старта (цены примерные, их нужно заменить своими)
  const SUPPLY_SET = [
    { key: 'cart', name: 'Картриджи', qty: 20, unit: 'шт', price: 160, on: true },
    { key: 'glove', name: 'Перчатки', qty: 100, unit: 'шт', price: 25, on: true },
    { key: 'anes', name: 'Анестезия', qty: 30, unit: 'порций', price: 45, on: true },
    { key: 'wipe', name: 'Салфетки и пелёнки', qty: 50, unit: 'наборов', price: 60, on: true },
    { key: 'brush', name: 'Микробраши', qty: 50, unit: 'шт', price: 40, on: false },
    { key: 'film', name: 'Защитная плёнка', qty: 100, unit: 'шт', price: 20, on: false },
    { key: 'cap', name: 'Колпачки для пигмента', qty: 500, unit: 'шт', price: 15, on: false },
  ];

  const INTROS = {
    clients: { ico: 'users', title: 'Клиенты', text: 'Карточки клиентов с рецептами и вкладка «Процедуры»: вся история с фильтрами, отмены и неявки. Здесь же напоминания и готовые сообщения. Перед коррекцией откройте карточку и подставьте прошлый рецепт.', when: 'Перед приходом клиента и после процедуры.' },
    board: { ico: 'board', title: 'Задачи', text: 'Ваш планер, как в Trello. Колонки можно переименовать, сворачивать и разворачивать, в карточке есть чек-лист и срок.', when: 'Утром, чтобы спланировать день.' },
    money: { ico: 'coin', title: 'Деньги', text: 'Цена процедуры, отчёт за месяц, «Что если», прайс-карточка для Instagram, а также услуги, материалы и ваш набор пигментов: из них считается, сколько остаётся с каждой процедуры.', when: 'Когда меняете прайс, закупаете материалы или подводите итоги.', warn: 'Без услуг и материалов расчёты будут пустыми. Начните с настройки на главной.' },
    learn: { ico: 'book', title: 'Знания', text: 'Короткие памятки, таблицы и видеоуроки по зонам и технике.', when: 'Перед сложной работой или когда нужно освежить порядок действий.', warn: 'Часть материалов открыта только в PRO.' },
  };


  // ---------- Состояние ----------
  const defaults = () => ({
    v: 3,
    onboarded: false,
    isPro: false,
    lastExport: null,
    bg: { id: 'emerald', custom: '' },
    seen: {},
    setupDismissed: false,
    settings: {
      masterName: '', currency: 'BYN', mode: 'monthly', rent: 0, rentHour: 0, otherFixed: 0, tax: 0,
      planClients: 20, target: 0, careDays: 3, corrDays: 28, refreshDays: 330, winbackDays: 120, dropsPerMl: 20,
    },
    templates: {
      care: 'Здравствуйте, {имя}! Как ваши ощущения после процедуры? Придерживайтесь рекомендаций по уходу, которые вы получили. Если появятся вопросы, пишите.',
      corr: 'Здравствуйте, {имя}! Прошёл примерно месяц после процедуры. Самое время на коррекцию. Подберём удобное время?',
      refresh: 'Здравствуйте, {имя}! С прошлой процедуры прошёл почти год. Давайте обновим цвет, когда вам удобно?',
      winback: 'Здравствуйте, {имя}! Давно не виделись. Если хотите, подберём время на визит.',
      holiday: 'Здравствуйте, {имя}! Поздравляю с праздником! Желаю тепла и хорошего настроения.',
      review: 'Здравствуйте, {имя}! Спасибо, что были у меня. Если вам понравился результат, оставьте, пожалуйста, пару слов о визите. Это очень помогает.',
    },
    followDone: {},
    clientMeta: {},
    supplies: [],
    zones: [],
    pigments: [],
    procedures: [],
    customLessons: [],
    collapsed: {},
    columns: [{ id: 'c1', name: 'Сегодня' }, { id: 'c2', name: 'На неделе' }, { id: 'c3', name: 'Позже' }, { id: 'c4', name: 'Готово' }],
    tasks: [],
  });

  let storageOk = true;
  const S = (() => {
    const d = defaults();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        const merged = Object.assign(d, p, { settings: Object.assign(d.settings, p.settings || {}), templates: Object.assign(d.templates, p.templates || {}), bg: Object.assign(d.bg, p.bg || {}) });
        if (!Array.isArray(merged.columns) || merged.columns.length < 2) merged.columns = defaults().columns;
        ['tasks', 'pigments', 'procedures', 'zones', 'supplies', 'customLessons'].forEach((k) => { if (!Array.isArray(merged[k])) merged[k] = []; });
        if (!merged.seen || typeof merged.seen !== 'object') merged.seen = {};
        if (!merged.followDone || typeof merged.followDone !== 'object') merged.followDone = {};
        if (!merged.clientMeta || typeof merged.clientMeta !== 'object') merged.clientMeta = {};
        if (!merged.collapsed || typeof merged.collapsed !== 'object') merged.collapsed = {};
        return merged;
      }
    } catch (e) { storageOk = false; }
    return d;
  })();
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(S)); storageOk = true; return true; } catch (e) { storageOk = false; return false; }
  };

  // в деньгах, клиентах и напоминаниях учитываются только состоявшиеся процедуры; отмены и неявки живут отдельно
  const procs = () => S.procedures.filter((p) => !p.status || p.status === 'done');
  const STATUS = { done: 'Состоялась', cancel: 'Отмена', noshow: 'Неявка' };

  let page = 'home';     // home | clients | board | money | learn | profile | bg
  let sub = null;        // price | supplies | services | kit | report (внутри «Деньги»), msgs (внутри «Клиенты»)
  let learnFilter = 'all';
  let clientQuery = '';
  let clientsTab = 'people'; let procPeriod = 'all'; let procZone = 'all'; let procQuery = '';
  let clientFilter = 'all';
  let kitQuery = '';
  let kitBrand = 'all';
  let kitZone = 'all';
  let msgTab = 'follow';
  let taskDraft = null;
  const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ---------- Вспомогательное ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const num = (v) => { const n = Number(String(v == null ? '' : v).replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
  const pad = (n) => String(n).padStart(2, '0');
  const dstr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => dstr(new Date());
  const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return dstr(d); };
  const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
  const sym = () => CURRENCIES[S.settings.currency] || S.settings.currency;
  const nf0 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
  const nf2 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
  const fmt = (n) => (Math.abs(n) >= 100 ? nf0.format(n) : nf2.format(n)).replace('-', '−') + ' ' + sym();
  const fmt2 = (n) => nf2.format(n).replace('-', '−') + ' ' + sym();
  const fmtDate = (s) => { const [y, m, d] = s.split('-'); return `${d}.${m}.${y}`; };
  const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
  const plural = (n, a, b, c) => { const m = Math.abs(n) % 100, d = Math.abs(n) % 10; return (m > 10 && m < 15) ? c : d === 1 ? a : (d >= 2 && d <= 4) ? b : c; };
  const mins = (m) => (m >= 60 ? `${Math.floor(m / 60)} ч${m % 60 ? ' ' + (m % 60) + ' мин' : ''}` : `${m} мин`);
  const initials = (n) => String(n || '').trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '•';
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // ---------- Расчёты: что считается «под капотом» ----------
  const unitCost = (s) => (num(s.packQty) > 0 ? num(s.packPrice) / num(s.packQty) : 0);
  const supplyById = (id) => S.supplies.find((s) => s.id === id);
  const pigById = (id) => S.pigments.find((p) => p.id === id);
  const dropCost = (p) => (num(p.ml) > 0 && num(S.settings.dropsPerMl) > 0 ? num(p.price) / (num(p.ml) * num(S.settings.dropsPerMl)) : 0);
  const avgDropCost = () => { const a = S.pigments.map(dropCost).filter((x) => x > 0); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0; };
  const usageCostOf = (map) => Object.entries(map || {}).reduce((sum, [id, q]) => { const s = supplyById(id); return sum + (s ? num(q) * unitCost(s) : 0); }, 0);
  const usageCost = (z) => usageCostOf(z.usage);
  // сроки напоминаний: свои у услуги, иначе общие из настроек
  const ruleDays = (zoneId, key) => { const z = S.zones.find((x) => x.id === zoneId); const v = z && z[key] !== undefined && z[key] !== null && z[key] !== '' ? num(z[key]) : 0; return v > 0 ? v : num(S.settings[key]); };
  const zoneSupplyCost = (z) => usageCost(z) + num(z.drops) * avgDropCost();
  // пигмент вне набора или без цены считается по средней цене капли в наборе
  const rowDropCost = (r) => { const p = pigById(r.pid); const dc = p ? dropCost(p) : 0; return dc > 0 ? dc : avgDropCost(); };
  const recipeCost = (rec) => (rec || []).reduce((sum, r) => sum + num(r.drops) * rowDropCost(r), 0);
  const recipeEstimated = (rec) => (rec || []).some((r) => { const p = pigById(r.pid); return !p || dropCost(p) <= 0; });
  const fixedMonthly = () => (S.settings.mode === 'monthly' ? num(S.settings.rent) : 0) + num(S.settings.otherFixed);
  const taxRate = () => Math.min(num(S.settings.tax), 90) / 100;

  function zoneStats(z, price = num(z.price)) {
    const st = S.settings;
    const supplies = zoneSupplyCost(z);
    const tax = price * taxRate();
    const rentH = st.mode === 'hourly' ? num(st.rentHour) * num(z.hours) : 0;
    const left = price - tax - supplies - rentH;
    const fixed = fixedMonthly();
    const N = Math.max(1, Math.round(num(st.planClients)) || 1);
    const target = num(st.target);
    const needPrice = ((fixed + target) / N + supplies + rentH) / (1 - taxRate());
    return { price, supplies, tax, rentH, left, fixed, N, target, needPrice, breakEven: left > 0 ? Math.ceil(fixed / left) : null };
  }

  // стоимость конкретной процедуры: материалы по услуге плюс пигмент по рецепту (или оценка)
  function procCosts(z, price, recipe, usageMap) {
    const st = S.settings;
    const usage = z ? usageCostOf(usageMap || z.usage) : 0;
    const hasRecipe = recipe && recipe.length;
    const pigment = hasRecipe ? recipeCost(recipe) : (z ? num(z.drops) * avgDropCost() : 0);
    const tax = price * taxRate();
    const rentH = st.mode === 'hourly' && z ? num(st.rentHour) * num(z.hours) : 0;
    return { usage, pigment, estimated: !hasRecipe || recipeEstimated(recipe), tax, rentH, supplies: usage + pigment, left: price - tax - usage - pigment - rentH };
  }

  const procNet = (p) => num(p.price) - num(p.costTax) - num(p.costSupplies) - num(p.costRent);
  const monthKey = (d = new Date()) => dstr(d).slice(0, 7);
  const prevMonthKey = (ym) => { const [y, m] = ym.split('-').map(Number); return monthKey(new Date(y, m - 2, 1)); };
  const monthName = (ym) => { const [y, m] = ym.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(/\s*г\.?$/, ''); };

  function monthData(ym) {
    const list = procs().filter((p) => p.date.startsWith(ym));
    const bad = S.procedures.filter((p) => p.date.startsWith(ym) && p.status && p.status !== 'done');
    const gross = list.reduce((s, p) => s + num(p.price), 0);
    const left = list.reduce((s, p) => s + procNet(p), 0);
    const tax = list.reduce((s, p) => s + num(p.costTax), 0);
    const sup = list.reduce((s, p) => s + num(p.costSupplies) + num(p.costRent), 0);
    const fixed = fixedMonthly();
    return { list, lostN: bad.length, lost: bad.reduce((a, p) => a + num(p.price), 0), count: list.length, gross, left, tax, sup, fixed, net: left - fixed, avg: list.length ? gross / list.length : 0, cover: fixed > 0 ? Math.min(1, Math.max(0, left / fixed)) : 1 };
  }

  function byZone(list) {
    const map = new Map();
    list.forEach((p) => {
      const key = p.zoneId || p.zoneName;
      const z = S.zones.find((x) => x.id === p.zoneId);
      const e = map.get(key) || { name: p.zoneName || (z && z.name) || 'Услуга', count: 0, gross: 0, left: 0, hours: 0 };
      e.count += 1; e.gross += num(p.price); e.left += procNet(p); e.hours += z ? num(z.hours) : 0;
      map.set(key, e);
    });
    return [...map.values()].map((e) => Object.assign(e, { perHour: e.hours > 0 ? e.left / e.hours : null })).sort((a, b) => b.left - a.left);
  }

  function forecast() {
    const d = new Date();
    const day = d.getDate();
    const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const m = monthData(monthKey());
    if (day < 5 || m.count < 3) return null;
    const projLeft = (m.left / day) * dim;
    return { projNet: projLeft - m.fixed, projLeft };
  }

  const clientKey = (n) => String(n || '').trim().toLowerCase();

  // клиенты: сводка по записям
  function clientsAgg() {
    const map = new Map();
    procs().forEach((p) => {
      const k = clientKey(p.client);
      if (!map.has(k)) map.set(k, { key: k, name: p.client, list: [] });
      map.get(k).list.push(p);
    });
    return [...map.values()].map((c) => {
      c.list.sort((a, b) => a.date.localeCompare(b.date));
      c.first = c.list[0].date; c.last = c.list[c.list.length - 1].date;
      c.visits = c.list.length; c.net = c.list.reduce((s, p) => s + procNet(p), 0);
      c.name = c.list[c.list.length - 1].client;
      return c;
    }).sort((a, b) => b.last.localeCompare(a.last));
  }

  function retention() {
    const byC = new Map();
    procs().forEach((p) => { const k = clientKey(p.client); if (!byC.has(k)) byC.set(k, []); byC.get(k).push(p); });
    let total = 0; let back = 0;
    byC.forEach((list) => {
      const prim = list.filter((p) => p.visit === 'Первичка').sort((a, b) => a.date.localeCompare(b.date))[0];
      if (!prim || daysBetween(prim.date, today()) < num(S.settings.corrDays) + 14) return;
      total += 1;
      if (list.some((p) => p.date > prim.date && p.visit !== 'Первичка')) back += 1;
    });
    return total >= 3 ? { total, back, rate: back / total } : null;
  }

  // Напоминания клиентам: что и кому написать сегодня
  const FOLLOW = {
    care: { title: 'Уход после процедуры', tpl: 'care' },
    corr: { title: 'Приглашение на коррекцию', tpl: 'corr' },
    refresh: { title: 'Обновление цвета', tpl: 'refresh' },
    winback: { title: 'Вернуть клиента', tpl: 'winback' },
  };
  function followups(includeDone = false) {
    const st = S.settings;
    const t = today();
    const res = [];
    const last = new Map();
    procs().forEach((p) => { const k = clientKey(p.client); if (!last.has(k) || last.get(k).date <= p.date) last.set(k, p); });
    procs().forEach((p) => {
      const d = daysBetween(p.date, t);
      const cd = ruleDays(p.zoneId, 'careDays');
      if (d >= cd && d <= cd + 3 && last.get(clientKey(p.client)).id === p.id) res.push({ p, d, kind: 'care', key: p.id + ':care' });
    });
    last.forEach((p) => {
      const d = daysBetween(p.date, t);
      const corr = ruleDays(p.zoneId, 'corrDays'); const refr = ruleDays(p.zoneId, 'refreshDays');
      if (p.visit === 'Первичка' && d >= corr && d < refr) res.push({ p, d, kind: 'corr', key: p.id + ':corr' });
      if (d >= refr) res.push({ p, d, kind: 'refresh', key: p.id + ':refresh' });
      else if (p.visit !== 'Первичка' && d >= num(st.winbackDays)) res.push({ p, d, kind: 'winback', key: p.id + ':winback' });
    });
    const order = { corr: 0, refresh: 1, winback: 2, care: 3 };
    return res.filter((x) => includeDone || !S.followDone[x.key]).sort((a, b) => order[a.kind] - order[b.kind] || b.d - a.d);
  }
  const dueList = () => followups().filter((x) => x.kind !== 'care');

  // ---------- Дела ----------
  const lastCol = () => S.columns[S.columns.length - 1];
  const firstCol = () => S.columns[0];
  const isActive = (t) => t.col !== lastCol().id;
  const colIndex = (id) => Math.max(0, S.columns.findIndex((c) => c.id === id));
  function dueLabel(d) {
    if (!d) return '';
    const diff = daysBetween(today(), d);
    if (diff === 0) return 'сегодня';
    if (diff === 1) return 'завтра';
    if (diff === -1) return 'вчера';
    return fmtDate(d).slice(0, 5);
  }
  const chkProgress = (t) => { const c = t.checklist || []; return c.length ? `${c.filter((x) => x.d).length}/${c.length}` : ''; };
  function taskMeta(t) {
    const bits = [];
    if (t.tag && TASK_TAGS[t.tag]) bits.push(`<span class="tag accent">${TASK_TAGS[t.tag]}</span>`);
    if (t.due) bits.push(`<span class="tag ${isActive(t) && t.due < today() ? 'bad' : ''}">${ico('clock')}${dueLabel(t.due)}</span>`);
    if (chkProgress(t)) bits.push(`<span class="tag">${ico('check')}${chkProgress(t)}</span>`);
    if (num(t.mins) > 0) bits.push(`<span class="tag">${mins(num(t.mins))}</span>`);
    return bits.join('');
  }
  const todayTasks = () => S.tasks.filter((t) => isActive(t) && (t.col === firstCol().id || (t.due && t.due <= today())));

  function addTask(fields) {
    if (!S.isPro && S.tasks.filter(isActive).length >= PLAN.freeTaskLimit) { openPaywall('Бесплатно можно держать ' + PLAN.freeTaskLimit + ' активных задач.'); return null; }
    const t = Object.assign({ id: uid(), title: '', note: '', col: firstCol().id, due: '', tag: '', mins: '', checklist: [], created: today() }, fields);
    S.tasks.push(t); save();
    return t;
  }

  // Настройка кабинета: пять шагов
  function setupSteps() {
    const st = S.settings;
    return [
      { k: 'cab', title: 'Ваш кабинет', hint: 'Укажите аренду, расходы и налог, иначе цена посчитается неточно.', done: num(st.rent) > 0 || num(st.rentHour) > 0 || num(st.otherFixed) > 0 || num(st.tax) > 0, ico: 'gear' },
      { k: 'svc', title: 'Услуги', hint: 'Без услуг нельзя считать цену и создавать процедуры.', done: S.zones.length > 0, ico: 'list' },
      { k: 'sup', title: 'Материалы', hint: 'Цена упаковки один раз, дальше расход считается сам.', done: S.supplies.length > 0, ico: 'box' },
      { k: 'kit', title: 'Мой набор пигментов', hint: 'Цена флакона даёт стоимость капли и стоимость рецепта.', done: S.pigments.length > 0, ico: 'palette' },
      { k: 'cli', title: 'Первая процедура', hint: 'Появятся рецепты, отчёт и напоминания.', done: S.procedures.length > 0, ico: 'users' },
    ];
  }

  // Короткие выводы простым языком. Главное: одна мысль, одно число, одно действие.
  function insights() {
    const out = [];
    const m = monthData(monthKey());
    const fc = forecast();
    const overdue = S.tasks.filter((t) => isActive(t) && t.due && t.due < today());

    if (overdue.length) out.push({ p: 1, tone: 'warn', ico: 'clock', title: `Просрочено задач: ${overdue.length}`, text: 'Разберите их сегодня или перенесите.', act: { label: 'Открыть задачи', page: 'board' } });

    const gaps = S.zones.map((z) => ({ z, r: zoneStats(z) }))
      .filter((x) => num(x.z.price) > 0 && x.r.needPrice - x.r.price > 0.5)
      .sort((a, b) => (b.r.needPrice - b.r.price) - (a.r.needPrice - a.r.price));
    if (gaps.length) {
      const g = gaps[0];
      out.push({ p: 1, tone: 'warn', ico: 'coin', title: `Цена «${esc(g.z.name)}» ниже нужной`, text: `Чтобы выйти на ваш доход при ${g.r.N} клиентах, нужно ${fmt(Math.ceil(g.r.needPrice))}, сейчас ${fmt(g.r.price)}.`, act: { label: 'Посмотреть расчёт', page: 'money', sub: 'price' } });
    }

    if (m.fixed > 0 && m.count > 0) {
      if (m.left < m.fixed) {
        const per = m.left / m.count;
        const need = per > 0 ? Math.ceil((m.fixed - m.left) / per) : 0;
        out.push({ p: 2, tone: 'info', ico: 'chart', title: 'До покрытия постоянных расходов', text: `Осталось ${fmt(m.fixed - m.left)}${need ? `, это примерно ${need} ${plural(need, 'процедура', 'процедуры', 'процедур')}` : ''}.` });
      } else {
        out.push({ p: 3, tone: 'ok', ico: 'check', title: 'Постоянные расходы покрыты', text: `Дальше всё идёт вам. Сейчас чистыми ${fmt(m.net)}.` });
      }
    }
    if (fc) out.push({ p: 2, tone: fc.projNet >= 0 ? 'ok' : 'warn', ico: 'trend', title: 'К концу месяца', text: `При таком темпе вы заработаете чистыми около ${fmt(fc.projNet)}.` });

    const zs = byZone(procs()).filter((z) => z.perHour != null).sort((x, y) => y.perHour - x.perHour);
    if (zs.length >= 2) {
      out.push({ p: 2, tone: 'info', ico: 'clock', title: 'Какой час оплачивается лучше', text: `${esc(zs[0].name)}: ${fmt(zs[0].perHour)} за час. ${esc(zs[zs.length - 1].name)}: ${fmt(zs[zs.length - 1].perHour)} за час.` });
    } else if (procs().length >= 3 && S.zones.some((z) => !num(z.hours))) {
      out.push({ p: 3, tone: 'info', ico: 'clock', title: 'Сколько стоит ваш час', text: 'Укажите, сколько часов занимает каждая услуга, и приложение покажет, какая оплачивается лучше.', act: { label: 'Указать часы', page: 'money', sub: 'services' } });
    }

    const due = dueList();
    if (due.length) {
      const avg = procs().length ? procs().reduce((s, p) => s + num(p.price), 0) / procs().length : 0;
      out.push({ p: 2, tone: 'info', ico: 'users', title: `Пора написать: ${due.length} ${plural(due.length, 'клиенту', 'клиентам', 'клиентам')}`, text: avg > 0 ? `Если запишется хотя бы половина, это около ${fmt(Math.round(due.length / 2) * avg)}.` : 'Напомните о коррекции или обновлении.' });
    }
    if (m.lostN > 0) out.push({ p: 2, tone: 'warn', ico: 'clock', title: `Неявки и отмены: ${m.lostN}`, text: `За месяц потеряно около ${fmt(m.lost)}. Напомните клиентам за день до процедуры.` });
    if (m.tax > 0) out.push({ p: 3, tone: 'info', ico: 'coin', title: 'Отложить на налог', text: `За этот месяц набежало ${fmt(m.tax)}.` });
    const ret = retention();
    if (ret) out.push({ p: 3, tone: 'info', ico: 'users', title: 'Возвращаются на коррекцию', text: `${Math.round(ret.rate * 100)}% новых клиентов (${ret.back} из ${ret.total}).` });

    return out.sort((a, b) => a.p - b.p);
  }

  // ---------- Диктовка: разбор текста правилами ----------
  function parseDictation(text) {
    const raw = String(text || '').replace(/\s+/g, ' ').trim();
    const low = raw.toLowerCase();
    const f = {};
    const found = [];

    let name = raw.replace(/^(запиши|запись|новая запись|добавь)[:,]?\s*/i, '');
    const c = name.search(/[,;]/);
    if (c > 0) name = name.slice(0, c);
    else {
      const k = name.search(/\s+(бров|губ|век|межресн|стрелк|удален|первичк|коррекц|рефреш)/i);
      if (k > 0) name = name.slice(0, k);
    }
    name = name.trim();
    if (name && name.length < 60) { f.client = name; found.push('Клиент'); }

    let best = null;
    S.zones.forEach((z) => {
      const kws = (z.kw && z.kw.length ? z.kw : [String(z.name).slice(0, 4).toLowerCase()]);
      kws.forEach((kw) => {
        const i = low.indexOf(kw);
        if (i >= 0 && (best === null || i < best.i)) best = { i, id: z.id };
      });
    });
    if (best) { f.zoneId = best.id; found.push('Услуга'); }

    if (/первичк|первый раз|впервые/.test(low)) { f.visit = 'Первичка'; found.push('Визит'); }
    else if (/коррекц|подправ/.test(low)) { f.visit = 'Коррекция'; found.push('Визит'); }
    else if (/рефреш|обновлен/.test(low)) { f.visit = 'Обновление'; found.push('Визит'); }

    const numPat = '(\\d{1,3}(?:[ \\u00a0]\\d{3})+|\\d+)';
    let pm = low.match(new RegExp('(?:чек|цена|стоимость|оплат[а-я]*|взяла|взял|заплатил[а-я]*)\\s*[:\\-]?\\s*' + numPat));
    if (!pm) pm = low.match(new RegExp(numPat + '\\s*(?:руб|р\\b|byn|₽|br)'));
    if (pm) { f.price = parseInt(pm[1].replace(/\s| /g, ''), 10); found.push('Сумма'); }

    const vm = low.match(/вольтаж[а-я]*\s*[:\-]?\s*(\d+(?:[.,]\d+)?)/);
    if (vm) { f.voltage = vm[1].replace(',', '.') + 'V'; found.push('Вольтаж'); }

    const nm = raw.match(/игл[а-я]*\s*[:\-]?\s*(\d(?:[.,]\d{1,2})?\s*[A-Za-zА-Яа-я]{1,5}\d?|\d\s*[A-Za-zА-Яа-я]{1,3})/i);
    if (nm) {
      f.needle = nm[1].replace(',', '.').replace(/рллт/i, 'RLLT').replace(/рлмт/i, 'RLMT').toUpperCase();
      found.push('Игла');
    }

    const pg = raw.match(/(?:пигмент[а-я]*|микс|рецепт)\s*[:\-]?\s*([\s\S]+?)(?=,\s*(?:игл|вольтаж|кож)|[.!]\s|\s*$)/i);
    if (pg) {
      f.pigment = pg[1].replace(/^(сделал[аи]?|использовал[аи]?|взял[аи]?|такой|такая)\s+/i, '').replace(/(\d)\s*капл[а-я]*/gi, '$1к').replace(/\s*плюс\s*/gi, ' + ').replace(/\s+/g, ' ').trim();
      found.push('Пигмент');
    }

    const notes = raw.split(/[.!?]\s+/).map((s) => s.trim().replace(/[.!?]$/, '')).filter((s) => /кож|анест|отек|реакц|довол|пожелан|кровил/i.test(s) && !/пигмент|игл/i.test(s));
    if (notes.length) { f.notes = notes.join('. '); found.push('Заметка'); }
    return { f, found };
  }

  // ---------- Видео ----------
  function toEmbed(url) {
    const u = String(url || '').trim();
    if (!u) return null;
    let m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    m = u.match(/vimeo\.com\/(\d+)/);
    if (m) return 'https://player.vimeo.com/video/' + m[1];
    m = u.match(/kinescope\.io\/(?:embed\/)?([\w-]+)/);
    if (m) return 'https://kinescope.io/embed/' + m[1];
    return null;
  }
  const safeUrl = (u) => (/^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : '');

  // ---------- Фон ----------
  function applyBg() {
    const preset = BGS.find((b) => b.id === S.bg.id) || BGS[0];
    const r = document.documentElement;
    const v = preset.v;
    r.style.setProperty('--bg', v.bg); r.style.setProperty('--bg-mid', v.mid); r.style.setProperty('--glow', v.glow);
    r.style.setProperty('--wave-top', v.wtop); r.style.setProperty('--wave-bot', v.wbot); r.style.setProperty('--crest', v.crest); r.style.setProperty('--streak', v.streak);
    r.dataset.mode = preset.mode;
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', v.bg);
    if (S.bg.custom) {
      r.style.setProperty('--photo', `url("${S.bg.custom}")`); document.body.classList.add('has-photo');
    } else { r.style.removeProperty('--photo'); document.body.classList.remove('has-photo'); }
  }

  // ---------- Каркас и переходы ----------
  let navBusy = false;
  function render(enter) {
    let main;
    if (sub) {
      const v = { price: viewPrice, supplies: viewSupplies, services: viewServices, kit: viewKit, report: viewReport, msgs: viewMsgs, whatif: viewWhatIf }[sub];
      main = v();
    } else {
      main = { home: viewHome, clients: viewClients, board: viewBoard, money: viewMoney, learn: viewLearn, profile: viewProfile, bg: viewBg }[page]();
    }
    $('#app').innerHTML = header() + `<main class="main${enter ? ' enter' : ''}">${main}</main>` + nav() + fab();
    document.body.classList.toggle('scrolled', window.scrollY > 40);
  }

  function transition(apply, targetPage) {
    closeModal(true);
    const main = $('.main');
    const finish = () => { apply(); render(true); window.scrollTo(0, 0); $('#loader').classList.remove('on'); navBusy = false; setTimeout(maybeIntro, 380); };
    if (reduce || !main || navBusy) { navBusy = true; finish(); return; }
    navBusy = true;
    document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('on', b.dataset.id === targetPage));
    main.classList.add('leave');
    $('#loader').classList.add('on');
    setTimeout(finish, 230);
  }
  function goTo(p, s = null) {
    if (p === page && s === sub) return;
    transition(() => { page = p; sub = s; }, p);
  }
  function goBack() {
    if (sub) { transition(() => { sub = null; }, page); return; }
    transition(() => { page = 'home'; }, 'home');
  }

  const META = {
    clients: ['Клиенты', 'Карточки и история процедур'],
    board: ['Задачи', 'Ваш планер'],
    money: ['Деньги', 'Цены, материалы и итоги'],
    learn: ['Знания', 'Памятки и уроки'],
    profile: ['Профиль', 'Кабинет и настройки'],
    bg: ['Фон', 'Тема и обои'],
    price: ['Цена процедуры', 'Сколько остаётся и какая цена нужна'],
    supplies: ['Материалы', 'Цена упаковки и расход'],
    services: ['Услуги', 'Цены и время работы'],
    kit: ['Мой набор', 'Пигменты, которыми вы работаете'],
    report: ['Отчёт за месяц', 'Деньги, услуги, клиенты'],
    whatif: ['Что если', 'Цена, скидка, клиенты'],
    msgs: ['Сообщения клиентам', 'Напоминания, шаблоны, подписи'],
  };

  function notifCount() {
    let n = 0;
    n += S.tasks.filter((t) => isActive(t) && t.due && t.due < today()).length;
    n += followups().length;
    return n;
  }

  function header() {
    const isHome = page === 'home';
    const showBack = !!sub || page === 'profile' || page === 'bg';
    const m = META[sub || page] || ['', ''];
    const left = isHome
      ? `${logo()}<div class="t-full home"><div class="brand-name">Кабинет мастера<small>Рабочее место</small></div></div><div class="t-compact">${greetingShort()}</div>`
      : `${showBack ? `<button class="back" data-a="back" aria-label="Назад">${ico('back')}</button>` : ''}${logo()}<div class="t-full"><div class="page-title">${m[0]}</div><div class="page-sub">${m[1]}</div></div>`;
    const nc = notifCount();
    return `<header class="top"><div class="top-l">${left}</div>
      <div class="cap"><button class="icon-btn" data-a="bell" aria-label="Уведомления">${ico('bell')}${nc ? `<span class="badge">${nc > 9 ? '9+' : nc}</span>` : ''}</button>
      <button class="icon-btn" data-a="drawer" aria-label="Меню">${ico('menu')}</button></div></header>`;
  }

  function nav() {
    const t = [['home', 'Главная', 'home'], ['clients', 'Клиенты', 'users'], ['board', 'Задачи', 'board'], ['money', 'Деньги', 'coin'], ['learn', 'Знания', 'book']];
    return `<nav class="tabs"><div class="tabs-in">${t.map(([id, label, ic]) =>
      `<button class="tab ${page === id ? 'on' : ''}" data-a="tab" data-id="${id}" data-id2="${id}" ${page === id ? 'aria-current="page"' : ''}>${ico(ic)}<span>${label}</span></button>`).join('')}</div></nav>`;
  }

  const fab = () => (page === 'clients' && !sub && !(!S.isPro && PLAN.freeProcedureLimit === 0)
    ? `<button class="fab" data-a="proc" data-id="" aria-label="Новая процедура">${ico('plus')}Процедура</button>`
    : (page === 'money' && sub === 'kit' ? `<button class="fab" data-a="pigment" data-id="" aria-label="Добавить пигмент">${ico('plus')}Добавить пигмент</button>` : ''));

  const insightCard = (i) => `<div class="card insight ${i.tone}"><div class="ic">${ico(i.ico)}</div><div>
    <div class="insight-t">${i.title}</div><div class="insight-s">${i.text}</div>
    ${i.act ? `<button class="link" data-a="go" data-page="${i.act.page}" data-sub="${i.act.sub || ''}">${i.act.label}</button>` : ''}</div></div>`;

  // --- Главная
  function greetingShort() {
    const h = new Date().getHours();
    const g = h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
    const n = S.settings.masterName.trim();
    return n ? `${g}, ${esc(n)}` : g;
  }

  function taskRow(t) {
    return `<div class="card task-row" data-a="task" data-id="${esc(t.id)}">
      <button class="chk" data-a="toggle" data-id="${esc(t.id)}" aria-label="Готово">${ico('check')}</button>
      <div><div class="item-title">${esc(t.title)}</div><div class="task-meta">${taskMeta(t)}</div></div></div>`;
  }

  function followRow(x, i) {
    const f = FOLLOW[x.kind];
    return `<div class="card stack"><div class="row"><div><div class="item-title">${esc(x.p.client)}</div>
      <div class="small muted">${f.title} · прошло ${x.d} ${plural(x.d, 'день', 'дня', 'дней')}</div></div></div>
      <div class="row" style="gap:8px"><button class="btn small" data-a="fcopy" data-k="${esc(x.key)}">${ico('copy')}Текст</button><button class="btn small" data-a="ftask" data-k="${esc(x.key)}">В задачи</button><button class="btn small" data-a="fdone" data-k="${esc(x.key)}">${ico('check')}Готово</button></div></div>`;
  }

  function viewHome() {
    const hasData = S.zones.length > 0;
    const m = monthData(monthKey());
    const fc = forecast();
    const ins = insights().slice(0, 3);
    const fl = followups();
    const tt = todayTasks();
    const planned = tt.reduce((s, t) => s + num(t.mins), 0);
    const steps = setupSteps();
    const doneN = steps.filter((s) => s.done).length;
    const next = steps.find((s) => !s.done);
    const needBackup = S.procedures.length >= 3 && (!S.lastExport || daysBetween(S.lastExport, today()) > 30);
    const date0 = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/\s*г\.?$/, '');
    const date = date0.charAt(0).toUpperCase() + date0.slice(1);
    const newClients = clientsAgg().filter((c) => daysBetween(c.first, today()) <= 30).length;

    const hero = hasData ? `<div class="hero"><div class="art-wrap pen">${ART.pen}</div><div class="hero-in">
        <div class="eyebrow">Чистыми за ${esc(monthName(monthKey()).split(' ')[0])}</div>
        <div class="hero-num ${m.net < 0 && m.count > 0 ? 'neg' : ''}">${m.count ? fmt(m.net) : fmt(0)}</div>
        <div class="hero-meta">${m.count ? `${m.count} ${plural(m.count, 'процедура', 'процедуры', 'процедур')} · выручка ${fmt(m.gross)}` : 'В этом месяце процедур пока нет'}</div>
        ${m.fixed > 0 ? `<div><div class="bar ${m.cover >= 1 ? 'ok' : ''}" role="progressbar" aria-valuenow="${Math.round(m.cover * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.round(m.cover * 100)}%"></i></div>
          <div class="tiny muted" style="margin-top:6px">Постоянные расходы ${fmt(m.fixed)}: покрыто ${Math.round(m.cover * 100)}%</div></div>` : ''}
        ${fc ? `<div class="hero-fc">К концу месяца при таком темпе: <b>${fmt(fc.projNet)}</b></div>` : ''}
      </div></div>` : '';

    const emptyHero = `<div class="hero"><div class="art-wrap pen">${ART.pen}</div><div class="hero-in"><div class="eyebrow">Начало работы</div><div class="hero-title">Посчитаем вашу процедуру</div>
        <p class="muted small">Укажите расходы и цены, и кабинет покажет, сколько остаётся с каждой процедуры и какая цена нужна.</p>
        <button class="btn primary" data-a="sample">Посмотреть на примере</button><button class="btn" data-a="settings">Ввести свои данные</button></div></div>`;
    const showSetup = !S.setupDismissed && doneN < steps.length && next && next.k !== 'cli';

    return `<div><h1 class="h1">${S.settings.masterName.trim() ? 'Здравствуйте, ' + esc(S.settings.masterName.trim()) : greetingShort()}</h1><div class="sub">${esc(date)}</div></div>
      <div class="row"><button class="chip chip-id" data-a="settings"><span class="dot"></span>${esc(S.settings.masterName.trim() || 'Мой кабинет')}</button></div>
      ${hasData ? hero : emptyHero}
      ${hasData ? `<button class="btn primary big" data-a="proc" data-id="">${ico('plus')}Новая процедура</button>` : ''}
      ${ins.length ? `<div class="stack"><span class="h2">Главное сейчас</span>${ins.map(insightCard).join('')}</div>` : ''}
      ${showSetup ? `<div class="card tap setup-card" data-a="setup"><div class="ic amber">${ico('tasks')}</div><div><div class="item-title">Завершите настройку (${doneN}/${steps.length})</div><div class="small muted">${esc(next.title)}: ${esc(next.hint)}</div></div><button class="x" data-a="dismissSetup" aria-label="Скрыть">${ico('close')}</button></div>` : ''}
      <div class="stack">
        <div class="row"><span class="h2">Сегодня${planned ? ` · ${mins(planned)}` : ''}</span><button class="link" data-a="tab" data-id="board">Все задачи</button></div>
        ${tt.slice(0, 4).map(taskRow).join('') || `<div class="card empty small">На сегодня задач нет.</div>`}
        ${tt.length > 4 ? `<button class="link" data-a="tab" data-id="board">Ещё ${tt.length - 4}</button>` : ''}
        <div class="quickadd"><input class="input" id="quickTask" placeholder="Новая задача на сегодня" enterkeyhint="done"><button class="btn small primary" data-a="quickadd" aria-label="Добавить">${ico('plus')}</button></div>
      </div>
      ${fl.length ? `<div class="stack"><div class="row"><span class="h2">Пора написать</span><button class="link" data-a="go" data-page="clients" data-sub="msgs">Все</button></div>${fl.slice(0, 3).map(followRow).join('')}</div>` : ''}
      ${S.procedures.length ? `<div class="stack"><span class="h2">Статистика</span><div class="grid2">
        <div class="card stat"><div class="ic">${ico('calcheck')}</div><div><div class="v">${m.count}</div><div class="l">Процедур за месяц</div></div></div>
        <div class="card stat"><div class="ic">${ico('coin')}</div><div><div class="v">${nf0.format(m.gross)}</div><div class="l">Выручка, ${esc(sym())}</div></div></div>
        <div class="card stat"><div class="ic">${ico('userplus')}</div><div><div class="v">${newClients}</div><div class="l">Новых клиентов (30 дн.)</div></div></div>
        <div class="card stat"><div class="ic amber">${ico('msg')}</div><div><div class="v">${fl.length}</div><div class="l">Пора написать</div></div></div></div></div>` : ''}
      ${needBackup ? `<div class="note warn">${ico('info')}<span>Данные хранятся только в этом телефоне. Сохраните копию, чтобы не потерять базу. <button class="link" data-a="export">Сохранить копию</button></span></div>` : ''}`;
  }

  // --- Деньги: цена, отчёт и всё, из чего они считаются
  function viewMoney() {
    return `<div class="tiles">
        <button class="tile" data-a="go" data-page="money" data-sub="price"><div class="art-wrap cart">${ART.cart}</div><div class="tile-t">Цена процедуры</div><div class="tile-s">Сколько остаётся и какую цену ставить</div></button>
        <button class="tile" data-a="go" data-page="money" data-sub="supplies"><div class="art-wrap bottle">${ART.bottle}</div><div class="tile-t">Материалы</div><div class="tile-s">Что вы покупаете и сколько стоит процедура</div></button>
      </div>
      <div class="card menu-list">
        <button class="menu-item" data-a="go" data-page="money" data-sub="report"><div class="ic blue">${ico('chart')}</div><div>Отчёт за месяц<small>Деньги, услуги, клиенты и налог</small></div>${ico('chev')}</button>
        <button class="menu-item" data-a="go" data-page="money" data-sub="whatif"><div class="ic violet">${ico('trend')}</div><div>Что если<small>Цена, скидка и число клиентов</small></div>${ico('chev')}</button>
        <button class="menu-item" data-a="pricecard"><div class="ic pink">${ico('star')}</div><div>Прайс-карточка<small>Картинка с ценами для Instagram</small></div>${ico('chev')}</button>
        <button class="menu-item" data-a="go" data-page="money" data-sub="services"><div class="ic">${ico('list')}</div><div>Услуги<small>Цены и время работы</small></div>${ico('chev')}</button>
        <button class="menu-item" data-a="go" data-page="money" data-sub="kit"><div class="ic">${ico('palette')}</div><div>Мой набор пигментов<small>${S.pigments.length ? S.pigments.length + ' ' + plural(S.pigments.length, 'пигмент', 'пигмента', 'пигментов') : 'Бренды, цвета, цена флакона'}</small></div>${ico('chev')}</button>
      </div>
      <div class="stack"><span class="h2">Скоро</span>
        <div class="chips wrap"><span class="chip soon">Расходы и налоги</span><span class="chip soon">Цели и план</span></div></div>`;
  }

  // --- Цена процедуры
  function viewPrice() {
    if (!S.zones.length) {
      return `<div class="card stack"><p>Чтобы посчитать, нужны три вещи: услуги с ценами, материалы и ваши постоянные расходы.</p>
        <button class="btn primary" data-a="sample">Заполнить примером и посмотреть</button>
        <button class="btn" data-a="svcset">Выбрать услуги из набора</button>
        <p class="tiny muted">Цифры в примере условные, замените их своими.</p></div>`;
    }
    const st = S.settings;
    return `<div class="card stack">
        <div class="field"><label for="planClients">Сколько клиентов в месяц планируете</label>
          <input class="input" id="planClients" type="number" inputmode="numeric" min="1" value="${esc(st.planClients)}" data-in="plan"></div>
        <div class="field"><label for="target">Сколько хотите оставлять в месяц (после всех расходов)</label>
          <div class="suffix"><input class="input" id="target" type="number" inputmode="decimal" min="0" value="${esc(st.target)}" data-in="plan"><span>${esc(sym())}</span></div></div>
      </div>
      <div id="mathOut" class="stack">${mathOut()}</div>`;
  }

  function mathOut() {
    const st = S.settings;
    const fixed = fixedMonthly();
    const parts = [];

    if (fixed > 0 || st.mode === 'hourly') {
      const rows = [10, 20, 30].map((n) => `<tr><td>при ${n} клиентах в месяц</td><td>${fmt(fixed / n)}</td></tr>`).join('');
      parts.push(`<div class="card stack">
        <div class="row"><span class="h2">Постоянные расходы</span><button class="link" data-a="settings">Изменить</button></div>
        <div class="big">${fmt(fixed)}<span class="small muted"> в месяц</span></div>
        ${st.mode === 'hourly' ? `<p class="small muted">Почасовая аренда считается внутри каждой процедуры (час × время услуги).</p>` : ''}
        ${fixed > 0 ? `<div><p class="small muted" style="margin-bottom:6px">Столько постоянных расходов приходится на одного клиента:</p><table class="table"><tbody>${rows}</tbody></table>
        <p class="tiny muted" style="margin-top:8px">Чем меньше клиентов, тем больше аренды приходится на каждого. Поэтому ставка аренды «на процедуру» даёт неверную цену.</p></div>` : ''}
      </div>`);
    }

    S.zones.forEach((z) => {
      const r = zoneStats(z);
      const hasPrice = r.price > 0;
      const gap = r.needPrice - r.price;
      const ok = hasPrice && gap <= 0.5;
      const mats = usageCost(z);
      const pig = num(z.drops) * avgDropCost();
      parts.push(`<div class="card stack tap" data-a="zone" data-id="${esc(z.id)}">
        <div class="row"><div class="item-title">${esc(z.name)}</div>${hasPrice ? `<span class="num">${fmt(r.price)}</span>` : `<span class="tag bad">нет цены</span>`}</div>
        <div class="sum">
          <div class="row"><span class="muted">Материалы</span><span class="num">−${fmt2(mats)}</span></div>
          ${num(z.drops) > 0 ? `<div class="row"><span class="muted">Пигмент (${esc(z.drops)} кап.)</span><span class="num">−${fmt2(pig)}</span></div>` : ''}
          ${r.tax > 0 ? `<div class="row"><span class="muted">Налог</span><span class="num">−${fmt2(r.tax)}</span></div>` : ''}
          ${r.rentH > 0 ? `<div class="row"><span class="muted">Аренда на время услуги</span><span class="num">−${fmt2(r.rentH)}</span></div>` : ''}
          <div class="row total"><span>Остаётся с процедуры</span><span class="num ${r.left > 0 ? 'good' : 'bad'}">${fmt(r.left)}</span></div>
        </div>
        ${hasPrice && num(z.hours) > 0 ? `<p class="small muted">За час работы: ${fmt(r.left / num(z.hours))}</p>` : ''}
        ${hasPrice ? (r.left > 0 && r.fixed > 0 ? `<p class="small">Чтобы покрыть постоянные расходы за месяц, нужно <b>${r.breakEven}</b> ${plural(r.breakEven, 'процедура', 'процедуры', 'процедур')}</p>` : r.left <= 0 ? `<div class="note bad">${ico('info')}При этой цене вы теряете деньги на каждой процедуре.</div>` : '') : ''}
        <div class="note ${ok ? 'ok' : ''}"><span>${r.target > 0 ? `Чтобы оставлять ${fmt(r.target)} при ${r.N} клиентах` : `Чтобы не уйти в минус при ${r.N} клиентах`}, цена должна быть не ниже <b>${fmt(Math.ceil(r.needPrice))}</b>${hasPrice ? (gap > 0.5 ? `, сейчас на ${fmt(Math.ceil(gap))} ниже` : ', ваша цена достаточна') : ''}.
          <span class="tiny muted" style="display:block;margin-top:4px">Расчёт так, будто все клиенты пришли на эту услугу.</span></span></div>
      </div>`);
    });
    return parts.join('');
  }

  // --- Материалы
  function viewSupplies() {
    const sup = S.supplies.map((s) => {
      const used = S.zones.filter((z) => num((z.usage || {})[s.id]) > 0).length;
      return `<div class="card tap row" data-a="supply" data-id="${esc(s.id)}">
        <div><div class="item-title">${esc(s.name)}</div><div class="small muted">${esc(s.packQty)} ${esc(s.unit || 'шт')} за ${fmt(num(s.packPrice))} · ${used ? 'используется в услугах: ' + used : 'пока не используется'}</div></div>
        <div style="text-align:right"><div class="num">${fmt2(unitCost(s))}</div><div class="tiny muted">за единицу</div></div></div>`;
    }).join('');
    const zones = S.zones.map((z) => {
      const used = Object.entries(z.usage || {}).filter(([id, q]) => supplyById(id) && num(q) > 0);
      return `<div class="card tap stack" data-a="zone" data-id="${esc(z.id)}">
        <div class="row"><div class="item-title">${esc(z.name)}</div><span class="num">${fmt2(zoneSupplyCost(z))}</span></div>
        <p class="small muted">${used.length ? used.map(([id, q]) => `${esc(supplyById(id).name)} ×${esc(q)}`).join(', ') : 'Расход не указан: нажмите и выберите материалы'}${num(z.drops) > 0 ? ` · пигмент ${esc(z.drops)} кап.` : ''}</p></div>`;
    }).join('');
    return `<div class="note">${ico('info')}<span>Укажите цену упаковки и сколько в ней штук: цена единицы посчитается сама. Какие материалы уходят на процедуру, выбирается в самой услуге.</span></div>
      <div class="row"><span class="h2">Что вы покупаете</span><button class="link" data-a="supply" data-id="">+ Свой материал</button></div>
      <div class="list">${sup || `<div class="card empty">${ico('box')}<b>Пока пусто</b><span>Добавьте набор материалов с примерными ценами и замените их своими.</span></div>`}</div>
      <button class="btn ${S.supplies.length ? '' : 'primary'}" data-a="supset">${ico('spark')}Добавить из набора материалов</button>
      <div class="row"><span class="h2">Сколько уходит на процедуру</span><button class="link" data-a="zone" data-id="">+ Услуга</button></div>
      <div class="list">${zones || `<div class="card empty">${ico('list')}<b>Нет услуг</b><span>Добавьте услуги и отметьте, что на них тратится.</span></div>`}</div>
      ${S.supplies.length === 0 && S.zones.length === 0 ? `<button class="btn" data-a="sample">Заполнить примером</button>` : ''}`;
  }

  // --- Услуги
  function viewServices() {
    const list = S.zones.map((z) => {
      const r = zoneStats(z);
      return `<div class="card tap row" data-a="zone" data-id="${esc(z.id)}"><div><div class="item-title">${esc(z.name)}</div>
        <div class="small muted">${num(z.hours) > 0 ? mins(Math.round(num(z.hours) * 60)) + ' · ' : ''}остаётся ${fmt(r.left)}</div></div><span class="num">${fmt(num(z.price))}</span></div>`;
    }).join('');
    return `<button class="btn primary" data-a="svcset">${ico('spark')}Начать с набора услуг</button>
      <div class="row"><span class="h2">Мои услуги</span><button class="link" data-a="zone" data-id="">+ Услуга</button></div>
      <div class="list">${list || `<div class="card empty">${ico('list')}<b>Услуг пока нет</b><span>Выберите набор или добавьте свою услугу.</span></div>`}</div>`;
  }

  // --- Мой набор пигментов
  function viewKit() {
    const brands = [...new Set(S.pigments.map((p) => p.brand))];
    const q = kitQuery.trim().toLowerCase();
    const list = S.pigments.filter((p) => (kitBrand === 'all' || p.brand === kitBrand) && (kitZone === 'all' || (p.zones || []).includes(kitZone)) && (!q || (p.name + ' ' + p.brand).toLowerCase().includes(q)));
    const groups = [...new Set(list.map((p) => p.brand))];
    const body = !S.pigments.length
      ? `<div class="empty">${ico('palette')}<b>Ваш набор пуст</b><span>Добавьте пигменты, которыми работаете. С ценой флакона приложение посчитает стоимость капли и рецепта.</span><button class="btn primary" style="width:auto" data-a="pigment" data-id="">${ico('plus')}Добавить пигмент</button></div>`
      : (groups.map((b) => `<div class="stack"><div class="row"><span class="h2">${esc(b)}</span><span class="tag">${list.filter((p) => p.brand === b).length}</span></div><div class="pig-grid">${list.filter((p) => p.brand === b).map((p) => pigCard(p)).join('')}</div></div>`).join('') || `<div class="card empty">Ничего не нашли.</div>`);
    return `${S.pigments.length ? `<div class="search">${ico('search')}<input class="input" id="kitSearch" type="search" placeholder="Поиск по названию или бренду" value="${esc(kitQuery)}" data-in="kitq"></div>
      <div class="seg scroll"><button class="${kitBrand === 'all' ? 'on' : ''}" data-a="kitBrand" data-id="all">Все</button>${brands.map((b) => `<button class="${kitBrand === b ? 'on' : ''}" data-a="kitBrand" data-id="${esc(b)}">${esc(b)}</button>`).join('')}</div>
      <div class="chips"><button class="chip ${kitZone === 'all' ? 'on' : ''}" data-a="kitZone" data-id="all">Все зоны</button>${Object.entries(ZONE_TAGS).map(([k, v]) => `<button class="chip ${kitZone === k ? 'on' : ''}" data-a="kitZone" data-id="${k}">${v}</button>`).join('')}</div>
      <div class="note"><span>1 мл примерно ${esc(S.settings.dropsPerMl)} капель (меняется в настройках). Стоимость капли = цена флакона ÷ (мл × капель в мл).</span></div>` : ''}
      ${body}`;
  }
  const pigCard = (p) => `<button class="pig" data-a="pigment" data-id="${esc(p.id)}">
      <div class="pig-top"><span class="swatch" style="background:${esc(p.color)}"></span><span>${esc(p.brand)}</span></div>
      <div class="pig-n">${esc(p.name)}</div>
      ${dropCost(p) > 0 ? `<span class="tag">${fmt2(dropCost(p))} за каплю</span>` : `<span class="tag warn">нет цены</span>`}</button>`;

  // --- Отчёт за месяц
  function viewReport() {
    const ym = monthKey();
    const m = monthData(ym);
    const p = monthData(prevMonthKey(ym));
    const title = monthName(ym);
    if (!m.count) {
      return `<div class="card empty">${ico('chart')}<b>${esc(title)}</b><span>В этом месяце процедур пока нет. Добавьте процедуры, и здесь появятся деньги, услуги и клиенты.</span></div>`;
    }
    const zs = byZone(m.list);
    const ret = retention();
    const diff = p.count ? m.net - p.net : null;
    return `<div class="eyebrow">${esc(title)}</div><div class="card stack">
        <div class="h2">Деньги</div>
        <div class="sum">
          <div class="row"><span class="muted">Выручка</span><span class="num">${fmt(m.gross)}</span></div>
          <div class="row"><span class="muted">Материалы${S.settings.mode === 'hourly' ? ' и аренда часов' : ''}</span><span class="num">−${fmt(m.sup)}</span></div>
          ${m.tax > 0 ? `<div class="row"><span class="muted">Налог</span><span class="num">−${fmt(m.tax)}</span></div>` : ''}
          ${m.fixed > 0 ? `<div class="row"><span class="muted">Постоянные расходы</span><span class="num">−${fmt(m.fixed)}</span></div>` : ''}
          <div class="row total"><span>Чистыми</span><span class="num ${m.net >= 0 ? 'good' : 'bad'}">${fmt(m.net)}</span></div>
        </div>
        ${diff != null ? `<p class="small muted">Прошлый месяц: ${fmt(p.net)}. ${diff >= 0 ? 'Сейчас лучше на' : 'Сейчас хуже на'} ${fmt(Math.abs(diff))}.</p>` : ''}
      </div>
      <div class="card stack">
        <div class="h2">По услугам</div>
        <table class="table"><thead><tr><th>Услуга</th><th>Раз</th><th>Чистыми</th><th>В час</th></tr></thead><tbody>
          ${zs.map((z) => `<tr><td>${esc(z.name)}</td><td>${z.count}</td><td>${fmt(z.left)}</td><td>${z.perHour != null ? fmt(z.perHour) : '—'}</td></tr>`).join('')}
        </tbody></table>
        ${zs.some((z) => z.perHour == null) ? `<p class="tiny muted">Чтобы увидеть «в час», укажите время услуги в разделе «Услуги».</p>` : ''}
      </div>
      <div class="card stack">
        <div class="h2">Клиенты</div>
        <div class="sum"><div class="row"><span class="muted">Средний чек</span><span class="num">${fmt(m.avg)}</span></div>
        ${ret ? `<div class="row"><span class="muted">Вернулись на коррекцию</span><span class="num">${Math.round(ret.rate * 100)}%</span></div>` : ''}
        ${m.lostN ? `<div class="row"><span class="muted">Неявки и отмены</span><span class="num bad">${m.lostN} · −${fmt(m.lost)}</span></div>` : ''}
        <div class="row"><span class="muted">Пора написать</span><span class="num">${followups().length}</span></div></div>
      </div>
      ${m.tax > 0 ? `<div class="note">${ico('coin')}<span>Отложите на налог: <b>${fmt(m.tax)}</b>.</span></div>` : ''}`;
  }

  // --- Сообщения: напоминания, шаблоны, подписи
  const TPL_META = [
    ['care', 'Уход после процедуры'], ['corr', 'Приглашение на коррекцию'], ['refresh', 'Обновление цвета'],
    ['winback', 'Вернуть клиента'], ['holiday', 'Поздравление'], ['review', 'Просьба об отзыве'],
  ];
  function viewMsgs() {
    const st = S.settings;
    let body = '';
    if (msgTab === 'follow') {
      const fl = followups();
      body = `<div class="stack"><span class="h2">Сегодня написать</span>${fl.map(followRow).join('') || `<div class="card empty">${ico('check')}<b>Всё отправлено</b><span>Когда подойдёт срок коррекции или обновления, клиент появится здесь.</span></div>`}</div>
        <div class="card stack"><div class="h2">Когда напоминать</div>
          <div class="grid2"><div class="field"><label for="rCare">Уход: через сколько дней</label><input class="input" id="rCare" type="number" inputmode="numeric" value="${esc(st.careDays)}" data-in="rule" data-f="careDays"></div>
            <div class="field"><label for="rCorr">Коррекция: через сколько дней</label><input class="input" id="rCorr" type="number" inputmode="numeric" value="${esc(st.corrDays)}" data-in="rule" data-f="corrDays"></div>
            <div class="field"><label for="rRef">Обновление: через сколько дней</label><input class="input" id="rRef" type="number" inputmode="numeric" value="${esc(st.refreshDays)}" data-in="rule" data-f="refreshDays"></div>
            <div class="field"><label for="rWin">Вернуть клиента: через сколько дней</label><input class="input" id="rWin" type="number" inputmode="numeric" value="${esc(st.winbackDays)}" data-in="rule" data-f="winbackDays"></div></div>
          <p class="tiny muted">Дни считаются от даты последней процедуры. Сообщения приложение не отправляет, оно готовит текст, вы копируете его в мессенджер.</p></div>`;
    } else if (msgTab === 'tpl') {
      body = TPL_META.map(([k, t]) => `<div class="card stack"><div class="row"><span class="item-title">${t}</span><button class="btn small" data-a="tplcopy" data-k="${k}">${ico('copy')}Копировать</button></div>
        <textarea class="input" id="tpl_${k}" data-in="tpl" data-k="${k}">${esc(S.templates[k])}</textarea><p class="tiny muted">{имя} заменится на имя клиента.</p></div>`).join('');
    } else {
      const zs = S.zones.map((z) => `<option value="${esc(z.id)}">${esc(z.name)}</option>`).join('');
      body = `<div class="card stack"><p class="small muted">Текст для поста без фото и без имени клиента. Проверьте и поправьте под себя.</p>
        <div class="field"><label for="capZone">Услуга</label><select class="input" id="capZone">${zs || '<option value="">Общая подпись</option>'}</select></div>
        <div class="field"><label for="capStyle">Тон</label><select class="input" id="capStyle"><option value="calm">Спокойный</option><option value="expert">Экспертный</option><option value="short">Короткий</option></select></div>
        <button class="btn primary" data-a="capGen">${ico('spark')}Составить подпись</button>
        <textarea class="input" id="capOut" style="min-height:140px" placeholder="Здесь появится подпись"></textarea>
        <button class="btn" data-a="capCopy">${ico('copy')}Скопировать</button></div>`;
    }
    return `<div class="seg"><button class="${msgTab === 'follow' ? 'on' : ''}" data-a="msgTab" data-id="follow">Напоминания</button><button class="${msgTab === 'tpl' ? 'on' : ''}" data-a="msgTab" data-id="tpl">Шаблоны</button><button class="${msgTab === 'cap' ? 'on' : ''}" data-a="msgTab" data-id="cap">Подпись</button></div>${body}`;
  }
  function captionFor(zoneName, style) {
    const name = String(zoneName || '').toLowerCase();
    let line = 'Спокойный естественный результат';
    let tags = '#перманентныймакияж #пммастер';
    if (/бров/.test(name)) { line = 'Брови: мягкий естественный цвет'; tags = '#перманентныймакияж #пмброви #татуажбровей'; }
    else if (/губ/.test(name)) { line = 'Губы: нежный оттенок без лишнего'; tags = '#перманентныймакияж #пмгуб #татуажгуб'; }
    else if (/век|межресн|стрел/.test(name)) { line = 'Взгляд: аккуратная линия у ресниц'; tags = '#перманентныймакияж #пмвек #межресничка'; }
    if (style === 'expert') return `Разбор работы: ${zoneName || 'перманентный макияж'}.\nЦвет подбирается индивидуально: учитываем тип кожи и ваши пожелания.\nПодробности и запись в личных сообщениях.\n${tags}`;
    if (style === 'short') return `${zoneName || 'Перманентный макияж'}. Запись открыта.\n${tags}`;
    return `${line}.\nБез спешки и без лишнего.\nЗапись в личных сообщениях.\n${tags}`;
  }

  // --- Клиенты
  const proLocked = () => !S.isPro && PLAN.freeProcedureLimit === 0;
  function clientCards() {
    const q = clientKey(clientQuery);
    const dueKeys = new Set(dueList().map((x) => clientKey(x.p.client)));
    let list = clientsAgg().filter((c) => !q || c.key.includes(q));
    if (clientFilter === 'recent') list = list.filter((c) => daysBetween(c.last, today()) <= 60);
    if (clientFilter === 'new') list = list.filter((c) => daysBetween(c.first, today()) <= 30);
    if (clientFilter === 'due') list = list.filter((c) => dueKeys.has(c.key));
    if (!list.length) return `<div class="card empty">${ico('users')}<b>${S.procedures.length ? 'Никого не нашли' : 'Клиентов пока нет'}</b><span>${S.procedures.length ? 'Измените фильтр или поиск.' : 'Добавьте первую процедуру кнопкой справа внизу, и тут появится карточка клиента.'}</span></div>`;
    return list.map((c) => {
      const last = c.list[c.list.length - 1];
      return `<div class="card tap cl" data-a="client" data-k="${esc(c.key)}"><div class="avatar">${esc(initials(c.name))}</div>
        <div><div class="item-title">${esc(c.name)}</div><div class="small muted">${esc(last.zoneName || 'Услуга')} · ${fmtDate(c.last)}</div>
        <div style="margin-top:4px"><span class="tag">${c.visits} ${plural(c.visits, 'визит', 'визита', 'визитов')}</span> ${dueKeys.has(c.key) ? '<span class="tag warn">пора написать</span>' : ''}</div></div>
        <span class="num good">+${fmt(c.net)}</span></div>`;
    }).join('');
  }
  function viewClients() {
    if (proLocked()) return lockedBlock('Клиенты', 'История процедур, рецепты и напоминания о коррекции доступны в PRO.');
    const tabs = `<div class="seg"><button class="${clientsTab === 'people' ? 'on' : ''}" data-a="clTab" data-id="people">Клиенты</button><button class="${clientsTab === 'procs' ? 'on' : ''}" data-a="clTab" data-id="procs">Процедуры</button></div>`;
    return tabs + (clientsTab === 'procs' ? viewProcs() : viewPeople());
  }
  function viewPeople() {
    const all = clientsAgg();
    const dueN = new Set(dueList().map((x) => clientKey(x.p.client))).size;
    const newN = all.filter((c) => daysBetween(c.first, today()) <= 30).length;
    const limitLine = !S.isPro ? `<div class="tiny muted">${S.procedures.length} из ${PLAN.freeProcedureLimit} бесплатных процедур</div>` : '';
    const msgN = followups().length;
    return `<button class="card tap menu-row" data-a="go" data-page="clients" data-sub="msgs"><div class="ic violet">${ico('msg')}</div><div><div class="item-title">Сообщения клиентам</div><div class="small muted">${msgN ? 'Пора написать: ' + msgN : 'Напоминания, шаблоны, подписи к постам'}</div></div>${ico('chev')}</button>
      <div class="grid2" style="grid-template-columns:repeat(3,1fr)">
        <div class="card stat" style="grid-template-columns:1fr;gap:6px;padding:12px"><div class="v">${all.length}</div><div class="l">Всего</div></div>
        <div class="card stat" style="grid-template-columns:1fr;gap:6px;padding:12px"><div class="v">${newN}</div><div class="l">Новых, 30 дн.</div></div>
        <div class="card stat" style="grid-template-columns:1fr;gap:6px;padding:12px"><div class="v">${dueN}</div><div class="l">Пора написать</div></div></div>${limitLine}
      <div class="seg scroll">${[['all', 'Все'], ['recent', 'Недавние'], ['new', 'Новые'], ['due', 'Пора написать']].map(([k, l]) => `<button class="${clientFilter === k ? 'on' : ''}" data-a="cfilter" data-id="${k}">${l}</button>`).join('')}</div>
      <div class="search">${ico('search')}<input class="input" id="clientSearch" type="search" placeholder="Имя, ник или пометка" value="${esc(clientQuery)}" data-in="search"></div>
      <div id="clientList" class="list">${clientCards()}</div>`;
  }

  // --- Процедуры: история списком, фильтры, неявки и отмены
  function procRows() {
    const q = clientKey(procQuery); const ym = monthKey(); const prev = prevMonthKey(ym);
    let list = S.procedures.slice().sort((a, b) => b.date.localeCompare(a.date));
    if (procPeriod === 'month') list = list.filter((p) => p.date.startsWith(ym));
    if (procPeriod === 'prev') list = list.filter((p) => p.date.startsWith(prev));
    if (procZone !== 'all') list = list.filter((p) => (p.zoneId || p.zoneName) === procZone);
    if (q) list = list.filter((p) => clientKey(p.client).includes(q));
    if (!list.length) return `<div class="card empty">${ico('list')}<b>${S.procedures.length ? 'Ничего не нашли' : 'Процедур пока нет'}</b><span>${S.procedures.length ? 'Измените период, услугу или поиск.' : 'Добавьте первую процедуру кнопкой справа внизу.'}</span></div>`;
    const done = list.filter((p) => !p.status || p.status === 'done');
    const sumNet = done.reduce((a, p) => a + procNet(p), 0); const lost = list.filter((x) => x.status && x.status !== 'done').reduce((a, p) => a + num(p.price), 0);
    let out = `<div class="grid2" style="grid-template-columns:repeat(3,1fr)">
        <div class="card stat" style="grid-template-columns:1fr;gap:6px;padding:12px"><div class="v">${done.length}</div><div class="l">Процедур</div></div>
        <div class="card stat" style="grid-template-columns:1fr;gap:6px;padding:12px"><div class="v">${nf0.format(sumNet)}</div><div class="l">Чистыми, ${esc(sym())}</div></div>
        <div class="card stat" style="grid-template-columns:1fr;gap:6px;padding:12px"><div class="v">${nf0.format(lost)}</div><div class="l">Потеряно, ${esc(sym())}</div></div></div>`;
    let cur = '';
    list.forEach((p) => {
      const ymk = p.date.slice(0, 7);
      if (ymk !== cur) { cur = ymk; const nm = monthName(ymk); out += `<div class="h2" style="margin-top:6px">${esc(nm.charAt(0).toUpperCase() + nm.slice(1))}</div>`; }
      const bad = p.status && p.status !== 'done';
      out += `<div class="card tap row" data-a="${bad ? 'lostEdit' : 'proc'}" data-id="${esc(p.id)}"><div><div class="item-title">${esc(p.client)}</div>
        <div class="small muted">${fmtDate(p.date)} · ${esc(p.zoneName || 'Услуга')}${bad ? '' : ' · ' + esc(p.visit)}</div>${bad ? `<div style="margin-top:4px"><span class="tag warn">${esc(STATUS[p.status] || p.status)}</span></div>` : ''}</div>
        <div style="text-align:right">${bad ? `<div class="num bad">−${fmt(num(p.price))}</div><div class="tiny muted">потеряно</div>` : `<div class="num good">+${fmt(procNet(p))}</div><div class="tiny muted">чек ${fmt(num(p.price))}</div>`}</div></div>`;
    });
    return out;
  }
  function viewProcs() {
    const zoneOpts = [...new Map(S.procedures.map((p) => [p.zoneId || p.zoneName, p.zoneName || 'Услуга']))];
    return `<div class="search">${ico('search')}<input class="input" id="procSearch" type="search" placeholder="Поиск по клиенту" value="${esc(procQuery)}" data-in="procq"></div>
      <div class="seg">${[['all', 'Все'], ['month', 'Этот месяц'], ['prev', 'Прошлый']].map(([k, l]) => `<button class="${procPeriod === k ? 'on' : ''}" data-a="procPeriod" data-id="${k}">${l}</button>`).join('')}</div>
      ${zoneOpts.length > 1 ? `<div class="chips"><button class="chip ${procZone === 'all' ? 'on' : ''}" data-a="procZone" data-id="all">Все услуги</button>${zoneOpts.map(([k, n]) => `<button class="chip ${procZone === k ? 'on' : ''}" data-a="procZone" data-id="${esc(k)}">${esc(n)}</button>`).join('')}</div>` : ''}
      <button class="btn" data-a="lostNew">${ico('clock')}Не пришёл или отменил</button>
      <div id="procList" class="list">${procRows()}</div>`;
  }

  // отмена или неявка: записывается отдельно и в деньги не попадает, но считается «потеряно»
  let L = null;
  function openLost(id) {
    if (!S.zones.length) { toast('Сначала выберите услуги', 'neutral'); openServiceSet(); return; }
    const b = id ? S.procedures.find((x) => x.id === id) : null;
    L = b ? clone(b) : { id: '', client: '', zoneId: S.zones[0].id, date: today(), status: 'noshow', price: S.zones[0].price || '', touched: false };
    if (b) L.touched = true;
    modal(`${head(id ? 'Отмена или неявка' : 'Не пришёл или отменил')}
      <p class="small muted">Эта запись не попадёт в выручку и отчёт, но покажет, сколько денег вы потеряли.</p>
      <div class="field"><label for="lsClient">Имя, ник или пометка</label><input class="input" id="lsClient" list="clientNames" value="${esc(L.client)}" placeholder="Например: Аня рыжая" autocomplete="off" autofocus>
        <datalist id="clientNames">${[...new Set(S.procedures.map((x) => x.client))].map((n) => `<option value="${esc(n)}">`).join('')}</datalist></div>
      <div class="field"><label for="lsZone">Услуга</label><select class="input" id="lsZone">${S.zones.map((z) => `<option value="${esc(z.id)}" ${z.id === L.zoneId ? 'selected' : ''}>${esc(z.name)}</option>`).join('')}</select></div>
      <div class="seg"><button class="${L.status === 'noshow' ? 'on' : ''}" data-a="lsStatus" data-id="noshow">Неявка</button><button class="${L.status === 'cancel' ? 'on' : ''}" data-a="lsStatus" data-id="cancel">Отмена</button></div>
      <div class="grid2"><div class="field"><label for="lsDate">Дата</label><input class="input" id="lsDate" type="date" value="${esc(L.date)}"></div>
        <div class="field"><label for="lsPrice">Сколько потеряли</label><div class="suffix"><input class="input" id="lsPrice" type="number" inputmode="decimal" min="0" value="${esc(L.price)}" data-in="lsPrice"><span>${esc(sym())}</span></div></div></div>
      <button class="btn primary" data-a="lsSave">Сохранить</button>
      ${id ? `<button class="btn danger" data-a="lsDel" data-id="${esc(id)}">Удалить запись</button>` : ''}`);
  }

  // --- Что если: цена, скидка, число клиентов
  let wi = { zoneId: '', price: null, disc: 0, clients: null };
  function wiOut() {
    const z = S.zones.find((x) => x.id === wi.zoneId); if (!z) return '';
    const eff = num(wi.price) * (1 - num(wi.disc) / 100);
    const rNew = zoneStats(z, eff); const rNow = zoneStats(z);
    const fixed = fixedMonthly(); const nNow = rNow.N; const nNew = num(wi.clients);
    const netNew = nNew * rNew.left - fixed; const netNow = nNow * rNow.left - fixed;
    const d = netNew - netNow;
    const needGoal = rNew.left > 0 && rNew.target > 0 ? Math.ceil((fixed + rNew.target) / rNew.left) : null;
    const needZero = rNew.left > 0 && fixed > 0 ? Math.ceil(fixed / rNew.left) : null;
    return `<div class="card stack"><div class="sum">
        <div class="row"><span class="muted">Цена для клиента</span><span class="num">${fmt(eff)}</span></div>
        <div class="row"><span class="muted">Остаётся с процедуры</span><span class="num ${rNew.left > 0 ? 'good' : 'bad'}">${fmt(rNew.left)}</span></div>
        <div class="row small"><span class="muted">Сейчас</span><span>${fmt(rNow.left)}</span></div>
        <div class="row total"><span>Чистыми за месяц (${nNew} ${plural(nNew, 'клиент', 'клиента', 'клиентов')})</span><span class="num ${netNew >= 0 ? 'good' : 'bad'}">${fmt(netNew)}</span></div>
        <div class="row small"><span class="muted">Сейчас (${nNow} ${plural(nNow, 'клиент', 'клиента', 'клиентов')}, ваша цена)</span><span>${fmt(netNow)}</span></div></div>
      <div class="note ${d >= 0 ? 'ok' : 'warn'}"><span>${Math.abs(d) < 0.5 ? 'Без изменений по сравнению с сейчас.' : d > 0 ? `Это на ${fmt(d)} в месяц лучше, чем сейчас.` : `Это на ${fmt(-d)} в месяц хуже, чем сейчас.`}</span></div>
      ${needGoal ? `<p class="small">Чтобы оставлять ${fmt(rNew.target)} в месяц при такой цене, нужно <b>${needGoal}</b> ${plural(needGoal, 'клиент', 'клиента', 'клиентов')}.</p>` : ''}
      ${needZero ? `<p class="small muted">Чтобы покрыть постоянные расходы: ${needZero} ${plural(needZero, 'клиент', 'клиента', 'клиентов')}.</p>` : ''}
      <p class="tiny muted">Расчёт так, будто все клиенты пришли на эту услугу. Данные в приложении при этом не меняются.</p></div>`;
  }
  function viewWhatIf() {
    if (!S.zones.length) return `<div class="card stack"><p>Чтобы пробовать «что если», нужна хотя бы одна услуга с ценой.</p><button class="btn primary" data-a="svcset">Выбрать услуги из набора</button></div>`;
    let z = S.zones.find((x) => x.id === wi.zoneId);
    if (!z) { z = S.zones[0]; wi = { zoneId: z.id, price: null, disc: 0, clients: null }; }
    const base = num(z.price);
    if (wi.price == null) wi.price = base;
    if (wi.clients == null) wi.clients = Math.max(1, Math.round(num(S.settings.planClients)) || 1);
    if (!base) return `<div class="card stack"><div class="field"><label for="wiZone">Услуга</label><select class="input" id="wiZone" data-in="wiZone">${S.zones.map((x) => `<option value="${esc(x.id)}" ${x.id === z.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div><div class="note warn">${ico('info')}<span>У этой услуги не указана цена. Откройте услугу и укажите её.</span></div></div>`;
    const lo = Math.max(1, Math.round(base * 0.5)); const hi = Math.round(base * 2); const step = Math.max(1, Math.round(base / 50));
    return `<div class="card stack">
        <div class="field"><label for="wiZone">Услуга</label><select class="input" id="wiZone" data-in="wiZone">${S.zones.map((x) => `<option value="${esc(x.id)}" ${x.id === z.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
        <div class="field"><label for="wiPrice">Цена: <b id="wiPriceV">${fmt(num(wi.price))}</b></label><input class="range" id="wiPrice" type="range" min="${lo}" max="${hi}" step="${step}" value="${esc(wi.price)}" data-in="wi"></div>
        <div class="field"><label for="wiDisc">Скидка: <b id="wiDiscV">${esc(wi.disc)}%</b></label><input class="range" id="wiDisc" type="range" min="0" max="50" step="5" value="${esc(wi.disc)}" data-in="wi"></div>
        <div class="field"><label for="wiN">Клиентов в месяц: <b id="wiNV">${esc(wi.clients)}</b></label><input class="range" id="wiN" type="range" min="1" max="60" step="1" value="${esc(wi.clients)}" data-in="wi"></div>
      </div>
      <div id="wiOut" class="stack">${wiOut()}</div>`;
  }

  // --- Прайс-карточка: картинка с ценами для Instagram, без фото
  let pc = null;
  function openPriceCard() {
    const list = S.zones.filter((z) => num(z.price) > 0);
    if (!list.length) { toast('Сначала укажите цены услуг', 'neutral'); return; }
    pc = { sel: list.map((z) => z.id), title: S.settings.masterName.trim() ? 'Прайс · ' + S.settings.masterName.trim() : 'Прайс', foot: 'Запись в личных сообщениях' };
    modal(`${head('Прайс-карточка')}
      <p class="small muted">Картинка с ценами для Instagram или Telegram. Отметьте услуги и поправьте тексты.</p>
      <div class="field"><label for="pcTitle">Заголовок</label><input class="input" id="pcTitle" value="${esc(pc.title)}" data-in="pcText" maxlength="40"></div>
      <div class="stack">${list.map((z) => `<div class="svc-set pc-row"><button class="cb on" data-a="pcTog" data-id="${esc(z.id)}" aria-label="Выбрать">${ico('check')}</button><div><div class="item-title">${esc(z.name)}</div></div><span class="num">${fmt(num(z.price))}</span></div>`).join('')}</div>
      <div class="field"><label for="pcFoot">Подпись внизу</label><input class="input" id="pcFoot" value="${esc(pc.foot)}" data-in="pcText" maxlength="60"></div>
      <canvas id="pcCanvas" class="pc-canvas" width="1080" height="1350" aria-label="Предпросмотр прайс-карточки"></canvas>
      <button class="btn primary" data-a="pcSave">${ico('upload')}Скачать картинку</button>
      <button class="btn" data-a="pcShare">Поделиться</button>`);
    drawPriceCard();
  }
  function drawPriceCard() {
    const cv = $('#pcCanvas'); if (!cv || !pc) return;
    const c = cv.getContext('2d'); const W = 1080; const H = 1350;
    const preset = BGS.find((b) => b.id === S.bg.id) || BGS[0]; const v = preset.v; const light = preset.mode === 'light';
    const ink = light ? '#0b2b27' : '#f2fbf9'; const muted = light ? 'rgba(11,43,39,.6)' : 'rgba(220,240,236,.62)'; const accent = light ? '#12776c' : '#aafcf2';
    const g = c.createLinearGradient(0, 0, W * 0.6, H); g.addColorStop(0, v.bg); g.addColorStop(1, v.mid);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const rg = c.createRadialGradient(W, H, 0, W, H, 900); rg.addColorStop(0, v.wbot); rg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = rg; c.fillRect(0, 0, W, H);
    const fam = '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    c.textBaseline = 'alphabetic';
    c.fillStyle = ink; c.font = `700 80px ${fam}`;
    let tsz = 80; const title = String(pc.title || 'Прайс');
    while (c.measureText(title).width > W - 160 && tsz > 36) { tsz -= 4; c.font = `700 ${tsz}px ${fam}`; }
    c.fillText(title, 80, 190);
    c.fillStyle = accent; c.fillRect(80, 230, 140, 6);
    const items = S.zones.filter((z) => pc.sel.includes(z.id) && num(z.price) > 0);
    const top = 330; const bottom = 1180; const rowH = items.length ? Math.min(130, (bottom - top) / items.length) : 130;
    let sz = Math.min(54, Math.floor(rowH * 0.46));
    const fits = (size) => items.every((z) => { c.font = `600 ${size}px ${fam}`; const nw = c.measureText(z.name).width; c.font = `700 ${size}px ${fam}`; return nw + c.measureText(fmt(num(z.price))).width + 60 <= W - 160; });
    while (sz > 26 && !fits(sz)) sz -= 2;
    items.forEach((z, i) => {
      const y = top + i * rowH + rowH * 0.62; const price = fmt(num(z.price));
      c.font = `600 ${sz}px ${fam}`; c.fillStyle = ink; c.textAlign = 'left'; c.fillText(z.name, 80, y);
      const nameW = c.measureText(z.name).width;
      c.font = `700 ${sz}px ${fam}`; c.fillStyle = accent; c.textAlign = 'right'; c.fillText(price, W - 80, y);
      const priceW = c.measureText(price).width;
      c.strokeStyle = muted; c.lineWidth = 2; c.setLineDash([2, 10]); c.beginPath(); c.moveTo(80 + nameW + 20, y - 8); c.lineTo(W - 80 - priceW - 20, y - 8); c.stroke(); c.setLineDash([]);
    });
    c.textAlign = 'left'; c.fillStyle = muted; c.font = `500 40px ${fam}`;
    let fsz = 40; const foot = String(pc.foot || '');
    while (c.measureText(foot).width > W - 160 && fsz > 24) { fsz -= 2; c.font = `500 ${fsz}px ${fam}`; }
    c.fillText(foot, 80, H - 90);
  }

  // --- Задачи (планер как в Trello): колонки друг под другом, каждую можно свернуть
  const isCollapsed = (col, ci) => (S.collapsed[col.id] !== undefined ? !!S.collapsed[col.id] : ci === S.columns.length - 1);
  function viewBoard() {
    const last = S.columns.length - 1;
    const cols = S.columns.map((col, ci) => {
      const tasks = S.tasks.filter((t) => t.col === col.id);
      const done = ci === last;
      const closed = isCollapsed(col, ci);
      return `<section class="col${closed ? ' collapsed' : ''}" aria-label="${esc(col.name)}">
        <button class="col-head" data-a="colTog" data-id="${esc(col.id)}" data-ci="${ci}" aria-expanded="${closed ? 'false' : 'true'}"><span class="h2">${esc(col.name)}</span><span class="tag">${tasks.length}</span><span class="col-chev">${ico('down')}</span></button>
        <div class="col-fold"><div class="col-in"><div class="col-body">${tasks.map((t) => `<article class="task ${done ? 'done' : ''}" data-a="task" data-id="${esc(t.id)}">
            <div class="task-top"><button class="chk ${done ? 'on' : ''}" data-a="toggle" data-id="${esc(t.id)}" aria-label="${done ? 'Вернуть в работу' : 'Готово'}">${ico('check')}</button>
              <div class="task-t">${esc(t.title)}</div></div>
            <div class="task-meta">${taskMeta(t)}</div>
            <div class="mv"><button data-a="mv" data-d="-1" data-id="${esc(t.id)}" aria-label="В колонку выше" ${ci === 0 ? 'disabled' : ''}>${ico('up')}</button><button data-a="mv" data-d="1" data-id="${esc(t.id)}" aria-label="В колонку ниже" ${done ? 'disabled' : ''}>${ico('down')}</button></div>
          </article>`).join('') || '<div class="tiny muted" style="padding:6px 2px">Пусто</div>'}</div>
        <button class="addcard" data-a="newtask" data-col="${esc(col.id)}">${ico('plus')}Карточка</button></div></div>
      </section>`;
    }).join('');
    return `<div class="row"><button class="link" data-a="cols">Настроить колонки</button><span class="tiny muted">${S.tasks.filter(isActive).length} в работе</span></div>
      <div class="board" id="board">${cols}</div>`;
  }

  // --- Знания
  const allLessons = () => SEED_LESSONS.concat(S.customLessons);
  function viewLearn() {
    const chips = [['all', 'Все']].concat(Object.entries(CATS));
    const list = allLessons().filter((l) => learnFilter === 'all' || l.cat === learnFilter);
    return `<div class="chips" role="tablist">${chips.map(([id, label]) => `<button class="chip ${learnFilter === id ? 'on' : ''}" data-a="filter" data-id="${id}">${label}</button>`).join('')}</div>
      <div class="list">${list.map((l) => {
        const locked = !l.free && !S.isPro;
        return `<div class="card tap row" data-a="lesson" data-id="${esc(l.id)}">
          <div class="row" style="justify-content:flex-start"><div class="ic">${ico(CAT_ICO[l.cat] || 'drop')}</div>
            <div><div class="item-title">${esc(l.title)}</div><div class="small muted">${esc(CATS[l.cat] || '')} · ${TYPE_LABEL[l.type] || ''}${l.demo ? ' · образец' : ''}</div></div></div>
          ${locked ? `<span class="tag line">${ico('lock')}PRO</span>` : ico('chev')}</div>`;
      }).join('') || `<div class="card empty">В этом разделе пока ничего нет.</div>`}</div>
      <button class="btn" data-a="addlesson">+ Добавить урок или памятку (режим автора)</button>`;
  }

  function lockedBlock(title, text) {
    return `<div class="card stack"><div class="item-title">${esc(title)}</div><p>${esc(text)}</p><button class="btn primary" data-a="plan">Что входит в PRO</button></div>`;
  }

  // --- Профиль
  function viewProfile() {
    const nm = S.settings.masterName.trim() || 'Мастер';
    const steps = setupSteps();
    const doneT = S.tasks.filter((t) => !isActive(t)).length;
    return `<div class="card stack" style="justify-items:center;text-align:center"><div class="avatar" style="width:84px;height:84px;font-size:28px">${esc(initials(nm))}</div>
        <div><div class="item-title" style="font-size:22px">${esc(nm)}</div><div class="small muted">Кабинет мастера ПМ</div></div>
        <div><span class="tag ${S.isPro ? 'accent' : ''}">${ico(S.isPro ? 'crown' : 'lock')}${S.isPro ? 'PRO' : 'Free'}</span> <span class="tag line">Данные на телефоне</span></div></div>
      <div class="grid2" style="grid-template-columns:repeat(3,1fr)">
        <div class="card stat" style="grid-template-columns:1fr;gap:6px;padding:12px"><div class="v">${clientsAgg().length}</div><div class="l">Клиентов</div></div>
        <div class="card stat" style="grid-template-columns:1fr;gap:6px;padding:12px"><div class="v">${S.procedures.length}</div><div class="l">Процедур</div></div>
        <div class="card stat" style="grid-template-columns:1fr;gap:6px;padding:12px"><div class="v">${doneT}</div><div class="l">Задач сделано</div></div></div>
      <div class="stack">${[
        ['gear', 'Настройки кабинета', 'Расходы, налог, валюта', 'settings'],
        ['tasks', 'Состояние настройки', `${steps.filter((s) => s.done).length} из ${steps.length} шагов`, 'setup'],
        ['palette', 'Фон и тема', 'Тёмная, светлая, свой фон', 'bgpage'],
        ['help', 'Подсказки', 'Показать подсказки по разделам снова', 'resetIntros'],
        ['save', 'Копия данных', S.lastExport ? 'Последняя: ' + fmtDate(S.lastExport) : 'Сохранить на телефон', 'export'],
        ['crown', 'Тариф', S.isPro ? 'PRO (демо)' : 'Free', 'plan'],
      ].map(([ic, t, s, a]) => `<button class="card tap menu-row" data-a="${a}"><div class="ic">${ico(ic)}</div><div><div class="item-title">${t}</div><div class="small muted">${s}</div></div>${ico('chev')}</button>`).join('')}</div>
      <div class="tiny muted" style="text-align:center">${esc(VERSION_LABEL)}</div>`;
  }

  // --- Фон
  function bgThumb(b) {
    const v = b.v;
    return `<button class="bgt ${S.bg.id === b.id && !S.bg.custom ? 'on' : ''}" data-a="setBg" data-id="${b.id}" style="background:radial-gradient(95% 75% at 92% 105%, ${v.wbot}, transparent 78%), linear-gradient(160deg, ${v.bg}, ${v.mid} 70%)"><span>${esc(b.name)}</span>${S.bg.id === b.id && !S.bg.custom ? `<i class="ck">${ico('check')}</i>` : ''}</button>`;
  }
  function viewBg() {
    const mode = (BGS.find((b) => b.id === S.bg.id) || BGS[0]).mode;
    return `<div class="stack"><span class="h2">Тема</span><div class="seg"><button class="${mode === 'dark' ? 'on' : ''}" data-a="setMode" data-id="dark">${ico('moon')} Тёмная</button><button class="${mode === 'light' ? 'on' : ''}" data-a="setMode" data-id="light">${ico('sun')} Светлая</button></div></div>
      <div class="stack"><span class="h2">Свой фон</span>
        <label class="btn primary" style="cursor:pointer">${ico('upload')}Загрузить фон из галереи<input type="file" accept="image/*" data-in="bgfile" hidden></label>
        ${S.bg.custom ? `<button class="btn" data-a="clearBg">Убрать свой фон</button>` : ''}
        <p class="tiny muted">Фото сохраняется только на этом телефоне и уменьшается автоматически.</p></div>
      <div class="stack"><span class="h2">Тёмные</span><div class="bg-grid">${BGS.filter((b) => b.mode === 'dark').map(bgThumb).join('')}</div></div>
      <div class="stack"><span class="h2">Светлые</span><div class="bg-grid">${BGS.filter((b) => b.mode === 'light').map(bgThumb).join('')}</div></div>`;
  }

  // ---------- Окна ----------
  let closeToken = 0;
  const wizardOpen = () => !!$('#modalRoot .sheet[data-wiz]');
  function modal(html, opts = {}) {
    const root = $('#modalRoot');
    closeToken += 1; root.classList.remove('closing');
    root.innerHTML = `<div class="scrim${opts.still ? ' still' : ''}" data-a="close"></div><div class="sheet${opts.still ? ' still' : ''}"${opts.wiz ? ' data-wiz="1"' : ''} role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
    document.body.classList.add('lock');
    const a = $('#modalRoot [autofocus]');
    if (a) a.focus();
  }
  function closeModal(immediate) {
    const root = $('#modalRoot');
    if (!root.firstElementChild) { document.body.classList.remove('lock'); return; }
    document.body.classList.remove('lock');
    if (immediate || reduce) { closeToken += 1; root.innerHTML = ''; root.classList.remove('closing'); return; }
    const tk = ++closeToken;
    root.classList.add('closing');
    setTimeout(() => { if (tk === closeToken) { root.innerHTML = ''; root.classList.remove('closing'); } }, 190);
  }
  function dialog(html) {
    const root = $('#dialogRoot');
    root.classList.remove('dclosing');
    root.innerHTML = `<div class="scrim dim" data-a="dialogClose"></div><div class="dialog" role="alertdialog" aria-modal="true">${html}</div>`;
  }
  function closeDialog() {
    const root = $('#dialogRoot');
    if (!root.firstElementChild) return;
    if (reduce) { root.innerHTML = ''; return; }
    root.classList.add('dclosing');
    setTimeout(() => { root.innerHTML = ''; root.classList.remove('dclosing'); }, 170);
  }
  let confirmCb = null;
  function confirmDialog(title, text, okLabel, cb, danger) {
    confirmCb = cb;
    dialog(`<h3>${esc(title)}</h3><p class="muted">${esc(text)}</p><div class="d-btns"><button class="btn" data-a="dialogClose">Отмена</button><button class="btn ${danger ? 'danger' : 'primary'}" data-a="confirmOk">${esc(okLabel)}</button></div>`);
  }
  const head = (title) => `<div class="sheet-head"><h2>${esc(title)}</h2><button class="icon-btn boxed" data-a="close" aria-label="Закрыть">${ico('close')}</button></div>`;

  // подсказка раздела: без галочки покажется ещё раз при следующем запуске, с галочкой больше не появится
  const introShown = new Set();
  function maybeIntro() {
    if (!S.onboarded || $('#welcomeRoot').firstElementChild || $('#modalRoot').firstElementChild || $('#dialogRoot').firstElementChild) return;
    if (sub || !INTROS[page] || S.seen[page] || introShown.has(page)) return;
    const m = INTROS[page];
    introShown.add(page);
    dialog(`<h3>${ico(m.ico)}${esc(m.title)}</h3><p>${esc(m.text)}</p><div class="d-when">КОГДА ОТКРЫВАТЬ</div><p class="muted">${esc(m.when)}</p>
      ${m.warn ? `<div class="note warn">${ico('info')}<span>${esc(m.warn)}</span></div>` : ''}
      <button class="cb-row" id="introNever" data-a="introNever" role="checkbox" aria-checked="false"><span class="cb">${ico('check')}</span>Больше не показывать</button>
      <button class="btn primary" data-a="introOk" data-id="${page}">${ico('check')}Понятно</button>`);
  }

  // --- Приветствие
  function showWelcome() {
    document.body.classList.add('welcoming');
    $('#welcomeRoot').innerHTML = `<div class="welcome"><div class="welcome-in w-anim">
      ${logo('logo-big')}
      <span class="pill">${ico('spark')}Рабочий кабинет мастера ПМ</span>
      <h1>Кабинет, который считает за вас</h1>
      <p class="lead">Цена процедуры, материалы и пигменты, клиенты с рецептами, задачи и памятки в одном месте.</p>
      <div class="card"><div class="w-item"><div class="ic">${ico('coin')}</div><div><b>Цена и деньги</b><span>Сколько остаётся с процедуры и какую цену ставить.</span></div></div>
        <div class="w-item"><div class="ic">${ico('palette')}</div><div><b>Пигменты и материалы</b><span>Цена капли и стоимость рецепта считаются сами.</span></div></div>
        <div class="w-item"><div class="ic">${ico('users')}</div><div><b>Клиенты и рецепты</b><span>История, прошлый рецепт одним нажатием, напоминания.</span></div></div>
        <div class="w-item"><div class="ic">${ico('board')}</div><div><b>Задачи и знания</b><span>Планер как в Trello, памятки и видеоуроки.</span></div></div></div>
      <button class="btn primary" data-a="wStart" data-id="sample">Начать с примера</button>
      <button class="btn" data-a="wStart" data-id="empty">Начать с пустого</button>
      <div class="meta"><span>Работает без интернета</span><span>iPhone и Android</span><span>Данные только у вас</span></div></div></div>`;
  }
  // --- Боковое меню
  function openDrawer() {
    const nm = S.settings.masterName.trim() || 'Мастер';
    const item = (ic, t, s, a, extra = '') => `<button class="dr-item" data-a="${a}" ${extra}><div class="ic" style="width:40px;height:40px;border-radius:12px">${ico(ic)}</div><div>${t}<small>${s}</small></div></button>`;
    const root = $('#modalRoot');
    closeToken += 1; root.classList.remove('closing');
    root.innerHTML = `<div class="scrim" data-a="close"></div><aside class="drawer" role="dialog" aria-modal="true">
      <div class="dr-head"><div class="row">${logo('logo')}<div class="brand-name" style="color:#fff">Кабинет мастера</div></div><button class="icon-btn" data-a="close" aria-label="Закрыть">${ico('close')}</button></div>
      <button class="dr-profile" data-a="dgo" data-page="profile"><div class="avatar">${esc(initials(nm))}</div><div><b>${esc(nm)}</b><small>Профиль и настройки</small></div>${ico('chev')}</button>
      <div class="dr-badges"><span class="tag line">${ico('home')}Мой кабинет</span><span class="tag ${S.isPro ? 'accent' : ''}"><i class="dot"></i>${S.isPro ? 'PRO' : 'Free'}</span></div>
      <div class="dr-sec">Настройка</div>
      ${item('gear', 'Настройки', 'Расходы, налог, валюта, данные', 'dsettings')}
      ${item('palette', 'Фон и тема', 'Тёмная, светлая, свой фон', 'dgo', 'data-page="bg"')}
      <div class="dr-sec">Инструменты</div>
      ${item('list', 'Услуги', 'Цены и время работы', 'dgo', 'data-page="money" data-sub="services"')}
      ${item('palette', 'Мой набор', 'Пигменты и цена капли', 'dgo', 'data-page="money" data-sub="kit"')}
      ${item('box', 'Материалы', 'Цена упаковки и расход', 'dgo', 'data-page="money" data-sub="supplies"')}
      ${item('spark', 'ИИ-помощник', 'Скоро: подсказки и разбор голоса', 'dsoon')}
      <div class="dr-sec">Управление</div>
      ${item('bell', 'Уведомления', 'Задачи и кому написать', 'dbell')}
      ${item('msg', 'Напоминания', 'После процедуры, коррекция, обновление', 'dgo', 'data-page="clients" data-sub="msgs"')}
      ${item('save', 'Копия данных', 'Сохранить и восстановить', 'dexport')}
      ${item('crown', 'Тариф', S.isPro ? 'PRO (демо)' : 'Free, что входит в PRO', 'dplan')}
      <div class="tiny muted" style="padding:14px 20px 20px">${esc(VERSION_LABEL)}</div></aside>`;
    document.body.classList.add('lock');
  }

  // --- Уведомления
  function openBell() {
    const items = [];
    const over = S.tasks.filter((t) => isActive(t) && t.due && t.due < today());
    if (over.length) items.push(['clock', `Просрочено задач: ${over.length}`, 'Откройте задачи и разберите', 'board', '']);
    const fl = followups();
    if (fl.length) items.push(['msg', `Пора написать: ${fl.length}`, 'Коррекция, обновление, уход', 'clients', 'msgs']);
    const steps = setupSteps();
    if (steps.some((s) => !s.done) && !S.setupDismissed) items.push(['tasks', `Настройка: ${steps.filter((s) => s.done).length} из ${steps.length}`, 'Завершите шаги', 'setup', '']);
    if (S.procedures.length >= 3 && (!S.lastExport || daysBetween(S.lastExport, today()) > 30)) items.push(['save', 'Сохраните копию данных', 'Копия защитит базу от потери', 'export', '']);
    modal(`${head('Уведомления')}<div class="stack">${items.map(([ic, t, s, p, sb]) => `<button class="card tap menu-row" data-a="bellgo" data-page="${p}" data-sub="${sb}"><div class="ic">${ico(ic)}</div><div><div class="item-title">${t}</div><div class="small muted">${s}</div></div>${ico('chev')}</button>`).join('') || `<div class="empty">${ico('bell')}<b>Всё спокойно</b><span>Новых уведомлений нет.</span></div>`}</div>`);
  }

  // --- Настройка кабинета (шаги)
  function openSetup() {
    const steps = setupSteps();
    const doneN = steps.filter((s) => s.done).length;
    const act = { cab: 'settings', svc: 'svcset', sup: 'gosup', kit: 'gokit', cli: 'proc' };
    modal(`${head('Настройка кабинета')}
      <div class="steps-bar"><span class="h2">${doneN} из ${steps.length} готово</span><div class="dots">${steps.map((s) => `<i class="${s.done ? 'done' : ''}"></i>`).join('')}</div></div>
      <div class="stack">${steps.map((s) => `<button class="card tap menu-row" data-a="${act[s.k]}" data-id=""><div class="ic ${s.done ? 'green' : 'amber'}">${ico(s.done ? 'check' : s.ico)}</div><div><div class="item-title">${esc(s.title)} ${s.done ? '<span class="tag good">Готово</span>' : '<span class="tag warn">Нужно</span>'}</div><div class="small muted">${esc(s.hint)}</div></div>${ico('chev')}</button>`).join('')}</div>
      <button class="btn" data-a="close">Закрыть</button>`);
  }

  function openSettings() {
    const st = S.settings;
    const cur = Object.keys(CURRENCIES).map((c) => `<option value="${c}" ${st.currency === c ? 'selected' : ''}>${c}${CURRENCIES[c] !== c ? ' (' + CURRENCIES[c] + ')' : ''}</option>`).join('');
    modal(`${head('Настройки')}
      <div class="field"><label for="sName">Как к вам обращаться</label><input class="input" id="sName" value="${esc(st.masterName)}" placeholder="Например: Анна"></div>
      <div class="field"><label for="sCur">Валюта</label><select class="input" id="sCur">${cur}</select></div>
      <div class="field"><label for="sMode">Как вы платите за место</label><select class="input" id="sMode" data-in="mode">
        <option value="monthly" ${st.mode === 'monthly' ? 'selected' : ''}>Помесячная аренда или свой кабинет</option>
        <option value="hourly" ${st.mode === 'hourly' ? 'selected' : ''}>Почасовая аренда (коворкинг)</option></select></div>
      <div class="field" id="rentMonthly" ${st.mode === 'monthly' ? '' : 'hidden'}><label for="sRent">Аренда в месяц</label><div class="suffix"><input class="input" id="sRent" type="number" inputmode="decimal" min="0" value="${esc(st.rent)}"><span>${esc(sym())}</span></div></div>
      <div class="field" id="rentHourly" ${st.mode === 'hourly' ? '' : 'hidden'}><label for="sRentH">Цена часа аренды</label><div class="suffix"><input class="input" id="sRentH" type="number" inputmode="decimal" min="0" value="${esc(st.rentHour)}"><span>${esc(sym())}</span></div></div>
      <div class="field"><label for="sOther">Другие постоянные расходы в месяц (интернет, сервисы, реклама)</label><div class="suffix"><input class="input" id="sOther" type="number" inputmode="decimal" min="0" value="${esc(st.otherFixed)}"><span>${esc(sym())}</span></div></div>
      <div class="field"><label for="sTax">Налог, % от суммы чека (поставьте свой)</label><div class="suffix"><input class="input" id="sTax" type="number" inputmode="decimal" min="0" max="90" value="${esc(st.tax)}"><span>%</span></div></div>
      <div class="field"><label for="sDrops">Капель в 1 мл пигмента (примерно, зависит от пигмента)</label><input class="input" id="sDrops" type="number" inputmode="numeric" min="1" value="${esc(st.dropsPerMl)}"></div>
      <button class="btn primary" data-a="saveSettings">Сохранить</button>
      <div class="stack" style="border-top:1px solid var(--line);padding-top:14px">
        <span class="h2">Ваши данные</span>
        <p class="small muted">Всё хранится только в этом браузере. Если очистить данные сайта или сменить телефон, без копии они пропадут. Последняя копия: ${S.lastExport ? fmtDate(S.lastExport) : 'не делали'}.</p>
        ${storageOk ? '' : `<div class="note warn">${ico('info')}<span>Браузер не даёт сохранять данные (приватный режим?). После закрытия всё исчезнет.</span></div>`}
        <button class="btn" data-a="export">${ico('save')}Скачать копию данных</button>
        <label class="btn" style="cursor:pointer">Загрузить из копии<input type="file" accept=".json,application/json" data-in="import" hidden></label>
        <button class="btn danger" data-a="reset">Стереть всё</button>
      </div>
      <div class="stack" style="border-top:1px solid var(--line);padding-top:14px">
        <span class="h2">Для теста</span>
        <button class="btn" data-a="togglePro">${S.isPro ? 'Вернуть бесплатный тариф' : 'Включить PRO (демо, без оплаты)'}</button>
      </div>`);
  }

  function saveSettings() {
    const st = S.settings;
    st.masterName = val('sName').trim().slice(0, 40);
    st.currency = val('sCur') || st.currency;
    st.mode = val('sMode') || st.mode;
    st.rent = num(val('sRent'));
    st.rentHour = num(val('sRentH'));
    st.otherFixed = num(val('sOther'));
    st.tax = Math.min(90, Math.max(0, num(val('sTax'))));
    st.dropsPerMl = Math.max(1, Math.round(num(val('sDrops'))) || 20);
    save(); closeModal(); render(); toast('Настройки сохранены');
  }

  let spId = '';
  function openSupply(id) {
    spId = id || '';
    const s = id ? supplyById(id) : { name: '', packPrice: '', packQty: '', unit: 'шт' };
    modal(`${head(id ? 'Материал' : 'Новый материал')}
      <div class="field"><label for="spName">Название</label><input class="input" id="spName" value="${esc(s.name)}" placeholder="Например: картриджи" autofocus></div>
      <div class="grid2"><div class="field"><label for="spPrice">Цена упаковки</label><div class="suffix"><input class="input" id="spPrice" type="number" inputmode="decimal" min="0" value="${esc(s.packPrice)}" data-in="spCalc"><span>${esc(sym())}</span></div></div>
        <div class="field"><label for="spQty">Сколько в упаковке</label><input class="input" id="spQty" type="number" inputmode="decimal" min="0" value="${esc(s.packQty)}" data-in="spCalc"></div></div>
      <div class="field"><label for="spUnit">Единица (шт, мл, порций)</label><input class="input" id="spUnit" value="${esc(s.unit || 'шт')}" data-in="spCalc"></div>
      <div class="note" id="spOut">${spOut(s.packPrice, s.packQty, s.unit)}</div>
      <button class="btn primary" data-a="saveSupply" data-id="${esc(id || '')}">Сохранить</button>
      ${id ? `<button class="btn danger" data-a="delSupply" data-id="${esc(id)}">Удалить</button>` : ''}`);
  }
  // что изменится в услугах, если поменять цену этого материала
  function spEffect(price, qty) {
    const s = spId ? supplyById(spId) : null; if (!s) return '';
    const diff = (num(qty) > 0 ? num(price) / num(qty) : 0) - unitCost(s);
    if (Math.abs(diff) < 0.0005) return '';
    const rows = S.zones.filter((z) => num((z.usage || {})[s.id]) > 0).map((z) => {
      const left = zoneStats(z).left;
      return `<div class="row small"><span>${esc(z.name)}</span><span>остаётся ${fmt(left - num(z.usage[s.id]) * diff)} <span class="muted">(было ${fmt(left)})</span></span></div>`;
    });
    return rows.length ? `<div class="stack" style="gap:6px;margin-top:8px"><span class="tiny muted">Что изменится в услугах</span>${rows.join('')}</div>` : '';
  }
  const spOut = (price, qty, unit) => `<div>${num(qty) > 0 ? `<span>Одна единица (${esc(unit || 'шт')}) стоит <b>${fmt2(num(price) / num(qty))}</b></span>` : '<span>Введите цену и количество в упаковке</span>'}${spEffect(price, qty)}</div>`;

  let zDraft = null; let zNew = false;
  function openZone(id) {
    const z = id ? S.zones.find((x) => x.id === id) : { name: '', price: '', hours: '', drops: '', usage: {} };
    if (!z) return;
    zDraft = { id: id || '', name: z.name, price: z.price, hours: z.hours, drops: z.drops, usage: clone(z.usage || {}), careDays: z.careDays || '', corrDays: z.corrDays || '', refreshDays: z.refreshDays || '' };
    zNew = false;
    renderZone(true);
  }
  function readZoneFields() {
    if (!zDraft || !$('#zName')) return;
    zDraft.name = val('zName'); zDraft.price = val('zPrice'); zDraft.hours = val('zHours'); zDraft.drops = val('zDrops');
    ['careDays', 'corrDays', 'refreshDays'].forEach((k) => { const el = $('#z_' + k); if (el) zDraft[k] = el.value; });
    document.querySelectorAll('#modalRoot [data-zu]').forEach((el) => { zDraft.usage[el.dataset.zu] = el.value; });
  }
  function renderZone(first) {
    const z = zDraft;
    const old = $('#modalRoot .sheet'); const st = old ? old.scrollTop : 0;
    const ids = Object.keys(z.usage).filter((id) => supplyById(id));
    const free = S.supplies.filter((x) => !ids.includes(x.id));
    const rows = ids.map((id) => { const m = supplyById(id); return `<div class="mat-row"><div><div class="item-title">${esc(m.name)}</div><div class="tiny muted">${fmt2(unitCost(m))} за ${esc(m.unit || 'шт')}</div></div>
        <input class="input" type="number" inputmode="decimal" min="0" step="any" data-zu="${esc(id)}" data-in="zCalc" value="${esc(z.usage[id])}" aria-label="Расход: ${esc(m.name)}">
        <span class="mat-sum" data-zsum="${esc(id)}"></span>
        <button class="icon-btn" style="width:34px;height:34px" data-a="zMatDel" data-id="${esc(id)}" aria-label="Убрать материал">${ico('close')}</button></div>`; }).join('');
    const newForm = zNew ? `<div class="card stack"><span class="h2">Новый материал</span>
        <div class="field"><label for="nmName">Название</label><input class="input" id="nmName" placeholder="Например: микробраши"></div>
        <div class="grid2"><div class="field"><label for="nmPrice">Цена упаковки</label><input class="input" id="nmPrice" type="number" inputmode="decimal" min="0"></div>
          <div class="field"><label for="nmQty">Сколько в упаковке</label><input class="input" id="nmQty" type="number" inputmode="decimal" min="0"></div></div>
        <div class="field"><label for="nmUnit">Единица (шт, мл, порций)</label><input class="input" id="nmUnit" value="шт"></div>
        <div class="d-btns2"><button class="btn" data-a="zNewCancel">Отмена</button><button class="btn primary" data-a="zNewSave">Добавить</button></div></div>` : '';
    modal(`${head(z.id ? (z.name || 'Услуга') : 'Новая услуга')}
      <div class="field"><label for="zName">Название услуги</label><input class="input" id="zName" value="${esc(z.name)}" placeholder="Например: брови" data-in="zCalc" ${z.id ? '' : 'autofocus'}></div>
      <div class="grid2"><div class="field"><label for="zPrice">Цена для клиента</label><div class="suffix"><input class="input" id="zPrice" type="number" inputmode="decimal" min="0" value="${esc(z.price)}" data-in="zCalc"><span>${esc(sym())}</span></div></div>
        <div class="field"><label for="zHours">Часов на услугу</label><input class="input" id="zHours" type="number" inputmode="decimal" min="0" step="0.5" value="${esc(z.hours)}" data-in="zCalc" placeholder="2.5"></div></div>
      <div class="stack"><span class="h2">Из чего складывается стоимость</span>
        <div class="card stack"><div><div class="item-title">Материалы на одну процедуру</div><div class="tiny muted">Выберите материалы и укажите, сколько единиц уходит. Цену упаковки меняйте в разделе «Материалы».</div></div>
          ${rows || `<div class="note"><span>${S.supplies.length ? 'Материалы не выбраны. Выберите из списка ниже.' : 'Материалов пока нет. Создайте первый кнопкой ниже или добавьте набор в «Деньги → Материалы».'}</span></div>`}
          <select class="input" id="zAddMat" aria-label="Добавить материал"><option value="">+ Добавить материал…</option>${free.map((x) => `<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('')}<option value="__new">Новый материал…</option></select>
          ${newForm}
        </div>
        <div class="field"><label for="zDrops">Пигмент, капель на процедуру (в среднем)</label><input class="input" id="zDrops" type="number" inputmode="numeric" min="0" value="${esc(z.drops)}" data-in="zCalc" placeholder="6">
          ${S.pigments.some((x) => dropCost(x) > 0) ? '' : '<p class="tiny muted">Чтобы пигмент учёлся в цене, укажите цену флакона в «Мой набор».</p>'}</div>
      </div>
      <div class="card stack" id="zOut"></div>
      <details class="fold"><summary>Напоминания клиентам по этой услуге</summary>
        <p class="tiny muted">Через сколько дней после процедуры напоминать. Пусто: берутся общие сроки из «Клиенты → Сообщения».</p>
        <div class="grid3"><div class="field"><label for="z_careDays">Уход</label><input class="input" id="z_careDays" type="number" inputmode="numeric" min="0" value="${esc(z.careDays)}" placeholder="${esc(S.settings.careDays)}"></div>
          <div class="field"><label for="z_corrDays">Коррекция</label><input class="input" id="z_corrDays" type="number" inputmode="numeric" min="0" value="${esc(z.corrDays)}" placeholder="${esc(S.settings.corrDays)}"></div>
          <div class="field"><label for="z_refreshDays">Обновление</label><input class="input" id="z_refreshDays" type="number" inputmode="numeric" min="0" value="${esc(z.refreshDays)}" placeholder="${esc(S.settings.refreshDays)}"></div></div>
      </details>
      <button class="btn primary" data-a="saveZone">Сохранить</button>
      ${z.id ? `<button class="btn danger" data-a="delZone" data-id="${esc(z.id)}">Удалить услугу</button>` : ''}`, { still: !first });
    const sh = $('#modalRoot .sheet'); if (sh && !first) sh.scrollTop = st;
    updateZoneOut();
  }
  function updateZoneOut() {
    const el = $('#zOut'); if (!el || !zDraft) return;
    readZoneFields();
    const f = { price: num(zDraft.price), hours: num(zDraft.hours), drops: num(zDraft.drops), usage: zDraft.usage };
    const r = zoneStats(f);
    document.querySelectorAll('[data-zsum]').forEach((e) => { const m = supplyById(e.dataset.zsum); e.textContent = m ? fmt2(num(zDraft.usage[e.dataset.zsum]) * unitCost(m)) : ''; });
    if (!r.price) { el.innerHTML = `<div class="muted small">Укажите цену для клиента, и здесь появится, сколько остаётся с процедуры.</div><div class="row small"><span class="muted">Расходы на процедуру</span><span class="num">${fmt2(r.supplies)}</span></div>`; return; }
    const gap = r.needPrice - r.price;
    el.innerHTML = `<div class="sum">
        <div class="row"><span class="muted">Цена</span><span class="num">${fmt2(r.price)}</span></div>
        <div class="row"><span class="muted">Материалы</span><span class="num">−${fmt2(usageCostOf(zDraft.usage))}</span></div>
        ${f.drops > 0 ? `<div class="row"><span class="muted">Пигмент (${esc(f.drops)} кап.)</span>${avgDropCost() > 0 ? `<span class="num">−${fmt2(f.drops * avgDropCost())}</span>` : '<span class="small muted">цена не указана</span>'}</div>` : ''}
        ${r.tax > 0 ? `<div class="row"><span class="muted">Налог</span><span class="num">−${fmt2(r.tax)}</span></div>` : ''}
        ${r.rentH > 0 ? `<div class="row"><span class="muted">Аренда на время услуги</span><span class="num">−${fmt2(r.rentH)}</span></div>` : ''}
        <div class="row total"><span>Остаётся</span><span class="num ${r.left > 0 ? 'good' : 'bad'}">${fmt(r.left)}</span></div></div>
      ${f.hours > 0 ? `<div class="small muted">За час работы: ${fmt(r.left / f.hours)}</div>` : ''}
      <div class="note ${gap <= 0.5 ? 'ok' : ''}"><span>Нужная цена при ${r.N} клиентах: <b>${fmt(Math.ceil(r.needPrice))}</b>${gap > 0.5 ? `, сейчас на ${fmt(Math.ceil(gap))} ниже` : ', ваша цена достаточна'}.</span></div>`;
  }

  // --- Набор услуг
  let svcSel = null;
  function openServiceSet() {
    if (!svcSel) svcSel = SERVICE_SET.map((x) => ({ key: x.key, on: x.on && !S.zones.some((z) => z.name === x.name), price: x.price }));
    const groups = [...new Set(SERVICE_SET.map((x) => x.group))];
    const n = svcSel.filter((x) => x.on).length;
    modal(`${head('Набор услуг')}
      <p class="small muted">Отметьте услуги, которые делаете, и поставьте цены. Цены в списке примерные, замените их своими. Изменить всё можно потом.</p>
      ${groups.map((g) => `<div class="stack"><span class="h2">${esc(g)}</span>${SERVICE_SET.filter((x) => x.group === g).map((x) => {
        const sel = svcSel.find((s) => s.key === x.key);
        return `<div class="svc-set"><button class="cb ${sel.on ? 'on' : ''}" data-a="svcTog" data-k="${x.key}" aria-label="Выбрать">${ico('check')}</button>
          <div><div class="item-title">${esc(x.name)}</div><div class="tiny muted">${mins(x.mins)}</div></div>
          <input class="input" type="number" inputmode="decimal" min="0" value="${esc(sel.price)}" data-in="svcPrice" data-k="${x.key}" aria-label="Цена"></div>`;
      }).join('')}</div>`).join('')}
      <button class="btn primary" id="svcAdd" data-a="svcAdd" ${n ? '' : 'disabled'}>${ico('plus')}Добавить ${n} ${plural(n, 'услугу', 'услуги', 'услуг')}</button>`);
  }

  // --- Набор материалов
  let supSel = null;
  function openSupplySet() {
    if (!supSel) supSel = SUPPLY_SET.map((x) => ({ key: x.key, on: x.on && !S.supplies.some((z) => z.name === x.name), price: x.price }));
    const n = supSel.filter((x) => x.on).length;
    modal(`${head('Набор материалов')}
      <p class="small muted">Отметьте материалы, которые используете, и поставьте цену упаковки. Цены в списке примерные, замените их своими. Потом в каждой услуге выберите, что и сколько на неё уходит.</p>
      <div class="stack">${SUPPLY_SET.map((x) => {
        const sel = supSel.find((s) => s.key === x.key);
        const have = S.supplies.some((z) => z.name === x.name);
        return `<div class="svc-set"><button class="cb ${sel.on ? 'on' : ''}" data-a="supTog" data-k="${x.key}" aria-label="Выбрать" ${have ? 'disabled' : ''}>${ico('check')}</button>
          <div><div class="item-title">${esc(x.name)}</div><div class="tiny muted">${have ? 'уже в списке' : x.qty + ' ' + x.unit + ' в упаковке'}</div></div>
          <input class="input" type="number" inputmode="decimal" min="0" value="${esc(sel.price)}" data-in="supPrice" data-k="${x.key}" aria-label="Цена упаковки" ${have ? 'disabled' : ''}></div>`;
      }).join('')}</div>
      <button class="btn primary" id="supAdd" data-a="supAdd" ${n ? '' : 'disabled'}>${ico('plus')}Добавить ${n} ${plural(n, 'материал', 'материала', 'материалов')}</button>`);
  }

  // --- Пигмент
  let pigDraft = null;
  function openPigment(id, keepBrand) {
    const p = id ? pigById(id) : { brand: keepBrand || '', name: '', color: PIG_COLORS[2], ml: 15, price: '', zones: Object.keys(ZONE_TAGS) };
    if (!p) return;
    pigDraft = { color: p.color, zones: (p.zones || []).slice() };
    const brands = [...new Set(S.pigments.map((x) => x.brand).concat(KNOWN_BRANDS))];
    modal(`${head(id ? 'Пигмент' : 'Новый пигмент')}
      <div class="field"><label for="pgBrand">Бренд</label><input class="input" id="pgBrand" list="brandList" value="${esc(p.brand)}" placeholder="Например: Biotek" autocomplete="off" ${id ? '' : 'autofocus'}><datalist id="brandList">${brands.map((b) => `<option value="${esc(b)}">`).join('')}</datalist>
        <p class="tiny muted">Подсказки: частые бренды. Проверяйте название на упаковке.</p></div>
      <div class="field"><label for="pgName">Название оттенка</label><input class="input" id="pgName" value="${esc(p.name)}" placeholder="Например: Шатен"></div>
      <div class="field"><label>Цвет на экране</label><div class="swatches" id="pgSw">${PIG_COLORS.map((c) => `<button type="button" style="background:${c}" class="${p.color === c ? 'on' : ''}" data-a="pgColor" data-c="${c}" aria-label="Цвет ${c}"></button>`).join('')}</div>
        <input class="input" type="color" id="pgColor" value="${esc(/^#[0-9a-f]{6}$/i.test(p.color) ? p.color : '#7b5238')}" data-in="pgColor" aria-label="Свой цвет"></div>
      <div class="field"><label>Для каких зон</label><div class="chips">${Object.entries(ZONE_TAGS).map(([k, v]) => `<button type="button" class="chip ${pigDraft.zones.includes(k) ? 'on' : ''}" data-a="pgZone" data-k="${k}">${v}</button>`).join('')}</div></div>
      <div class="grid2"><div class="field"><label for="pgMl">Объём флакона, мл</label><input class="input" id="pgMl" type="number" inputmode="decimal" min="0" value="${esc(p.ml)}" data-in="pgCalc"></div>
        <div class="field"><label for="pgPrice">Цена флакона</label><div class="suffix"><input class="input" id="pgPrice" type="number" inputmode="decimal" min="0" value="${esc(p.price)}" data-in="pgCalc"><span>${esc(sym())}</span></div></div></div>
      <div class="note" id="pgOut">${pgOut(p.price, p.ml)}</div>
      <button class="btn primary" data-a="savePigment" data-id="${esc(id || '')}" data-more="0">Сохранить</button>
      ${id ? `<button class="btn danger" data-a="delPigment" data-id="${esc(id)}">Удалить из набора</button>` : `<button class="btn" data-a="savePigment" data-id="" data-more="1">Сохранить и добавить ещё</button>`}`);
  }
  const pgOut = (price, ml) => { const dc = num(ml) > 0 && num(S.settings.dropsPerMl) > 0 ? num(price) / (num(ml) * num(S.settings.dropsPerMl)) : 0; return dc > 0 ? `<span>Одна капля стоит около <b>${fmt2(dc)}</b> (при ${esc(S.settings.dropsPerMl)} каплях в мл)</span>` : '<span>Введите цену и объём, и приложение посчитает стоимость капли</span>'; };

  // --- Запись (пошаговый мастер)
  let P = null; let pDirty = false; let pOpen = {};
  const recipeLine = (r) => { const p = pigById(r.pid); const n = p ? p.name : String(r.name || '').trim(); return n ? `${n} ${r.drops}к` : ''; };
  const recipeText = () => P.recipe.map(recipeLine).filter(Boolean).join(' + ');
  // рецепт приводим к строкам «пигмент + капли»: текст (диктовка, старые записи) разбирается, удалённые из набора пигменты остаются «другими»
  function normRecipe() {
    if (!P.recipe.length && P.pigment) P.recipe = recipeFromText(P.pigment);
    P.recipe = P.recipe.map((r) => (r.pid && !pigById(r.pid) ? { pid: '', name: r.name || '', drops: r.drops } : r));
    P.pigment = '';
    if (!P.usage) P.usage = null;
  }
  // «Шатен 3к + Брюнет 1к» -> строки рецепта (для диктовки и старых записей)
  function recipeFromText(text) {
    return String(text || '').split(/\s*[+,;]\s*/).map((tok) => {
      const t = tok.trim(); if (!t) return null;
      const m = t.match(/^(.*?)[\s:]*(\d+)\s*(?:к|капл[а-я]*)?\s*$/i);
      const name = (m ? m[1] : t).trim(); const drops = m ? Math.max(1, parseInt(m[2], 10)) : 1;
      if (!name) return null;
      const low = name.toLowerCase();
      const p = S.pigments.find((x) => x.name.toLowerCase() === low) || S.pigments.find((x) => low.includes(x.name.toLowerCase()) || x.name.toLowerCase().includes(low));
      return p ? { pid: p.id, drops } : { pid: '', name, drops };
    }).filter(Boolean);
  }
  function openProc(id, prefill) {
    const base = id ? S.procedures.find((x) => x.id === id) : null;
    if (id && !base) return;
    if (!S.zones.length) { toast('Сначала выберите услуги', 'neutral'); openServiceSet(); return; }
    if (!id && !S.isPro && S.procedures.length >= PLAN.freeProcedureLimit) { openPaywall('Бесплатно можно хранить ' + PLAN.freeProcedureLimit + ' процедур.'); return; }
    if (base) P = Object.assign({ recipe: [], priceTouched: true, remind: false }, clone(base));
    else P = Object.assign({ id: '', client: '', zoneId: S.zones[0].id, visit: 'Первичка', date: today(), price: '', priceTouched: false, recipe: [], pigment: '', needle: '', voltage: '', notes: '', remind: true }, prefill || {});
    if (prefill && prefill.price) P.priceTouched = true;
    if (!S.zones.find((z) => z.id === P.zoneId)) P.zoneId = S.zones[0].id;
    if (!P.priceTouched || P.price === '') P.price = S.zones.find((z) => z.id === P.zoneId).price || '';
    normRecipe();
    pOpen = {}; pDirty = false;
    renderProc(true);
  }
  function renderProc(first) {
    const old = $('#modalRoot .sheet'); const st = old ? old.scrollTop : 0;
    modal(procHtml(), { still: !first, wiz: 1 });
    const sh = $('#modalRoot .sheet'); if (sh && !first) sh.scrollTop = st;
    updatePLive();
  }
  function pPrevHtml() {
    const k = clientKey(P.client);
    const prev = k ? S.procedures.filter((p) => clientKey(p.client) === k && p.id !== P.id).sort((a, b) => b.date.localeCompare(a.date))[0] : null;
    if (!prev || !(prev.pigment || (prev.recipe && prev.recipe.length) || prev.needle || prev.voltage)) return '';
    return `<div class="note"><span>Была ${fmtDate(prev.date)}: ${esc(prev.pigment || 'рецепт не записан')}. <button class="link" data-a="repeat" data-id="${esc(prev.id)}">Подставить как в прошлый раз</button></span></div>`;
  }
  function updatePrev() { const el = $('#pPrev'); if (el && P) el.innerHTML = pPrevHtml(); }
  function procHtml() {
    const zone = S.zones.find((z) => z.id === P.zoneId);
    const recent = clientsAgg().slice(0, 5);
    const useMap = P.usage || (zone && zone.usage) || {};
    const isOpen = (key, auto) => (pOpen[key] !== undefined ? pOpen[key] : auto);
    const recipeOpen = isOpen('recipe', P.recipe.length > 0 || !!(P.needle || P.voltage || P.notes));
    const matsOpen = isOpen('mats', !!P.usage);
    const dateOpen = isOpen('date', P.date !== today());
    const body = `${!P.id ? `<button class="link" data-a="procVoice">${ico('mic')}Продиктовать голосом</button>` : ''}
      <div class="field"><label for="pClient">Имя, ник или пометка</label><input class="input" id="pClient" list="clientNames" value="${esc(P.client)}" placeholder="Например: Аня рыжая" data-p="client" autocomplete="off" ${P.id || P.client ? '' : 'autofocus'}>
        <datalist id="clientNames">${[...new Set(S.procedures.map((x) => x.client))].map((n) => `<option value="${esc(n)}">`).join('')}</datalist>
        <p class="tiny muted">Настоящие фамилии и телефоны вводить не обязательно.</p></div>
      ${recent.length ? `<div class="chips">${recent.map((c) => `<button class="chip" data-a="pickClient" data-n="${esc(c.name)}">${esc(c.name)}</button>`).join('')}</div>` : ''}
      <div class="stack"><span class="h2">Услуга</span><div class="svc-grid">${S.zones.map((z) => `<button class="svc ${z.id === P.zoneId ? 'on' : ''}" data-a="pickZone" data-id="${esc(z.id)}">${esc(z.name)}<small>${fmt(num(z.price))}</small></button>`).join('')}</div></div>
      <div class="stack"><span class="h2">Визит</span><div class="seg">${VISITS.map((v) => `<button class="${P.visit === v ? 'on' : ''}" data-a="pickVisit" data-v="${v}">${v}</button>`).join('')}</div></div>
      <div class="field"><label for="pPrice">Сумма чека</label><div class="suffix"><input class="input" id="pPrice" type="number" inputmode="decimal" min="0" value="${esc(P.price)}" data-p="price"><span>${esc(sym())}</span></div></div>
      <div class="card stack" id="pLive"></div>
      <div id="pPrev">${pPrevHtml()}</div>
      <details class="fold" data-fold="recipe"${recipeOpen ? ' open' : ''}><summary>Рецепт и параметры</summary>
        <div class="fold-body">
        <div class="stack"><div class="row"><span class="h2">Пигменты в рецепте</span><button class="link" data-a="compAdd">+ Добавить пигмент</button></div>
          ${P.recipe.map((r, i) => { const p = pigById(r.pid); return `<div class="card comp2">
            <div class="comp2-top"><span class="swatch${p ? '' : ' none'}" style="${p ? 'background:' + esc(p.color) : ''}"></span>
              <select class="input" data-rsel="${i}" aria-label="Пигмент">${S.pigments.map((x) => `<option value="${esc(x.id)}"${x.id === r.pid ? ' selected' : ''}>${esc(x.brand)} · ${esc(x.name)}</option>`).join('')}<option value=""${p ? '' : ' selected'}>Другой пигмент (вписать)</option></select>
              <button class="icon-btn" style="width:34px;height:34px" data-a="compDel" data-i="${i}" aria-label="Убрать пигмент">${ico('close')}</button></div>
            ${p ? '' : `<input class="input" data-rname="${i}" value="${esc(r.name || '')}" placeholder="Название пигмента" aria-label="Название пигмента">`}
            <div class="comp2-bot"><span class="tiny muted">${p ? (dropCost(p) > 0 ? fmt2(dropCost(p)) + ' за каплю' : 'цена флакона не указана') : (avgDropCost() > 0 ? 'цена по среднему в наборе' : 'цена не учтена')}</span>
              <div class="stepper"><button data-a="dropDec" data-i="${i}" aria-label="Меньше капель">−</button><b>${esc(r.drops)}</b><button data-a="dropInc" data-i="${i}" aria-label="Больше капель">+</button></div></div></div>`; }).join('') || `<div class="note"><span>${S.pigments.length ? 'Нажмите «Добавить пигмент» и выберите оттенок из списка. Стоимость рецепта посчитается сама.' : 'Ваш набор пуст. Нажмите «Добавить пигмент» и впишите название. Чтобы цена считалась точно, добавьте пигменты в «Деньги → Мой набор».'}</span></div>`}</div>
        <div class="grid2"><div class="field"><label for="pNeedle">Игла или картридж</label><input class="input" id="pNeedle" value="${esc(P.needle)}" placeholder="0.30 RLLT" data-p="needle"></div>
          <div class="field"><label for="pVolt">Вольтаж</label><input class="input" id="pVolt" value="${esc(P.voltage)}" placeholder="5.5V" data-p="voltage"></div></div>
        <div class="field"><label for="pNotes">Особенности кожи, заметка</label><input class="input" id="pNotes" value="${esc(P.notes)}" placeholder="Жирная кожа, просила не темнить" data-p="notes"></div>
        </div></details>
      ${S.supplies.length ? `<details class="fold" data-fold="mats"${matsOpen ? ' open' : ''}><summary>Материалы этой процедуры</summary>
        <div class="fold-body"><p class="tiny muted">Сколько реально ушло. Изменения действуют только на эту процедуру, услуга остаётся прежней.</p>
          ${S.supplies.map((m) => `<div class="mat-row mat-row2"><div><div class="item-title">${esc(m.name)}</div><div class="tiny muted">${fmt2(unitCost(m))} за ${esc(m.unit || 'шт')}</div></div>
            <input class="input" type="number" inputmode="decimal" min="0" step="any" data-pu="${esc(m.id)}" value="${esc(useMap[m.id] || '')}" placeholder="0" aria-label="Расход: ${esc(m.name)}"></div>`).join('')}</div></details>` : ''}
      <details class="fold" data-fold="date"${dateOpen ? ' open' : ''}><summary>Дата: ${P.date === today() ? 'сегодня' : fmtDate(P.date)}</summary>
        <div class="fold-body"><div class="field"><label for="pDate">Дата процедуры</label><input class="input" id="pDate" type="date" value="${esc(P.date)}" data-p="date"></div></div></details>
      ${!P.id ? `<div class="card toggle-row"><div><div class="item-title">Напомнить о коррекции</div><div class="small muted">Через ${esc(ruleDays(P.zoneId, 'corrDays'))} дн., карточка появится в задачах</div></div><button class="switch ${P.remind ? 'on' : ''}" data-a="togRemind" aria-label="Напомнить"></button></div>` : ''}
      <button class="btn" data-a="pCaption">${ico('copy')}Скопировать подпись к посту</button>
      ${P.id ? `<button class="btn danger" data-a="delProc" data-id="${esc(P.id)}">Удалить процедуру</button>` : ''}`;
    const foot = `<div class="foot-sum"><small>Остаётся с процедуры</small><b id="pLeft">—</b></div><button class="btn primary" data-a="saveProc" data-id="${esc(P.id)}">${ico('check')}Сохранить</button>`;
    return `<div class="sheet-head"><h2>${P.id ? 'Процедура' : 'Новая процедура'}</h2><button class="icon-btn boxed" data-a="procClose" aria-label="Закрыть">${ico('close')}</button></div>
      <div class="step-body">${body}</div><div class="sheet-foot">${foot}</div>`;
  }
  function updatePLive() {
    const el = $('#pLive'); if (!el) return;
    const left = $('#pLeft');
    const zone = S.zones.find((z) => z.id === P.zoneId);
    const price = num(P.price);
    if (!price) { el.innerHTML = '<div class="muted small">Введите сумму чека, и здесь появится, сколько остаётся с процедуры.</div>'; if (left) { left.textContent = '—'; left.className = ''; } return; }
    const c = procCosts(zone, price, P.recipe, P.usage);
    const r = zone ? zoneStats(zone, price) : null;
    if (left) { left.textContent = fmt(c.left); left.className = c.left > 0 ? 'good' : 'bad'; }
    el.innerHTML = `<div class="sum">
        <div class="row"><span class="muted">Материалы</span><span class="num">−${fmt2(c.usage)}</span></div>
        <div class="row"><span class="muted">Пигмент${c.estimated ? ' (оценка)' : ''}</span><span class="num">−${fmt2(c.pigment)}</span></div>
        ${c.tax > 0 ? `<div class="row"><span class="muted">Налог</span><span class="num">−${fmt2(c.tax)}</span></div>` : ''}
        ${c.rentH > 0 ? `<div class="row"><span class="muted">Аренда на время услуги</span><span class="num">−${fmt2(c.rentH)}</span></div>` : ''}
        <div class="row total"><span>Остаётся с процедуры</span><span class="num ${c.left > 0 ? 'good' : 'bad'}">${fmt(c.left)}</span></div></div>
      ${zone && num(zone.hours) > 0 ? `<div class="small muted">За час работы: ${fmt(c.left / num(zone.hours))}</div>` : ''}
      ${r && r.needPrice - price > 0.5 ? `<div class="note warn">${ico('info')}<span>Ниже нужной цены: при ваших целях нужно ${fmt(Math.ceil(r.needPrice))}.</span></div>` : ''}`;
  }
  function saveProc() {
    const z = S.zones.find((x) => x.id === P.zoneId);
    const client = String(P.client).trim();
    const price = num(P.price);
    if (!client) { toast('Введите имя или пометку', 'neutral'); const i = $('#pClient'); if (i) { i.focus(); i.scrollIntoView({ block: 'center' }); } return; }
    if (!z) { toast('Выберите услугу', 'neutral'); return; }
    const c = procCosts(z, price, P.recipe, P.usage);
    const rec = {
      id: P.id || uid(), client, zoneId: z.id, zoneName: z.name, visit: P.visit, date: P.date || today(), price,
      pigment: recipeText(), recipe: clone(P.recipe), needle: String(P.needle).trim(), voltage: String(P.voltage).trim(), notes: String(P.notes).trim(),
      costSupplies: c.supplies, costTax: c.tax, costRent: c.rentH, status: 'done',
      usage: P.usage ? Object.fromEntries(Object.entries(P.usage).filter(([, v]) => num(v) > 0).map(([k, v]) => [k, num(v)])) : undefined,
    };
    const isNew = !P.id;
    if (!isNew) S.procedures = S.procedures.map((p) => (p.id === rec.id ? rec : p)); else S.procedures.push(rec);
    let extra = '';
    if (isNew && P.remind && rec.visit === 'Первичка') {
      const cols = S.columns; const col = cols[Math.min(2, cols.length - 2)];
      S.tasks.push({ id: uid(), title: `Пригласить на коррекцию: ${client}`, note: '', col: col.id, due: addDays(rec.date, ruleDays(z.id, 'corrDays')), tag: 'clients', mins: 5, checklist: [], created: today() });
      extra = ' Напоминание добавлено в задачи.';
    }
    save(); pDirty = false; P = null; closeModal(); render(); toast('Процедура сохранена.' + extra);
  }

  // --- Карточка клиента
  function openClient(key) {
    const c = clientsAgg().find((x) => x.key === key);
    if (!c) return;
    const meta = S.clientMeta[key] || {};
    const last = c.list[c.list.length - 1];
    const f = followups().filter((x) => clientKey(x.p.client) === key);
    modal(`${head(c.name)}
      <div class="row" style="justify-content:flex-start;gap:14px"><div class="avatar" style="width:64px;height:64px;font-size:22px">${esc(initials(c.name))}</div>
        <div><div class="small muted">Последний визит ${fmtDate(c.last)}</div><div style="margin-top:4px"><span class="tag">${c.visits} ${plural(c.visits, 'визит', 'визита', 'визитов')}</span> <span class="tag good">+${fmt(c.net)}</span></div></div></div>
      ${f.length ? `<div class="note warn">${ico('msg')}<span>${f.map((x) => FOLLOW[x.kind].title).join(', ')}. <button class="link" data-a="fcopy" data-k="${esc(f[0].key)}">Скопировать текст</button></span></div>` : ''}
      <div class="field"><label for="cmPhoto">Фототип кожи (по шкале Фитцпатрика)</label><select class="input" id="cmPhoto"><option value="">Не указан</option>${['I', 'II', 'III', 'IV', 'V', 'VI'].map((x) => `<option ${meta.photo === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="field"><label for="cmNote">Заметка о клиенте</label><textarea class="input" id="cmNote" style="min-height:72px" placeholder="Предпочтения, особенности, о чём договорились">${esc(meta.note || '')}</textarea></div>
      <div class="stack"><span class="h2">История</span>${c.list.slice().reverse().map((p) => `<div class="card tap stack" data-a="proc" data-id="${esc(p.id)}"><div class="row"><div class="item-title">${esc(p.zoneName || 'Услуга')} <span class="tag">${esc(p.visit)}</span></div><span class="small muted">${fmtDate(p.date)}</span></div>
          ${p.pigment ? `<p class="small"><span class="muted">Рецепт:</span> ${esc(p.pigment)}</p>` : ''}${p.needle || p.voltage ? `<p class="small"><span class="muted">Игла:</span> ${esc(p.needle || '—')} <span class="muted">· Вольтаж:</span> ${esc(p.voltage || '—')}</p>` : ''}
          ${p.notes ? `<p class="small muted">${esc(p.notes)}</p>` : ''}<div class="row"><span class="small muted">Чек ${fmt(num(p.price))}</span><span class="num good">+${fmt(procNet(p))}</span></div></div>`).join('')}</div>
      <button class="btn primary" data-a="saveClient" data-k="${esc(key)}">Сохранить карточку</button>
      <button class="btn" data-a="newForClient" data-k="${esc(key)}">${ico('plus')}Новая процедура для клиента</button>`);
    void last;
  }

  function openVoice() {
    if (!S.isPro) { openPaywall('Диктовка доступна в PRO.'); return; }
    if (!S.zones.length) { toast('Сначала выберите услуги', 'neutral'); openServiceSet(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    modal(`${head('Диктовка процедуры')}
      <p class="small muted">Наговорите после процедуры или вставьте текст. Приложение само разберёт имя, услугу, сумму, рецепт, иглу и вольтаж. Перед сохранением вы всё увидите и сможете поправить.</p>
      <textarea class="input" id="dictText" placeholder="Например: Марина К., брови первичка, чек 250 рублей. Пигмент Шатен 4 капли плюс тёмный каштан 2 капли, игла 0.30 RLLT, вольтаж 5.4. Кожа нормальная." autofocus></textarea>
      <p class="tiny muted">На телефоне нажмите значок микрофона на клавиатуре и говорите. ${SR ? 'Или кнопка ниже.' : ''}</p>
      ${SR ? `<button class="btn" data-a="listen" id="listenBtn">${ico('mic')}Говорить</button>` : ''}
      <button class="btn" data-a="dictExample">Вставить пример</button>
      <button class="btn primary" data-a="dictParse">Разобрать</button>`);
  }

  function openPaywall(reason) {
    modal(`${head('PRO')}
      ${reason ? `<div class="note">${ico('info')}<span>${esc(reason)}</span></div>` : ''}
      <div class="stack"><div class="card"><b>В PRO</b><ul style="margin:8px 0 0;padding-left:18px;line-height:1.7">
        <li>Безлимитная история клиентов и рецептов</li><li>Диктовка процедуры голосом</li><li>Задачи без ограничений</li><li>Все видеоуроки, памятки и таблицы</li></ul></div>
        <p class="small muted">Оплата в тестовой версии не подключена. Кнопка ниже включает PRO для проверки.</p></div>
      <button class="btn primary" data-a="setPro">Включить PRO (демо)</button>
      <button class="btn" data-a="close">Позже</button>`);
  }

  function openLesson(id) {
    const l = allLessons().find((x) => x.id === id);
    if (!l) return;
    if (!l.free && !S.isPro) { openPaywall('Этот материал доступен в PRO.'); return; }
    const emb = toEmbed(l.video);
    const url = safeUrl(l.video);
    modal(`${head(l.title)}
      <div><span class="tag accent">${esc(CATS[l.cat] || '')}</span> <span class="tag">${TYPE_LABEL[l.type] || ''}</span></div>
      ${l.type === 'video' ? `<div class="video">${emb ? `<iframe src="${esc(emb)}" allowfullscreen loading="lazy" title="${esc(l.title)}"></iframe>` : url ? `<a class="link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Открыть видео по ссылке</a>` : 'Здесь будет видео урока'}</div>` : ''}
      ${l.demo ? `<div class="note">${ico('info')}<span>Образец оформления. Тексты и видео подготовит мастер-консультант.</span></div>` : ''}
      ${(l.sections || []).map((s) => `<div class="card stack"><b>${esc(s.h)}</b><p class="small" style="white-space:pre-line">${esc(s.t)}</p></div>`).join('')}`);
  }

  function openAddLesson() {
    modal(`${head('Новый урок или памятка')}
      <p class="small muted">Режим автора для теста: материал сохранится только на этом телефоне.</p>
      <div class="field"><label for="lTitle">Название</label><input class="input" id="lTitle" autofocus></div>
      <div class="grid2"><div class="field"><label for="lCat">Раздел</label><select class="input" id="lCat">${Object.entries(CATS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
        <div class="field"><label for="lType">Вид</label><select class="input" id="lType"><option value="memo">Памятка</option><option value="video">Видео</option><option value="table">Таблица</option></select></div></div>
      <div class="field"><label for="lVideo">Ссылка на видео (YouTube, Vimeo, Kinescope)</label><input class="input" id="lVideo" inputmode="url" placeholder="https://"></div>
      <div class="field"><label for="lText">Текст памятки (каждый абзац с новой строки)</label><textarea class="input" id="lText"></textarea></div>
      <label class="row small" style="justify-content:flex-start"><input type="checkbox" id="lFree"> Бесплатный (виден без PRO)</label>
      <button class="btn primary" data-a="saveLesson">Сохранить</button>`);
  }

  // --- Окна для дел
  function openTask(id, colId) {
    const t = id ? S.tasks.find((x) => x.id === id) : null;
    if (id && !t) return;
    if (!id && !S.isPro && S.tasks.filter(isActive).length >= PLAN.freeTaskLimit) { openPaywall('Бесплатно можно держать ' + PLAN.freeTaskLimit + ' активных задач.'); return; }
    taskDraft = t ? JSON.parse(JSON.stringify(t)) : { id: '', title: '', note: '', col: colId || firstCol().id, due: '', tag: '', mins: '', checklist: [] };
    modal(`${head(id ? 'Карточка' : 'Новая карточка')}
      <div class="field"><label for="tTitle">Что нужно сделать</label><input class="input" id="tTitle" value="${esc(taskDraft.title)}" placeholder="Например: заказать картриджи" autofocus></div>
      <div class="grid2"><div class="field"><label for="tCol">Колонка</label><select class="input" id="tCol">${S.columns.map((c) => `<option value="${esc(c.id)}" ${c.id === taskDraft.col ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div class="field"><label for="tDue">Срок</label><input class="input" id="tDue" type="date" value="${esc(taskDraft.due)}"></div></div>
      <div class="grid2"><div class="field"><label for="tTag">Метка</label><select class="input" id="tTag"><option value="">Без метки</option>${Object.entries(TASK_TAGS).map(([k, v]) => `<option value="${k}" ${taskDraft.tag === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
        <div class="field"><label for="tMins">Сколько минут</label><input class="input" id="tMins" type="number" inputmode="numeric" min="0" value="${esc(taskDraft.mins)}" placeholder="30"></div></div>
      <div class="field"><label for="tNote">Заметка</label><textarea class="input" id="tNote" style="min-height:72px">${esc(taskDraft.note)}</textarea></div>
      <div class="stack"><span class="h2">Чек-лист</span><div id="chkList">${chkHtml()}</div>
        <div class="quickadd"><input class="input" id="chkNew" placeholder="Новый пункт" enterkeyhint="done"><button class="btn small" data-a="chkAdd" aria-label="Добавить пункт">${ico('plus')}</button></div></div>
      <button class="btn primary" data-a="saveTask" data-id="${esc(id || '')}">Сохранить</button>
      ${id ? `<button class="btn danger" data-a="delTask" data-id="${esc(id)}">Удалить карточку</button>` : ''}`);
  }
  const chkHtml = () => (taskDraft.checklist || []).map((c, i) => `<div class="row chk-row"><button class="chk ${c.d ? 'on' : ''}" data-a="chkTog" data-i="${i}" aria-label="Отметить">${ico('check')}</button>
      <span style="flex:1" class="${c.d ? 'muted' : ''}">${esc(c.t)}</span><button class="icon-btn" style="width:34px;height:34px" data-a="chkDel" data-i="${i}" aria-label="Убрать пункт">${ico('close')}</button></div>`).join('');

  function readTaskForm() {
    taskDraft.title = val('tTitle').trim(); taskDraft.col = val('tCol'); taskDraft.due = val('tDue');
    taskDraft.tag = val('tTag'); taskDraft.mins = val('tMins'); taskDraft.note = val('tNote').trim();
  }

  function openCols() {
    modal(`${head('Колонки доски')}
      <p class="small muted">Назовите колонки, как удобно. Последняя колонка считается «Готово». Если удалить колонку, её карточки уйдут в первую.</p>
      <div class="stack" id="colList">${S.columns.map((c) => `<div class="row"><input class="input" data-colid="${esc(c.id)}" value="${esc(c.name)}" aria-label="Название колонки">
        <button class="icon-btn boxed" data-a="colDel" data-id="${esc(c.id)}" aria-label="Удалить колонку">${ico('close')}</button></div>`).join('')}</div>
      <button class="btn" data-a="colAdd">${ico('plus')}Добавить колонку</button>
      <button class="btn primary" data-a="saveCols">Сохранить</button>`);
  }
  function readCols() {
    return [...document.querySelectorAll('#colList [data-colid]')].map((el) => ({ id: el.dataset.colid, name: el.value.trim() || 'Колонка' }));
  }

  // ---------- Действия ----------
  function toast(msg, kind, label, fn) {
    if (typeof kind === 'string' && kind !== 'neutral') { fn = label; label = kind; kind = ''; }
    const t = $('#toast');
    t.className = ''; void t.offsetWidth;
    t.innerHTML = `<span>${esc(msg)}</span>${label ? `<button id="toastBtn">${esc(label)}</button>` : ''}`;
    t.classList.add('show'); if (kind === 'neutral') t.classList.add('neutral');
    if (label) $('#toastBtn').onclick = () => { fn(); t.classList.remove('show'); };
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('show'), label ? 6000 : 2600);
  }

  function copyText(text, msg) {
    const done = () => toast(msg || 'Текст скопирован. Вставьте в мессенджер.');
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done)); } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('Не удалось скопировать', 'neutral'); }
    ta.remove();
  }

  function loadSample() {
    const cart = uid(), glove = uid(), anes = uid(), kit = uid();
    S.supplies = [
      { id: cart, name: 'Картриджи', packPrice: 160, packQty: 20, unit: 'шт' },
      { id: glove, name: 'Перчатки', packPrice: 25, packQty: 100, unit: 'шт' },
      { id: anes, name: 'Анестезия', packPrice: 45, packQty: 30, unit: 'порций' },
      { id: kit, name: 'Салфетки, пелёнки, микробраши', packPrice: 60, packQty: 50, unit: 'наборов' },
    ];
    const u = (c, g, a, k) => ({ [cart]: c, [glove]: g, [anes]: a, [kit]: k });
    S.zones = [
      { id: uid(), name: 'Брови', kw: ['бров'], price: 250, hours: 2.5, drops: 6, usage: u(1, 2, 1, 1) },
      { id: uid(), name: 'Губы', kw: ['губ'], price: 280, hours: 3, drops: 8, usage: u(1, 2, 1, 1) },
      { id: uid(), name: 'Веки', kw: ['век', 'межресн', 'стрелк'], price: 200, hours: 2, drops: 4, usage: u(1, 2, 1, 1) },
      { id: uid(), name: 'Удаление', kw: ['удален', 'ремувер'], price: 150, hours: 1.5, drops: 0, usage: u(1, 2, 0, 1) },
    ];
    S.pigments = [
      { id: uid(), brand: 'Мой бренд', name: 'Шатен', color: '#7b5238', ml: 10, price: 90, zones: ['brows'] },
      { id: uid(), brand: 'Мой бренд', name: 'Тёмный каштан', color: '#3b2a22', ml: 10, price: 90, zones: ['brows', 'eyes'] },
      { id: uid(), brand: 'Мой бренд', name: 'Пыльная роза', color: '#d88c7a', ml: 10, price: 95, zones: ['lips'] },
      { id: uid(), brand: 'Мой бренд', name: 'Карамель', color: '#c9a27c', ml: 10, price: 95, zones: ['lips'] },
    ];
    Object.assign(S.settings, { mode: 'monthly', rent: 600, otherFixed: 80, tax: 5, planClients: 20, target: 3500 });
    if (!S.tasks.length) {
      const [c1, c2] = S.columns;
      const d = new Date(); d.setDate(d.getDate() + 2);
      S.tasks = [
        { id: uid(), title: 'Заказать картриджи и перчатки', note: '', col: c1.id, due: today(), tag: 'buy', mins: 15, checklist: [{ t: 'Проверить остатки', d: true }, { t: 'Сделать заказ', d: false }], created: today() },
        { id: uid(), title: 'Выложить прайс в Instagram', note: '', col: c1.id, due: '', tag: 'content', mins: 30, checklist: [], created: today() },
        { id: uid(), title: 'Пересчитать цену на губы', note: '', col: c2.id, due: dstr(d), tag: 'life', mins: 20, checklist: [], created: today() },
      ];
    }
    save();
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kabinet-mastera-${today()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    S.lastExport = today(); save(); toast('Копия сохранена в загрузки'); if (page === 'home' || page === 'profile') render();
  }

  function importData(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d || typeof d !== 'object' || !Array.isArray(d.procedures) || !d.settings) throw new Error('bad');
        confirmDialog('Заменить данные?', 'Все данные в приложении будут заменены данными из копии.', 'Заменить', () => {
          const base = defaults();
          Object.keys(S).forEach((k) => delete S[k]);
          Object.assign(S, base, d, { settings: Object.assign(base.settings, d.settings), templates: Object.assign(base.templates, d.templates || {}), bg: Object.assign(base.bg, d.bg || {}), onboarded: true });
          ['tasks', 'pigments', 'procedures', 'zones', 'supplies', 'customLessons'].forEach((k) => { if (!Array.isArray(S[k])) S[k] = []; });
          if (!Array.isArray(S.columns) || S.columns.length < 2) S.columns = base.columns;
          save(); applyBg(); closeModal(true); render(); toast('Данные загружены');
        }, true);
      } catch (e) { toast('Это не похоже на копию данных', 'neutral'); }
    };
    r.readAsText(file);
  }

  function resizeToDataUrl(file, cb) {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1080; const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = () => toast('Не удалось открыть фото', 'neutral');
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  const moveTask = (id, d) => {
    const t = S.tasks.find((x) => x.id === id); if (!t) return;
    const i = Math.min(S.columns.length - 1, Math.max(0, colIndex(t.col) + d));
    t.col = S.columns[i].id;
    if (isCollapsed(S.columns[i], i)) S.collapsed[t.col] = false; // колонку, куда ушла карточка, раскрываем
    save(); render(); toast(`Перенесено: ${S.columns[i].name}`, 'neutral');
  };
  const followByKey = (k) => followups(true).find((x) => x.key === k);

  const actions = {
    tab: (el) => goTo(el.dataset.id),
    go: (el) => goTo(el.dataset.page, el.dataset.sub || null),
    dgo: (el) => { closeModal(true); goTo(el.dataset.page, el.dataset.sub || null); },
    bellgo: (el) => {
      closeModal(true);
      const p = el.dataset.page;
      if (p === 'setup') openSetup(); else if (p === 'export') exportData(); else goTo(p, el.dataset.sub || null);
    },
    back: goBack,
    bgpage: () => goTo('bg'),
    close: () => { if (wizardOpen()) actions.procClose(); else closeModal(); },
    dialogClose: closeDialog,
    confirmOk: () => { const cb = confirmCb; confirmCb = null; closeDialog(); if (cb) cb(); },
    introNever: (el) => { const on = !el.classList.contains('on'); el.classList.toggle('on', on); el.setAttribute('aria-checked', on ? 'true' : 'false'); },
    introOk: (el) => { const never = $('#introNever'); if (never && never.classList.contains('on')) { S.seen[el.dataset.id] = true; save(); } closeDialog(); },
    resetIntros: () => { S.seen = {}; introShown.clear(); save(); toast('Подсказки включены. Они появятся при заходе в разделы.'); },
    drawer: openDrawer,
    dsettings: () => { closeModal(true); openSettings(); },
    dplan: () => { closeModal(true); actions.plan(); },
    dexport: () => { closeModal(true); exportData(); },
    dbell: () => { closeModal(true); openBell(); },
    dsoon: () => toast('ИИ-помощник появится в серверной версии', 'neutral'),
    bell: openBell,
    settings: openSettings,
    setup: openSetup,
    dismissSetup: () => { S.setupDismissed = true; save(); render(); toast('Подсказку можно вернуть в профиле', 'neutral'); },
    gosup: () => { closeModal(true); goTo('money', 'supplies'); },
    gokit: () => { closeModal(true); goTo('money', 'kit'); },
    saveSettings,
    plan: () => (S.isPro ? openSettings() : openPaywall('')),
    setPro: () => { S.isPro = true; save(); closeModal(); render(); toast('PRO включён (демо)'); },
    togglePro: () => { S.isPro = !S.isPro; save(); closeModal(); render(); },
    wStart: (el) => {
      const kind = el.dataset.id; const w = $('.welcome'); if (w) w.classList.add('leaving');
      setTimeout(() => {
        $('#welcomeRoot').innerHTML = ''; document.body.classList.remove('welcoming');
        if (kind === 'sample') loadSample();
        S.onboarded = true; save(); render(true);
        if (kind === 'sample') toast('Пример загружен. Цифры условные, замените своими.');
      }, reduce ? 0 : 280);
    },
    sample: () => { loadSample(); S.onboarded = true; save(); render(true); toast('Пример загружен. Цифры условные, замените своими.'); },
    // услуги и материалы
    svcset: () => { closeModal(true); svcSel = null; openServiceSet(); },
    svcTog: (el) => { const s = svcSel.find((x) => x.key === el.dataset.k); s.on = !s.on; el.classList.toggle('on', s.on); const n = svcSel.filter((x) => x.on).length; const b = $('#svcAdd'); if (b) { b.disabled = !n; b.innerHTML = `${ico('plus')}Добавить ${n} ${plural(n, 'услугу', 'услуги', 'услуг')}`; } },
    svcAdd: () => {
      let added = 0;
      svcSel.filter((x) => x.on).forEach((x) => {
        const def = SERVICE_SET.find((d) => d.key === x.key);
        if (S.zones.some((z) => z.name === def.name)) return;
        S.zones.push({ id: uid(), name: def.name, kw: def.kw, price: num(x.price), hours: def.mins / 60, drops: def.drops, usage: {} }); added += 1;
      });
      svcSel = null; save(); closeModal(); render(); toast(added ? `Добавлено услуг: ${added}` : 'Эти услуги уже есть');
    },
    supset: () => { closeModal(true); supSel = null; openSupplySet(); },
    supTog: (el) => { const x = supSel.find((v) => v.key === el.dataset.k); x.on = !x.on; el.classList.toggle('on', x.on); const n = supSel.filter((v) => v.on).length; const b = $('#supAdd'); if (b) { b.disabled = !n; b.innerHTML = `${ico('plus')}Добавить ${n} ${plural(n, 'материал', 'материала', 'материалов')}`; } },
    supAdd: () => {
      let added = 0;
      supSel.filter((x) => x.on).forEach((x) => {
        const def = SUPPLY_SET.find((d) => d.key === x.key);
        if (S.supplies.some((z) => z.name === def.name)) return;
        S.supplies.push({ id: uid(), name: def.name, packPrice: num(x.price), packQty: def.qty, unit: def.unit }); added += 1;
      });
      supSel = null; save(); closeModal(); render(); toast(added ? `Добавлено материалов: ${added}. Теперь выберите их в услугах.` : 'Эти материалы уже есть');
    },
    zMatDel: (el) => { readZoneFields(); delete zDraft.usage[el.dataset.id]; renderZone(); },
    zNewCancel: () => { readZoneFields(); zNew = false; renderZone(); },
    zNewSave: () => {
      const name = val('nmName').trim();
      if (!name) { toast('Введите название материала', 'neutral'); return; }
      readZoneFields();
      const rec = { id: uid(), name, packPrice: num(val('nmPrice')), packQty: num(val('nmQty')), unit: val('nmUnit').trim() || 'шт' };
      S.supplies.push(rec); zDraft.usage[rec.id] = 1; zNew = false; save(); renderZone();
    },
    clTab: (el) => { clientsTab = el.dataset.id; render(); },
    procPeriod: (el) => { procPeriod = el.dataset.id; render(); },
    procZone: (el) => { procZone = el.dataset.id; render(); },
    lostNew: () => openLost(''),
    lostEdit: (el) => openLost(el.dataset.id),
    lsStatus: (el) => { L.status = el.dataset.id; document.querySelectorAll('#modalRoot .seg button').forEach((b) => b.classList.toggle('on', b === el)); },
    lsSave: () => {
      const client = val('lsClient').trim();
      if (!client) { toast('Введите имя или пометку', 'neutral'); return; }
      const z = S.zones.find((x) => x.id === val('lsZone')) || S.zones[0];
      const rec = { id: L.id || uid(), client, zoneId: z.id, zoneName: z.name, visit: '', date: val('lsDate') || today(), price: num(val('lsPrice')), status: L.status,
        pigment: '', recipe: [], needle: '', voltage: '', notes: '', costSupplies: 0, costTax: 0, costRent: 0 };
      S.procedures = L.id ? S.procedures.map((x) => (x.id === rec.id ? rec : x)) : S.procedures.concat(rec);
      L = null; save(); closeModal(); render(); toast('Записано: ' + STATUS[rec.status].toLowerCase());
    },
    lsDel: (el) => {
      const p = S.procedures.find((x) => x.id === el.dataset.id); if (!p) return;
      S.procedures = S.procedures.filter((x) => x.id !== p.id); L = null; save(); closeModal(); render();
      toast('Запись удалена', 'Вернуть', () => { S.procedures.push(p); save(); render(); });
    },
    pricecard: openPriceCard,
    pcTog: (el) => { const id = el.dataset.id; const i = pc.sel.indexOf(id); if (i >= 0) pc.sel.splice(i, 1); else pc.sel.push(id); el.classList.toggle('on', i < 0); drawPriceCard(); },
    pcSave: () => { const cv = $('#pcCanvas'); cv.toBlob((b) => { if (!b) { toast('Не получилось сохранить картинку', 'neutral'); return; } const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'prajs-kartochka.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast('Картинка сохранена в загрузки'); }, 'image/png'); },
    pcShare: () => {
      const cv = $('#pcCanvas');
      cv.toBlob((b) => {
        const f = b && new File([b], 'prajs-kartochka.png', { type: 'image/png' });
        if (f && navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f] }).catch(() => {});
        else toast('Здесь нельзя поделиться напрямую. Нажмите «Скачать картинку».', 'neutral');
      }, 'image/png');
    },
    supply: (el) => openSupply(el.dataset.id),
    saveSupply: (el) => {
      const name = val('spName').trim();
      if (!name) { toast('Введите название', 'neutral'); return; }
      const rec = { id: el.dataset.id || uid(), name, packPrice: num(val('spPrice')), packQty: num(val('spQty')), unit: val('spUnit').trim() || 'шт' };
      S.supplies = el.dataset.id ? S.supplies.map((s) => (s.id === rec.id ? rec : s)) : S.supplies.concat(rec);
      save(); closeModal(); render();
    },
    delSupply: (el) => {
      const s = supplyById(el.dataset.id); if (!s) return;
      const backup = JSON.stringify(S.zones);
      S.supplies = S.supplies.filter((x) => x.id !== s.id);
      S.zones.forEach((z) => { if (z.usage) delete z.usage[s.id]; });
      save(); closeModal(); render();
      toast('Материал удалён', 'Вернуть', () => { S.supplies.push(s); S.zones = JSON.parse(backup); save(); render(); });
    },
    zone: (el) => openZone(el.dataset.id),
    saveZone: () => {
      readZoneFields();
      const f = zDraft;
      const name = String(f.name).trim();
      if (!name) { toast('Введите название', 'neutral'); return; }
      const usage = {};
      Object.entries(f.usage).forEach(([k, v]) => { if (num(v) > 0 && supplyById(k)) usage[k] = num(v); });
      const old = S.zones.find((z) => z.id === f.id);
      const rec = { id: f.id || uid(), name, price: num(f.price), hours: num(f.hours), drops: num(f.drops), usage,
        careDays: num(f.careDays) || '', corrDays: num(f.corrDays) || '', refreshDays: num(f.refreshDays) || '',
        kw: old && old.kw && old.name === name ? old.kw : [name.slice(0, 4).toLowerCase()] };
      S.zones = old ? S.zones.map((z) => (z.id === rec.id ? rec : z)) : S.zones.concat(rec);
      zDraft = null; save(); closeModal(); render(); toast('Услуга сохранена');
    },
    delZone: (el) => {
      const z = S.zones.find((x) => x.id === el.dataset.id); if (!z) return;
      S.zones = S.zones.filter((x) => x.id !== z.id); save(); closeModal(); render();
      toast('Услуга удалена', 'Вернуть', () => { S.zones.push(z); save(); render(); });
    },
    // набор пигментов
    pigment: (el) => openPigment(el.dataset.id),
    pgColor: (el) => { pigDraft.color = el.dataset.c; document.querySelectorAll('#pgSw button').forEach((b) => b.classList.toggle('on', b === el)); const c = $('#pgColor'); if (c) c.value = el.dataset.c; },
    pgZone: (el) => { const k = el.dataset.k; const i = pigDraft.zones.indexOf(k); if (i >= 0) pigDraft.zones.splice(i, 1); else pigDraft.zones.push(k); el.classList.toggle('on', i < 0); },
    savePigment: (el) => {
      const brand = val('pgBrand').trim(); const name = val('pgName').trim();
      if (!name) { toast('Введите название оттенка', 'neutral'); return; }
      const rec = { id: el.dataset.id || uid(), brand: brand || 'Без бренда', name, color: pigDraft.color, ml: num(val('pgMl')), price: num(val('pgPrice')), zones: pigDraft.zones.length ? pigDraft.zones : Object.keys(ZONE_TAGS) };
      S.pigments = el.dataset.id ? S.pigments.map((p) => (p.id === rec.id ? rec : p)) : S.pigments.concat(rec);
      save();
      if (el.dataset.more === '1') { toast(`${name} добавлен в набор`); openPigment('', rec.brand); render(); } else { closeModal(); render(); toast(`${name} добавлен в набор`); }
    },
    delPigment: (el) => {
      const p = pigById(el.dataset.id); if (!p) return;
      S.pigments = S.pigments.filter((x) => x.id !== p.id); save(); closeModal(); render();
      toast('Пигмент удалён из набора', 'Вернуть', () => { S.pigments.push(p); save(); render(); });
    },
    kitBrand: (el) => { kitBrand = el.dataset.id; render(); },
    kitZone: (el) => { kitZone = el.dataset.id; render(); },
    // запись
    proc: (el) => { if ($('#modalRoot .sheet') && !wizardOpen()) closeModal(true); openProc(el.dataset.id); },
    procClose: () => {
      if (pDirty) confirmDialog('Выйти без сохранения?', 'Введённые данные пропадут.', 'Выйти', () => { P = null; pDirty = false; closeModal(); }, true);
      else { P = null; closeModal(); }
    },
    pickClient: (el) => { P.client = el.dataset.n; pDirty = true; const i = $('#pClient'); if (i) i.value = P.client; updatePrev(); },
    pickZone: (el) => { P.zoneId = el.dataset.id; P.usage = null; pDirty = true; if (!P.priceTouched) P.price = (S.zones.find((z) => z.id === P.zoneId) || {}).price || ''; renderProc(); },
    pickVisit: (el) => { P.visit = el.dataset.v; pDirty = true; renderProc(); },
    compAdd: () => {
      const used = new Set(P.recipe.map((r) => r.pid));
      const next = S.pigments.find((x) => !used.has(x.id));
      P.recipe.push({ pid: next ? next.id : '', name: '', drops: 1 }); pDirty = true; renderProc();
    },
    dropInc: (el) => { P.recipe[Number(el.dataset.i)].drops += 1; pDirty = true; renderProc(); },
    dropDec: (el) => { const r = P.recipe[Number(el.dataset.i)]; r.drops = Math.max(1, r.drops - 1); pDirty = true; renderProc(); },
    compDel: (el) => { P.recipe.splice(Number(el.dataset.i), 1); pDirty = true; renderProc(); },
    togRemind: () => { P.remind = !P.remind; renderProc(); },
    pCaption: () => { const z = S.zones.find((x) => x.id === P.zoneId); copyText(captionFor(z ? z.name : '', 'calm'), 'Подпись скопирована'); },
    saveProc: () => saveProc(),
    delProc: (el) => {
      const p = S.procedures.find((x) => x.id === el.dataset.id); if (!p) return;
      S.procedures = S.procedures.filter((x) => x.id !== p.id); P = null; pDirty = false; save(); closeModal(); render();
      toast('Процедура удалена', 'Вернуть', () => { S.procedures.push(p); save(); render(); });
    },
    repeat: (el) => {
      const p = S.procedures.find((x) => x.id === el.dataset.id); if (!p) return;
      P.recipe = clone(p.recipe || []); P.pigment = p.recipe && p.recipe.length ? '' : (p.pigment || ''); P.needle = p.needle || ''; P.voltage = p.voltage || ''; normRecipe();
      if (p.notes && !P.notes) P.notes = p.notes;
      if (P.visit === 'Первичка') P.visit = 'Коррекция';
      pDirty = true; renderProc(); toast('Рецепт подставлен');
    },
    voice: openVoice,
    procVoice: () => { if (!S.isPro) { toast('Диктовка доступна в PRO', 'neutral'); return; } openVoice(); },
    dictExample: () => { $('#dictText').value = 'Марина К., брови первичка, чек 250 рублей. Пигмент Шатен 4 капли плюс тёмный каштан 2 капли, игла 0.30 RLLT, вольтаж 5.4. Кожа нормальная, клиентка довольна.'; },
    dictParse: () => {
      const text = val('dictText').trim();
      if (!text) { toast('Введите или наговорите текст', 'neutral'); return; }
      const { f, found } = parseDictation(text);
      if (!found.length) { toast('Ничего не распознано. Попробуйте по-другому.', 'neutral'); return; }
      openProc('', f);
      pDirty = true;
      const body = $('#modalRoot .step-body');
      if (body) body.insertAdjacentHTML('afterbegin', `<div class="note">${ico('spark')}<span>Распознано: ${found.map((x) => `<span class="tag good">${esc(x)}</span>`).join(' ')}. Проверьте и сохраните.</span></div>`);
    },
    listen: (el) => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return;
      const rec = new SR(); rec.lang = 'ru-RU'; rec.interimResults = false;
      el.textContent = 'Слушаю…';
      rec.onresult = (ev) => { const t = Array.from(ev.results).map((r) => r[0].transcript).join(' '); const ta = $('#dictText'); if (ta) ta.value = (ta.value + ' ' + t).trim(); };
      rec.onend = () => { const b = $('#listenBtn'); if (b) b.innerHTML = ico('mic') + 'Говорить'; };
      rec.onerror = () => toast('Не получилось записать. Используйте микрофон на клавиатуре.', 'neutral');
      try { rec.start(); } catch (e) { /* уже запущено */ }
    },
    // клиенты и напоминания
    client: (el) => openClient(el.dataset.k),
    cfilter: (el) => { clientFilter = el.dataset.id; render(); },
    saveClient: (el) => { const k = el.dataset.k; S.clientMeta[k] = { photo: val('cmPhoto'), note: val('cmNote').trim() }; save(); closeModal(); toast('Карточка сохранена'); },
    newForClient: (el) => {
      const c = clientsAgg().find((x) => x.key === el.dataset.k); if (!c) return;
      const last = c.list[c.list.length - 1];
      closeModal(true);
      openProc('', { client: c.name, zoneId: last.zoneId, visit: 'Коррекция', recipe: clone(last.recipe || []), pigment: last.recipe && last.recipe.length ? '' : (last.pigment || ''), needle: last.needle || '', voltage: last.voltage || '' });
    },
    fcopy: (el) => {
      const x = followByKey(el.dataset.k); if (!x) return;
      copyText(String(S.templates[FOLLOW[x.kind].tpl]).replace(/\{имя\}/g, x.p.client));
    },
    ftask: (el) => {
      const x = followByKey(el.dataset.k); if (!x) return;
      const t = addTask({ title: `Написать: ${x.p.client} (${FOLLOW[x.kind].title.toLowerCase()})`, tag: 'clients', due: today(), mins: 5 });
      if (t) { render(); toast('Добавлено в задачи на сегодня'); }
    },
    fdone: (el) => { S.followDone[el.dataset.k] = true; save(); render(); toast('Отмечено как отправленное'); },
    msgTab: (el) => { msgTab = el.dataset.id; render(); },
    tplcopy: (el) => copyText(String(S.templates[el.dataset.k]).replace(/\{имя\}/g, 'Анна')),
    capGen: () => {
      const z = S.zones.find((x) => x.id === val('capZone'));
      $('#capOut').value = captionFor(z ? z.name : '', val('capStyle'));
    },
    capCopy: () => { const t = val('capOut'); if (!t) { toast('Сначала составьте подпись', 'neutral'); return; } copyText(t, 'Подпись скопирована'); },
    // знания
    filter: (el) => { learnFilter = el.dataset.id; render(); },
    lesson: (el) => openLesson(el.dataset.id),
    addlesson: () => (S.isPro ? openAddLesson() : openPaywall('Режим автора доступен в PRO (в тесте включите PRO).')),
    saveLesson: () => {
      const title = val('lTitle').trim(); if (!title) { toast('Введите название', 'neutral'); return; }
      const paras = val('lText').split('\n').map((s) => s.trim()).filter(Boolean);
      S.customLessons.push({ id: uid(), title, cat: val('lCat'), type: val('lType'), free: $('#lFree').checked, video: val('lVideo').trim(), sections: paras.length ? [{ h: 'Памятка', t: paras.join('\n') }] : [], demo: false });
      save(); closeModal(); render(); toast('Добавлено');
    },
    // дела
    task: (el) => openTask(el.dataset.id),
    newtask: (el) => openTask('', el.dataset.col || ''),
    toggle: (el) => {
      const t = S.tasks.find((x) => x.id === el.dataset.id); if (!t) return;
      t.col = isActive(t) ? lastCol().id : firstCol().id; save(); render();
    },
    mv: (el) => moveTask(el.dataset.id, Number(el.dataset.d)),
    colTog: (el) => {
      const sec = el.closest('.col'); if (!sec) return;
      const closed = !sec.classList.contains('collapsed');
      sec.classList.toggle('collapsed', closed);
      el.setAttribute('aria-expanded', closed ? 'false' : 'true');
      S.collapsed[el.dataset.id] = closed; save();
    },
    quickadd: () => {
      const inp = $('#quickTask'); const title = inp ? inp.value.trim() : '';
      if (!title) { toast('Напишите задачу', 'neutral'); return; }
      if (addTask({ title })) { render(); toast('Добавлено на сегодня'); }
    },
    chkAdd: () => {
      const inp = $('#chkNew'); const t = inp ? inp.value.trim() : ''; if (!t) return;
      taskDraft.checklist.push({ t, d: false }); inp.value = ''; $('#chkList').innerHTML = chkHtml(); inp.focus();
    },
    chkTog: (el) => { const c = taskDraft.checklist[Number(el.dataset.i)]; if (c) { c.d = !c.d; $('#chkList').innerHTML = chkHtml(); } },
    chkDel: (el) => { taskDraft.checklist.splice(Number(el.dataset.i), 1); $('#chkList').innerHTML = chkHtml(); },
    saveTask: (el) => {
      readTaskForm();
      if (!taskDraft.title) { toast('Напишите, что нужно сделать', 'neutral'); return; }
      const id = el.dataset.id;
      if (id) S.tasks = S.tasks.map((t) => (t.id === id ? Object.assign({}, t, taskDraft, { id }) : t));
      else S.tasks.push(Object.assign({}, taskDraft, { id: uid(), created: today() }));
      save(); closeModal(); render();
    },
    delTask: (el) => {
      const t = S.tasks.find((x) => x.id === el.dataset.id); if (!t) return;
      S.tasks = S.tasks.filter((x) => x.id !== t.id); save(); closeModal(); render();
      toast('Карточка удалена', 'Вернуть', () => { S.tasks.push(t); save(); render(); });
    },
    cols: openCols,
    colAdd: () => {
      const id = uid();
      const rows = document.querySelectorAll('#colList .row');
      rows[rows.length - 1].insertAdjacentHTML('beforebegin', `<div class="row"><input class="input" data-colid="${id}" value="Новая колонка" aria-label="Название колонки"><button class="icon-btn boxed" data-a="colDel" data-id="${id}" aria-label="Удалить колонку">${ico('close')}</button></div>`);
    },
    colDel: (el) => {
      const rows = [...document.querySelectorAll('#colList .row')];
      if (rows.length <= 2) { toast('Должно остаться минимум две колонки', 'neutral'); return; }
      const row = el.closest('.row'); if (row) row.remove();
    },
    saveCols: () => {
      const next = readCols();
      if (next.length < 2) { toast('Нужно минимум две колонки', 'neutral'); return; }
      const keep = new Set(next.map((c) => c.id));
      S.tasks.forEach((t) => { if (!keep.has(t.col)) t.col = next[0].id; });
      S.columns = next; save(); closeModal(); render();
    },
    // фон
    setBg: (el) => { S.bg.id = el.dataset.id; S.bg.custom = ''; save(); applyBg(); render(); toast('Фон изменён'); },
    setMode: (el) => { const m = el.dataset.id; const cur = BGS.find((b) => b.id === S.bg.id) || BGS[0]; if (cur.mode === m) return; S.bg.id = BGS.find((b) => b.mode === m).id; save(); applyBg(); render(); },
    clearBg: () => { S.bg.custom = ''; save(); applyBg(); render(); toast('Свой фон убран'); },
    export: exportData,
    reset: () => {
      confirmDialog('Стереть все данные?', 'Это нельзя отменить. Сначала сохраните копию, если данные нужны.', 'Стереть', () => {
        try { localStorage.removeItem(KEY); } catch (e) { /* ничего */ }
        Object.keys(S).forEach((k) => delete S[k]); Object.assign(S, defaults());
        closeModal(true); page = 'home'; sub = null; applyBg(); render(); showWelcome();
      }, true);
    },
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-a]');
    if (!el || !actions[el.dataset.a] || el.tagName === 'A' || el.disabled) return;
    actions[el.dataset.a](el, e);
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.pu !== undefined && P) { const zn = S.zones.find((x) => x.id === P.zoneId); if (!P.usage) P.usage = clone((zn && zn.usage) || {}); P.usage[t.dataset.pu] = t.value; pDirty = true; updatePLive(); return; }
    if (t.dataset && t.dataset.rname !== undefined && P) { const r = P.recipe[Number(t.dataset.rname)]; if (r) { r.name = t.value; pDirty = true; } return; }
    if (t.dataset && t.dataset.p && P) { P[t.dataset.p] = t.value; pDirty = true; if (t.dataset.p === 'price') { P.priceTouched = true; updatePLive(); } if (t.dataset.p === 'client') updatePrev(); return; }
    const k = t.dataset && t.dataset.in;
    if (!k) return;
    if (k === 'plan') {
      S.settings.planClients = Math.max(1, Math.round(num($('#planClients').value)) || 1);
      S.settings.target = Math.max(0, num($('#target').value));
      save(); const o = $('#mathOut'); if (o) o.innerHTML = mathOut();
    } else if (k === 'search') {
      clientQuery = t.value; const l = $('#clientList'); if (l) l.innerHTML = clientCards();
    } else if (k === 'kitq') {
      kitQuery = t.value; const pos = t.selectionStart; render(); const i = $('#kitSearch'); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (x) { /* ничего */ } }
    } else if (k === 'procq') {
      procQuery = t.value; const l = $('#procList'); if (l) l.innerHTML = procRows();
    } else if (k === 'wi') {
      wi.price = num($('#wiPrice').value); wi.disc = num($('#wiDisc').value); wi.clients = num($('#wiN').value);
      $('#wiPriceV').textContent = fmt(wi.price); $('#wiDiscV').textContent = wi.disc + '%'; $('#wiNV').textContent = wi.clients;
      const o = $('#wiOut'); if (o) o.innerHTML = wiOut();
    } else if (k === 'pcText') {
      pc.title = val('pcTitle'); pc.foot = val('pcFoot'); drawPriceCard();
    } else if (k === 'lsPrice') { L.touched = true;
    } else if (k === 'spCalc') { $('#spOut').innerHTML = spOut(val('spPrice'), val('spQty'), val('spUnit')); }
    else if (k === 'supPrice') { const x = supSel.find((v) => v.key === t.dataset.k); if (x) x.price = t.value; }
    else if (k === 'zCalc') updateZoneOut();
    else if (k === 'pgCalc') { $('#pgOut').innerHTML = pgOut(val('pgPrice'), val('pgMl')); }
    else if (k === 'pgColor') { pigDraft.color = t.value; document.querySelectorAll('#pgSw button').forEach((b) => b.classList.remove('on')); }
    else if (k === 'svcPrice') { const s = svcSel.find((x) => x.key === t.dataset.k); if (s) s.price = t.value; }
    else if (k === 'rule') { S.settings[t.dataset.f] = Math.max(1, Math.round(num(t.value)) || 1); save(); }
    else if (k === 'tpl') { S.templates[t.dataset.k] = t.value; save(); }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.rsel !== undefined && P) { const r = P.recipe[Number(t.dataset.rsel)]; if (r) { r.pid = t.value; pDirty = true; renderProc(); } return; }
    const k = t.dataset && t.dataset.in;
    if (t.id === 'zAddMat' && zDraft) { const v = t.value; readZoneFields(); if (v === '__new') zNew = true; else if (v) zDraft.usage[v] = 1; renderZone(); return; }
    if (k === 'wiZone') { wi = { zoneId: t.value, price: null, disc: 0, clients: null }; render(); return; }
    if (t.id === 'lsZone' && L) { L.zoneId = t.value; const z = S.zones.find((x) => x.id === t.value); if (z && !L.touched) { const pr = $('#lsPrice'); if (pr) pr.value = z.price || ''; } return; }
    if (k === 'mode') { $('#rentMonthly').hidden = t.value !== 'monthly'; $('#rentHourly').hidden = t.value !== 'hourly'; }
    else if (k === 'import') { importData(t.files[0]); t.value = ''; }
    else if (k === 'bgfile') {
      const f = t.files[0]; t.value = ''; if (!f) return;
      resizeToDataUrl(f, (url) => { const prev = S.bg.custom; S.bg.custom = url; if (!save()) { S.bg.custom = prev; toast('Не хватило места для фото', 'neutral'); return; } applyBg(); render(); toast('Фон установлен'); });
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if ($('#dialogRoot').firstElementChild) closeDialog(); else if ($('#modalRoot').firstElementChild) actions.close(); }
    if (e.key === 'Enter' && e.target.id === 'quickTask') { e.preventDefault(); actions.quickadd(); }
    if (e.key === 'Enter' && e.target.id === 'chkNew') { e.preventDefault(); actions.chkAdd(); }
  });
  document.addEventListener('toggle', (e) => { const d = e.target; if (P && d.dataset && d.dataset.fold) pOpen[d.dataset.fold] = d.open; }, true);
  window.addEventListener('scroll', () => { document.body.classList.toggle('scrolled', window.scrollY > 40); }, { passive: true });

  window.__pmu = { parseDictation, zoneStats, procCosts, insights, monthData, byZone, followups, dropCost, avgDropCost, S }; // для проверки в консоли
  applyBg();
  render(true);
  if (!S.onboarded) showWelcome(); else setTimeout(maybeIntro, 700);

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
