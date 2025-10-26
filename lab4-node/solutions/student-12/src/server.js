import TelegramBot from 'node-telegram-bot-api'
import dotenv from 'dotenv'
import { tours, budgetRanges } from './data/tours.js' 
import { countriesInfo, countriesList } from './data/countries-info.js' 
import { routesInfo, routesCountries } from './data/routes-info.js'
import { formatPrice, formatDate, filterTours } from './utils/index.js';

export const runServer = () => {
  dotenv.config();  // dotenv - библиотека для работы с файлом .env, .config() - метод, который читает файл .env и загружает переменные
  const token = process.env.TELEGRAM_BOT_TOKEN;

  // Создаем экземпляр бота
  const bot = new TelegramBot(token, { polling: true });  // { polling: true } - включаем режим опроса (бот постоянно проверяет новые сообщения)

  // Обрабатываем команду /start
  bot.onText(/\/start/, (msg) => {  // bot.onText() - метод для обработки текстовых команд, msg - объект с информацией о сообщении
    const chatId = msg.chat.id;  // msg.chat - информация о чате, msg.chat.id - уникальный идентификатор чата (чтобы знать, куда отвечать)
    const welcomeMessage = `
<b>Добро пожаловать в TravelPlanner!</b>
Я ваш персональный помощник в мире путешествий

<b>Доступные команды:</b>
/search_trip - Поиск и бронирование туров
/my_bookings - Мои бронирования  
/destinations - Популярные направления

<i>Начните с /search_trip чтобы найти идеальное путешествие!</i>
`;
    bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'HTML'  // Чтобы жирный и крусив были
    });
  });

  // Обрабатываем команду /search_trip - Поиск и бронирование туров
  bot.onText(/\/search_trip/, (msg) => {
    const chatId = msg.chat.id;

    showSearchMainMenu(bot, chatId);
  });

  // Обрабатываем команду /my_bookings - Мои бронирования
  bot.onText(/\/my_bookings/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    showBookingsMainMenu(bot, chatId, userId);
  });

  // Обрабатываем команду /destinations - Популярные направления
  bot.onText(/\/destinations/, (msg) => {
    const chatId = msg.chat.id;
    
    showDestinationsMainMenu(bot, chatId);
  });

  // Обрабатываем текстовые сообщения
  bot.on('message', (msg) => {
    handleMessage(bot, msg);
  });

  // Обработка callback-запросов (нажатия на inline-кнопки)
  bot.on('callback_query', (callbackQuery) => {
    handleCallbackQuery(bot, callbackQuery);
  });
  console.log('Бот запущен...');
}


// Функция обработки текстовых сообщений
export function handleMessage(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userId = msg.from.id.toString();

  // Если это команда (начинается с /) - пропускаем
  if (text.startsWith('/')) {
    return;
  }
  
  // Обрабатываем кнопку "Назад"
  if (text === '↩️ Назад') {
    const mainMenuMessage1 = `
Возвращаемся к списку команд
      `;
    const mainMenuMessage2 = `
<b>Доступные команды:</b>
/search_trip - Поиск и бронирование туров
/my_bookings - Мои бронирования  
/destinations - Популярные направления
      `;
    bot.sendMessage(chatId, mainMenuMessage1, {
      parse_mode: 'HTML',
      reply_markup: {
        remove_keyboard: true  // убираем клавиатуру
      }
    });
    bot.sendMessage(chatId, mainMenuMessage2, {
      parse_mode: 'HTML',
    });
    return;  // !!!прекращаем выполнение, чтобы не сработали другие обработчики
  }

  // Обрабатываем кнопки меню поиска
  else if (text === '💳 Бюджет' || text === '🌍 Направление' || 
      text === '📅 Даты' || text === '🎟️ Тип отдыха' ||
      text === '🔍 Все туры') {
    handleSearchMenu(bot, chatId, text);
    return;
  }

  // Обрабатываем кнопки меню бронирований 
  else if (text === '✔️ Активные бронирования' || 
      text === '✖️ Завершенные бронирования' || 
      text === '🔜 Скоро поездка!') {
    handleBookingsMenu(bot, chatId, userId, text);
    return;
  }

  // 🗺️ Обрабатываем кнопки меню направлений
  else if (text === '💫 Рекомендации по сезону' || 
      text === '🎟 Рекомендации по интересам' || 
      text === '🌍 Информация о странах' || 
      text === '✔️ Готовые маршруты') {
    handleDestinationsMenu(bot, chatId, text);
    return;
  }

  // Обработка случайных сообщений 
  else {
    const randomMessage = `
<b>Пу-пу-пу...</b> Что-то не то вы написали, попробуйте еще раз 🙂‍↕️ 🙂‍↕️ 🙂‍↕️

<i>Доступные команды:
/start
/search_trip - Поиск и бронирование туров
/my_bookings - Мои бронирования  
/destinations - Популярные направления</i>
    `;
    bot.sendMessage(chatId, randomMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        remove_keyboard: true  // убираем клавиатуру
      }
    });
    return;
  }
}

