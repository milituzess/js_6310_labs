import { routesInfo } from '../src/data/routes-info.js';
import { describe, test, expect } from '@jest/globals';


describe('Routes data', () => {
  // Тест обязательных полей (страны/города/маршруты и экскурсии)
  test('all countries have cities with routes and excursions', () => {
    Object.values(routesInfo).forEach(country => {
      expect(typeof country).toBe('object');
      
      Object.values(country).forEach(city => {
        expect(city).toHaveProperty('description');
        expect(city).toHaveProperty('routes');
        expect(city).toHaveProperty('excursions');
        
        expect(Array.isArray(city.routes)).toBe(true);
        expect(Array.isArray(city.excursions)).toBe(true);
      });
    });
  });

  // Тест структуры маршрутов (наличие и тип данных)
  test('all routes have required fields', () => {
    Object.values(routesInfo).forEach(country => {
      Object.values(country).forEach(city => {
        city.routes.forEach(route => {
          expect(route).toHaveProperty('name');
          expect(route).toHaveProperty('duration');
          expect(route).toHaveProperty('itinerary');
          
          expect(typeof route.name).toBe('string');
          expect(typeof route.duration).toBe('string');
          expect(typeof route.itinerary).toBe('string');
        });
      });
    });
  });

  // Тест структуры экскурсий (наличие и тип данных)
  test('all excursions have required fields', () => {
    Object.values(routesInfo).forEach(country => {
      Object.values(country).forEach(city => {
        city.excursions.forEach(excursion => {
          expect(excursion).toHaveProperty('name');
          expect(excursion).toHaveProperty('duration');
          expect(excursion).toHaveProperty('description');
          
          expect(typeof excursion.name).toBe('string');
          expect(typeof excursion.duration).toBe('string');
          expect(typeof excursion.description).toBe('string');
        });
      });
    });
  });

  // Тест содержания описаний (достаточно подробные описания)
  test('all descriptions contain meaningful content', () => {
    Object.values(routesInfo).forEach(country => {
      Object.values(country).forEach(city => {
        expect(city.description.length).toBeGreaterThan(20);
        expect(city.description).toMatch(/<b>.*<\/b>/); // HTML форматирование
        
        city.routes.forEach(route => {
          expect(route.name.length).toBeGreaterThan(5);
          expect(route.duration.length).toBeGreaterThan(3);
          expect(route.itinerary.length).toBeGreaterThan(50);
        });
        
        city.excursions.forEach(excursion => {
          expect(excursion.name.length).toBeGreaterThan(5);
          expect(excursion.duration.length).toBeGreaterThan(3);
          expect(excursion.description.length).toBeGreaterThan(20);
        });
      });
    });
  });

  // Тест уникальности названий
  test('all route and excursion names are unique within cities', () => {
    Object.values(routesInfo).forEach(country => {
      Object.values(country).forEach(city => {
        const routeNames = city.routes.map(r => r.name);
        const excursionNames = city.excursions.map(e => e.name);
        
        expect(routeNames.length).toBe([...new Set(routeNames)].length);
        expect(excursionNames.length).toBe([...new Set(excursionNames)].length);
      });
    });
  });

  // Тест формата длительности
  test('all durations have valid format', () => {
    Object.values(routesInfo).forEach(country => {
      Object.values(country).forEach(city => {
        city.routes.forEach(route => {
          expect(route.duration).toMatch(/\d+\s*(день|дня|дней|час|часа|часов)/);
        });
        
        city.excursions.forEach(excursion => {
          expect(excursion.duration).toMatch(/\d+\s*(час|часа|часов)/);
        });
      });
    });
  });

  // Тест наличия активностей
  test('all routes and excursions have specific activities', () => {
    Object.values(routesInfo).forEach(country => {
      Object.values(country).forEach(city => {
        city.routes.forEach(route => {
          expect(route.itinerary).toMatch(/[А-Яа-яA-Za-z]/); // Содержит текст
        });
        
        city.excursions.forEach(excursion => {
          expect(excursion.description).toMatch(/[А-Яа-яA-Za-z]/); // Содержит текст
        });
      });
    });
  });

  // Тест отсутствия пустых данных
  test('no empty or placeholder data', () => {
    Object.values(routesInfo).forEach(country => {
      Object.values(country).forEach(city => {
        expect(city.description).not.toMatch(/TODO|ВСТАВЬТЕ|ОПИСАНИЕ|xxx/i);
        
        city.routes.forEach(route => {
          expect(route.name).not.toMatch(/TODO|ВСТАВЬТЕ/i);
          expect(route.itinerary).not.toMatch(/TODO|ВСТАВЬТЕ/i);
        });
        
        city.excursions.forEach(excursion => {
          expect(excursion.name).not.toMatch(/TODO|ВСТАВЬТЕ/i);
          expect(excursion.description).not.toMatch(/TODO|ВСТАВЬТЕ/i);
        });
      });
    });
  });

  // Тест консистентности формата (единообразное форматирование)
  test('consistent formatting across all data', () => {
    Object.values(routesInfo).forEach(country => {
      Object.values(country).forEach(city => {
        // Проверяем единообразное использование HTML
        expect(city.description).toMatch(/<b>.*<\/b>/);
        
        // Проверяем единообразное оформление маршрутов
        city.routes.forEach(route => {
          expect(route.itinerary).toMatch(/\n•/); // Переносы перед пунктами
        });
      });
    });
  });

  // Тест минимального количества данных (хотя бы один маршрут и экскурсия)
  test('each city has at least one route and one excursion', () => {
    Object.values(routesInfo).forEach(country => {
      Object.values(country).forEach(city => {
        expect(city.routes.length).toBeGreaterThan(0);
        expect(city.excursions.length).toBeGreaterThan(0);
      });
    });
  });
});
