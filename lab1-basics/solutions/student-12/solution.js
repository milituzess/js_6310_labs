// ===== ЗАДАНИЕ 1: Базовые операции =====
function simpleTask() {
    // 1.1 Объявите переменные разных типов (не менне 5)
    let number = 1; //числовой
    let flag = true; //булевый
    let str = 'hi'; //строковый
    let und; // не определенный
    let obj = null; //объект
    // 1.2 Выведите типы всех переменных
    console.log(typeof(number));
    console.log(typeof(flag));
    console.log(typeof(str));
    console.log(typeof(und));
    console.log(typeof(obj));
}








// ===== ЗАДАНИЕ 2: Функции =====
function getReviewerNumber(number, lab) {
    // 2.1 Функция определяющая номер ревьюера для вашей группы по вашему номеру и номеру лабораторной работы
    if(typeof(number) !== "number" || typeof(lab) !== "number"){
        return "Аргументы функции должны быть числами";
    }
    if (number > 23 || number < 1) {
        return "Номер человека в группе от 1 до 23";
    }
    let res = (number + lab) % 23;
    return res || 23;
}

function getVariant(number, variants) {
    // 2.2 Функция определяющая номер варианта, исходя из количества вариантов
    if(typeof(number) !== "number" || typeof(variants) !== "number"){
        return "Аргументы функции должны быть числами";
    }
    return (number % variants) || variants; 
    // оператор || возвращает первый истинный операнд (0 = false, любое другое число = true)
    // если остаток от деления не 0, то возращаем этот остаток, иначе возращаем число вариантов
}

function calculate(a, b, operation) {
    // 2.3 Напишите функцию калькулятор, калькулятор обрабатывает следующие операции: +, -, *, /
    if(typeof(a) !== "number" || typeof(b) !== "number"){
        return "Аргументы функции должны быть числами";
    }
    if(operation !== '+' && operation !== '-' && operation !== '*' && operation !== '/'){
        return "Неизвестная операция";
    }
    if(operation == "+"){
        return a + b;
    }
    else if(operation == "-"){
        return a - b;
    }
    else if(operation == "*"){
        return a * b;
    }
    else if(operation == "/"){
        if(b == 0){
            return "Нельзя на 0 делить";
        }
        return a / b;
    }
}

function calculateArea(figure, ...params) {
    // 2.4 Напишите функцию для определения площади фигур 'circle', 'rectangle', 'triangle'
    // Используйте switch.
    switch(figure) {
        case 'circle': // в case передается значение из switch(...)
            if (params.length === 1) {
                if (typeof(params[0]) !== "number" || params[0] <= 0) {
                    return "Некорректные параметры"; 
                }
                return Math.PI * params[0] * params[0];
            }
            return "Должен быть 1 параметр - радиус";   
        case 'rectangle':
            if (params.length === 2) {
                if (typeof(params[0]) !== "number" || params[0] <= 0 || typeof(params[1]) !== "number" || params[1] <= 0) {
                    return "Некорректные параметры"; 
                }
                return params[0] * params[1];
            } 
            return "Должно быть 2 параметра - длина и ширина"; 
        case 'triangle':
            if (params.length === 3) {
                if (typeof(params[0]) !== "number" || params[0] <= 0 || typeof(params[1]) !== "number" || params[1] <= 0 || typeof(params[2]) !== "number" || params[2] <= 0) {
                    return "Некорректные параметры"; 
                }
                // Формула Герона
                const p = (params[0] + params[1] + params[2]) / 2;
                return Math.sqrt(p * (p - params[0]) * (p - params[1]) * (p - params[2]));
            } 
            return "Должно быть 3 параметра - длины 3 сторон"; 
        default: // если ни одно case не подошло
            return 'Неизвестная фигура: ' + figure;
    }
}

// 2.5 Стрелочные функции
const reverseString = (str) => { // const reverseString = function(str) {
    // Функция возвращает перевернутую строку
    if (typeof(str) === "string") {
        return str.split('').reverse().join(''); // разделение на массив -> переворот -> соединение в строку
    }
    return "Входные данные - строка"
};

const getRandomNumber = (min, max) => {
    // Функция возвращает случайное число между min и max
    return Math.floor(Math.random() * (max - min + 1)) + min; // Math.random() - от 0 до 1 -> умножаем на диапазон -> округляем вниз до целого -> сдвигаем в наш диапазон
};









