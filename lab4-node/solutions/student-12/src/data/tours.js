// бд туров
export const tours = [
  {
    id: 1,
    destination: "🇹🇷 Турция",
    city: "Стамбул",
    price: 45000,
    dates: {
      start: "2026-06-15",
      end: "2026-06-22",
      duration: "7 дней"
    },
    season: "лето",
    interests: ["культура", "шоппинг", "история"], // Теги для фильтрации
    accommodation: {
      type: "Отель 4*",
      name: "Ramada Hotel & Suites",
      meals: "Завтраки"
    },
    flight: {
      airline: "Аэрофлот",
      type: "Прямой рейс",
      baggage: "20 кг"
    },
    description: "Увлекательное путешествие в Стамбул с экскурсиями по историческим местам",
    rating: 4.5
  },
  {
    id: 2,
    destination: "🇪🇬 Египет", 
    city: "Хургада",
    price: 35000,
    dates: {
      start: "2025-11-01", 
      end: "2025-11-08",
      duration: "7 дней"
    },
    season: "лето",
    interests: ["пляжный отдых", "дайвинг", "экскурсии"],
    accommodation: {
      type: "Отель 5*",
      name: "Jaz Aquaviva",
      meals: "Все включено"
    },
    flight: {
      airline: "EgyptAir",
      type: "Прямой рейс", 
      baggage: "23 кг"
    },
    description: "Пляжный отдых в Хургаде с возможностью дайвинга и экскурсий",
    rating: 4.3
  },
  {
    id: 3,
    destination: "🇮🇹 Италия",
    city: "Рим",
    price: 65000,
    dates: {
      start: "2026-05-20",
      end: "2026-05-27", 
      duration: "7 дней"
    },
    season: "весна",
    interests: ["культура", "история", "гастрономия"],
    accommodation: {
      type: "Отель 3*",
      name: "Hotel Artemide",
      meals: "Завтраки"
    },
    flight: {
      airline: "Alitalia",
      type: "Прямой рейс",
      baggage: "20 кг"
    },
    description: "Тур по историческим местам Рима с посещением Ватикана",
    rating: 4.7
  },
  {
    id: 4,
    destination: "🇹🇷 Турция",
    city: "Анталия",
    price: 38000,
    dates: {
      start: "2024-08-10",
      end: "2024-08-17",
      duration: "7 дней"
    },
    season: "лето", 
    interests: ["пляжный отдых", "активный отдых"],
    accommodation: {
      type: "Отель 4*",
      name: "Rixos Premium Belek",
      meals: "Все включено"
    },
    flight: {
      airline: "Turkish Airlines",
      type: "Прямой рейс",
      baggage: "23 кг"
    },
    description: "Отдых в Анталии с песчаными пляжами и развлечениями",
    rating: 4.4
  },
  {
    id: 5,
    destination: "🇮🇹 Италия",
    city: "Флоренция",
    price: 72000,
    dates: {
      start: "2026-09-15", 
      end: "2026-09-22",
      duration: "7 дней"
    },
    season: "осень",
    interests: ["искусство", "культура", "гастрономия"],
    accommodation: {
      type: "Бутик-отель 4*",
      name: "Hotel Spadai", 
      meals: "Завтраки"
    },
    flight: {
      airline: "Alitalia",
      type: "С пересадкой",
      baggage: "20 кг"
    },
    description: "Тур по галереям Флоренции и тосканской кухне",
    rating: 4.8
  }
];

// Фильтры по бюджету
export const budgetRanges = [
  { label: "До 40,000 руб", max: 40000 },
  { label: "До 60,000 руб", max: 60000 }, 
  { label: "До 80,000 руб", max: 80000 },
  { label: "Любой бюджет", max: Infinity }
];