// Функция обработки callback-запросов
export function handleCallbackQuery(bot, callbackQuery) {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  const userId = callbackQuery.from.id.toString();

  // Обработка кнопки "Новый поиск"
  if (data === 'new_search') {
    // Показываем меню поиска
    const searchKeyboard = {
      reply_markup: {
        keyboard: [
          ['💳 Бюджет', '🌍 Направление'],
          ['📅 Даты', '🎟️ Тип отдыха'],
          ['🔍 Все туры', '↩️ Назад']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    };
    const searchMessage = `
🔍 <b>Поиск и бронирование туров</b>

Выберите критерии для поиска идеального путешествия:

Мы подберем туры по вашим предпочтениям и покажем варианты проживания с перелетом!
  `;
    bot.sendMessage(msg.chat.id, searchMessage, {
      parse_mode: 'HTML',
      ...searchKeyboard
    });
    // Уведомление о действии
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Начинаем новый поиск'
    });
  }

  // Обработка кнопки "Вернуться к поиску"
  else if (data === 'back_to_search_menu') {
    showSearchMainMenu(bot, msg.chat.id);
    
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся к поиску'
    });
  }

  // Обработка кнопки выбора бюджета
  else if (data.startsWith('budget_')) {
    const budgetValue = data.split('_')[1];
    let maxBudget;
    // Проверяем если это "Infinity"
    if (budgetValue === 'Infinity') {
      maxBudget = Infinity;
    } else {
      maxBudget = parseInt(budgetValue);
    }

    showToursByBudget(bot, msg.chat.id, maxBudget);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Подбираем туры по бюджету...'
    });
  }

  // Обработка кнопки "Выбрать другой бюджет"
  else if (data === 'back_to_budget_menu') {
    showBudgetMenu(bot, msg.chat.id);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся к выбору бюджета'
    });
  }

  // Обработка кнопки выбора направления
  else if (data.startsWith('destination_')) {
    const destination = data.split('_')[1];
    showToursByDestination(bot, msg.chat.id, destination);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: `Ищем туры в ${destination}...`
    });
  }

  // Обработка кнопки "Выбрать другую страну"
  else if (data === 'back_to_destination_menu') {
    showDestinationMenu(bot, msg.chat.id);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся к выбору страны'
    });
  }

  // Обработка кнопки "Посмотреть все туры"
  else if (data === 'show_all_tours') {
    showAllTours(bot, msg.chat.id);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Открываем все туры'
    });
  }

  // Обработка кнопки выбора года
  else if (data.startsWith('dates_year_')) {
    const year = parseInt(data.split('_')[2]);
      
    // Проверяем если это кнопка "Весь год"
    if (data.startsWith('dates_year_all_')) {
      const fullYear = parseInt(data.split('_')[3]);
      showToursByYear(bot, msg.chat.id, fullYear);
    } else {
      showMonthsMenu(bot, msg.chat.id, year);
    }
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: `Выбран ${year} год`
    });
  }

  // Обработка кнопки выбора месяца
  else if (data.startsWith('dates_month_')) {
    const parts = data.split('_');
    const year = parseInt(parts[2]);
    const month = parseInt(parts[3]);
      
    showToursByMonth(bot, msg.chat.id, year, month);
    bot.answerCallbackQuery(callbackQuery.id, {
      text: `Ищем туры на ${month}/${year}...`
    });
  }

  // Обработка кнопки "Выбрать другой год"
  else if (data.startsWith('back_to_dates_menu')) {
    showDatesMenu(bot, msg.chat.id)
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся к выбору года'
    });
  }

  // Обработка кнопки "Выбрать другой месяц"
  else if (data.startsWith('back_to_months_')) {
    const year = parseInt(data.split('_')[3]);
    showMonthsMenu(bot, msg.chat.id, year);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся к выбору месяца'
    });
  }

  // Обработка кнопки "Все даты"
  else if (data === 'dates_all') {
    showAllToursByDates(bot, msg.chat.id);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Открываем все туры по датам...'
    });
  }

  // Обработка кнопки выбора типа отдыха
  else if (data.startsWith('interest_search_')) {
    const interest = data.split('_')[2];
    showToursByInterest(bot, msg.chat.id, interest);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: `Ищем туры для ${interest}...`
    });
  }

  // Обработка кнопки "Выбрать другой тип отдыха"
  else if (data === 'back_to_interests_menu') {
    showInterestsMenuSearch(bot, msg.chat.id);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся к выбору типа отдыха'
    });
  }

  // Обработка кнопки "Все типы отдыха" 
  else if (data === 'interests_all') {
    showAllToursByInterests(bot, msg.chat.id);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Открываем все туры по типам отдыха...'
    });
  }

  // Обработка кнопки "Подробнее о Туре"
  else if (data.startsWith('tour_detail_')) {
    const tourId = parseInt(data.split('_')[2]); // Получаем ID тура
    const tour = tours.find(t => t.id === tourId); // Находим тур по ID
      
    if (tour) {
      showTourDetails(bot, msg.chat.id, tour); // Показываем детали тура
    }
      
    // Уведомление о действии
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Загружаем детали тура...'
    });
  }

  // Обработка кнопки "Забронировать этот тур"
  else if (data.startsWith('book_tour_')) {
    const tourId = parseInt(data.split('_')[2]);
    const tour = tours.find(t => t.id === tourId);
      
    if (tour) {
      bookTour(bot, msg.chat.id, userId, tour);
        
      // Уведомление о успешном бронировании
      bot.answerCallbackQuery(callbackQuery.id, {
        text: 'Тур успешно забронирован! ✔️'
      });
    } else {
      // Если тур не найден
      bot.answerCallbackQuery(callbackQuery.id, {
        text: 'Ошибка: тур не найден ✖️'
      });
    }
  }

  // Обработка кнопки "Вернуться в меню бронирований" 
  else if (data === 'back_to_bookings_menu') {
    showBookingsMainMenu(bot, msg.chat.id, userId);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся в меню бронирований'
    });
  }

  // Обработка кнопки "Бронирование #..." 
  else if (data.startsWith('booking_detail_')) {
    const bookingId = parseInt(data.split('_')[2]); // Получаем ID бронирования
    const booking = findBookingById(userId, bookingId); // Находим бронирование
      
    if (booking) {
      showBookingDetails(bot, msg.chat.id, userId, booking); // ← ВОТ ЗДЕСЬ ВЫЗЫВАЕМ ФУНКЦИЮ!
    } else {
      bot.answerCallbackQuery(callbackQuery.id, {
        text: 'Бронирование не найдено ✖️'
      });
    }
  }

  // Обработка кнопки "Вернуться к списку бронирований" 
  else if (data === 'back_to_active_bookings') {
    showActiveBookings(bot, msg.chat.id, userId); // Возвращаем к списку активных бронирований
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся к списку бронирований'
    });
  }

  // Обработка кнопки "Отменить бронирование"
  else if (data.startsWith('cancel_booking_')) {
    const bookingId = parseInt(data.split('_')[2]); // Получаем ID бронирования
    cancelBooking(bot, msg.chat.id, userId, bookingId); // Отменяем бронирование
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Отменяем бронирование...'
    });
  }

  // Обработка кнопки "Вернуться к направлениям" 
  else if (data === 'back_to_destinations_menu') {
    showDestinationsMainMenu(bot, msg.chat.id);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся к направлениям'
    });
  }
    
  // Обработка кнопки информации о стране 
  else if (data.startsWith('country_info_')) {
    const countryName = data.split('_')[2]; // Получаем название страны
    showCountryInfo(bot, msg.chat.id, countryName); // Показываем информацию о стране
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: `Загружаем информацию о ${countryName}...`
    });
  }

  // Обработка кнопки "Выбрать другую страну" 
  else if (data === 'back_to_countries_menu') {
    showCountriesMenu(bot, msg.chat.id);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся к выбору страны'
    });
  }
    
  // Обработка кнопки выбора страны для маршрутов
  else if (data.startsWith('routes_country_')) {
    const countryName = data.split('_')[2]; // Получаем название страны
    showRoutesCities(bot, msg.chat.id, countryName); // Показываем города страны
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: `Загружаем маршруты для ${countryName}...`
    });
  }

  // Обработка кнопки "Выбрать другую страну" в маршрутах 
  else if (data === 'back_to_routes_menu') {
    showRoutesMenu(bot, msg.chat.id);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся к выбору страны'
    });
  }

  // Обработка кнопки выбора города для маршрутов 
  else if (data.startsWith('routes_city_')) {
    const parts = data.split('_');
    const countryName = parts[2];
    const cityName = parts[3];
    showCityRoutes(bot, msg.chat.id, countryName, cityName);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: `Загружаем маршруты для ${cityName}...`
    });
  }

  // Обработка кнопки выбора сезона
  else if (data.startsWith('season_')) {
    const season = data.split('_')[1];
    showSeasonalTours(bot, msg.chat.id, season);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: `Подбираем туры на ${season}...`
    });
  }
    
  // Обработка кнопки выбора интереса
  else if (data.startsWith('interest_')) {
    const interest = data.split('_')[1];
    showInterestTours(bot, msg.chat.id, interest);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: `Подбираем туры для ${interest}...`
    });
  }
    
  // Обработка кнопки "Выбрать другой сезон"
  else if (data === 'back_to_seasons_menu') {
    showSeasonsMenu(bot, msg.chat.id);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся к выбору сезона'
    });
  }
    
  // Обработка кнопки "Выбрать другой интерес"
  else if (data === 'back_to_destinations_interests_menu') {
    showInterestsMenu(bot, msg.chat.id);
      
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Возвращаемся к выбору интереса'
    });
  }

  // Обработка неизвестных callback данных
  else {
    console.log('Неизвестный callback data:', data);
    bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Неизвестная команда',
      show_alert: false
    });
  }
}


