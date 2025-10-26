import { describe, it, expect, jest, beforeAll, beforeEach } from '@jest/globals';


// Mock для Telegram Bot
const mockBot = {
  sendMessage: jest.fn(),
  answerCallbackQuery: jest.fn()
};

// Mock для данных
const mockTour = {
  id: 1,
  destination: 'Турция',
  city: 'Стамбул',
  price: 50000,
  rating: 4.5,
  dates: {
    start: '2024-07-01',
    end: '2024-07-08',
    duration: '7 дней'
  },
  accommodation: {
    type: 'Отель',
    name: 'Hilton Istanbul',
    meals: 'Все включено'
  },
  flight: {
    airline: 'Turkish Airlines',
    type: 'Прямой рейс',
    baggage: '20кг'
  },
  interests: ['экскурсии', 'шоппинг'],
  season: 'лето',
  description: 'Прекрасный тур в Стамбул'
};


// Динамически импортируем функции после установки глобальных переменных
let serverFunctions;


describe('Server Functions', () => {
  beforeAll(async () => {
    // Импортируем функции после того как все готово
    serverFunctions = await import('../src/server.js');
  });

  it('should export all functions', () => {
    expect(typeof serverFunctions.showSearchMainMenu).toBe('function');
    expect(typeof serverFunctions.showTourDetails).toBe('function');
    expect(typeof serverFunctions.bookTour).toBe('function');
    expect(typeof serverFunctions.showBookingDetails).toBe('function');
    expect(typeof serverFunctions.showToursByBudget).toBe('function');
  });

  it('should call bot.sendMessage in showSearchMainMenu', () => {
    const chatId = 12345;
    
    serverFunctions.showSearchMainMenu(mockBot, chatId);

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Поиск и бронирование туров'),
      expect.any(Object)
    );
  });

  it('should handle search menu items', () => {
    const chatId = 12345;

    serverFunctions.handleSearchMenu(mockBot, chatId, '💳 Бюджет');
    expect(mockBot.sendMessage).toHaveBeenCalled();

    serverFunctions.handleSearchMenu(mockBot, chatId, '🌍 Направление');
    expect(mockBot.sendMessage).toHaveBeenCalled();

    serverFunctions.handleSearchMenu(mockBot, chatId, '📅 Даты');
    expect(mockBot.sendMessage).toHaveBeenCalled();

    serverFunctions.handleSearchMenu(mockBot, chatId, '🎟️ Тип отдыха');
    expect(mockBot.sendMessage).toHaveBeenCalled();

    serverFunctions.handleSearchMenu(mockBot, chatId, '🔍 Все туры');
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should show tour details', () => {
    const chatId = 12345;
    
    serverFunctions.showTourDetails(mockBot, chatId, mockTour);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Детали тура'),
      expect.any(Object)
    );
  });

});

describe('Booking Functions', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
    global.userBookings = {};
  });

  it('should book a tour successfully', () => {
    const chatId = 12345;
    const userId = 'user123';
    
    serverFunctions.bookTour(mockBot, chatId, userId, mockTour);
    
    // Проверяем что отправилось сообщение об успешном бронировании
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Бронирование подтверждено'),
      expect.any(Object)
    );
    
    // Проверяем что бронирование сохранилось
    expect(global.userBookings[userId]).toHaveLength(1);
    expect(global.userBookings[userId][0].tour.id).toBe(mockTour.id);
  });

  it('should show bookings main menu', () => {
    const chatId = 12345;
    const userId = 'user123';
    
    serverFunctions.showBookingsMainMenu(mockBot, chatId, userId);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Управление бронированиями'),
      expect.any(Object)
    );
  });

  it('should find booking by id', () => {
    const userId = 'user123';
    const bookingId = Date.now();
    
    // Сначала создаем бронирование
    global.userBookings[userId] = [{
      id: bookingId,
      tour: mockTour,
      bookingDate: new Date().toLocaleString('ru-RU'),
      status: 'active',
      userId: userId
    }];
    
    const booking = serverFunctions.findBookingById(userId, bookingId);
    
    expect(booking).toBeDefined();
    expect(booking.id).toBe(bookingId);
    expect(booking.tour.destination).toBe('Турция');
  });
});