// ===== ЗАДАНИЕ 3: Объекты =====
const book = {
    // 3.1 Создайте объект "книга" с полями для хранения заголовка, автора, 
    // года выпуска, количества страниц, и доступности
    // объект должен иметь два метода getInfo возвращает одной строкой информацию о названии книги, аторе, годе выпуска, количестве страниц
    // метод toggleAvailability - который меняет значение доступности и возвращает его
    title: "йъйъйъъйъйъй",
    author: "аоаооаоа",
    year: 2000,
    pages: 100,
    isAvailable: true,
    
    getInfo: function() {
        return `Название: "${this.title}", автор: ${this.author}, год: ${this.year}, страниц: ${this.pages}`;
    },
    
    toggleAvailability: function() {
        this.isAvailable = !this.isAvailable; //присваивание инвертированного значения
        return this.isAvailable;
    }
};

const student = {
    // 3.2 Реализуйте методы объекта "студент" 
    name: "Анна Петрова",
    age: 20,
    course: 2,
    grades: {
        math: 90,
        programming: 95,
        history: 85
    },
    
    // Метод для расчета среднего балла
    getAverageGrade() { // getAverageGrade: function() { ... } - не сокращенный синтаксис
        // Ваш код здесь
        const grades = Object.values(this.grades); // this.grades - обращение к объекту с оценками студента, Object.values() - возвращает массив значений объекта
        if (grades.length === 0) return 0;
        const sum = grades.reduce((total, grade) => total + grade, 0);
        // reduce() - метод массива для последовательной обработки элементов
        // к total в каждой итерации будет добавляться по одному значению grade 
        return sum / grades.length;
    },
    
    // Метод для добавления новой оценки
    addGrade(subject, grade) {
        // Ваш код здесь
        this.grades[subject] = grade;
        return `Оценка ${grade} по ${subject} добавлена`;
    }
};









// ===== ЗАДАНИЕ 4: Массивы =====
function processArrays() {
    const numbers = [12, 45, 23, 67, 34, 89, 56, 91, 27, 14];
    const words = ["JavaScript", "программирование", "массив", "функция", "объект"];
    const users = [
        { id: 1, name: "Анна", age: 25, isActive: true },
        { id: 2, name: "Борис", age: 30, isActive: false },
        { id: 3, name: "Виктория", age: 22, isActive: true },
        { id: 4, name: "Григорий", age: 35, isActive: true },
        { id: 5, name: "Дарья", age: 28, isActive: false }
    ];
    
    // 1. Используйте forEach для вывода всех чисел больше 50
    // forEach - перебирает каждый элемент массива по порядку и выполняет функцию для каждого элемента
    console.log("Числа больше 50:");
    let output = '';
    numbers.forEach(num => {
        if (num > 50) {
            console.log(num);
        }
    });

    // 2. Используйте map для создания массива квадратов чисел
    // map - создает новый массив, каждый элемент преобразуется по заданному правилу (исходный массив не изменяется)
    /*const squares =  ваш код */
    const squares = numbers.map(num => num * num);
    console.log("Квадраты чисел:", squares);

    // 3. Используйте filter для получения активных пользователей
    // filter - cоздает новый массив только с элементами, которые прошли проверк
    /*const activeUsers =  ваш код */
    const activeUsers = users.filter(user => user.isActive);
    console.log("Активные пользователи:", activeUsers);

    // 4. Используйте find для поиска пользователя с именем "Виктория"
    // find - находит первый элемент, соответствующий условию и возвращает его, иначе возвращает undefined
    /*const victoria =  ваш код */
    const victoria = users.find(user => user.name === "Виктория");
    console.log("Пользователь Виктория:", victoria);

    // 5. Используйте reduce для подсчета суммы всех чисел
    // reduce - cворачивает массив в одно значение, накапливает результат последовательно
    /*const sum =  ваш код */
    const sum = numbers.reduce((total, num) => total + num, 0);
    console.log("Сумма всех чисел:", sum);

    // 6. Используйте sort для сортировки пользователей по возрасту (по убыванию)
    /*const sortedByAge =  ваш код */
    const sortedByAge = [...users].sort((a, b) => b.age - a.age);
    console.log("Пользователи по убыванию возраста:", sortedByAge);

    // 7. Используйте метод для проверки, все ли пользователи старше 18 лет
    /*const allAdults =  ваш код */
    const allAdults = users.every(user => user.age > 18);
    console.log("Все пользователи старше 18 лет:", allAdults);

    // 8. Создайте цепочку методов: 
    //    - отфильтровать активных пользователей
    //    - преобразовать в массив имен
    //    - отсортировать по алфавиту
    /*const activeUserNames =  ваш код */
    const activeUserNames = users
    .filter(user => user.isActive)    // [{Анна}, {Виктория}, {Григорий}]
    .map(user => user.name)           // ["Анна", "Виктория", "Григорий"]
    .sort();                          // ["Анна", "Виктория", "Григорий"]
    console.log("Имена активных пользователей по алфавиту:", activeUserNames);
}