// Функция показа главного меню поиска и бронирования
export function showSearchMainMenu(bot, chatId) {
  const message = `
🔍 <b>Поиск и бронирование туров</b>

Выберите критерии для поиска идеального путешествия:

Мы подберем туры по вашим предпочтениям и покажем варианты проживания с перелетом!
  `;
  
  // Создаем клавиатуру с кнопками
  const searchKeyboard = {
    reply_markup: {
      keyboard: [
        ['💳 Бюджет', '🌍 Направление'],
        ['📅 Даты', '🎟️ Тип отдыха'],
        ['🔍 Все туры', '↩️ Назад']
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...searchKeyboard
  });
}

// Функция обработки меню поиска и бронирования
export function handleSearchMenu(bot, chatId, menuItem) {
  
  // Обработка кнопки "Бюджет"
  if (menuItem === '💳 Бюджет') {
    showBudgetMenu(bot, chatId);
  }
  
  // Обработка кнопки "Направление"
  else if (menuItem === '🌍 Направление') {
    showDestinationMenu(bot, chatId);
  }
  
  // Обработка кнотки "Даты"
  else if (menuItem === '📅 Даты') {
    showDatesMenu(bot, chatId);
  }
  
  // Обработка кнопки "Тип отдыха"
  else if (menuItem === '🎟️ Тип отдыха') {
    showInterestsMenuSearch(bot, chatId);
  }
  
  // Обработка кнопки "Все туры"
  else if (menuItem === '🔍 Все туры') {
    showAllTours(bot, chatId);
  }
}

// Функция показа меню бюджетов
export function showBudgetMenu(bot, chatId) {
  const message = `
💳 <b>Выбор бюджета на человека</b>

Выберите подходящий ценовой диапазон:

Я подберу туры в выбранном бюджетном диапазоне с учетом всех включенных услуг
  `;
  
  // Создаем inline-кнопки для каждого бюджетного диапазона
  const budgetButtons = budgetRanges.map(budget => [
    {
      text: budget.label,
      callback_data: `budget_${String(budget.max)}`
    }
  ]);
  
  // Добавляем кнопку возврата
  const backButton = [
    {
      text: '↩️ Вернуться к поиску туров',
      callback_data: 'back_to_search_menu'
    }
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...budgetButtons,  // Кнопки бюджетов
        backButton        // Кнопка возврата
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа туров по бюджету
export function showToursByBudget(bot, chatId, maxBudget) {
  // Фильтруем туры по бюджету
  let filteredTours;
  let budgetMessage = '';
  if (maxBudget === Infinity) {
    // Если выбран "Любой бюджет" - показываем все туры
    filteredTours = tours;
    budgetMessage = '<b>Все туры (любой бюджет)</b>\n\n';
  } else {
    // Фильтруем по максимальному бюджету
    filteredTours = filterTours(tours, { maxBudget: maxBudget });
    budgetMessage = `<b>Туры до ${formatPrice(maxBudget)}</b>\n\n`;
  }
  
  // Проверяем есть ли туры
  if (filteredTours.length === 0) {
    const noToursMessage = `
😔 <b>Пу-пу-пу</b>

Не найдено туров в выбранном бюджетном диапазоне.
    `;
    
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Выбрать другой бюджет',
            callback_data: 'back_to_budget_menu'
          }],
          [{
            text: '🔍 Посмотреть все туры',
            callback_data: 'show_all_tours'
          }],
          [{
            text: '↩️ Вернуться к поиску туров',
            callback_data: 'back_to_search_menu'
          }]
        ]
      }
    };
    
    bot.sendMessage(chatId, noToursMessage, {
      parse_mode: 'HTML',
      ...inlineKeyboard
    });
    return;
  }
  
  // Показываем туры 
  const toursList = filteredTours.map(tour => 
    `<b>${tour.destination}, ${tour.city}</b>\n` +
    `${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)}\n` +
    `Рейтинг: ${tour.rating}/5\n` +
    `${tour.accommodation.type}\n` +
    `Стоимость: ${formatPrice(tour.price)}\n` +
    `Интересы: ${tour.interests.join(', ')}`
  ).join('\n' + '─'.repeat(30) + '\n');

  const successMessage = `
${budgetMessage}
Найдено туров: <b>${filteredTours.length}</b>

${toursList}
  `;

  // СОЗДАЕМ INLINE-КНОПКИ ДЛЯ КАЖДОГО ТУРА
  const tourButtons = filteredTours.map(tour => [
    {
      text: `Подробнее: ${tour.destination}, ${tour.city} (${formatPrice(tour.price)})`,
      callback_data: `tour_detail_${tour.id}`
    }
  ]);
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: 'Выбрать другой бюджет',
      callback_data: 'back_to_budget_menu'
    }],
    [{
      text: '🔍 Посмотреть все туры',
      callback_data: 'show_all_tours'
    }],
    [{
      text: '↩️ Вернуться к поиску туров',
      callback_data: 'back_to_search_menu'
    }]
  ];

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...tourButtons,      // Кнопки "Подробнее" для каждого тура
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, successMessage, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа меню напралений
export function showDestinationMenu(bot, chatId) {
  // Получаем уникальные страны из туров (только те, которые реально есть в базе)
  const availableDestinations = [...new Set(tours.map(tour => tour.destination))];
  
  const message = `
🌍 <b>Выбор направления</b>

Выберите страну для поиска туров:

Я покажу все доступные туры в выбранной стране
  `;
  
  // Создаем inline-кнопки для каждой доступной страны
  const destinationButtons = availableDestinations.map(destination => [
    {
      text: `${destination}`,
      callback_data: `destination_${destination}`
    }
  ]);
  
  // Добавляем кнопку возврата
  const backButton = [
    {
      text: '↩️ Вернуться к поиску туров',
      callback_data: 'back_to_search_menu'
    }
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...destinationButtons,  // Кнопки стран
        backButton             // Кнопка возврата
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа туров по напралению
export function showToursByDestination(bot, chatId, destination) {
  // Фильтруем туры по выбранной стране
  const filteredTours = filterTours(tours, { destination: destination });
  
  const destinationMessage = `<b>Туры в ${destination}</b>\n\n`;
  
  // Проверяем есть ли туры
  if (filteredTours.length === 0) {
    const noToursMessage = `
😔 <b>Пу-пу-пу</b>

Не найдено туров в выбранном бюджетном диапазоне.
    `;
    
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Выбрать другую страну',
            callback_data: 'back_to_destination_menu'
          }],
          [{
            text: 'Посмотреть все туры',
            callback_data: 'show_all_tours'
          }],
          [{
            text: '↩️ Вернуться к поиску',
            callback_data: 'back_to_search_menu'
          }]
        ]
      }
    };
    
    bot.sendMessage(chatId, noToursMessage, {
      parse_mode: 'HTML',
      ...inlineKeyboard
    });
    return;
  }
  
  // Показываем туры 
  const toursList = filteredTours.map(tour => 
    `<b>${tour.destination}, ${tour.city}</b>\n` +
    `${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)}\n` +
    `Рейтинг: ${tour.rating}/5\n` +
    `${tour.accommodation.type}\n` +
    `Стоимость: ${formatPrice(tour.price)}\n` +
    `Интересы: ${tour.interests.join(', ')}`
  ).join('\n' + '─'.repeat(30) + '\n');

  
  const successMessage = `
${destinationMessage}
Найдено туров: <b>${filteredTours.length}</b>

${toursList}
  `;
  
  // СОЗДАЕМ INLINE-КНОПКИ ДЛЯ КАЖДОГО ТУРА
  const tourButtons = filteredTours.map(tour => [
    {
      text: `Подробнее: ${tour.destination}, ${tour.city} (${formatPrice(tour.price)})`,
      callback_data: `tour_detail_${tour.id}`
    }
  ]);
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: 'Выбрать другую страну',
      callback_data: 'back_to_destination_menu'
    }],
    [{
      text: 'Посмотреть все туры',
      callback_data: 'show_all_tours'
    }],
    [{
      text: '↩️ Вернуться к поиску',
      callback_data: 'back_to_search_menu'
    }]
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...tourButtons,      // Кнопки "Подробнее" для каждого тура
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, successMessage, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа меню годов
export function showDatesMenu(bot, chatId) {
  // Получаем уникальные годы из дат начала туров
  const availableYears = [...new Set(tours.map(tour => {
    return new Date(tour.dates.start).getFullYear();
  }))].sort();
  
  const message = `
📅 <b>Выбор даты поездки</b>

Сначала выберите год поездки:

Я покажу все доступные туры в выбранный период
  `;
  
  // Создаем inline-кнопки для каждого года
  const yearButtons = availableYears.map(year => [
    {
      text: `${year} год`,
      callback_data: `dates_year_${year}`
    }
  ]);
  
  // Добавляем кнопку "Все даты"
  const allDatesButton = [
    {
      text: 'Все доступные даты',
      callback_data: 'dates_all'
    }
  ];
  
  // Добавляем кнопку возврата
  const backButton = [
    {
      text: '↩️ Вернуться к поиску туров',
      callback_data: 'back_to_search_menu'
    }
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...yearButtons,      // Кнопки годов
        allDatesButton,      // Кнопка "Все даты"
        backButton          // Кнопка возврата
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа месяцев для выбранного года
export function showMonthsMenu(bot, chatId, year) {
  // Получаем уникальные месяцы для выбранного года
  const availableMonths = [...new Set(tours
      .filter(tour => new Date(tour.dates.start).getFullYear() === year)
      .map(tour => new Date(tour.dates.start).getMonth() + 1) // +1 потому что месяцы с 0 до 11
  )].sort((a, b) => a - b);
  
  const monthNames = {
    1: 'Январь', 2: 'Февраль', 3: 'Март', 4: 'Апрель', 5: 'Май', 6: 'Июнь',
    7: 'Июль', 8: 'Август', 9: 'Сентябрь', 10: 'Октябрь', 11: 'Ноябрь', 12: 'Декабрь'
  };
  
  const message = `
📅 <b>Выбор даты поездки</b>

Год: <b>${year}</b>

Теперь выберите месяц поездки:
  `;
  
  // Создаем inline-кнопки для каждого месяца
  const monthButtons = availableMonths.map(month => [
    {
      text: `${monthNames[month]}`,
      callback_data: `dates_month_${year}_${month}`
    }
  ]);
  
  // Добавляем кнопку "Весь год"
  const allYearButton = [
    {
      text: `Весь ${year} год`,
      callback_data: `dates_year_all_${year}`
    }
  ];
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: 'Все доступные даты',
      callback_data: 'dates_all'
    }],
    [{
      text: '↩️ Выбрать другой год',
      callback_data: 'back_to_dates_menu'
    }],
    [{
      text: '↩️ Вернуться к поиску туров',
      callback_data: 'back_to_search_menu'
    }]
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...monthButtons,     // Кнопки месяцев
        allYearButton,       // Кнопка "Весь год"
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа туров по году
export function showToursByYear(bot, chatId, year) {
  // Фильтруем туры по году
  const filteredTours = tours.filter(tour => {
    const tourYear = new Date(tour.dates.start).getFullYear();
    return tourYear === year;
  });
  
  const yearMessage = `<b>Туры за ${year} год</b>\n\n`;
  
  // Проверяем есть ли туры
  if (filteredTours.length === 0) {
    const noToursMessage = `
😔 <b>Пу-пу-пу</b>

Не найдено туров в выбранном бюджетном диапазоне.
    `;
    
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Выбрать другой год',
            callback_data: 'back_to_dates_menu'
          }],
          [{
            text: 'Посмотреть все туры',
            callback_data: 'show_all_tours'
          }],
          [{
            text: '↩️ Вернуться к поиску',
            callback_data: 'back_to_search_menu'
          }]
        ]
      }
    };
    
    bot.sendMessage(chatId, noToursMessage, {
      parse_mode: 'HTML',
      ...inlineKeyboard
    });
    return;
  }
  
  // СОЗДАЕМ КРАСИВЫЙ СПИСОК ТУРОВ
  const toursList = filteredTours.map(tour => {
    
    return `<b>${tour.destination}, ${tour.city}</b>\n` +
    `${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)}\n` +
    `Рейтинг: ${tour.rating}/5\n` +
    `${tour.accommodation.type}\n` +
    `Стоимость: ${formatPrice(tour.price)}\n` +
    `Интересы: ${tour.interests.join(', ')}`;
  }).join('\n\n' + '─'.repeat(30) + '\n\n');
  
  const successMessage = `
${yearMessage}
Найдено туров: <b>${filteredTours.length}</b>

${toursList}
  `;
  
  // СОЗДАЕМ INLINE-КНОПКИ ДЛЯ КАЖДОГО ТУРА
  const tourButtons = filteredTours.map(tour => [
    {
      text: `Подробнее: ${tour.destination}, ${tour.city} (${formatPrice(tour.price)})`,
      callback_data: `tour_detail_${tour.id}`
    }
  ]);
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: 'Выбрать другой год',
      callback_data: 'back_to_dates_menu'
    }],
    [{
      text: 'Посмотреть все туры',
      callback_data: 'show_all_tours'
    }],
    [{
      text: '↩️ Вернуться к поиску',
      callback_data: 'back_to_search_menu'
    }]
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...tourButtons,      // Кнопки "Подробнее" для каждого тура
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, successMessage, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа туров по месяцу
export function showToursByMonth(bot, chatId, year, month) {
  const monthNames = {
    1: 'Январь', 2: 'Февраль', 3: 'Март', 4: 'Апрель', 5: 'Май', 6: 'Июнь',
    7: 'Июль', 8: 'Август', 9: 'Сентябрь', 10: 'Октябрь', 11: 'Ноябрь', 12: 'Декабрь'
  };
  
  // Фильтруем туры по году и месяцу
  const filteredTours = tours.filter(tour => {
    const tourDate = new Date(tour.dates.start);
    return tourDate.getFullYear() === year && (tourDate.getMonth() + 1) === month;
  });
  
  const monthMessage = `<b>Туры на ${monthNames[month]} ${year} года</b>\n\n`;
  
  // Проверяем есть ли туры
  if (filteredTours.length === 0) {
    const noToursMessage = `
😔 <b>Пу-пу-пу</b>

Не найдено туров в выбранном бюджетном диапазоне.
    `;
    
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Выбрать другой месяц',
            callback_data: `back_to_months_${year}`
          }],
          [{
            text: 'Посмотреть все туры',
            callback_data: 'show_all_tours'
          }],
          [{
            text: '↩️ Вернуться к поиску',
            callback_data: 'back_to_search_menu'
          }]
        ]
      }
    };
    
    bot.sendMessage(chatId, noToursMessage, {
      parse_mode: 'HTML',
      ...inlineKeyboard
    });
    return;
  }
  
  // Показываем туры 
  const toursList = filteredTours.map(tour => 
    `<b>${tour.destination}, ${tour.city}</b>\n` +
    `${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)}\n` +
    `Рейтинг: ${tour.rating}/5\n` +
    `${tour.accommodation.type}\n` +
    `Стоимость: ${formatPrice(tour.price)}\n` +
    `Интересы: ${tour.interests.join(', ')}`
  ).join('\n' + '─'.repeat(30) + '\n');
  
  const successMessage = `
${monthMessage}
Найдено туров: <b>${filteredTours.length}</b>

${toursList}
  `;
  
  // СОЗДАЕМ INLINE-КНОПКИ ДЛЯ КАЖДОГО ТУРА
  const tourButtons = filteredTours.map(tour => [
    {
      text: `Подробнее: ${tour.destination}, ${tour.city} (${formatPrice(tour.price)})`,
      callback_data: `tour_detail_${tour.id}`
    }
  ]);
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: 'Выбрать другой месяц',
      callback_data: `back_to_months_${year}`
    }],
    [{
      text: 'Посмотреть все туры',
      callback_data: 'show_all_tours'
    }],
    [{
      text: '↩️ Вернуться к поиску',
      callback_data: 'back_to_search_menu'
    }]
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...tourButtons,      // Кнопки "Подробнее" для каждого тура
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, successMessage, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа меню типов отдыха
export function showInterestsMenuSearch(bot, chatId) {
  // Получаем уникальные интересы из всех туров
  const allInterests = tours.flatMap(tour => tour.interests);
  const uniqueInterests = [...new Set(allInterests)];
  
  const message = `
🎟️ <b>Выбор типа отдыха</b>

Выберите интересующий вас тип отдыха:

Я покажу туры, которые идеально подходят для выбранного занятия
  `;
  
  // Создаем inline-кнопки для каждого интереса
  const interestButtons = uniqueInterests.map(interest => [
    {
      text: `${interest.charAt(0).toUpperCase() + interest.slice(1)}`,
      callback_data: `interest_search_${interest}`
    }
  ]);
  
  // Добавляем кнопку "Все типы отдыха"
  const allInterestsButton = [
    {
      text: 'Все типы отдыха',
      callback_data: 'interests_all'
    }
  ];
  
  // Добавляем кнопку возврата
  const backButton = [
    {
      text: '↩️ Вернуться к поиску туров',
      callback_data: 'back_to_search_menu'
    }
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...interestButtons,   // Кнопки интересов
        allInterestsButton,   // Кнопка "Все типы"
        backButton           // Кнопка возврата
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа туров по типу отдыха
export function showToursByInterest(bot, chatId, interest) {
  // Фильтруем туры по интересу
  const filteredTours = filterTours(tours, { interest: interest });
  
  const interestMessage = `<b>Туры для: ${interest}</b>\n\n`;
  
  // Проверяем есть ли туры
  if (filteredTours.length === 0) {
    const noToursMessage = `
😔 <b>Пу-пу-пу</b>

Не найдено туров в выбранном бюджетном диапазоне.
    `;
    
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Выбрать другой тип отдыха',
            callback_data: 'back_to_interests_menu'
          }],
          [{
            text: 'Посмотреть все туры',
            callback_data: 'show_all_tours'
          }],
          [{
            text: '↩️ Вернуться к поиску',
            callback_data: 'back_to_search_menu'
          }]
        ]
      }
    };
    
    bot.sendMessage(chatId, noToursMessage, {
      parse_mode: 'HTML',
      ...inlineKeyboard
    });
    return;
  }
  
  // Показываем туры 
  const toursList = filteredTours.map(tour => 
    `<b>${tour.destination}, ${tour.city}</b>\n` +
    `${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)}\n` +
    `Рейтинг: ${tour.rating}/5\n` +
    `${tour.accommodation.type}\n` +
    `Стоимость: ${formatPrice(tour.price)}\n` +
    `Интересы: ${tour.interests.join(', ')}`
  ).join('\n' + '─'.repeat(30) + '\n');
  
  const successMessage = `
${interestMessage}
Найдено туров: <b>${filteredTours.length}</b>

${toursList}
  `;
  
  // СОЗДАЕМ INLINE-КНОПКИ ДЛЯ КАЖДОГО ТУРА
  const tourButtons = filteredTours.map(tour => [
    {
      text: `Подробнее: ${tour.destination}, ${tour.city} (${formatPrice(tour.price)})`,
      callback_data: `tour_detail_${tour.id}`
    }
  ]);
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: 'Выбрать другой тип отдыха',
      callback_data: 'back_to_interests_menu'
    }],
    [{
      text: 'Посмотреть все туры',
      callback_data: 'show_all_tours'
    }],
    [{
      text: '↩️ Вернуться к поиску',
      callback_data: 'back_to_search_menu'
    }]
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...tourButtons,      // Кнопки "Подробнее" для каждого тура
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, successMessage, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа всех туров
export function showAllTours(bot, chatId) {
  const message = `
🔍 <b>Все доступные туры</b>

Найдено туров: <b>${tours.length}</b>

Выберите тур для просмотра деталей и бронирования:
  `;
  
  // Создаем inline-кнопки для каждого тура
  const tourButtons = tours.map((tour, index) => [
    {
      text: `Тур #${index + 1} - ${tour.destination}, ${tour.city} (${tour.dates.duration}, ${formatPrice(tour.price)})`,
      callback_data: `tour_detail_${tour.id}`
    }
  ]);
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: '↩️ Вернуться к поиску туров',
      callback_data: 'back_to_search_menu'
    }]
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...tourButtons,      // Кнопки туров
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа всех туров по датам
export function showAllToursByDates(bot, chatId) {
  // Сортируем туры по дате начала (от ближайших к дальним)
  const sortedTours = [...tours].sort((a, b) => new Date(a.dates.start) - new Date(b.dates.start));
  
  const message = `<b>Все туры по датам</b>\nТуры отсортированы по дате начала:\n\n`;
  
  // Показываем туры 
  const toursList = sortedTours.map(tour => 
    `<b>${tour.destination}, ${tour.city}</b>\n` +
    `${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)}\n` +
    `Рейтинг: ${tour.rating}/5\n` +
    `${tour.accommodation.type}\n` +
    `Стоимость: ${formatPrice(tour.price)}\n` +
    `Интересы: ${tour.interests.join(', ')}`
  ).join('\n' + '─'.repeat(30) + '\n');
  
  const successMessage = `
${message}
Найдено туров: <b>${sortedTours.length}</b>

${toursList}
  `;
  
  // СОЗДАЕМ INLINE-КНОПКИ ДЛЯ КАЖДОГО ТУРА
  const tourButtons = sortedTours.map(tour => [
    {
      text: `Подробнее: ${tour.destination}, ${tour.city} (${formatPrice(tour.price)})`,
      callback_data: `tour_detail_${tour.id}`
    }
  ]);
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: 'Выбрать год',
      callback_data: 'back_to_dates_menu'
    }],
    [{
      text: '↩️ Вернуться к поиску',
      callback_data: 'back_to_search_menu'
    }]
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...tourButtons,      // Кнопки "Подробнее" для каждого тура
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, successMessage, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа всех туров по типам отдыха
export function showAllToursByInterests(bot, chatId) {
  // Группируем туры по интересам для красивого отображения
  const toursByInterest = {};
  
  tours.forEach(tour => {
    tour.interests.forEach(interest => {
      if (!toursByInterest[interest]) {
        toursByInterest[interest] = [];
      }
      toursByInterest[interest].push(tour);
    });
  });
  
  const message = `<b>Все туры по типам отдыха</b>\n\n`;
  
  // СОЗДАЕМ КРАСИВЫЙ СПИСОК С ГРУППИРОВКОЙ ПО ИНТЕРЕСАМ
  let toursList = '';
  
  Object.keys(toursByInterest).forEach(interest => {
    const interestTours = toursByInterest[interest];
    
    toursList += `<b>${interest.charAt(0).toUpperCase() + interest.slice(1)}</b> (${interestTours.length} тур${interestTours.length > 1 ? 'а' : ''}):\n`;
    
    interestTours.forEach(tour => {
      toursList += `  • ${tour.destination}, ${tour.city} - ${formatPrice(tour.price)}\n`;
    });
    
    toursList += '\n';
  });
  
  const successMessage = `
${message}
Всего типов отдыха: <b>${Object.keys(toursByInterest).length}</b>
Всего туров: <b>${tours.length}</b>

${toursList}
  `;
  
  // СОЗДАЕМ INLINE-КНОПКИ ДЛЯ КАЖДОГО ТУРА
  const tourButtons = tours.map(tour => [
    {
      text: `Подробнее: ${tour.destination}, ${tour.city} (${formatPrice(tour.price)})`,
      callback_data: `tour_detail_${tour.id}`
    }
  ]);
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: 'Выбрать тип отдыха',
      callback_data: 'back_to_interests_menu'
    }],
    [{
      text: '↩️ Вернуться к поиску',
      callback_data: 'back_to_search_menu'
    }]
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...tourButtons,      // Кнопки "Подробнее" для каждого тура
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, successMessage, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа деталей одного тура 
export function showTourDetails(bot, chatId, tour) {
  const message = `
<b>Детали тура</b>

<b>${tour.destination}, ${tour.city}</b>
⭐ Рейтинг: ${tour.rating}/5

<b>Даты поездки:</b>
${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)} (${tour.dates.duration})

<b>Стоимость:</b> ${formatPrice(tour.price)}/чел.

<b>Проживание:</b>
Тип: ${tour.accommodation.type}
Отель: ${tour.accommodation.name}  
Питание: ${tour.accommodation.meals}

<b>Перелёт:</b>
Авиакомпания: ${tour.flight.airline}
Тип рейса: ${tour.flight.type}
Багаж: ${tour.flight.baggage}

<b>Интересы:</b> ${tour.interests.join(', ')}

<b>Описание:</b>
${tour.description}
  `;
  
  // Клавиатура с кнопками
  const detailsKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '✔️Забронировать этот тур',
          callback_data: `book_tour_${tour.id}`
        }],
        [{
          text: 'Найти новый тур',
          callback_data: 'new_search'
        }]
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...detailsKeyboard
  });
}

