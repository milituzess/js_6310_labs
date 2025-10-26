// Форматирование цены
export function formatPrice(price) {
  // Обработка ошибок
  if (price === undefined || price === null) {
    return '???';
  }
  if (typeof price === 'string' && price.trim() === '') {
    return '???';
  }
  const numberPrice = Number(price);
  if (isNaN(numberPrice)) {
    return '???';
  }
  if (numberPrice < 0) {
    return '???';
  }

  // Форматируем
  const formatted = price.toLocaleString('ru-RU') + '₽';
  // Заменяем non-breaking spaces на обычные пробелы
  return formatted.replace(/\u00A0/g, ' ');
}
// ${tour.price.toLocaleString()} руб. -> ${formatPrice(tour.price)}

// Форматирование даты
export function formatDate(dateString) {
  // Обработка ошибок
  const date1 = new Date(dateString);
  if (isNaN(date1.getTime())) {
    return '???';
  }
  if (dateString === undefined || dateString === null) {
    return '???';
  }

  


  // Форматируем
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
}
// ${tour.dates.start} - ${tour.dates.end} -> ${formatDate(tour.dates.start)} - ${formatDate(tour.dates.end)}

// Сокращение длинного текста
// export function truncateText(text, maxLength = 100) {
// if (text.length <= maxLength) return text;
// return text.substring(0, maxLength) + '...';
// }