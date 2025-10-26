// Универсальная фильтрация туров
export function filterTours(tours, filters) {
  return tours.filter(tour => {
    for (const [key, value] of Object.entries(filters)) {
      if (value && !matchesFilter(tour, key, value)) {
        return false;
      }
    }
    return true;
  });
}

// Вспомогательная функция для проверки фильтров
function matchesFilter(tour, key, value) {
  switch (key) {
    case 'maxBudget':
      return tour.price <= value;
    
    case 'destination':
      return tour.destination === value;
    
    case 'season':
      return tour.season === value;
    
    case 'year':
      return new Date(tour.dates.start).getFullYear() === value;
    
    case 'month':
      return (new Date(tour.dates.start).getMonth() + 1) === value;
    
    case 'interest':
      return tour.interests.includes(value);
    
    default:
      return true;
  }
}