// Функция бронирования тура 
export function bookTour(bot, chatId, userId, tour) {
  // Создаем объект бронирования
  const booking = {
    id: Date.now(), // Уникальный ID брони (текущее время в мс)
    tour: tour,
    bookingDate: new Date().toLocaleString('ru-RU'), // Дата бронирования
    status: 'active', // Статус брони
    userId: userId // ID пользователя
  };
  
  // Сохраняем бронирование (в памяти)
  if (!global.userBookings) {
    global.userBookings = {}; // Создаем хранилище если его нет
  }
  if (!global.userBookings[userId]) {
    global.userBookings[userId] = []; // Создаем массив для пользователя
  }
  global.userBookings[userId].push(booking); // Добавляем бронь

  // Сообщение о успешном бронировании
  const successMessage = `
✔️ <b>Бронирование подтверждено!</b>

<b>Номер брони:</b> #${booking.id}
<b>Статус:</b> Активно
<b>Дата брони:</b> ${booking.bookingDate}

Детали бронирования:
Направление: ${tour.destination}, ${tour.city}
Даты: ${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)} 
Стоимость: ${formatPrice(tour.price)}
Отель: ${tour.accommodation.name} (${tour.accommodation.type})
Перелёт: ${tour.flight.airline} (${tour.flight.type})

<i>Скоро мы свяжемся с вами для уточнения деталей и оплаты.</i>

Для просмотра информации по вашим бронированиям воспользуйтесь командой /my_bookings
  `;
  
  // Клавиатура после бронирования
  const afterBookingKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '🔍 Найти ещё туры',
          callback_data: 'new_search'
        }]
      ]
    }
  };
  
  bot.sendMessage(chatId, successMessage, {
    parse_mode: 'HTML',
    ...afterBookingKeyboard
  });
}



