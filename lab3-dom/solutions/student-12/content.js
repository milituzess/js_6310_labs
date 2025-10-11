'use strict' // включает строгий режим JavaScript

function cyberpunkStyles() {
    const style = document.createElement('style'); // создает новый HTML-элемент <style>. в этот элемент мы будем помещать наши CSS-стили
    style.id = 'spring-styles'; // дает элементу уникальный идентификатор. чтобы потом можно было найти и удалить этот элемент
    // Записывает CSS-код внутрь элемента <style>
    style.textContent = ` 
        /* 1. цвет текста */
        body {
            color: #ffffffff !important;
        }
        
        /* 2. шапка */
        header, .header, #header {
            background-color: #8700FF !important;
            border: none !important;
            box-shadow: 
                0 0 20px #8700FF,
                0 0 40px #8700FF !important;
            margin-bottom: 40px !important;
        }
        
        /* 3. ссылки  */
        a {
            color: #ffffffff !important;
            text-shadow: 0 0 10px #017f81ff, 0 0 20px #00FBFF, 0 0 30px #ffffffff !important;
            font-weight: 600 !important;
        }
        
        /* 4. ссылки при наведении */
        a:hover {
            color: #00d5d9ff !important;
            background-color: #b6feffff !important;
            border: none !important;
            box-shadow: 
                0 0 20px #b6feffff,
                0 0 40px #b6feffff !important;
        }
        
        /* 5. кнопки */
        button, .button, input[type="submit"] {
            background-color: #00FBFF !important; 
            border-radius: 1px !important;
            border: 2px solid #b6feffff !important;
        }
        /* кнопки при наведении */
        button:hover {
            box-shadow: 
                0 0 20px #b6feffff,
                0 0 40px #b6feffff !important;
        }
        
        
        /* 6. заголовки */
        h1, h2, h3 {
            color: #0088ffff !important;
            text-shadow: 0 0 10px #0433FF, 0 0 20px #0433FF, 0 0 30px #0433FF !important;
            font-weight: 900 !important;
        }
        
        /* 7. футер */
        footer, .footer {
            background-color: #FF008B !important;
            box-shadow: 
                0 0 20px #FF008B,
                0 0 40px #FF008B !important;
            margin-top: 40px !important;
        }
        /* 8. ссылки в футере */
        footer a, .footer a, footer a:visited, .footer a:visited {
            color: #FFFFFF !important; /* Белый цвет для обычных и посещенных ссылок */
            text-decoration: none !important; /* Убираем подчеркивание */
            text-shadow: 0 0 20px #fdcde8ff, 0 0 30px #ff9bd2ff, 0 0 40px #ff4fb0ff !important;
        }
        /* 9. ссылки при наведении в футере */
        footer a:hover, .footer a:hover {
            color: #00d5d9ff !important;
            background-color: #b6feffff !important;
            border: none !important;
            box-shadow: 
                0 0 20px #b6feffff,
                0 0 40px #b6feffff !important;
        }

        /* 10. навигация в шапке */
        nav, .navigation, .menu {
            background-color: #FF008B !important;
            border: none !important;
            box-shadow: 
                0 0 20px #FF008B,
                0 0 40px #FF008B !important;
            border-radius: 0px !important;
            padding: 10px !important;
        }
        /* 11. вход */
        .login_links{
            background-color: #FF008B !important;
            border: none !important;
            box-shadow: 
                0 0 10px #FF008B,
                0 0 20px #FF008B !important;
            border-radius: 0px !important;
        }
        /* 12. четность недели */
        .week_parity{
            background-color: #FF008B !important;
            border: none !important;
            box-shadow: 
                0 0 10px #FF008B,
                0 0 20px #FF008B !important;
            border-radius: 0px !important;
        }

        /* 13. задний фон */
        .page_wrapper {
            background-color: #000000ff !important;
        }
        .main_slider_holder {
            background: #000 !important;
        }
        .news_box {
            background: #000 !important;
        }
        /* стратегические проекты университета */
        .tab_items{
            background: #000000ff !important;
        }
        /* учебные подразделения и ближайшие события */
        .slick-track{
            background: #000000ff !important;
            margin-top: 40px !important;
        }
        /* ближайшие события, стратегические проекты университета, открой книту каи */
        .portlet-content{
            background: #000000ff !important;
        }

        

        /* 14. месяц и год в разделе ближайшие события */
        .events_nav{
            background: #FF008B !important;
            box-shadow: 
                0 0 40px #FF008B,
                0 0 80px #FF008B,
                0 0 120px #FF008B !important;
            margin-top: 100px !important;
        }

        /* 15. учебные подразделения */
        .institutes_slider_box.institutes_box.cf.disable-user-actions{
            box-shadow: 
                0 0 40px #8700FF,
                0 0 80px #8700FF,
                0 0 120px #8700FF !important;
            margin-bottom: 120px !important;
            background: #000000ff !important;
        }

        /* 16. кнопки вперед и назад */
        .slick-prev, .slick-next{
            background: #FF008B !important;
            box-shadow: 
                0 0 40px #FF008B,
                0 0 80px #FF008B,
                0 0 120px #FF008B !important;
        }
        .inst-slide.prev.cf, .inst-slide.next{
            background: #000000ff !important;
            z-index: 9999 !important;
            opacity: 1 !important;
            width: 5% !important;
        }



    `;
    document.head.appendChild(style); // добавляет созданный элемент <style> в <head> страницы
}