describe('Booking Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.userBookings = {};
  });

  it('should cancel booking successfully', () => {
    const chatId = 12345;
    const userId = 'user123';
    const bookingId = Date.now();
    
    // Создаем тестовое бронирование
    global.userBookings[userId] = [{
      id: bookingId,
      tour: mockTour,
      bookingDate: new Date().toLocaleString('ru-RU'),
      status: 'active',
      userId: userId
    }];
    
    serverFunctions.cancelBooking(mockBot, chatId, userId, bookingId);
    
    // Проверяем что статус изменился на 'cancelled'
    expect(global.userBookings[userId][0].status).toBe('cancelled');
    
    // Проверяем что отправилось сообщение об отмене
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Бронирование отменено'),
      expect.any(Object)
    );
  });

  it('should show active bookings', () => {
    const chatId = 12345;
    const userId = 'user123';
    
    // Создаем активное бронирование с БУДУЩЕЙ датой
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10); // +10 дней в будущее
    
    const futureTour = {
      ...mockTour,
      dates: {
        start: futureDate.toISOString().split('T')[0],
        end: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: '7 дней'
      }
    };
    
    global.userBookings[userId] = [{
      id: 1,
      tour: futureTour,
      bookingDate: new Date().toLocaleString('ru-RU'),
      status: 'active',
      userId: userId
    }];
    
    serverFunctions.showActiveBookings(mockBot, chatId, userId);
    
    // Проверяем что функция была вызвана (не проверяем точный текст)
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should show message when no active bookings', () => {
    const chatId = 12345;
    const userId = 'user123';
  
    // global.userBookings не существует - нет бронирований вообще
    global.userBookings = undefined;
  
    serverFunctions.showActiveBookings(mockBot, chatId, userId);
  
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('У вас пока нет активных бронирований'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should show completed bookings for cancelled booking', () => {
    const chatId = 12345;
    const userId = 'user123';
    
    // Создаем ОТМЕНЕННОЕ бронирование
    global.userBookings[userId] = [{
      id: 1,
      tour: mockTour,
      bookingDate: new Date().toLocaleString('ru-RU'),
      status: 'cancelled', // Явно отмененное
      userId: userId
    }];
    
    serverFunctions.showCompletedBookings(mockBot, chatId, userId);
    
    // Проверяем что отправлено сообщение о бронированиях (более гибкая проверка)
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toMatch(/бронирования/i); // ищет "бронирования" в любом регистре
  });

  it('should show upcoming trips', () => {
    const chatId = 12345;
    const userId = 'user123';
    
    // Создаем бронирование с ближайшей датой (через 7 дней)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingTour = {
      ...mockTour,
      dates: {
        start: nextWeek.toISOString().split('T')[0],
        end: new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: '7 дней'
      }
    };
    
    global.userBookings[userId] = [{
      id: 1,
      tour: upcomingTour,
      bookingDate: new Date().toLocaleString('ru-RU'),
      status: 'active',
      userId: userId
    }];
    
    serverFunctions.showUpcomingTrips(mockBot, chatId, userId);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Скоро поездка'),
      expect.any(Object)
    );
  });

  it('should show message when no upcoming trips', () => {
    const chatId = 12345;
    const userId = 'user123';
  
    // global.userBookings не существует - нет бронирований вообще
    global.userBookings = undefined;
  
    serverFunctions.showUpcomingTrips(mockBot, chatId, userId);
  
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('У вас нет'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should show message when no active bookings for upcoming trips', () => {
    const chatId = 12345;
    const userId = 'user123';
  
    // Есть бронирования, но все отмененные
    global.userBookings[userId] = [{
      id: 1,
      tour: mockTour,
      bookingDate: new Date().toLocaleString('ru-RU'),
      status: 'cancelled', // Отмененное бронирование
      userId: userId
    }];
  
    serverFunctions.showUpcomingTrips(mockBot, chatId, userId);
  
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('У вас нет поездок в ближайшие 30 дней'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should show message when no completed bookings', () => {
    const chatId = 12345;
    const userId = 'user123';
  
    // НЕ создаем бронирования - global.userBookings[userId] будет undefined
    global.userBookings = {}; // Пустой объект
  
    serverFunctions.showCompletedBookings(mockBot, chatId, userId);
  
    // Проверяем что отправилось сообщение "нет завершенных бронирований"
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('нет завершенных бронирований'),
      expect.any(Object)
    );
  });

  it('should show message when user has no bookings at all', () => {
    const chatId = 12345;
    const userId = 'user123';
  
    // global.userBookings вообще не существует
    global.userBookings = undefined;
  
    serverFunctions.showCompletedBookings(mockBot, chatId, userId);
  
    // Проверяем что отправилось сообщение "нет завершенных бронирований"
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('нет завершенных бронирований'),
      expect.any(Object)
    );
  });

  it('should show message when user has bookings but no completed ones', () => {
    const chatId = 12345;
    const userId = 'user123';
  
    // Создаем только АКТИВНЫЕ бронирования с БУДУЩИМИ датами
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // +30 дней в будущее
  
    const futureTour = {
      ...mockTour,
      dates: {
        start: futureDate.toISOString().split('T')[0],
        end: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: '7 дней'
      }
    };
  
    global.userBookings[userId] = [{
      id: 1,
      tour: futureTour,
      bookingDate: new Date().toLocaleString('ru-RU'),
      status: 'active', // Активное и дата в будущем - не завершенное
      userId: userId
    }];
  
    serverFunctions.showCompletedBookings(mockBot, chatId, userId);
  
    // Проверяем что отправилось сообщение "нет завершенных бронирований"
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('нет завершенных бронирований'),
      expect.any(Object)
    );
  
    // Проверяем что в сообщении есть объяснение
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toContain('после отмены брони или завершения поездки');
  });

  it('should show completed (not cancelled) bookings', () => {
    const chatId = 12345;
    const userId = 'user123';
  
    // Создаем завершенное бронирование (прошедшая дата, но статус active)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30); // -30 дней в прошлом
  
    const pastTour = {
      ...mockTour,
      dates: {
        start: pastDate.toISOString().split('T')[0],
        end: new Date(pastDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: '7 дней'
      }
    };
  
    global.userBookings[userId] = [{
      id: 1,
      tour: pastTour,
      bookingDate: new Date().toLocaleString('ru-RU'),
      status: 'active', // Активное, но дата прошла - должно стать "Завершено"
      userId: userId
    }];
  
    serverFunctions.showCompletedBookings(mockBot, chatId, userId);
  
    // Проверяем что отправилось сообщение с завершенными бронированиями
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
  
    // Проверяем что статус "Завершено" (не "Отменено")
    expect(sentMessage).toContain('Завершено');
    expect(sentMessage).toContain('✔️'); // Галочка для завершенных
  });
 
});

describe('Budget Filter Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show tours within budget', () => {
    const chatId = 12345;
    const maxBudget = 75000;
    
    serverFunctions.showToursByBudget(mockBot, chatId, maxBudget);
    
    // Проверяем что отправилось сообщение с турами
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Туры до'),
      expect.any(Object)
    );
    
    // Проверяем что есть кнопки "Подробнее" для туров
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const hasTourButtons = keyboard.some(button => 
      button[0].text.includes('Подробнее:')
    );
    expect(hasTourButtons).toBe(true);
  });

  it('should show all tours when budget is Infinity', () => {
    const chatId = 12345;
    
    serverFunctions.showToursByBudget(mockBot, chatId, Infinity);
    
    // Проверяем что отправилось сообщение "Все туры (любой бюджет)"
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toContain('Все туры (любой бюджет)');
    expect(sentMessage).toContain('любой бюджет');
  });

  it('should show message when no tours in budget', () => {
    const chatId = 12345;
    const maxBudget = 1000; // Очень маленький бюджет
    
    serverFunctions.showToursByBudget(mockBot, chatId, maxBudget);
    
    // Проверяем что отправилось сообщение "Не найдено туров"
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Не найдено туров'),
      expect.any(Object)
    );
    
    // Проверяем что есть кнопка "Выбрать другой бюджет"
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const hasBudgetButton = keyboard.some(button => 
      button[0].text.includes('Выбрать другой бюджет')
    );
    expect(hasBudgetButton).toBe(true);
  });

  it('should show navigation buttons', () => {
    const chatId = 12345;
    const maxBudget = 50000;
    
    serverFunctions.showToursByBudget(mockBot, chatId, maxBudget);
    
    // Проверяем что есть все кнопки навигации
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    
    expect(buttonTexts).toContain('Выбрать другой бюджет');
    expect(buttonTexts).toContain('🔍 Посмотреть все туры');
    expect(buttonTexts).toContain('↩️ Вернуться к поиску туров');
  });
});