// Функция показа главного меню бронирований
export function showBookingsMainMenu(bot, chatId, userId) {
  const message = `
📋 <b>Управление бронированиями</b>

Здесь вы можете посмотреть информацию о ваших бронированиях, получить напоминания о поездках и управлять бронями
  `;
  
  // Проверяем есть ли скоро поездки
  const hasUpcomingTrips = checkUpcomingTrips(userId);
  
  // Создаем клавиатуру
  const bookingsKeyboard = {
    reply_markup: {
      keyboard: [
        ['✔️ Активные бронирования'],
        ['✖️ Завершенные бронирования'],
        ...(hasUpcomingTrips ? [['🔜 Скоро поездка!']] : []), // Условная кнопка
        ['↩️ Назад']
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...bookingsKeyboard
  });
}

// Функция проверки ближайших поездок (30 дней)
export function checkUpcomingTrips(userId) {
  if (!global.userBookings || !global.userBookings[userId]) {
    return false;
  }
  
  const userBookings = global.userBookings[userId];
  const activeBookings = userBookings.filter(booking => booking.status === 'active');
  
  // Проверяем есть ли активные бронирования в ближайшие 30 дней
  const hasUpcoming = activeBookings.some(booking => isUpcomingTrip(booking));
  
  return hasUpcoming;
}

// Функция проверки - скоро ли поездка (в ближайшие 30 дней)
export function isUpcomingTrip(booking) {
  const tripStartDate = new Date(booking.tour.dates.start);
  const today = new Date();
  const daysUntilTrip = Math.ceil((tripStartDate - today) / (1000 * 60 * 60 * 24));
  
  return daysUntilTrip <= 30 && daysUntilTrip >= 0; // От 0 до 30 дней
}

// Функция обработки кнопок меню бронирований
export function handleBookingsMenu(bot, chatId, userId, menuItem) {
  
  // Обработка кнопки "Активные бронирования"
  if (menuItem === '✔️ Активные бронирования') {
    showActiveBookings(bot, chatId, userId);
  }
  
  // Обработка кнопки "Завершенные бронирования"
  else if (menuItem === '✖️ Завершенные бронирования') {
    showCompletedBookings(bot, chatId, userId);
  }
  
  // Обработка кнопки "Скоро поездка!"
  else if (menuItem === '🔜 Скоро поездка!') {
    showUpcomingTrips(bot, chatId, userId);
  }
}

// Функция показа активных бронирований
export function showActiveBookings(bot, chatId, userId) {
  // Проверяем есть ли активные бронирования
  if (!global.userBookings || !global.userBookings[userId]) {
    const noBookingsMessage = `
<b>Активные бронирования</b>

У вас пока нет активных бронирований.

Чтобы забронировать тур, используйте:
🔍 /search_trip - поиск и бронирование туров
    `;
    
    // Inline-кнопки под сообщением
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Найти новые туры',
            callback_data: 'new_search'
          }],
          [{
            text: '↩️ Вернуться в меню бронирований', 
            callback_data: 'back_to_bookings_menu'
          }]
        ]
      }
    };
    
    bot.sendMessage(chatId, noBookingsMessage, {
      parse_mode: 'HTML',
      ...inlineKeyboard
    });
    return;
  }
  
  const userBookings = global.userBookings[userId];
  const activeBookings = userBookings.filter(booking => 
    booking.status === 'active' && !isPastTrip(booking)
  );
  const activeCount = activeBookings.length
  
  // Создаем красивое сообщение со списком бронирований
  let message = `
<b>Ваши активные бронирования</b>\n
У вас <b>${activeCount}</b> активных бронирований\n
`;
  
  activeBookings.forEach((booking, index) => {
    const tour = booking.tour;
    message += `<b>Бронирование #${index + 1}</b>\n`;
    message += `Номер брони: #${booking.id}\n`;
    message += `${tour.destination}, ${tour.city}\n`;
    message += `${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)} \n`;
    message += `\n\n`;
  });
  
  // Создаем кнопки для каждого бронирования
  const bookingButtons = activeBookings.map((booking, index) => [
    {
      text: `Бронирование #${index + 1}: ${booking.tour.destination}, ${booking.tour.city} (${formatPrice(booking.tour.price)})`,
      callback_data: `booking_detail_${booking.id}`
    }
  ]);
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: 'Найти новые туры',
      callback_data: 'new_search'
    }],
    [{
      text: '↩️ Вернуться в меню бронирований',
      callback_data: 'back_to_bookings_menu'
    }]
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...bookingButtons,  // Кнопки для каждого бронирования
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция поиска бронирования по ID
export function findBookingById(userId, bookingId) {
  if (!global.userBookings || !global.userBookings[userId]) {
    return null;
  }
  
  return global.userBookings[userId].find(booking => booking.id === bookingId);
}