function removeSpringStyles() { // находит элемент стилей по ID и удаляет его. Чтобы вернуть сайту оригинальный вид
    const style = document.getElementById('spring-styles');
    if (style) style.remove();
}

function createToggleButton() { // cоздает новую кнопку. Пользователь будет нажимать на нее для включения/выключения стилей
    const button = document.createElement('button'); 
    button.id = 'spring-toggle'; // дает кнопке уникальный ID
    button.innerHTML = 'Включить киберпанк'; // текст на кнопке

    Object.assign(button.style, { // применяет несколько CSS-стилей к кнопке сразу
        position: 'fixed', // кнопка всегда на одном месте при прокрутке
        top: '15px', // позиция в правом верхнем углу
        right: '15px', // позиция в правом верхнем углу
        zIndex: '10000', // кнопка всегда поверх других элементов
        background: '#00FBFF', // цвет кнопки
        color: 'white', // цвет текста кнопки
        border: '2px solid #b6feffff', // границ нет
        borderRadius: '1px', // скругление
        padding: '10px 16px', // внутренние отступы: 10px сверху/снизу, 16px слева/справа
        fontSize: '14px', // размер шрифта текста
        cursor: 'pointer', // курсор меняется на руку при наведении
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)', // тень около кнопки
        transition: 'all 0.2s ease' // плавная анимация при изменении стилей кнопки
    });


    // логика переключения
    button.onclick = function() {
        const isEnabled = localStorage.getItem('springStyle') === 'true'; // проверяет в локальном хранилище, включены ли стили
        // localStorage сохраняет настройки между перезагрузками страницы

        if (isEnabled) { // если стили включены - выключает
            removeSpringStyles();
            localStorage.setItem('springStyle', 'false'); // переключение
            button.innerHTML = 'Включить киберпанк'; // обновление текста кнопки
            button.style.background = '#00FBFF'; // обновление цвета кнопки
        } else { // если выключены - включает
            cyberpunkStyles();
            localStorage.setItem('springStyle', 'true');
            button.innerHTML = 'Включить базу';
        }
    };

    document.body.appendChild(button); // добавляет созданный элемент button в <body> страницы
}

function demonstrateDOMUsage() {
    console.log("🔧 Demonstrating DOM methods:"); // выводит сообщение в консоль браузера

    // getElementById
    const page = document.getElementById('page_wrapper'); // ищет элемент с id="page_wrapper"
    if (page) {
        console.log("✅ getElementById: page_wrapper found"); // выводит сообщение в консоль браузера
    }
    else {
        console.log("❌ getElementById: page_wrapper not found"); 
    }

    // querySelector с сложным селектором (два класса)
    const mainContent = document.querySelector('footer .section'); // ищет элемент с классом section внутри <footer> (пробел означает "потомок")
    if (mainContent) {
        const classes1 = mainContent.className ? ` class="${mainContent.className}"` : '';
        console.log(`✅ querySelector (complex): footer.section found (${mainContent.tagName.toLowerCase()}, ${classes1})`); // выводит сообщение в консоль браузера

        // parentElement
        const parent = mainContent.parentElement; // свойство DOM-элемента, которое возвращает родительский элемент текущего элемента (если он существует).
        if (parent) {
            const classes2 = parent.className ? ` class="${parent.className}"` : '';
            console.log(`✅ parentElement: parent found (${parent.tagName.toLowerCase()}, ${classes2})`); // выводит сообщение в консоль браузера
        }
        else {
            console.log("❌ parentElement: parent not found"); 
        }

        // children
        const children = mainContent.children; // получает все дочерние элементы, показывает навигацию по DOM-дереву
        console.log(`✅ children: ${children.length} child elements found`); // выводит сообщение в консоль браузера
    }
    else {
        console.log("❌ querySelector (complex): footer.section not found");
    }

    // querySelectorAll
    const links = document.querySelectorAll('a'); //метод возвращает список всех найденных элементов (<a>/ссылок)
    console.log(`✅ querySelectorAll: found ${links.length} <a>`); // выводит сообщение в консоль браузера
}

// Основная функция инициализации
function init() {
    console.log("🚀 Initializing KAI Spring Style extension"); // выводит сообщение о начале инициализации

    createToggleButton(); // создает кнопку  
    demonstrateDOMUsage(); // запускает демонстрационные функции

    // Применяем стили если они были включены
    const isEnabled = localStorage.getItem('springStyle') === 'true'; // проверяет сохраненные настройки и применяет стили если нужно, чтобы при перезагрузке страницы стили оставались включенными
    if (isEnabled) {
        cyberpunkStyles();
        const btn = document.getElementById('spring-toggle');
        btn.innerHTML = 'Включить базу';
    }

    console.log("✅ Extension initialization complete"); // выводит сообщение в консоль браузера
}

// Запуск расширения, ждет полной загрузки страницы перед запуском
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}