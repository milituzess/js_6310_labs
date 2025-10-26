import { filterTours } from '../src/utils/helpers.js';
import { tours } from '../src/data/tours.js';
import { describe, test, expect } from '@jest/globals';


describe('Helper utilities', () => {
  // Тест для фильтрации по бюджету
  test('filterTours by maxBudget', () => {
    const result = filterTours(tours, { maxBudget: 40000 });
    result.forEach(tour => {
      expect(tour.price).toBeLessThanOrEqual(40000);
    });
    // Проверяем что дорогие туры отфильтровались
    const expensiveTours = tours.filter(t => t.price > 40000);
    expensiveTours.forEach(expensiveTour => {
      expect(result).not.toContain(expensiveTour);
    });
  });

  // Тест для фильтрации по направлению
  test('filterTours by destination', () => {
    const result = filterTours(tours, { destination: 'Турция' });
    result.forEach(tour => {
      expect(tour.destination).toBe('Турция');
    });
    // Проверяем что туры в другие страны отфильтровались
    const otherDestinations = tours.filter(t => t.destination !== 'Турция');
    otherDestinations.forEach(otherTour => {
      expect(result).not.toContain(otherTour);
    });
  });

  // Тест для фильтрации по сезону
  test('filterTours by season', () => {
    const result = filterTours(tours, { season: 'лето' });
    result.forEach(tour => {
      expect(tour.season).toBe('лето');
    });
  });

  // Тест для фильтрации по году
  test('filterTours by year', () => {
    const targetYear = 2026;
    const result = filterTours(tours, { year: targetYear });
    result.forEach(tour => {
      const tourYear = new Date(tour.dates.start).getFullYear();
      expect(tourYear).toBe(targetYear);
    });
  });

  // Тест для фильтрации по месяцу
  test('filterTours by month', () => {
    const targetMonth = 6; // Июнь
    const result = filterTours(tours, { month: targetMonth });
    result.forEach(tour => {
      const tourMonth = new Date(tour.dates.start).getMonth() + 1;
      expect(tourMonth).toBe(targetMonth);
    });
  });

  // Тест для фильтрации по интересу
  test('filterTours by interest', () => {
    const result = filterTours(tours, { interest: 'культура' });
    result.forEach(tour => {
      expect(tour.interests).toContain('культура');
    });
  });

  // Тест для нескольких фильтров одновременно
  test('filterTours by multiple criteria', () => {
    const result = filterTours(tours, { 
      destination: 'Турция',
      maxBudget: 50000,
      season: 'лето'
    });
    
    result.forEach(tour => {
      expect(tour.destination).toBe('Турция');
      expect(tour.price).toBeLessThanOrEqual(50000);
      expect(tour.season).toBe('лето');
    });
  });

  // Тест для неизвестных данных
  test('filterTours with unknown filter/destination/season/month/interest returns 0 tours', () => {
    const result1 = filterTours(tours, { unknownFilter: 'someValue' });
    expect(result1.length).toBe(tours.length);
    const result2 = filterTours(tours, { destination: 'someValue' });
    expect(result2.length).toBe(0);
    const result3 = filterTours(tours, { season: 'someValue' });
    expect(result3.length).toBe(0);
    const result4 = filterTours(tours, { month: 'someValue' });
    expect(result4.length).toBe(0);
    const result5 = filterTours(tours, { interest: 'someValue' });
    expect(result5.length).toBe(0);
    const result6 = filterTours(tours, { interest: 'someValue' });
    expect(result6.length).toBe(0);
  });

  // Тест для большого и маленького года
  test('filterTours with big and small year returns 0 tours', () => {
    const result = filterTours(tours, { year: 3000 });
    expect(result.length).toBe(0);
    const result2 = filterTours(tours, { year: 1 });
    expect(result2.length).toBe(0);
  });

  // Тест для непральных типов данных
  test('filterTours with incorrect data types returns 0 tours', () => {
    const result = filterTours(tours, { year: "2026" });
    expect(result.length).toBe(0);
    const result2 = filterTours(tours, { destination: 123 });
    expect(result2.length).toBe(0);
    const result3 = filterTours(tours, { season: 123 });
    expect(result3.length).toBe(0);
    const result4 = filterTours(tours, { month: 123 });
    expect(result4.length).toBe(0);
    const result5 = filterTours(tours, { interest: 123 });
    expect(result5.length).toBe(0);
    const result6 = filterTours(tours, { interest: 123 });
    expect(result6.length).toBe(0);
  });

  // Тест для пустого фильтра 
  test('filterTours with empty filters returns all tours', () => {
    const result = filterTours(tours, {});
    expect(result.length).toBe(tours.length);
  });

  // Тест для пустой строки
  test('filterTours with empty line returns all tours', () => {
    const result1 = filterTours(tours, { unknownFilter: '' });
    expect(result1.length).toBe(tours.length);
    const result2 = filterTours(tours, { destination: '' });
    expect(result2.length).toBe(tours.length);
    const result3 = filterTours(tours, { season: '' });
    expect(result3.length).toBe(tours.length);
    const result4 = filterTours(tours, { month: '' });
    expect(result4.length).toBe(tours.length);
    const result5 = filterTours(tours, { interest: '' });
    expect(result5.length).toBe(tours.length);
    const result6 = filterTours(tours, { interest: '' });
    expect(result6.length).toBe(tours.length);
  });

  // Тест для фильтра с значением undefined/null
  test('filterTours with undefined values returns all tours', () => {
    const result1 = filterTours(tours, { destination: undefined, season: null });
    expect(result1.length).toBe(tours.length);
    const result2 = filterTours(tours, { maxBudget: undefined });
    expect(result2.length).toBe(tours.length);
    const result3 = filterTours(tours, { maxBudget: null });
    expect(result3.length).toBe(tours.length);
    const result4 = filterTours(tours, { destination: undefined });
    expect(result4.length).toBe(tours.length);
    const result5 = filterTours(tours, { destination: null });
    expect(result5.length).toBe(tours.length);
    const result6 = filterTours(tours, { season: undefined });
    expect(result6.length).toBe(tours.length);
    const result7 = filterTours(tours, { season: null });
    expect(result7.length).toBe(tours.length);
    const result8 = filterTours(tours, { year: undefined });
    expect(result8.length).toBe(tours.length);
    const result9 = filterTours(tours, { year: null });
    expect(result9.length).toBe(tours.length);
    const result10 = filterTours(tours, { month: undefined });
    expect(result10.length).toBe(tours.length);
    const result11 = filterTours(tours, { month: null });
    expect(result11.length).toBe(tours.length);
    const result12 = filterTours(tours, { interest: undefined });
    expect(result12.length).toBe(tours.length);
    const result13 = filterTours(tours, { interest: null });
    expect(result13.length).toBe(tours.length);
  });

  // Тест на точное количество отфильтрованных туров
  test('filterTours returns correct number of tours', () => {
    const turkeyToursCount = tours.filter(t => t.destination === 'Турция').length;
    const result = filterTours(tours, { destination: 'Турция' });
    expect(result.length).toBe(turkeyToursCount);
  });
});