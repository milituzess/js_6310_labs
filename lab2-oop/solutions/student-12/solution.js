'use strict'

// ===== ЗАДАНИЕ 1: Базовый класс Vehicle =====
class Vehicle {
    // Создайте базовый класс Vehicle.
    // В конструкторе принимайте и сохраняйте в this свойства: 
    // make (марка), model (модель), year (год выпуска).
    static vehicleCount = 0; // статическое свойство самого класса, а не его экхемпляров, для подсчета количества созданных транспортных средств.
    constructor(make, model, year) {
        this._validateMake(make);
        this._validateModel(model);
        this._validateYear(year);
        this.make = make;
        this.model = model; // прямое присвоение
        this._year = year; // приватное свойство, доступ потом через геттер
        Vehicle.vehicleCount++;
    }

    // Проверка марки
    _validateMake(make) { // приватный метод
        if (typeof make !== 'string' || make.trim().length === 0) {
            throw new Error('Некорректная марка')
        }
    }

    //  Проверка модели
    _validateModel(model) {
        if (typeof model !== 'string' || model.trim().length === 0) {
            throw new Error('Некорректная модель')
        }
    }

    // Проверка года
    _validateYear(year) {
        if (typeof year !== 'number' || isNaN(year) || !Number.isInteger(year)) {
            throw new Error('Год должен быть целым числом')
        }
        const currentYear = new Date().getFullYear();
        if (year > currentYear) {
            throw new Error(`Год не может быть больше текущего: ${currentYear}`)
        }
        if (year < 1500) {
            throw new Error('Год не может быть меньше 1500')
        }
    }

    // Добавьте метод displayInfo(), который выводит в консоль информацию 
    // о транспортном средстве в формате: "Марка: [make], Модель: [model], Год: [year]".
    displayInfo() {
        console.log(`Марка: ${this.make}, модель: ${this.model}, год: ${this._year}`);
    }

    // Добавьте геттер age, который возвращает возраст транспортного средства 
    // (текущий год минус год выпуска). Используйте new Date().getFullYear().
    get age() {
        return new Date().getFullYear() - this._year;
    }

    // Добавьте сеттер для года выпуска с проверкой: год не может быть больше текущего.
    set year(newYear) {
        const currentYear = new Date().getFullYear();
        if (newYear > currentYear) {
            throw new Error(`Год не может быть больше текущего: ${currentYear}`)
        }
        this._year = newYear;
    }

    get year() {
        return this._year; //публичные доступы через геттер
    }

    // Добавьте статический метод compareAge(vehicle1, vehicle2), 
    // который возвращает разницу в возрасте между двумя транспортными средствами.
    static compareAge(vehicle1, vehicle2) {
        return Math.abs(vehicle1.age - vehicle2.age); //вызывает геттер age
    }

    // Создайте статический метод getTotalVehicles(), 
    // который возвращает общее количество созданных транспортных средств.
    static getTotalVehicles() {
        return Vehicle.vehicleCount;
    }
}





// ===== ЗАДАНИЕ 2: Класс Car (наследуется от Vehicle) =====
class Car extends Vehicle {
    // Создайте дочерний класс Car, который наследуется от Vehicle.
    // Добавьте новое свойство numDoors (количество дверей).
    constructor(make, model, year, numDoors) {
        Car._validateNumDoors(numDoors);
        super(make, model, year);
        this.numDoors = numDoors;
    }

    // Проверка дверей
    static _validateNumDoors(numDoors) {
        if (typeof numDoors !== 'number' || isNaN(numDoors) || !Number.isInteger(numDoors) || numDoors < 1) {
            throw new Error('Некорректное кол-во дверей')
        }
    }

    // Переопределите метод displayInfo() так, чтобы он также выводил количество дверей. 
    // Используйте super.displayInfo() для вызова метода родителя.
    displayInfo() {
        super.displayInfo();
        console.log(`Количество дверей: ${this.numDoors}`);
    }

    // Добавьте метод honk(), который выводит "Beep beep!".
    honk() {
        console.log("Beep beep!");
    }
}





// ===== ЗАДАНИЕ 3: Класс ElectricCar (наследуется от Car) =====
class ElectricCar extends Car {
    // Создайте дочерний класс ElectricCar, который наследуется от Car.
    // Добавьте новое свойство batteryCapacity (емкость батареи в кВт·ч).
    constructor(make, model, year, numDoors, batteryCapacity) {
        ElectricCar._validateBatteryCapacity(batteryCapacity);
        super(make, model, year, numDoors);
        this.batteryCapacity = batteryCapacity;
    }

    // Проверка емкости
    static _validateBatteryCapacity(batteryCapacity) {
        if (typeof batteryCapacity !== 'number' || isNaN(batteryCapacity) || !Number.isInteger(batteryCapacity) || batteryCapacity < 1) {
            throw new Error('Некорректная емкость батареи')
        }
    }