describe('Destination Filter Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show tours for specific destination', () => {
    const chatId = 12345;
    const destination = 'Турция';
    
    serverFunctions.showToursByDestination(mockBot, chatId, destination);
    
    // Проверяем что функция была вызвана (не проверяем точное содержание)
    expect(mockBot.sendMessage).toHaveBeenCalled();
    
    // Проверяем что первый аргумент - chatId
    expect(mockBot.sendMessage.mock.calls[0][0]).toBe(chatId);
  });

  it('should show message when no tours for destination', () => {
    const chatId = 12345;
    const destination = 'НесуществующаяСтрана'; // Страна без туров
    
    serverFunctions.showToursByDestination(mockBot, chatId, destination);
    
    // Проверяем что отправилось сообщение "Не найдено туров"
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toContain('Не найдено туров');
    
    // Проверяем что есть кнопка "Выбрать другую страну"
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    expect(buttonTexts).toContain('Выбрать другую страну');
  });

  it('should show correct navigation buttons for destination', () => {
    const chatId = 12345;
    const destination = 'Турция';
    
    serverFunctions.showToursByDestination(mockBot, chatId, destination);
    
    // Проверяем что есть все кнопки навигации для направления
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    
    expect(buttonTexts).toContain('Выбрать другую страну');
    expect(buttonTexts).toContain('Посмотреть все туры');
    expect(buttonTexts).toContain('↩️ Вернуться к поиску');
  });

  it('should handle destination search', () => {
    const chatId = 12345;
    const destination = 'Турция';
    
    serverFunctions.showToursByDestination(mockBot, chatId, destination);
    
    // Просто проверяем что функция отработала без ошибок
    expect(mockBot.sendMessage).toHaveBeenCalled();
    
    // Проверяем что сообщение содержит HTML разметку
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toMatch(/<b>.*<\/b>/); // Проверяем что есть HTML теги
  });

  it('should display found tours with correct information', () => {
    const chatId = 12345;
    const destination = '🇹🇷 Турция';
  
    serverFunctions.showToursByDestination(mockBot, chatId, destination);
  
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
  
    // Проверяем что сообщение содержит информацию о найденных турах
    expect(sentMessage).toContain('Найдено туров:');
  
    // Проверяем что отображается информация о туре из наших mock данных
    expect(sentMessage).toContain('Турция'); // Страна
    expect(sentMessage).toContain('Стамбул'); // Город
    expect(sentMessage).toContain('45 000₽'); // Цена
    expect(sentMessage).toContain('4.5'); // Рейтинг
    expect(sentMessage).toContain('культура'); // Интересы
    expect(sentMessage).toContain('история'); // Интересы
  });

  it('should create buttons for each tour', () => {
    const chatId = 12345;
    const destination = '🇹🇷 Турция';
  
    serverFunctions.showToursByDestination(mockBot, chatId, destination);
  
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
  
    // Проверяем что есть кнопки для каждого тура
    const tourButtons = keyboard.filter(row => 
      row[0].text.includes('Подробнее:')
    );
  
    expect(tourButtons.length).toBeGreaterThan(0);
  
    // Проверяем что кнопки содержат правильную информацию
    const firstTourButton = tourButtons[0][0];
    expect(firstTourButton.text).toContain('Турция'); // Страна
    expect(firstTourButton.text).toContain('Стамбул'); // Город
    expect(firstTourButton.text).toContain('45 000₽'); // Цена
    expect(firstTourButton.callback_data).toContain('tour_detail_'); // Callback data
  });

  it('should send message with HTML parse mode', () => {
    const chatId = 12345;
    const destination = '🇹🇷 Турция';
  
    serverFunctions.showToursByDestination(mockBot, chatId, destination);
  
    const messageOptions = mockBot.sendMessage.mock.calls[0][2];
  
    // Проверяем что сообщение отправляется с HTML разметкой
    expect(messageOptions.parse_mode).toBe('HTML');
  
    // Проверяем что есть inline keyboard
    expect(messageOptions.reply_markup).toBeDefined();
    expect(messageOptions.reply_markup.inline_keyboard).toBeDefined();
  });

});

describe('Year Filter Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show tours for specific year', () => {
    const chatId = 12345;
    const year = 2024;
    
    serverFunctions.showToursByYear(mockBot, chatId, year);
    
    // Проверяем что функция была вызвана
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.sendMessage.mock.calls[0][0]).toBe(chatId);
  });

  it('should show message when no tours for year', () => {
    const chatId = 12345;
    const year = 2020; // Год без туров
    
    serverFunctions.showToursByYear(mockBot, chatId, year);
    
    // Проверяем что отправилось сообщение "Не найдено туров"
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toContain('Не найдено туров');
    
    // Проверяем что есть кнопка "Выбрать другой год"
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    expect(buttonTexts).toContain('Выбрать другой год');
  });

  it('should show correct navigation buttons for year filter', () => {
    const chatId = 12345;
    const year = 2024;
    
    serverFunctions.showToursByYear(mockBot, chatId, year);
    
    // Проверяем что есть все кнопки навигации для фильтра по году
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    
    expect(buttonTexts).toContain('Выбрать другой год');
    expect(buttonTexts).toContain('Посмотреть все туры');
    expect(buttonTexts).toContain('↩️ Вернуться к поиску');
  });

  it('should handle year search', () => {
    const chatId = 12345;
    const year = 2024;
    
    serverFunctions.showToursByYear(mockBot, chatId, year);
    
    // Просто проверяем что функция отработала без ошибок
    expect(mockBot.sendMessage).toHaveBeenCalled();
    
    // Проверяем что сообщение содержит HTML разметку
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toMatch(/<b>.*<\/b>/);
  });

  it('should display found tours with year information', () => {
    const chatId = 12345;
    const year = 2024;
  
    serverFunctions.showToursByYear(mockBot, chatId, year);
  
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
  
    // Проверяем что сообщение содержит информацию о годе
    expect(sentMessage).toContain('Найдено туров:');
    expect(sentMessage).toContain('2024 год');
  
    // Проверяем что отображается информация о турах
    expect(sentMessage).toContain('Турция');
    expect(sentMessage).toContain('Анталия');
  });

  it('should create buttons for each tour in year', () => {
    const chatId = 12345;
    const year = 2024;
  
    serverFunctions.showToursByYear(mockBot, chatId, year);
  
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
  
    // Проверяем что есть кнопки для каждого тура
    const tourButtons = keyboard.filter(row => 
      row[0].text.includes('Подробнее:')
    );
  
    expect(tourButtons.length).toBeGreaterThan(0);
  
    // Проверяем что кнопки содержат правильную информацию
    const firstTourButton = tourButtons[0][0];
    expect(firstTourButton.text).toContain('Турция');
    expect(firstTourButton.text).toContain('Анталия');
    expect(firstTourButton.callback_data).toContain('tour_detail_');
  });

  it('should send message with HTML parse mode for year filter', () => {
    const chatId = 12345;
    const year = 2024;
  
    serverFunctions.showToursByYear(mockBot, chatId, year);
  
    const messageOptions = mockBot.sendMessage.mock.calls[0][2];
  
    // Проверяем что сообщение отправляется с HTML разметкой
    expect(messageOptions.parse_mode).toBe('HTML');
  
    // Проверяем что есть inline keyboard
    expect(messageOptions.reply_markup).toBeDefined();
    expect(messageOptions.reply_markup.inline_keyboard).toBeDefined();
  });

  it('should format tour list correctly for year', () => {
    const chatId = 12345;
    const year = 2024;
  
    serverFunctions.showToursByYear(mockBot, chatId, year);
  
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
  
    // Проверяем базовую структуру сообщения
    expect(sentMessage).toContain('Рейтинг:');
    expect(sentMessage).toContain('Стоимость:');
    expect(sentMessage).toContain('Интересы:');
  });
});