// Функция показа деталей бронирования
export function showBookingDetails(bot, chatId, userId, booking) {
  const tour = booking.tour;
  
  const message = `
<b>Детали бронирования</b>

<b>Информация о брони:</b>
Номер брони: #${booking.id}
Дата бронирования: ${booking.bookingDate}
Статус: ✔️ Активно
ID пользователя: ${userId} 

<b>Информация о туре:</b>
<b>${tour.destination}, ${tour.city}</b>
Рейтинг: ${tour.rating}/5

Даты поездки: ${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)}  (${tour.dates.duration})

Стоимость: ${formatPrice(tour.price)}/чел.

Проживание:
Тип: ${tour.accommodation.type}
Отель: ${tour.accommodation.name}
Питание: ${tour.accommodation.meals}

Перелёт:
Авиакомпания: ${tour.flight.airline}
Тип рейса: ${tour.flight.type}
Багаж: ${tour.flight.baggage}

Интересы: ${tour.interests.join(', ')}

Описание: ${tour.description}
  `;
  //${booking.userId}
  // Inline-кнопки для управления бронированием
  const detailsKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '✖️ Отменить бронирование',
          callback_data: `cancel_booking_${booking.id}`
        }],
        [{
          text: '↩️ Вернуться к списку бронирований',
          callback_data: 'back_to_active_bookings'
        }],
        [{
          text: '↩️ Вернуться в меню бронирований',
          callback_data: 'back_to_bookings_menu'
        }]
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...detailsKeyboard
  });
}

// Функция отмены бронирования
export function cancelBooking(bot, chatId, userId, bookingId) {
  // Находим бронирование
  const booking = findBookingById(userId, bookingId);
  
  if (!booking) {
    bot.sendMessage(chatId,
      '✖️ <b>Ошибка отмены</b>\n\n' +
      'Бронирование не найдено. Возможно, оно уже было отменено.',
      { parse_mode: 'HTML' }
    );
    return;
  }
  
  // Меняем статус бронирования
  booking.status = 'cancelled';
  
  // Сообщение об успешной отмене
  const cancelMessage = `
✖️ <b>Бронирование отменено</b>

Номер брони: #${booking.id}
${booking.tour.destination}, ${booking.tour.city}
${formatDate(booking.tour.dates.start)} - ${formatDate(booking.tour.dates.end)} 
Стоимость: ${formatPrice(booking.tour.price)}

Дата отмены: ${new Date().toLocaleString('ru-RU')}

<i>Если отмена произошла по ошибке, вы можете забронировать тур ещё раз</i>
  `;
  
  // Клавиатура после отмены
  const afterCancelKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Найти новые туры',
          callback_data: 'new_search'
        }],
        [{
          text: '↩️ Вернуться к активным бронированиям',
          callback_data: 'back_to_active_bookings'
        }],
        [{
          text: '↩️ Вернуться в меню бронирований',
          callback_data: 'back_to_bookings_menu'
        }]
      ]
    }
  };
  
  bot.sendMessage(chatId, cancelMessage, {
    parse_mode: 'HTML',
    ...afterCancelKeyboard
  });
}