// ===== ЗАДАНИЕ 5: Менеджер задач =====
const taskManager = {
    tasks: [
        { id: 1, title: "Изучить JavaScript", completed: false, priority: "high" },
        { id: 2, title: "Сделать лабораторную работу", completed: true, priority: "high" },
        { id: 3, title: "Прочитать книгу", completed: false, priority: "medium" }
    ],
    
    addTask(title, priority = "medium") {
        // 5.1 Добавление задачи
        const newTask = {
            id: this.tasks.length > 0 ? Math.max(...this.tasks.map(task => task.id)) + 1 : 1,
            title: title,
            completed: false,
            priority: priority
        };
        this.tasks.push(newTask);
        return `Задача "${newTask.title}" с ID ${newTask.id} добавлена `;
    },
    
    completeTask(taskId) {
        // 5.2 Отметка выполнения
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = true;
            return `Задача "${task.title}" выполнена`;
        }
        return `Задача с ID ${taskId} не найдена`;
    },

    // Удаление задачи
    deleteTask(taskId) {
        // 5.3 Ваш код здесь
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        
        if (this.tasks.length < initialLength) {
            return `Задача с ID ${taskId} удалена`;
        }
        return `Задача с ID ${taskId} не найдена`;
    },

    // Получение списка задач по статусу
    getTasksByStatus(completed) {
        // 5.4 Ваш код здесь
        return this.tasks.filter(task => task.completed === completed);
    },
    
    getStats() {
        /* 5.5 Статистика возвращает объект:        
        total,
        completed,
        pending,
        completionRate
        */
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return {
            total: total,
            completed: completed,
            pending: pending,
            completionRate: completionRate
        };
    }
};









// ===== ЗАДАНИЕ 6: Регулярные выражения =====
/*
Дополнительные материалы:
https://regex101.com/ - интерактивный тестер regex
MDN Regular Expressions - https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Regular_expressions
Learn Regex - https://github.com/ziishaned/learn-regex - учебник по regex
 
Задание (по вариантам):
1. Изучите функции с регулярными выражениями по своему варианту
На защите вы должны суметь объяснить структуру регулярного выражения.
2. Напишите тесты, покрывающие все различные варианты. Обратите внимание тесты должны обеспечивать полное покрытие, но не быть дублирующимися.
3. Если предложенное регулярное выражение некорректно, вы можете исправить его.

Вычисление своего варианта:
Номер варианта = Ваш номер % Общее количество вариантов
 */

/**
 * Вариант 1: Валидация email адреса
 * Правила:
 * - Латиница, цифры, спецсимволы: ._%+-
 * - Обязательный символ @
 * - Доменная часть: латиница, цифры, точка
 * - Минимальная длина 5 символов
 */
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * Вариант 2: Валидация пароля
 * Правила:
 * - Минимум 8 символов
 * - Хотя бы одна заглавная буква
 * - Хотя бы одна строчная буква  
 * - Хотя бы одна цифра
 * - Хотя бы один специальный символ: !@#$%^&*()
 */
function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/;
    return passwordRegex.test(password);
}

/**
 * Вариант 3: Валидация номера телефона (российский формат)
 * Поддерживает форматы:
 * - +7 (999) 123-45-67
 * - 8 (999) 123-45-67  
 * - 89991234567
 * - +7(999)123-45-67
 */