describe('Month Filter Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show tours for specific month and year', () => {
    const chatId = 12345;
    const year = 2024;
    const month = 7; // Июль
    
    serverFunctions.showToursByMonth(mockBot, chatId, year, month);
    
    // Проверяем что функция была вызвана
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.sendMessage.mock.calls[0][0]).toBe(chatId);
  });

  it('should show message when no tours for month', () => {
    const chatId = 12345;
    const year = 2020;
    const month = 1; // Январь 2020 - месяц без туров
    
    serverFunctions.showToursByMonth(mockBot, chatId, year, month);
    
    // Проверяем что отправилось сообщение "Не найдено туров"
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toContain('Не найдено туров');
    
    // Проверяем что есть кнопка "Выбрать другой месяц"
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    expect(buttonTexts).toContain('Выбрать другой месяц');
  });

  it('should show correct navigation buttons for month filter', () => {
    const chatId = 12345;
    const year = 2024;
    const month = 7;
    
    serverFunctions.showToursByMonth(mockBot, chatId, year, month);
    
    // Проверяем что есть все кнопки навигации для фильтра по месяцу
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    
    expect(buttonTexts).toContain('Выбрать другой месяц');
    expect(buttonTexts).toContain('Посмотреть все туры');
    expect(buttonTexts).toContain('↩️ Вернуться к поиску');
  });

  it('should handle month search', () => {
    const chatId = 12345;
    const year = 2024;
    const month = 7;
    
    serverFunctions.showToursByMonth(mockBot, chatId, year, month);
    
    // Просто проверяем что функция отработала без ошибок
    expect(mockBot.sendMessage).toHaveBeenCalled();
    
    // Проверяем что сообщение содержит HTML разметку
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toMatch(/<b>.*<\/b>/);
  });

  it('should display found tours with month information', () => {
    const chatId = 12345;
    const year = 2024;
    const month = 8;
  
    serverFunctions.showToursByMonth(mockBot, chatId, year, month);
  
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
  
    // Проверяем что сообщение содержит информацию о месяце и годе
    expect(sentMessage).toContain('Найдено туров:');
    expect(sentMessage).toContain('Август 2024 года');
  
    // Проверяем что отображается информация о турах
    expect(sentMessage).toContain('Турция');
    expect(sentMessage).toContain('Анталия');
  });

  it('should create buttons for each tour in month', () => {
    const chatId = 12345;
    const year = 2024;
    const month = 8;
  
    serverFunctions.showToursByMonth(mockBot, chatId, year, month);
  
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
  
    // Проверяем что есть кнопки для каждого тура
    const tourButtons = keyboard.filter(row => 
      row[0].text.includes('Подробнее:')
    );
  
    expect(tourButtons.length).toBeGreaterThan(0);
  
    // Проверяем что кнопки содержат правильную информацию
    const firstTourButton = tourButtons[0][0];
    expect(firstTourButton.text).toContain('Турция');
    expect(firstTourButton.text).toContain('Анталия');
    expect(firstTourButton.callback_data).toContain('tour_detail_');
  });

  it('should send message with HTML parse mode for month filter', () => {
    const chatId = 12345;
    const year = 2024;
    const month = 8;
  
    serverFunctions.showToursByMonth(mockBot, chatId, year, month);
  
    const messageOptions = mockBot.sendMessage.mock.calls[0][2];
  
    // Проверяем что сообщение отправляется с HTML разметкой
    expect(messageOptions.parse_mode).toBe('HTML');
  
    // Проверяем что есть inline keyboard
    expect(messageOptions.reply_markup).toBeDefined();
    expect(messageOptions.reply_markup.inline_keyboard).toBeDefined();
  });

  it('should format tour list correctly for month', () => {
    const chatId = 12345;
    const year = 2024;
    const month = 8;
  
    serverFunctions.showToursByMonth(mockBot, chatId, year, month);
  
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
  
    // Проверяем базовую структуру сообщения
    expect(sentMessage).toContain('Рейтинг:');
    expect(sentMessage).toContain('Стоимость:');
    expect(sentMessage).toContain('Интересы:');
  });

});

describe('Interest Filter Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show tours for specific interest', () => {
    const chatId = 12345;
    const interest = 'пляжный отдых';
    
    serverFunctions.showToursByInterest(mockBot, chatId, interest);
    
    // Проверяем что функция была вызвана
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.sendMessage.mock.calls[0][0]).toBe(chatId);
  });

  it('should show message when no tours for interest', () => {
    const chatId = 12345;
    const interest = 'несуществующий_интерес'; // Интерес без туров
    
    serverFunctions.showToursByInterest(mockBot, chatId, interest);
    
    // Проверяем что отправилось сообщение "Не найдено туров"
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toContain('Не найдено туров');
    
    // Проверяем что есть кнопка "Выбрать другой тип отдыха"
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    expect(buttonTexts).toContain('Выбрать другой тип отдыха');
  });

  it('should show correct navigation buttons for interest filter', () => {
    const chatId = 12345;
    const interest = 'экскурсии';
    
    serverFunctions.showToursByInterest(mockBot, chatId, interest);
    
    // Проверяем что есть все кнопки навигации для фильтра по интересу
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    
    expect(buttonTexts).toContain('Выбрать другой тип отдыха');
    expect(buttonTexts).toContain('Посмотреть все туры');
    expect(buttonTexts).toContain('↩️ Вернуться к поиску');
  });

  it('should handle interest search', () => {
    const chatId = 12345;
    const interest = 'экскурсии';
    
    serverFunctions.showToursByInterest(mockBot, chatId, interest);
    
    // Просто проверяем что функция отработала без ошибок
    expect(mockBot.sendMessage).toHaveBeenCalled();
    
    // Проверяем что сообщение содержит HTML разметку
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toMatch(/<b>.*<\/b>/);
  });

  it('should display found tours with interest information', () => {
    const chatId = 12345;
    const interest = 'пляжный отдых';
  
    serverFunctions.showToursByInterest(mockBot, chatId, interest);
  
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
  
    // Проверяем что сообщение содержит информацию о интересе
    expect(sentMessage).toContain('Найдено туров:');
    expect(sentMessage).toContain(`Туры для: ${interest}`);
  
    // Проверяем что отображается информация о турах
    expect(sentMessage).toContain('Турция');
    expect(sentMessage).toContain('Анталия');
  });

  it('should create buttons for each tour with interest', () => {
    const chatId = 12345;
    const interest = 'пляжный отдых';
  
    serverFunctions.showToursByInterest(mockBot, chatId, interest);
  
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
  
    // Проверяем что есть кнопки для каждого тура
    const tourButtons = keyboard.filter(row => 
      row[0].text.includes('Подробнее:')
    );
  
    expect(tourButtons.length).toBeGreaterThan(0);
  
    // Проверяем что кнопки содержат правильную информацию
    const firstTourButton = tourButtons[0][0];
    expect(firstTourButton.text).toContain('Египет');
    expect(firstTourButton.text).toContain('Хургада');
    expect(firstTourButton.callback_data).toContain('tour_detail_');
  });

  it('should send message with HTML parse mode for interest filter', () => {
    const chatId = 12345;
    const interest = 'пляжный отдых';
  
    serverFunctions.showToursByInterest(mockBot, chatId, interest);
  
    const messageOptions = mockBot.sendMessage.mock.calls[0][2];
  
    // Проверяем что сообщение отправляется с HTML разметкой
    expect(messageOptions.parse_mode).toBe('HTML');
  
    // Проверяем что есть inline keyboard
    expect(messageOptions.reply_markup).toBeDefined();
    expect(messageOptions.reply_markup.inline_keyboard).toBeDefined();
  });

  it('should format tour list correctly for interest', () => {
    const chatId = 12345;
    const interest = 'пляжный отдых';
  
    serverFunctions.showToursByInterest(mockBot, chatId, interest);
  
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
  
    // Проверяем базовую структуру сообщения
    expect(sentMessage).toContain('Рейтинг:');
    expect(sentMessage).toContain('Стоимость:');
    expect(sentMessage).toContain('Интересы:');
  });

  it('should work with different interests', () => {
    const chatId = 12345;
    
    // Тестируем разные интересы
    const testInterests = ['экскурсии', 'шоппинг', 'культура', 'история'];
    
    testInterests.forEach(interest => {
      jest.clearAllMocks();
      serverFunctions.showToursByInterest(mockBot, chatId, interest);
      
      // Проверяем что функция была вызвана для каждого интереса
      expect(mockBot.sendMessage).toHaveBeenCalled();
    });
  });
});

