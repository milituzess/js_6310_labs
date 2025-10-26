import { countriesInfo } from '../src/data/countries-info.js';
import { describe, test, expect } from '@jest/globals';

describe('Countries data', () => {
  // Тест обязательных полей
  test('all countries have required info sections', () => {
    Object.values(countriesInfo).forEach(country => {
      expect(country).toHaveProperty('visa');
      expect(country).toHaveProperty('climate');
      expect(country).toHaveProperty('currency');
      expect(country).toHaveProperty('language');
      expect(country).toHaveProperty('culture');
    });
  });

  // Тест типов данных
  test('all info sections have correct data types', () => {
    Object.values(countriesInfo).forEach(country => {
      expect(typeof country.visa).toBe('string');
      expect(typeof country.climate).toBe('string');
      expect(typeof country.currency).toBe('string');
      expect(typeof country.language).toBe('string');
      expect(typeof country.culture).toBe('string');
    });
  });

  // Тест содержания информации (достаточно подробные)
  test('all info sections contain meaningful content', () => {
    Object.values(countriesInfo).forEach(country => {
      expect(country.visa.length).toBeGreaterThan(20);
      expect(country.climate.length).toBeGreaterThan(20);
      expect(country.currency.length).toBeGreaterThan(20);
      expect(country.language.length).toBeGreaterThan(20);
      expect(country.culture.length).toBeGreaterThan(20);
    });
  });

  // Тест формата HTML в описаниях (корректное использование тегов)
  test('info sections contain valid HTML formatting', () => {
    Object.values(countriesInfo).forEach(country => {
      expect(country.visa).toMatch(/<b>.*<\/b>/);
      expect(country.climate).toMatch(/<b>.*<\/b>/);
      expect(country.currency).toMatch(/<b>.*<\/b>/);
      expect(country.language).toMatch(/<b>.*<\/b>/);
      expect(country.culture).toMatch(/<b>.*<\/b>/);
    });
  });

  // Тест структуры списков (оформление маркированных списков)
  test('info sections have proper list formatting', () => {
    Object.values(countriesInfo).forEach(country => {
      expect(country.visa).toMatch(/•/);
      expect(country.climate).toMatch(/•/);
      expect(country.currency).toMatch(/•/);
      expect(country.language).toMatch(/•/);
      expect(country.culture).toMatch(/•/);
    });
  });

  // Тест уникальности стран
  test('all country names are unique', () => {
    const countryNames = Object.keys(countriesInfo);
    const uniqueNames = [...new Set(countryNames)];
    expect(countryNames.length).toBe(uniqueNames.length);
  });

  // Тест формата названий стран (эмодзи + текст)
  test('country names have proper format with emoji', () => {
    Object.keys(countriesInfo).forEach(countryName => {
      expect(countryName).toMatch(/🇹🇷|🇪🇬|🇮🇹|🇪🇸|🇬🇷/); // флаги
      expect(countryName).toMatch(/[А-Яа-я]/); // кириллица
      expect(countryName.length).toBeGreaterThan(5);
    });
  });

  // Тест содержания конкретных разделов (ключевые слова в каждом разделе)
  test('specific sections contain relevant keywords', () => {
    Object.entries(countriesInfo).forEach(([, country]) => {
      // Виза
      expect(country.visa.toLowerCase()).toMatch(/виза|паспорт|граждан|срок/);
      
      // Климат
      expect(country.climate.toLowerCase()).toMatch(/климат|температур|градус|погод/);
      
      // Валюта
      expect(country.currency.toLowerCase()).toMatch(/валюта|карт|нал|деньг/);
      
      // Язык
      expect(country.language.toLowerCase()).toMatch(/язык|разговор|фраз|официал/);
      
      // Культура
      expect(country.culture.toLowerCase()).toMatch(/культур|традиц|обыча|чаев/);
    });
  });

  // Тест отсутствия пустых данных (нет пустых или placeholder-данных)
  test('no empty or placeholder data', () => {
    Object.values(countriesInfo).forEach(country => {
      const sections = [country.visa, country.climate, country.currency, country.language, country.culture];
      sections.forEach(section => {
        expect(section).not.toMatch(/TODO|ВСТАВЬТЕ|ОПИСАНИЕ|xxx/i);
        expect(section.trim()).not.toBe('');
      });
    });
  });

  // Тест консистентности формата (единообразное форматирование)
  test('consistent formatting across all countries', () => {
    Object.values(countriesInfo).forEach(country => {
      // Проверяем что все секции используют одинаковое форматирование
      const sections = [country.visa, country.climate, country.currency, country.language, country.culture];
      sections.forEach(section => {
        // Должны быть переносы строк между пунктами
        expect(section).toMatch(/\n•/);
        // Должны быть HTML теги для жирного текста
        expect(section).toMatch(/<b>/);
      });
    });
  });
});