function validatePhone(phone) {
    const phoneRegex = /^(\+7|8)[\s(-]?\d{3}[\s)-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
    return phoneRegex.test(phone);
}

/**
 * Вариант 4: Валидация даты в формате DD.MM.YYYY
 * Правила:
 * - День: 01-31
 * - Месяц: 01-12
 * - Год: 1900-2099
 */
function validateDate(date) {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19|20)\d{2}$/; 
    return dateRegex.test(date);
    // ^ - начало строки
    // (0[1-9]|[12][0-9]|3[01]) - первая група(день) (группа из трех альтернатив через | или)
    // \. - экранированная точка (означает именно символ точки, а не любой символ)
    // (0[1-9]|1[0-2]) - втооая группа (месяц)
    // \.
    // (19|20)\d{2} - третья группа (год), (19|20) - начинается с 19 или 20, \d{2} - любые 2 цифры (\d = цифра, {2} = ровно 2 раза)
    // $ - конец строки

}

// Бонус: выполните все остальные варианты. Выполнение бонуса не учитывается в итоговой оценке.


// ===== ТЕСТИРОВАНИЕ =====
function runTests() {
    console.log("=== ТЕСТИРОВАНИЕ ===");
    
    // Задание 1.1 и 1.2
    console.log("=== Задание 1.1 и 1.2 ===");
    simpleTask();

    // Задание 2.1
    console.log("=== Задание 2.1 ===");
    console.assert(getReviewerNumber("a", 1) === "Аргументы функции должны быть числами", "Тест задания 2.1 провален (не числа)");
    console.assert(getReviewerNumber(1, "a") === "Аргументы функции должны быть числами", "Тест задания 2.1 провален (не числа)");
    console.assert(getReviewerNumber(0, 1) === "Номер человека в группе от 1 до 23", "Тест задания 2.1 провален (0)");
    console.assert(getReviewerNumber(24, 1) === "Номер человека в группе от 1 до 23", "Тест задания 2.1 провален (24)");
    console.assert(getReviewerNumber(1, 1) === 2, "Тест задания 2.1 провален");
    console.assert(getReviewerNumber(12, 1) === 13, "Тест задания 2.1 провален");
    console.assert(getReviewerNumber(22, 1) === 23, "Тест задания 2.1 провален");

    // Задание 2.2
    console.log("=== Задание 2.2 ===");
    console.assert(getVariant(8, "a") === "Аргументы функции должны быть числами", "Тест задания 2.2 провален (не числа)");
    console.assert(getVariant("a", 4) === "Аргументы функции должны быть числами", "Тест задания 2.2 провален (не числа)");
    console.assert(getVariant(8, 4) === 4, "Тест задания 2.2 провален");
    console.assert(getVariant(7, 4) === 3, "Тест задания 2.2 провален");
    console.assert(getVariant(6, 4) === 2, "Тест задания 2.2 провален");
    console.assert(getVariant(5, 4) === 1, "Тест задания 2.2 провален");
    console.assert(getVariant(4, 4) === 4, "Тест задания 2.2 провален");
    console.assert(getVariant(3, 4) === 3, "Тест задания 2.2 провален");
    console.assert(getVariant(2, 4) === 2, "Тест задания 2.2 провален");
    console.assert(getVariant(1, 4) === 1, "Тест задания 2.2 провален");

    // Задание 2.3
    console.log("=== Задание 2.3 ===");
    console.assert(calculate(10, 5, '+') === 15, "Тест задания 2.3 провален (+)");
    console.assert(calculate(10, 5, '-') === 5, "Тест задания 2.3 провален (-)");
    console.assert(calculate(10, 5, '*') === 50, "Тест задания 2.3 провален (*)");
    console.assert(calculate(10, 5, '/') === 2, "Тест задания 2.3 провален (/)");
    console.assert(calculate(10, 4, '/') === 2.5, "Тест задания 2.3 провален (float)");
    console.assert(calculate(10, 0, '/') === "Нельзя на 0 делить", "Тест задания 2.3 провален (/0)");
    console.assert(calculate(0, 5, '/') === 0, "Тест задания 2.3 провален (0/)");
    console.assert(calculate(-10, 5, '+') === -5, "Тест задания 2.3 провален (+ отриц)");
    console.assert(calculate(-10, -5, '*') === 50, "Тест задания 2.3 провален (* отриц)");
    console.assert(calculate(1, "b", "+") === "Аргументы функции должны быть числами", "Тест задания 2.3 провален (проверка аргументов)");
    console.assert(calculate("a", 1, "+") === "Аргументы функции должны быть числами", "Тест задания 2.3 провален (проверка аргументов)");
    console.assert(calculate("a", "b", "+") === "Аргументы функции должны быть числами", "Тест задания 2.3 провален (проверка аргументов)");
    console.assert(calculate(10, 5, "~") === "Неизвестная операция", "Тест задания 2.3 провален (неизвестная операция)");
    console.assert(calculate(Number.MAX_VALUE, 1, '+') === Number.MAX_VALUE+1, "Тест калькулятора 2.3 провален (переполнение при сложении)");
    console.assert(calculate(Number.MAX_VALUE, Number.MAX_VALUE, '+') === Infinity, "Тест калькулятора 2.3 провален (переполнение при сложении двух больших чисел)");
    console.assert(calculate(Number.MAX_VALUE, 2, '-') === Number.MAX_VALUE - 2, "Тест калькулятора 2.3 провален (вычитание из максимального значения)");
    console.assert(calculate(Number.MAX_VALUE, 1, '*') === Number.MAX_VALUE, "Тест калькулятора 2.3 провален (переполнение при умножении)");
    console.assert(calculate(1, Number.MAX_VALUE, '*') === Number.MAX_VALUE, "Тест калькулятора 2.3 провален (переполнение при умножении с максимальным значением)");
    console.assert(calculate(Number.MAX_VALUE, 10, "*") === Infinity, "Тест калькулятора провален (умножение максимального числа на 10)");
    console.assert(calculate(Number.MAX_VALUE, 2, '/') === Number.MAX_VALUE / 2, "Тест калькулятора 2.3 провален (деление максимального значения)");

    // Задание 2.4
    console.log("=== Задание 2.4 ===");
    console.assert(calculateArea("circle", 1, 1) === "Должен быть 1 параметр - радиус", "Тест задания 2.4 провален (площадь круга, 1 параметр)");
    console.assert(calculateArea("circle") === "Должен быть 1 параметр - радиус", "Тест задания 2.4 провален (площадь круга, 1 параметр)");
    console.assert(calculateArea("circle", "a") === "Некорректные параметры", "Тест задания 2.4 провален (площадь круга, буква)");
    console.assert(calculateArea("circle", -1) === "Некорректные параметры", "Тест задания 2.4 провален (площадь круга, отрицательное число)");
    console.assert(calculateArea("circle", 0) === "Некорректные параметры", "Тест задания 2.4 провален (площадь круга, 0)");
    console.assert(calculateArea("circle", 2) === 12.566370614359172, "Тест задания 2.4 провален (площадь круга)");

    console.assert(calculateArea("rectangle", 1) === "Должно быть 2 параметра - длина и ширина", "Тест задания 2.4 провален (площадь прямоугольника, 2 параметр)");
    console.assert(calculateArea("rectangle", 1, 1, 1) === "Должно быть 2 параметра - длина и ширина", "Тест задания 2.4 провален (площадь прямоугольника, 2 параметр)");
    console.assert(calculateArea("rectangle", 1, "f") === "Некорректные параметры", "Тест задания 2.4 провален (площадь прямоугольника, буква)");
    console.assert(calculateArea("rectangle", 1, -1) === "Некорректные параметры", "Тест задания 2.4 провален (площадь прямоугольника, отрицательное число)");
    console.assert(calculateArea("rectangle", 1, 0) === "Некорректные параметры", "Тест задания 2.4 провален (площадь прямоугольника, 0)");
    console.assert(calculateArea("rectangle", 2, 4) === 8, "Тест задания 2.4 провален (площадь прямоугольника)");

    console.assert(calculateArea("triangle", 1, 2) === "Должно быть 3 параметра - длины 3 сторон", "Тест задания 2.4 провален (площадь треугольника, 3 параметра)");
    console.assert(calculateArea("triangle", 1, 2, 3, 4) === "Должно быть 3 параметра - длины 3 сторон", "Тест задания 2.4 провален (площадь треугольника, 3 параметра)");
    console.assert(calculateArea("triangle", 1, 2, "f") === "Некорректные параметры", "Тест задания 2.4 провален (площадь треугольника, буква)");
    console.assert(calculateArea("triangle", 1, 2, -1) === "Некорректные параметры", "Тест задания 2.4 провален (площадь треугольника, отрицательное число)");
    console.assert(calculateArea("triangle", 1, 2, 0) === "Некорректные параметры", "Тест задания 2.4 провален (площадь треугольника, 0)");
    console.assert(calculateArea("triangle", 2, 2, 3) === 1.984313483298443, "Тест задания 2.4 провален (площадь треугольника)");

    console.assert(calculateArea("wqwqw", 4, 6) === "Неизвестная фигура: wqwqw", "Тест задания 2.4 провален (неизвестная фигура)");

    // Задание 2.5
    console.log("=== Задание 2.5 ===");
    console.assert(reverseString("qwerty") === "ytrewq", "Тест задания 2.5 провален (перевернутая строка)");
    console.assert(reverseString("") === "", "Тест задания 2.5 провален (пустая строка");
    console.assert(reverseString("a") === "a", "Тест задания 2.5 провален (один символ)");
    console.assert(reverseString(111) === "Входные данные - строка", "Тест задания 2.5 провален (не строка)");

    console.assert(typeof(getRandomNumber(25, 100)) === "number", "Тест задания 2.5 провален (результат не число");
    console.assert(getRandomNumber(25, 100) >= 25 && getRandomNumber(25, 100) < 100, "Тест 2.5 задания провален(результат не в границах");

    // Задание 3.1
    console.log("=== Задание 3.1 ===");
    console.log(book.getInfo());
    console.log(book.toggleAvailability());
    console.log(book.toggleAvailability());
    book.toggleAvailability();     
    console.log(book.isAvailable);

    // Задание 3.2
    console.log("=== Задание 3.2 ===")
    console.log(student.getAverageGrade());
    console.log(student.addGrade('physics', 88));
    console.log(student.getAverageGrade());
    console.log(student.grades); //вывод всех оценок 

    // Задание 4
    console.log("=== Задание 4 ===")
    processArrays();

    
    // Задание 5
    console.log("=== Задание 5 ===")
    console.log(taskManager.addTask("Написать отчет", "high")); //добавление задачи в список
    console.log(taskManager.completeTask(1)); //отметка выполнения задачи
    console.log(taskManager.completeTask(999)); //отметка выполнения несуществующей задачи
    console.log(taskManager.deleteTask(3)); //удаление задачи
    console.log(taskManager.deleteTask(999)); //удаление несуществующей задачи
    console.log("Активные задачи:", taskManager.getTasksByStatus(false)); //вывод задач по статусу
    console.log("Статистика:", taskManager.getStats()); //вывод статы
    
    // Задание 6.4
    
    console.log("=== Задание 6.4 ===")
    console.assert(validateDate("31.12.2099") === true, "Тест задания 6 провален (максимальная допустимая дата)");
    console.assert(validateDate("01.01.1900") === true, "Тест задания 6 провален (минимальная допустимая дата)");
    console.assert(validateDate("01.01.2000") === true, "Тест задания 6 провален (обычная дата)");
    console.assert(validateDate("00.01.2000") === false, "Тест задания 6 провален (день 00)");
    console.assert(validateDate("32.01.2000") === false, "Тест задания 6 провален (день 32)");
    console.assert(validateDate("01.00.2000") === false, "Тест задания 6 провален (месяц 00)");
    console.assert(validateDate("01.13.2000") === false, "Тест задания 6 провален (месяц 13)");
    console.assert(validateDate("01.01.1899") === false, "Тест задания 6 провален (год 1899)");
    console.assert(validateDate("01.01.2100") === false, "Тест задания 6 провален (год 2100)");
    console.assert(validateDate("1.01.2000") === false, "Тест задания 6 провален (день из одной цифры)");
    console.assert(validateDate("01.1.2000") === false, "Тест задания 6 провален (месяц из одной цифры)");
    console.assert(validateDate("01.01.99") === false, "Тест задания 6 провален (год из двух цифр)");
    console.assert(validateDate("01-01-2000") === false, "Тест задания 6 провален (неправильные разделители)");
    console.assert(validateDate("01012000") === false, "Тест задания 6 провален (неправильные разделители)");
    console.assert(validateDate("01june2000") === false, "Тест задания 6 провален (месяц текстом)");
    console.assert(validateDate("") === false, "Тест задания 6 провален (пустая строка)");

    console.log("Все тесты пройдены! ✅");
}

// Запуск тестов
runTests();