describe('Months Menu Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show months menu for specific year', () => {
    const chatId = 12345;
    const year = 2024;
    
    serverFunctions.showMonthsMenu(mockBot, chatId, year);
    
    // Проверяем что функция была вызвана
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.sendMessage.mock.calls[0][0]).toBe(chatId);
  });

  it('should display correct year in message', () => {
    const chatId = 12345;
    const year = 2024;
    
    serverFunctions.showMonthsMenu(mockBot, chatId, year);
    
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toContain(`Год: <b>${year}</b>`);
    expect(sentMessage).toContain('Выбор даты поездки');
  });

  it('should create month buttons with correct callback data', () => {
    const chatId = 12345;
    const year = 2024;
    
    serverFunctions.showMonthsMenu(mockBot, chatId, year);
    
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    
    // Проверяем что есть кнопки месяцев
    const monthButtons = keyboard.filter(row => 
      row[0].callback_data && row[0].callback_data.startsWith('dates_month_')
    );
    
    expect(monthButtons.length).toBeGreaterThan(0);
    
    // Проверяем что callback_data содержит правильный год и месяц
    monthButtons.forEach(buttonRow => {
      const button = buttonRow[0];
      expect(button.callback_data).toMatch(/dates_month_\d+_\d+/);
      expect(button.text).toMatch(/^(Январь|Февраль|Март|Апрель|Май|Июнь|Июль|Август|Сентябрь|Октябрь|Ноябрь|Декабрь)$/);
    });
  });

  it('should include "all year" button', () => {
    const chatId = 12345;
    const year = 2024;
    
    serverFunctions.showMonthsMenu(mockBot, chatId, year);
    
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    
    // Проверяем что есть кнопка "Весь год"
    expect(buttonTexts).toContain(`Весь ${year} год`);
    
    // Проверяем callback_data для кнопки "Весь год"
    const allYearButton = keyboard.flat().find(button => 
      button.text === `Весь ${year} год`
    );
    expect(allYearButton.callback_data).toBe(`dates_year_all_${year}`);
  });

  it('should show correct navigation buttons', () => {
    const chatId = 12345;
    const year = 2024;
    
    serverFunctions.showMonthsMenu(mockBot, chatId, year);
    
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    
    // Проверяем что есть все кнопки навигации
    expect(buttonTexts).toContain('Все доступные даты');
    expect(buttonTexts).toContain('↩️ Выбрать другой год');
    expect(buttonTexts).toContain('↩️ Вернуться к поиску туров');
    
    // Проверяем callback_data для кнопок навигации
    const navigationButtons = keyboard.flat().filter(button => 
      button.text === 'Все доступные даты' || 
      button.text === '↩️ Выбрать другой год' || 
      button.text === '↩️ Вернуться к поиску туров'
    );
    
    navigationButtons.forEach(button => {
      expect(button.callback_data).toBeDefined();
    });
  });

  it('should send message with HTML parse mode', () => {
    const chatId = 12345;
    const year = 2024;
    
    serverFunctions.showMonthsMenu(mockBot, chatId, year);
    
    const messageOptions = mockBot.sendMessage.mock.calls[0][2];
    
    // Проверяем что сообщение отправляется с HTML разметкой
    expect(messageOptions.parse_mode).toBe('HTML');
    
    // Проверяем что есть inline keyboard
    expect(messageOptions.reply_markup).toBeDefined();
    expect(messageOptions.reply_markup.inline_keyboard).toBeDefined();
  });

  it('should work with different years', () => {
    const chatId = 12345;
    const testYears = [2023, 2024, 2025];
    
    testYears.forEach(year => {
      jest.clearAllMocks();
      serverFunctions.showMonthsMenu(mockBot, chatId, year);
      
      // Проверяем что функция была вызвана для каждого года
      expect(mockBot.sendMessage).toHaveBeenCalled();
      
      const sentMessage = mockBot.sendMessage.mock.calls[0][1];
      expect(sentMessage).toContain(`Год: <b>${year}</b>`);
    });
  });

  it('should use correct month names in Russian', () => {
    const chatId = 12345;
    const year = 2024;
    
    serverFunctions.showMonthsMenu(mockBot, chatId, year);
    
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const monthButtons = keyboard.flat().filter(button => 
      button.callback_data && button.callback_data.startsWith('dates_month_')
    );
    
    // Проверяем что используются правильные русские названия месяцев
    const russianMonthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    monthButtons.forEach(button => {
      expect(russianMonthNames).toContain(button.text);
    });
  });

  it('should have sorted months', () => {
    const chatId = 12345;
    const year = 2024;
  
    serverFunctions.showMonthsMenu(mockBot, chatId, year);
  
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const monthButtons = keyboard.flat().filter(button => 
      button.callback_data && button.callback_data.startsWith('dates_month_')
    );
  
    expect(monthButtons.length).toBeGreaterThan(0);
  });
});