// Функция показа завершенных бронирований
export function showCompletedBookings(bot, chatId, userId) {
  // Проверяем есть ли бронирования у пользователя
  if (!global.userBookings || !global.userBookings[userId]) {
    const noBookingsMessage = `
<b>Завершенные бронирования</b>

У вас пока нет завершенных бронирований.

Завершенные бронирования - это поездки, которые уже состоялись.
    `;
    
    // Клавиатура для возврата
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Найти новые туры',
            callback_data: 'new_search'
          }],
          [{
            text: '↩️ Вернуться в меню бронирований',
            callback_data: 'back_to_bookings_menu'
          }]
        ]
      }
    };
    
    bot.sendMessage(chatId, noBookingsMessage, {
      parse_mode: 'HTML',
      ...inlineKeyboard
    });
    return;
  }
  
  const userBookings = global.userBookings[userId];
  
  // Завершенные бронирования - отмененные и прошедшие по дате
  const completedBookings = userBookings.filter(booking => 
    booking.status === 'cancelled' || isPastTrip(booking)
  );
  
  if (completedBookings.length === 0) {
    const noCompletedMessage = `
✖️ <b>Завершенные бронирования</b>

У вас пока нет завершенных бронирований.

Завершенные бронирования появляются здесь после отмены брони или завершения поездки.
    `;
    
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Найти новые туры',
            callback_data: 'new_search'
          }],
          [{
            text: '↩️ Вернуться в меню бронирований',
            callback_data: 'back_to_bookings_menu'
          }]
        ]
      }
    };
    
    bot.sendMessage(chatId, noCompletedMessage, {
      parse_mode: 'HTML',
      ...inlineKeyboard
    });
    return;
  }
  
  // Создаем красивое сообщение со списком завершенных бронирований
  let message = `
✖️ <b>Ваши завершенные и отмененные бронирования</b>

Всего таких бронирований: <b>${completedBookings.length}</b>

`;
  
  completedBookings.forEach((booking, index) => {
    const tour = booking.tour;
    const statusIcon = booking.status === 'cancelled' ? '✖️' : '✔️';
    const statusText = booking.status === 'cancelled' ? 'Отменено' : 'Завершено';
    
    message += `${statusIcon} <b>Бронирование #${index + 1}</b>\n`;
    message += `Номер брони: #${booking.id}\n`;
    message += `${tour.destination}, ${tour.city}\n`;
    message += `${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)}\n`;
    message += `Стоимость: ${formatPrice(tour.price)}\n`;
    message += `Статус: ${statusText}\n`;
    message += `\n\n`;
  });
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: 'Найти новые туры',
      callback_data: 'new_search'
    }],
    [{
      text: '↩️ Вернуться в меню бронирований',
      callback_data: 'back_to_bookings_menu'
    }]
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        //...bookingButtons,  // Кнопки для каждого бронирования
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция проверки - прошла ли поездка
export function isPastTrip(booking) {
  const tripEndDate = new Date(booking.tour.dates.end);
  const today = new Date();
  return tripEndDate < today; // True если поездка уже завершилась
}

// Функция показа ближайших поездок
export function showUpcomingTrips(bot, chatId, userId) {
  // Проверяем есть ли активные бронирования
  if (!global.userBookings || !global.userBookings[userId]) {
    const noUpcomingMessage = `
🔜 <b>Скоро поездка!</b>

У вас нет ближайших поездок.

Ближайшие поездки - это активные бронирования, которые начнутся в течение 30 дней.
    `;
    
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Найти новые туры',
            callback_data: 'new_search'
          }],
          [{
            text: '↩️ Вернуться в меню бронирований',
            callback_data: 'back_to_bookings_menu'
          }]
        ]
      }
    };
    
    bot.sendMessage(chatId, noUpcomingMessage, {
      parse_mode: 'HTML',
      ...inlineKeyboard
    });
    return;
  }
  
  const userBookings = global.userBookings[userId];
  const activeBookings = userBookings.filter(booking => booking.status === 'active');
  const upcomingBookings = activeBookings.filter(booking => isUpcomingTrip(booking));
  
  if (upcomingBookings.length === 0) {
    const noUpcomingMessage = `
🔜  <b>Скоро поездка!</b>

У вас нет поездок в ближайшие 30 дней.

Ближайшая поездка появится здесь, когда до неё останется меньше месяца.
    `;
    
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Найти новые туры',
            callback_data: 'new_search'
          }],
          [{
            text: '↩️ Вернуться в меню бронирований',
            callback_data: 'back_to_bookings_menu'
          }]
        ]
      }
    };
    
    bot.sendMessage(chatId, noUpcomingMessage, {
      parse_mode: 'HTML',
      ...inlineKeyboard
    });
    return;
  }
  
  // Создаем красивое сообщение со списком ближайших поездок
  let message = `
🔜 <b>Скоро поездка!</b>

У вас есть поездки (<b>${upcomingBookings.length}</b> шт) в ближайшие 30 дней:

`;
  
  upcomingBookings.forEach((booking, index) => {
    const tour = booking.tour;
    const tripStartDate = new Date(tour.dates.start);
    const today = new Date();
    const daysUntilTrip = Math.ceil((tripStartDate - today) / (1000 * 60 * 60 * 24));
    
    message += `<b>Поездка #${index + 1}</b>\n`;
    message += `<b>До поездки осталось: ${daysUntilTrip} дней</b>\n`;
    message += `Номер брони: #${booking.id}\n`;
    message += `${tour.destination}, ${tour.city}\n`;
    message += `${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)}\n`;
    message += `Отель: ${tour.accommodation.name}\n`;
    message += `\n\n`;
  });
  
  // Создаем кнопки для каждой ближайшей поездки
  const tripButtons = upcomingBookings.map((booking, index) => [
    {
      text: `Поездка #${index + 1}: ${booking.tour.destination}, ${booking.tour.city} (${formatPrice(booking.tour.price)})`,
      callback_data: `booking_detail_${booking.id}`
    }
  ]);
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: 'Найти новые туры',
      callback_data: 'new_search'
    }],
    [{
      text: '↩️ Вернуться в меню бронирований',
      callback_data: 'back_to_bookings_menu'
    }]
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...tripButtons,  // Кнопки для каждой поездки
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}



// Функция показа главного меню направлений
export function showDestinationsMainMenu(bot, chatId) {
  const message = `
🗺️ <b>Путеводитель по направлениям</b>

Здесь вы найдете рекомендации по сезонам, информацию о странах, визах и готовые маршруты для идеального путешествия!
  `;
  
  // Создаем клавиатуру с кнопками
  const destinationsKeyboard = {
    reply_markup: {
      keyboard: [
        ['💫 Рекомендации по сезону'],
        ['🎟 Рекомендации по интересам'],
        ['🌍 Информация о странах'],
        ['✔️ Готовые маршруты'],
        ['↩️ Назад']
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...destinationsKeyboard
  });
}

// Функция обработки меню направлений
export function handleDestinationsMenu(bot, chatId, menuItem) {
  
  // Обработка кнопки "Рекомендации по сезону"
  if (menuItem === '💫 Рекомендации по сезону') {
    showSeasonsMenu(bot, chatId);
  }
  
  // Обработка кнопки "Рекомендации по интересам"
  else if (menuItem === '🎟 Рекомендации по интересам') {
    showInterestsMenu(bot, chatId);
  }
  
  // Обработка кнопки "Информация о странах"
  else if (menuItem === '🌍 Информация о странах') {
    showCountriesMenu(bot, chatId);
  }
  
  // Обработка кнопки "Готовые маршруты"
  else if (menuItem === '✔️ Готовые маршруты') {
    showRoutesMenu(bot, chatId);
  }
}

// Функция показа меню сезонов
export function showSeasonsMenu(bot, chatId) {
  // Получаем уникальные сезоны из туров
  const uniqueSeasons = [...new Set(tours.map(tour => tour.season))];
  
  const message = `
<b>Рекомендации по сезону</b>

Выберите время года для подбора идеальных направлений
  `;
  
  // Создаем inline-кнопки для каждого сезона
  const seasonButtons = uniqueSeasons.map(season => [
    {
      text: `${season.charAt(0).toUpperCase() + season.slice(1)}`,
      callback_data: `season_${season}`
    }
  ]);
  
  // Добавляем кнопку возврата
  const backButton = [
    {
      text: '↩️ Вернуться в меню путеводителя',
      callback_data: 'back_to_destinations_menu'
    }
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...seasonButtons,  // Кнопки сезонов
        backButton        // Кнопка возврата
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа туров по сезону
export function showSeasonalTours(bot, chatId, season) {
  // Фильтруем туры по сезону
  const seasonalTours = filterTours(tours, { season: season });
  
  if (seasonalTours.length === 0) {
    bot.sendMessage(chatId,
      `<b>Туры на ${season}</b>\n\n` +
      `К сожалению, туров на ${season} пока нет в наличии\n` +
      `Попробуйте выбрать другой сезон или обратитесь позже`,
      { parse_mode: 'HTML' }
    );
    return;
  }
  
  // Получаем уникальные страны для этого сезона
  const uniqueCountries = [...new Set(seasonalTours.map(tour => tour.destination))];
  
  let message = `
<b>Лучшие направления на ${season}</b>

Найдено туров: <b>${seasonalTours.length}</b>
Доступные страны: ${uniqueCountries.join(', ')}

<b>Рекомендуемые туры:</b>
  `;
  
  // Показываем туры
  seasonalTours.forEach((tour, index) => {
    message += `\n${index + 1}. <b>${tour.destination}, ${tour.city}</b>\n`;
    message += `${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)}\n`;
    message += `Рейтинг: ${tour.rating}/5\n`;
    message += `Стоимость: ${formatPrice(tour.price)}\n`;
    message += `Интересы: ${tour.interests.join(', ')}\n`;
  });
  
  message += `\n\n <i>Для бронирования используйте:</i>\n`;
  message += `/search_trip`;
  
  // Клавиатура для навигации
  const navigationKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Выбрать другой сезон',
          callback_data: 'back_to_seasons_menu'
        }],
        [{
          text: '↩️ Вернуться в меню путеводителя',
          callback_data: 'back_to_destinations_menu'
        }]
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...navigationKeyboard
  });
}

