import { tours } from '../src/data/tours.js';
import { describe, test, expect } from '@jest/globals';

describe('Tours data', () => {
  // Тест обязательных полей
  test('all tours have required fields', () => {
    tours.forEach(tour => {
      expect(tour).toHaveProperty('id');
      expect(tour).toHaveProperty('destination');
      expect(tour).toHaveProperty('price');
      expect(tour).toHaveProperty('city');
      expect(tour).toHaveProperty('dates');
      expect(tour.dates).toHaveProperty('start');
      expect(tour.dates).toHaveProperty('end');
      expect(tour.dates).toHaveProperty('duration');
      expect(tour).toHaveProperty('season');
      expect(tour).toHaveProperty('interests');
      expect(tour).toHaveProperty('accommodation');
      expect(tour).toHaveProperty('flight');
      expect(tour).toHaveProperty('description');
      expect(tour).toHaveProperty('rating');
    });
  });

  // Тест типов данных
  test('all tours have correct data types', () => {
    tours.forEach(tour => {
      expect(typeof tour.id).toBe('number');
      expect(typeof tour.destination).toBe('string');
      expect(typeof tour.city).toBe('string');
      expect(typeof tour.price).toBe('number');
      expect(typeof tour.dates.start).toBe('string');
      expect(typeof tour.dates.end).toBe('string');
      expect(typeof tour.dates.duration).toBe('string');
      expect(typeof tour.season).toBe('string');
      expect(Array.isArray(tour.interests)).toBe(true);
      expect(typeof tour.description).toBe('string');
      expect(typeof tour.rating).toBe('number');
    });
  });

  // Тест цен (от 0 до 1000000)
  test('all prices are positive', () => {
    tours.forEach(tour => {
      expect(tour.price).toBeGreaterThan(0);
      expect(tour.price).toBeLessThan(1000000); // разумный максимум
    });
  });

  // Тест дат (дата окончания позже даты начала)
  test('end date is after start date', () => {
    tours.forEach(tour => {
      const start = new Date(tour.dates.start);
      const end = new Date(tour.dates.end);
      expect(end > start).toBe(true);
    });
  });

  // Тест рейтингов (от 0 до 5)
  test('all ratings are valid', () => {
    tours.forEach(tour => {
      expect(tour.rating).toBeGreaterThanOrEqual(0);
      expect(tour.rating).toBeLessThanOrEqual(5);
    });
  });

  // Тест уникальности ID
  test('all tour IDs are unique', () => {
    const ids = tours.map(tour => tour.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  // Тест интересов (не пустые массивы)
  test('all tours have at least one interest', () => {
    tours.forEach(tour => {
      expect(tour.interests.length).toBeGreaterThan(0);
      tour.interests.forEach(interest => {
        expect(typeof interest).toBe('string');
        expect(interest.length).toBeGreaterThan(0);
      });
    });
  });

  // Тест проживания (полные данные об отелях)
  test('all tours have valid accommodation data', () => {
    tours.forEach(tour => {
      expect(tour.accommodation).toHaveProperty('type');
      expect(tour.accommodation).toHaveProperty('name');
      expect(tour.accommodation).toHaveProperty('meals');
      expect(typeof tour.accommodation.type).toBe('string');
      expect(typeof tour.accommodation.name).toBe('string');
      expect(typeof tour.accommodation.meals).toBe('string');
    });
  });

  // Тест перелетов (полные данные о рейсах)
  test('all tours have valid flight data', () => {
    tours.forEach(tour => {
      expect(tour.flight).toHaveProperty('airline');
      expect(tour.flight).toHaveProperty('type');
      expect(tour.flight).toHaveProperty('baggage');
      expect(typeof tour.flight.airline).toBe('string');
      expect(typeof tour.flight.type).toBe('string');
      expect(typeof tour.flight.baggage).toBe('string');
    });
  });

  // Тест формата дат
  test('all dates have valid format', () => {
    tours.forEach(tour => {
      // Проверяем что даты можно распарсить
      const start = new Date(tour.dates.start);
      const end = new Date(tour.dates.end);
      expect(isNaN(start.getTime())).toBe(false);
      expect(isNaN(end.getTime())).toBe(false);
    });
  });

  // Тест сезонов
  test('all seasons are valid', () => {
    const validSeasons = ['весна', 'лето', 'осень', 'зима'];
    tours.forEach(tour => {
      expect(validSeasons).toContain(tour.season);
    });
  });

  // Тест длительности
  test('all durations are valid', () => {
    tours.forEach(tour => {
      expect(tour.dates.duration).toMatch(/\d+\s*(день|дней|дня)/);
    });
  });

});