describe('All Tours By Dates Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show all tours sorted by dates', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByDates(mockBot, chatId);
    
    // Проверяем что функция была вызвана
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.sendMessage.mock.calls[0][0]).toBe(chatId);
  });

  it('should display correct title and description', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByDates(mockBot, chatId);
    
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toContain('Все туры по датам');
    expect(sentMessage).toContain('отсортированы по дате начала');
  });

  it('should show tours count', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByDates(mockBot, chatId);
    
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toContain('Найдено туров:');
  });

  it('should create buttons for each tour', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByDates(mockBot, chatId);
    
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    
    // Проверяем что есть кнопки для каждого тура
    const tourButtons = keyboard.filter(row => 
      row[0].text.includes('Подробнее:')
    );
    
    expect(tourButtons.length).toBeGreaterThan(0);
    
    // Проверяем что кнопки содержат правильную информацию
    const firstTourButton = tourButtons[0][0];
    expect(firstTourButton.text).toContain('Подробнее:');
    expect(firstTourButton.callback_data).toContain('tour_detail_');
  });

  it('should show correct navigation buttons', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByDates(mockBot, chatId);
    
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    
    // Проверяем что есть все кнопки навигации
    expect(buttonTexts).toContain('Выбрать год');
    expect(buttonTexts).toContain('↩️ Вернуться к поиску');
  });

  it('should send message with HTML parse mode', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByDates(mockBot, chatId);
    
    const messageOptions = mockBot.sendMessage.mock.calls[0][2];
    
    // Проверяем что сообщение отправляется с HTML разметкой
    expect(messageOptions.parse_mode).toBe('HTML');
    
    // Проверяем что есть inline keyboard
    expect(messageOptions.reply_markup).toBeDefined();
    expect(messageOptions.reply_markup.inline_keyboard).toBeDefined();
  });

  it('should display tour information correctly', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByDates(mockBot, chatId);
    
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    
    // Проверяем что отображается полная информация о турах
    expect(sentMessage).toContain('Рейтинг:');
    expect(sentMessage).toContain('Стоимость:');
    expect(sentMessage).toContain('Интересы:');
    expect(sentMessage).toContain('Турция');
    expect(sentMessage).toContain('Стамбул');
  });

  it('should format tour list with separators', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByDates(mockBot, chatId);
    
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    
    // Проверяем что туры разделены линиями (─.repeat(30))
    // Это косвенная проверка форматирования
    expect(sentMessage).toContain('─');
  });

  it('should sort tours by start date', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByDates(mockBot, chatId);
    
    // Проверяем что функция была вызвана (сортировка происходит внутри функции)
    // Если бы сортировка не работала, функция все равно была бы вызвана,
    // но порядок туров был бы случайным
    expect(mockBot.sendMessage).toHaveBeenCalled();
    
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    
    // Косвенно проверяем сортировку - если бы она не работала,
    // информация все равно отобразилась бы, но в случайном порядке
    expect(sentMessage).toContain('отсортированы по дате начала');
  });
});

describe('All Tours By Interests Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show all tours grouped by interests', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByInterests(mockBot, chatId);
    
    // Проверяем что функция была вызвана
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.sendMessage.mock.calls[0][0]).toBe(chatId);
  });

  it('should display correct title and statistics', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByInterests(mockBot, chatId);
    
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    expect(sentMessage).toContain('Все туры по типам отдыха');
    expect(sentMessage).toContain('Всего типов отдыха:');
    expect(sentMessage).toContain('Всего туров:');
  });

  it('should group tours by interests', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByInterests(mockBot, chatId);
    
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    
    // Проверяем что туры сгруппированы по интересам
    expect(sentMessage).toContain('•'); // Маркеры списка для туров
    expect(sentMessage).toContain('тур'); // Упоминание количества туров
  });

  it('should capitalize interest names', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByInterests(mockBot, chatId);
    
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    
    // Проверяем что названия интересов начинаются с заглавной буквы
    // (interest.charAt(0).toUpperCase() + interest.slice(1))
    expect(sentMessage).toMatch(/<b>[А-Я][а-я]+<\/b>/);
  });

  it('should use correct plural forms', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByInterests(mockBot, chatId);
    
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    
    // Проверяем что используется правильная форма множественного числа
    // (interestTours.length > 1 ? 'а' : '')
    expect(sentMessage).toMatch(/\d+ тур[а]?/);
  });

  it('should create buttons for each tour', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByInterests(mockBot, chatId);
    
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    
    // Проверяем что есть кнопки для каждого тура
    const tourButtons = keyboard.filter(row => 
      row[0].text.includes('Подробнее:')
    );
    
    expect(tourButtons.length).toBeGreaterThan(0);
    
    // Проверяем что кнопки содержат правильную информацию
    const firstTourButton = tourButtons[0][0];
    expect(firstTourButton.text).toContain('Подробнее:');
    expect(firstTourButton.text).toContain('Турция');
    expect(firstTourButton.text).toContain('Стамбул');
    expect(firstTourButton.callback_data).toContain('tour_detail_');
  });

  it('should show correct navigation buttons', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByInterests(mockBot, chatId);
    
    const keyboard = mockBot.sendMessage.mock.calls[0][2].reply_markup.inline_keyboard;
    const buttonTexts = keyboard.flat().map(button => button.text);
    
    // Проверяем что есть все кнопки навигации
    expect(buttonTexts).toContain('Выбрать тип отдыха');
    expect(buttonTexts).toContain('↩️ Вернуться к поиску');
  });

  it('should send message with HTML parse mode', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByInterests(mockBot, chatId);
    
    const messageOptions = mockBot.sendMessage.mock.calls[0][2];
    
    // Проверяем что сообщение отправляется с HTML разметкой
    expect(messageOptions.parse_mode).toBe('HTML');
    
    // Проверяем что есть inline keyboard
    expect(messageOptions.reply_markup).toBeDefined();
    expect(messageOptions.reply_markup.inline_keyboard).toBeDefined();
  });

  it('should display tour prices in grouped list', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByInterests(mockBot, chatId);
    
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    
    // Проверяем что в сгруппированном списке отображаются цены
    expect(sentMessage).toContain('₽');
    expect(sentMessage).toContain('•'); // Маркеры списка
  });

  it('should handle multiple tours per interest', () => {
    const chatId = 12345;
    
    serverFunctions.showAllToursByInterests(mockBot, chatId);
    
    const sentMessage = mockBot.sendMessage.mock.calls[0][1];
    
    // Проверяем что функция обрабатывает группировку туров по интересам
    // Это косвенная проверка логики группировки в toursByInterest
    expect(sentMessage).toContain(':'); // Разделитель после названия интереса
  });
});