    // Переопределите метод displayInfo() для вывода дополнительной информации о батарее.
    displayInfo() {
        super.displayInfo();
        console.log(`Емкость батареи: ${this.batteryCapacity} кВт·ч`);
    }

    // Добавьте метод calculateRange(), который рассчитывает примерный запас хода 
    // (предположим, что 1 кВт·ч = 6 км).
    calculateRange() {
        return this.batteryCapacity * 6;
    }
}





// ===== ЗАДАНИЕ 4: Каррирование =====

// Создайте функцию createVehicleFactory, которая возвращает функцию 
// для создания транспортных средств определенного типа (каррирование).
const createVehicleFactory = (vehicleType) => (make, model, year, ...args) => {
    // return {};  Замените {} на варажение
    return new vehicleType(make, model, year, ...args);
};





// ===== ЗАДАНИЕ 5: Статические методы и свойства =====

// Добавьте статическое свойство vehicleCount в класс Vehicle 
// для подсчета количества созданных транспортных средств.
// Модифицируйте конструктор Vehicle для увеличения счетчика
// (добавьте в начало конструктора: Vehicle.vehicleCount++);
// Создайте статический метод getTotalVehicles(), 
// который возвращает общее количество созданных транспортных средств.





// Автоматические тесты
function runTests() {
    console.log("=== Задание 1 ===");
    // тр. средство 1
    const vehicle_1 = new Vehicle('Toyota', 'Camry', 2015);
    vehicle_1.displayInfo();
    console.log(`Возраст: ${vehicle_1.age} лет`);
    // тр. средство 2
    const vehicle_2 = new Vehicle('Toyota', 'Camry', 2010);
    vehicle_2.displayInfo();
    console.log(`Возраст: ${vehicle_2.age} лет`);
    // для двух тр.средств
    console.log(`Разница возраста: ${Vehicle.compareAge(vehicle_1, vehicle_2)} лет`);
    console.log(`Общее количество созданных транспортных средств: ${Vehicle.getTotalVehicles()} шт`);
    // проверка ошибок
    // механизм обработки ошибок
    try { // блок try - "попробуй выполнить этот код"
        new Vehicle(1, 'Camry', 2015);
        console.log('ошибка');
    } catch (e) { // блок catch - "если произошла ошибка, выполни этот код"
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Vehicle("", 'Camry', 2015);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Vehicle('Toyota', 1, 2015);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Vehicle('Toyota', "", 2015);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Vehicle('Toyota', 'Camry', "2015");
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Vehicle('Toyota', 'Camry');
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Vehicle('Toyota', 'Camry', 2015.5);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Vehicle('Toyota', 'Camry', 2030);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Vehicle('Toyota', 'Camry', 1);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        vehicle_1.year = 2026;
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    console.assert(vehicle_1.make === 'Toyota', 'не совпадает марка');
    console.assert(vehicle_1.model === 'Camry', 'не совпадает модель');
    console.assert(vehicle_1.year === 2015, 'не совпадает год');
    console.assert(vehicle_1.age === new Date().getFullYear() - 2015, 'не совпадает возраст тр.средства');
    console.assert(Vehicle.compareAge(vehicle_1, vehicle_2) === vehicle_1.year - vehicle_2.year, 'не совпадает разница возраста тр.средств');
    console.assert(Vehicle.getTotalVehicles() === 2, 'не совпадает кол-во тр.средства');
    vehicle_1.year = 2010;
    vehicle_1.displayInfo();
    console.assert(vehicle_1.year === 2010, 'не совпадает год');

    console.log();
    console.log("=== Задание 2 ===");
    // тр. средство 3
    const car = new Car('Honda', 'Civic', 2018, 4);
    car.displayInfo();
    console.log(`Возраст: ${vehicle_1.age} лет`);
    // для двух тр.средств
    console.log(`Разница возраста: ${Vehicle.compareAge(car, vehicle_2)} лет`);
    console.log(`Общее количество созданных транспортных средств: ${Vehicle.getTotalVehicles()} шт`);
    // чисто для машинок
    car.honk();
    // проверка ошибок
        try { 
        new Car(1, 'Civic', 2018, 4);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car("", 'Civic', 2018, 4);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 1, 2018, 4);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', "", 2018, 4);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', "2018", 4);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 2018.5, 4);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 2030, 4);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 1, 4);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 2018, "4");
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 2018);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 2018, 4.5);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 2018, 0);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        car.year = 2026;
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    console.assert(car.make === 'Honda', 'не совпадает марка');
    console.assert(car.model === 'Civic', 'не совпадает модель');
    console.assert(car.year === 2018, 'не совпадает год');
    console.assert(car.numDoors === 4, 'не совпадает кол-во дверей');
    console.assert(car.age === new Date().getFullYear() - 2018, 'не совпадает возраст тр.средства');
    console.assert(Vehicle.compareAge(car, vehicle_2) === car.year - vehicle_2.year, 'не совпадает разница возраста тр.средств');
    console.assert(Vehicle.getTotalVehicles() === 3, 'не совпадает кол-во тр.средства');
    car.year = 2000;
    car.displayInfo();
    console.assert(car.year === 2000, 'не совпадает год');

    console.log();
    console.log("=== Задание 3 ===");
    // тр. средство 4
    const electricCar = new ElectricCar('Tesla', 'Model 3', 2020, 4, 75);
    electricCar.displayInfo();
    console.log(`Возраст: ${vehicle_1.age} лет`);
    // для двух тр.средств
    console.log(`Разница возраста: ${Vehicle.compareAge(electricCar, vehicle_2)} лет`);
    console.log(`Общее количество созданных транспортных средств: ${Vehicle.getTotalVehicles()} шт`);
    // чисто для электрических машинок
    console.log(`Запас хода: ${electricCar.calculateRange()} км`);
        // проверка ошибок
        try { 
        new ElectricCar(1, 'Model 3', 2020, 4, 75);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new ElectricCar("", 'Model 3', 2020, 4, 75);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new ElectricCar('Tesla', 1, 2020, 4, 75);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new ElectricCar('Tesla', "", 2020, 4, 75);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new ElectricCar('Tesla', 'Model 3', "2020", 4, 75);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new ElectricCar('Tesla', 'Model 3', 2020.5, 4, 75);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new ElectricCar('Tesla', 'Model 3', 2030, 4, 75);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new ElectricCar('Tesla', 'Model 3', 1, 4, 75);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new ElectricCar('Tesla', 'Model 3', 2020, "4", 75);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new ElectricCar('Tesla', 'Model 3', 2020, 4.5, 75);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new ElectricCar('Tesla', 'Model 3', 2020, 0, 75);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
        try { 
        new ElectricCar('Tesla', 'Model 3', 2020, 4, "75");
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new ElectricCar('Tesla', 'Model 3', 2020, 4, 75.5);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new ElectricCar('Tesla', 'Model 3', 2020, 4, 0);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
        try { 
        new ElectricCar('Tesla', 'Model 3', 2020, 4);
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        electricCar.year = 2026;
        console.log('ошибка');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    console.assert(electricCar.make === 'Tesla', 'не совпадает марка');
    console.assert(electricCar.model === 'Model 3', 'не совпадает модель');
    console.assert(electricCar.year === 2020, 'не совпадает год');
    console.assert(electricCar.numDoors === 4, 'не совпадает кол-во дверей');
    console.assert(electricCar.batteryCapacity === 75, 'не совпадает емкость батареи');
    console.assert(electricCar.age === new Date().getFullYear() - 2020, 'не совпадает возраст тр.средства');
    console.assert(electricCar.calculateRange() === electricCar.batteryCapacity * 6, 'не совпадает запас хода');
    console.assert(Vehicle.compareAge(electricCar, vehicle_2) === electricCar.year - vehicle_2.year, 'не совпадает разница возраста тр.средств');
    console.assert(Vehicle.getTotalVehicles() === 4, 'не совпадает кол-во тр.средства');
    electricCar.year = 2005;
    electricCar.displayInfo();
    console.assert(electricCar.year === 2005, 'не совпадает год');

    console.log();
    console.log("=== Задание 4 ===");
    // проверка каррирования
    // тр. средство 5
    const createCarFactory_1 = createVehicleFactory(Vehicle);
    const myNewCar_1 = createCarFactory_1('BMW', 'X5', 2022);
    console.log('Создан новый автомобиль:');
    myNewCar_1.displayInfo();
    // тр. средство 6
    const createCarFactory_2 = createVehicleFactory(Car);
    const myNewCar_2 = createCarFactory_2('BMW', 'X5', 2022, 4);
    console.log('Создан новый автомобиль:');
    myNewCar_2.displayInfo();
     // тр. средство 7
    const createCarFactory_3 = createVehicleFactory(ElectricCar);
    const myNewCar_3 = createCarFactory_3('BMW', 'X5', 2022, 4, 60);
    console.log('Создан новый автомобиль:');
    myNewCar_3.displayInfo();

    // Проверка возраста
    // тр. средство 8
    const testVehicle = new Vehicle('Test', 'Model', 2010);
    console.assert(testVehicle.age === (new Date().getFullYear() - 2010), 'Тест возраста провален');
    
    console.log('Всего создано транспортных средств:', Vehicle.getTotalVehicles());
    console.log('Все тесты пройдены! ✅');
}

runTests();