// Функция показа меню интересов
export function showInterestsMenu(bot, chatId) {
  // Получаем уникальные интересы из всех туров
  const allInterests = tours.flatMap(tour => tour.interests);
  const uniqueInterests = [...new Set(allInterests)];
  
  const message = `
<b>Рекомендации по интересам</b>

Выберите тип отдыха для персонализированных рекомендаций
  `;
  
  // Создаем inline-кнопки для каждого интереса
  const interestButtons = uniqueInterests.map(interest => [
    {
      text: `${interest.charAt(0).toUpperCase() + interest.slice(1)}`,
      callback_data: `interest_${interest}`
    }
  ]);
  
  // Добавляем кнопку возврата
  const backButton = [
    {
      text: '↩️ Вернуться в меню путеводителя',
      callback_data: 'back_to_destinations_menu'
    }
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...interestButtons,  // Кнопки интересов
        backButton          // Кнопка возврата
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа туров по интересам
export function showInterestTours(bot, chatId, interest) {
  // Фильтруем туры по интересу
  const interestTours = tours.filter(tour => tour.interests.includes(interest));
  
  if (interestTours.length === 0) {
    bot.sendMessage(chatId,
      `<b>Туры для "${interest}"</b>\n\n` +
      `К сожалению, туров для интереса "${interest}" пока нет\n` +
      `Попробуйте выбрать другой интерес или обратитесь позже`,
      { parse_mode: 'HTML' }
    );
    return;
  }
  
  // Получаем уникальные страны для этого интереса
  const uniqueCountries = [...new Set(interestTours.map(tour => tour.destination))];
  
  let message = `
<b>Лучшие направления для "${interest}"</b>

Найдено туров: <b>${interestTours.length}</b>
Доступные страны: ${uniqueCountries.join(', ')}

<b>Рекомендуемые туры:</b>
  `;
  
  // Показываем туры
  interestTours.forEach((tour, index) => {
    message += `\n${index + 1}. <b>${tour.destination}, ${tour.city}</b>\n`;
    message += `${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)}\n`;
    message += `Рейтинг: ${tour.rating}/5\n`;
    message += `Стоимость: ${formatPrice(tour.price)}\n`;
    message += `Сезон: ${tour.season}\n`;
  });
  
  message += `\n\n <i>Для бронирования используйте:</i>\n`;
  message += `/search_trip`;
  
  // Клавиатура для навигации
  const navigationKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Выбрать другой интерес',
          callback_data: 'back_to_destinations_interests_menu'
        }],
        [{
          text: '↩️ Вернуться в меню путеводителя',
          callback_data: 'back_to_destinations_menu'
        }]
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...navigationKeyboard
  });
}

// Функция показа меню выбора стран
export function showCountriesMenu(bot, chatId) {
  const message = `
<b>Информация о странах</b>

Выберите страну, чтобы узнать подробную информацию о визах, документах, климате, лучшем времени для посещения, валюте, финансах, языке, общении, культуре и традициях
  `;
  
  // Создаем inline-кнопки для каждой страны
  const countryButtons = countriesList.map(country => [
    {
      text: `${country}`,
      callback_data: `country_info_${country}`
    }
  ]);
  
  // Добавляем кнопку возврата
  const backButton = [
    {
      text: '↩️ Вернуться в меню путеводителя',
      callback_data: 'back_to_destinations_menu'
    }
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...countryButtons,  // Кнопки стран
        backButton         // Кнопка возврата
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа информации о стране
export function showCountryInfo(bot, chatId, countryName) {
  // Проверяем есть ли информация о стране
  if (!countriesInfo[countryName]) {
    bot.sendMessage(chatId,
      `✖️ <b>Информация не найдена</b>\n\n` +
      `Информация о стране "${countryName}" временно недоступна.`,
      { parse_mode: 'HTML' }
    );
    return;
  }
  
  const country = countriesInfo[countryName];
  
  // Создаем красивое сообщение с информацией о стране
  const message = `
<b>${countryName}</b>
${country.visa}
${country.climate}
${country.currency}
${country.language}
${country.culture}
<b>Готовы посетить ${countryName}?</b>
Используйте команду /search_trip чтобы найти туры в эту страну
  `;
  
  // Клавиатура для навигации
  const navigationKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Выбрать другую страну',
          callback_data: 'back_to_countries_menu'
        }],
        [{
          text: '↩️ Вернуться в меню путеводителя',
          callback_data: 'back_to_destinations_menu'
        }]
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...navigationKeyboard
  });
}

// Функция показа меню выбора стран для маршрутов
export function showRoutesMenu(bot, chatId) {
  const message = `
<b>Готовые маршруты и экскурсии</b>

Выберите страну, чтобы посмотреть готовые маршруты и экскурсии
  `;
  
  // Создаем inline-кнопки для каждой страны с маршрутами
  const countryButtons = routesCountries.map(country => [
    {
      text: `${country}`,
      callback_data: `routes_country_${country}`
    }
  ]);
  
  // Добавляем кнопку возврата
  const backButton = [
    {
      text: '↩️ Вернуться в меню путеводителя',
      callback_data: 'back_to_destinations_menu'
    }
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...countryButtons,  // Кнопки стран
        backButton         // Кнопка возврата
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа городов выбранной страны
export function showRoutesCities(bot, chatId, countryName) {
  // Проверяем есть ли маршруты для страны
  if (!routesInfo[countryName]) {
    bot.sendMessage(chatId,
      `✖️ <b>Маршруты не найдены</b>\n\n` +
      `Для страны "${countryName}" пока нет готовых маршрутов.`,
      { parse_mode: 'HTML' }
    );
    return;
  }
  
  const cities = Object.keys(routesInfo[countryName]);
  
  const message = `
Выбрана страна: <b>${countryName}</b>

Выберите город, чтобы чтобы посмотреть готовые маршруты и экскурсии
  `;
  
  // Создаем inline-кнопки для каждого города
  const cityButtons = cities.map(city => [
    {
      text: `${city}`,
      callback_data: `routes_city_${countryName}_${city}`
    }
  ]);
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{
      text: 'Выбрать другую страну',
      callback_data: 'back_to_routes_menu'
    }],
    [{
      text: '↩️ Вернуться в меню путеводителя',
      callback_data: 'back_to_destinations_menu'
    }]
  ];
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...cityButtons,      // Кнопки городов
        ...navigationButtons // Кнопки навигации
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция показа маршрутов и экскурсий для города
export function showCityRoutes(bot, chatId, countryName, cityName) {
  // Проверяем есть ли информация о городе
  if (!routesInfo[countryName] || !routesInfo[countryName][cityName]) {
    bot.sendMessage(chatId,
      `✖️ <b>Информация не найдена</b>\n\n` +
      `Для города "${cityName}" пока нет готовых маршрутов.`,
      { parse_mode: 'HTML' }
    );
    return;
  }
  
  const cityInfo = routesInfo[countryName][cityName];
  
  // Создаем сообщение с маршрутами
  let message = `
<b>${cityName}, ${countryName}</b>

${cityInfo.description}

<b>Готовые маршруты:</b>
  `;
  
  // Добавляем маршруты
  cityInfo.routes.forEach((route, index) => {
    message += `\n<b>Маршрут №${index + 1} "${route.name}"</b>\n`;
    message += `Длительность: ${route.duration}\n`;
    message += `${route.itinerary}\n`;
  });
  
  // Добавляем экскурсии
  message += `\n<b>Экскурсии:</b>\n`;
  
  cityInfo.excursions.forEach((excursion, index) => {
    message += `\n<b>Экскурсия №${index + 1} "${excursion.name}"</b>\n`;
    message += `Длительность${excursion.duration}\n`;
    message += `Описание:${excursion.description}\n`;
  });
  
  message += `\n<i>Для бронирования туров используйте команду /search_trip</i>`;
  
  // Клавиатура для навигации
  const navigationKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Выбрать другой город',
          callback_data: `routes_country_${countryName}`
        }],
        [{
          text: 'Выбрать другую страну',
          callback_data: 'back_to_routes_menu'
        }],
        [{
          text: '↩️ Вернуться в меню путеводителя',
          callback_data: 'back_to_destinations_menu'
        }]
      ]
    }
  };
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...navigationKeyboard
  });
}

export default runServer;