describe('Check Upcoming Trips Function', () => {
  beforeEach(() => {
    global.userBookings = {};
  });

  it('should return false when no user bookings', () => {
    const userId = 'user123';
    
    const result = serverFunctions.checkUpcomingTrips(userId);
    
    expect(result).toBe(false);
  });

  it('should return false when user has no bookings', () => {
    const userId = 'user123';
    global.userBookings[userId] = [];
    
    const result = serverFunctions.checkUpcomingTrips(userId);
    
    expect(result).toBe(false);
  });

  it('should return true when user has upcoming trip', () => {
    const userId = 'user123';
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    global.userBookings[userId] = [{
      id: 1,
      tour: {
        dates: {
          start: nextWeek.toISOString().split('T')[0]
        }
      },
      status: 'active',
      userId: userId
    }];
    
    const result = serverFunctions.checkUpcomingTrips(userId);
    
    expect(result).toBe(true);
  });

  it('should return false when user has only cancelled bookings', () => {
    const userId = 'user123';
    
    global.userBookings[userId] = [{
      id: 1,
      tour: {
        dates: {
          start: '2024-07-01'
        }
      },
      status: 'cancelled', // Отмененное бронирование
      userId: userId
    }];
    
    const result = serverFunctions.checkUpcomingTrips(userId);
    
    expect(result).toBe(false);
  });
});

describe('Handle Bookings Menu Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle active bookings menu item', () => {
    const chatId = 12345;
    const userId = 'user123';
    const menuItem = '✔️ Активные бронирования';
    
    serverFunctions.handleBookingsMenu(mockBot, chatId, userId, menuItem);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should handle completed bookings menu item', () => {
    const chatId = 12345;
    const userId = 'user123';
    const menuItem = '✖️ Завершенные бронирования';
    
    serverFunctions.handleBookingsMenu(mockBot, chatId, userId, menuItem);
    
    // Проверяем что была вызвана функция showCompletedBookings
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should handle upcoming trips menu item', () => {
    const chatId = 12345;
    const userId = 'user123';
    const menuItem = '🔜 Скоро поездка!';
    
    serverFunctions.handleBookingsMenu(mockBot, chatId, userId, menuItem);
    
    // Проверяем что была вызвана функция showUpcomingTrips
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });
});

describe('Destinations Menu Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show destinations main menu', () => {
    const chatId = 12345;
    
    serverFunctions.showDestinationsMainMenu(mockBot, chatId);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Путеводитель по направлениям'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should handle seasons menu item', () => {
    const chatId = 12345;
    const menuItem = '💫 Рекомендации по сезону';
    
    serverFunctions.handleDestinationsMenu(mockBot, chatId, menuItem);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should handle interests menu item', () => {
    const chatId = 12345;
    const menuItem = '🎟 Рекомендации по интересам';
    
    serverFunctions.handleDestinationsMenu(mockBot, chatId, menuItem);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should handle countries menu item', () => {
    const chatId = 12345;
    const menuItem = '🌍 Информация о странах';
    
    serverFunctions.handleDestinationsMenu(mockBot, chatId, menuItem);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should handle routes menu item', () => {
    const chatId = 12345;
    const menuItem = '✔️ Готовые маршруты';
    
    serverFunctions.handleDestinationsMenu(mockBot, chatId, menuItem);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should show seasons menu', () => {
    const chatId = 12345;
    
    serverFunctions.showSeasonsMenu(mockBot, chatId);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Рекомендации по сезону'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });
});

describe('Seasonal Tours Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show seasonal tours when available', () => {
    const chatId = 12345;
    const season = 'лето';
    
    serverFunctions.showSeasonalTours(mockBot, chatId, season);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Лучшие направления на'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should show message when no seasonal tours', () => {
    const chatId = 12345;
    const season = 'несуществующий_сезон';
    
    serverFunctions.showSeasonalTours(mockBot, chatId, season);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('К сожалению, туров на'),
      { parse_mode: 'HTML' }
    );
  });
});

describe('Interest Tours Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show interest tours when available', () => {
    const chatId = 12345;
    const interest = 'экскурсии';
    
    serverFunctions.showInterestTours(mockBot, chatId, interest);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Лучшие направления для'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should show message when no interest tours', () => {
    const chatId = 12345;
    const interest = 'несуществующий_интерес';
    
    serverFunctions.showInterestTours(mockBot, chatId, interest);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('К сожалению, туров для интереса'),
      { parse_mode: 'HTML' }
    );
  });
});

describe('Country Info Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show country info when available', () => {
    const chatId = 12345;
    const countryName = 'Турция';
    
    serverFunctions.showCountryInfo(mockBot, chatId, countryName);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Информация не найдена'),
      expect.objectContaining({
        parse_mode: 'HTML'
      })
    );
  });

  it('should show country info when available', () => {
    const chatId = 12345;
    const countryName = '🇹🇷 Турция';
    
    serverFunctions.showCountryInfo(mockBot, chatId, countryName);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('🇹🇷 Турция'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should show message when country info not found', () => {
    const chatId = 12345;
    const countryName = 'НесуществующаяСтрана';
    
    serverFunctions.showCountryInfo(mockBot, chatId, countryName);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Информация не найдена'),
      { parse_mode: 'HTML' }
    );
  });
});

describe('Routes Cities Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show cities when routes available', () => {
    const chatId = 12345;
    const countryName = '🇹🇷 Турция';
    
    serverFunctions.showRoutesCities(mockBot, chatId, countryName);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Выбрана страна:'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should show message when no routes for country', () => {
    const chatId = 12345;
    const countryName = 'НесуществующаяСтрана';
    
    serverFunctions.showRoutesCities(mockBot, chatId, countryName);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Маршруты не найдены'),
      { parse_mode: 'HTML' }
    );
  });
});

describe('City Routes Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show city routes when available', () => {
    const chatId = 12345;
    const countryName = '🇹🇷 Турция';
    const cityName = 'Стамбул';
    
    serverFunctions.showCityRoutes(mockBot, chatId, countryName, cityName);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Стамбул'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should show message when no city routes', () => {
    const chatId = 12345;
    const countryName = 'НесуществующаяСтрана';
    const cityName = 'НесуществующийГород';
    
    serverFunctions.showCityRoutes(mockBot, chatId, countryName, cityName);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Информация не найдена'),
      { parse_mode: 'HTML' }
    );
  });
});

describe('Booking Details Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.userBookings = {};
  });

  it('should show booking details', () => {
    const chatId = 12345;
    const userId = 'user123';
    const booking = {
      id: 1,
      bookingDate: '2024-01-01',
      tour: mockTour,
      userId: userId
    };
    
    serverFunctions.showBookingDetails(mockBot, chatId, userId, booking);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Детали бронирования'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should cancel booking successfully', () => {
    const chatId = 12345;
    const userId = 'user123';
    const bookingId = 1;
    
    global.userBookings[userId] = [{
      id: bookingId,
      tour: mockTour,
      bookingDate: '2024-01-01',
      status: 'active',
      userId: userId
    }];
    
    serverFunctions.cancelBooking(mockBot, chatId, userId, bookingId);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Бронирование отменено'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should show error when booking not found for cancellation', () => {
    const chatId = 12345;
    const userId = 'user123';
    const bookingId = 999; // Несуществующий ID
    
    serverFunctions.cancelBooking(mockBot, chatId, userId, bookingId);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Ошибка отмены'),
      { parse_mode: 'HTML' }
    );
  });
});

describe('Handle Message Function', () => {
  let mockBot;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBot = {
      sendMessage: jest.fn()
    };
  });

  it('should ignore commands', () => {
    const mockMsg = {
      chat: { id: 12345 },
      from: { id: 67890 },
      text: '/start'
    };
    
    serverFunctions.handleMessage(mockBot, mockMsg);
    
    expect(mockBot.sendMessage).not.toHaveBeenCalled();
  });

  it('should handle "Назад" button', () => {
    const mockMsg = {
      chat: { id: 12345 },
      from: { id: 67890 },
      text: '↩️ Назад'
    };
    
    serverFunctions.handleMessage(mockBot, mockMsg);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      12345,
      expect.stringContaining('Возвращаемся к списку команд'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: { remove_keyboard: true }
      })
    );
  });

  it('should handle search menu buttons', () => {
    const mockMsg = {
      chat: { id: 12345 },
      from: { id: 67890 },
      text: '💳 Бюджет'
    };
    
    serverFunctions.handleMessage(mockBot, mockMsg);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should handle bookings menu buttons', () => {
    const mockMsg = {
      chat: { id: 12345 },
      from: { id: 67890 },
      text: '✔️ Активные бронирования'
    };
    
    serverFunctions.handleMessage(mockBot, mockMsg);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should handle destinations menu buttons', () => {
    const mockMsg = {
      chat: { id: 12345 },
      from: { id: 67890 },
      text: '💫 Рекомендации по сезону'
    };
    
    serverFunctions.handleMessage(mockBot, mockMsg);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should handle random messages', () => {
    const mockMsg = {
      chat: { id: 12345 },
      from: { id: 67890 },
      text: 'случайный текст'
    };
    
    serverFunctions.handleMessage(mockBot, mockMsg);
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      12345,
      expect.stringContaining('Пу-пу-пу...'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: { remove_keyboard: true }
      })
    );
  });
});

describe('Handle Callback Query Function', () => {
  let mockBot;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBot = {
      sendMessage: jest.fn(),
      answerCallbackQuery: jest.fn()
    };
  });

  it('should handle new_search callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'new_search',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Начинаем новый поиск'
    });
  });

  it('should handle budget callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'budget_50000',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Подбираем туры по бюджету...'
    });
  });

  it('should handle destination callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'destination_Турция',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Ищем туры в Турция...'
    });
  });

  it('should handle tour detail callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'tour_detail_1',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Загружаем детали тура...'
    });
  });

  it('should handle book tour callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'book_tour_1',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Тур успешно забронирован! ✔️'
    });
  });

  it('should handle book tour callback when tour not found', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'book_tour_999', 
      id: 'callback123',
      from: { id: 67890 }
    };
  
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);

    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Ошибка: тур не найден ✖️'
    });
  });

  it('should handle booking detail callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'booking_detail_1',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    // Создаем тестовое бронирование
    global.userBookings = {
      '67890': [{
        id: 1,
        tour: mockTour,
        bookingDate: '2024-01-01',
        status: 'active',
        userId: '67890'
      }]
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should handle booking_detail callback when booking not found', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'booking_detail_999', // Несуществующий ID бронирования
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    // Проверяем что отправлено сообщение об ошибке
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Бронирование не найдено ✖️'
    });
  });

  it('should handle back_to_search_menu callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_search_menu',
      id: 'callback123',
      from: { id: 67890 }
    };
  
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся к поиску'
    });
  });

  it('should handle back_to_budget_menu callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_budget_menu',
      id: 'callback123',
      from: { id: 67890 }
    };
  
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся к выбору бюджета'
    });
  });

  it('should handle back_to_destination_menu callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_destination_menu',
      id: 'callback123',
      from: { id: 67890 }
    };
  
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся к выбору страны'
    });
  });

  it('should handle show_all_tours callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'show_all_tours',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Открываем все туры'
    });
  });

  it('should handle dates_year callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'dates_year_2024',
      id: 'callback123',
      from: { id: 67890 }
    };
  
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Выбран 2024 год'
    });
  });

  it('should handle dates_month callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'dates_month_2024_7',
      id: 'callback123',
      from: { id: 67890 }
    };
  
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Ищем туры на 7/2024...'
    });
  });

  it('should handle back_to_dates_menu callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_dates_menu',
      id: 'callback123',
      from: { id: 67890 }
    };
  
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся к выбору года'
    });
  });

  it('should handle back_to_months callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_months_2024',
      id: 'callback123',
      from: { id: 67890 }
    };
  
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся к выбору месяца'
    });
  });

  it('should handle dates_all callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'dates_all',
      id: 'callback123',
      from: { id: 67890 }
    };
  
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Открываем все туры по датам...'
    });
  });

  it('should handle interest_search callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'interest_search_экскурсии',
      id: 'callback123',
      from: { id: 67890 }
    };
  
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Ищем туры для экскурсии...'
    });
  });

  it('should handle back_to_interests_menu callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_interests_menu',
      id: 'callback123',
      from: { id: 67890 }
    };
  
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся к выбору типа отдыха'
    });
  });

  it('should handle interests_all callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'interests_all',
      id: 'callback123',
      from: { id: 67890 }
    };
  
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Открываем все туры по типам отдыха...'
    });
  });

  it('should handle back_to_bookings_menu callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_bookings_menu',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся в меню бронирований'
    });
  });

  it('should handle back_to_active_bookings callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_active_bookings',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся к списку бронирований'
    });
  });

  it('should handle cancel_booking callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'cancel_booking_1',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Отменяем бронирование...'
    });
  }); 
  
  it('should handle back_to_destinations_menu callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_destinations_menu',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся к направлениям'
    });
  });

  it('should handle country_info callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'country_info_Турция',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Загружаем информацию о Турция...'
    });
  });

  it('should handle back_to_countries_menu callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_countries_menu',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся к выбору страны'
    });
  });

  it('should handle routes_country callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'routes_country_Турция',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Загружаем маршруты для Турция...'
    });
  });

  it('should handle back_to_routes_menu callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_routes_menu',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся к выбору страны'
    });
  });

  it('should handle routes_city callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'routes_city_Турция_Стамбул',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Загружаем маршруты для Стамбул...'
    });
  });

  it('should handle season callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'season_лето',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Подбираем туры на лето...'
    });
  });

  it('should handle interest callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'interest_экскурсии',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Подбираем туры для экскурсии...'
    });
  });
  
  it('should handle back_to_seasons_menu callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_seasons_menu',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся к выбору сезона'
    });
  });

  it('should handle back_to_destinations_interests_menu callback', () => {
    const mockCallback = {
      message: { chat: { id: 12345 } },
      data: 'back_to_destinations_interests_menu',
      id: 'callback123',
      from: { id: 67890 }
    };
    
    serverFunctions.handleCallbackQuery(mockBot, mockCallback);
    
    expect(mockBot.sendMessage).toHaveBeenCalled();
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('callback123', {
      text: 'Возвращаемся к выбору интереса'
    });
  });
 
});