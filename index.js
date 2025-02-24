const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// Middleware для обработки JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Главная страница с формой
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Конвертер валют</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            width: 400px;
            text-align: center;
          }
          h1 {
            color: #333;
            font-size: 24px;
          }
          form {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          label {
            font-size: 16px;
            color: #555;
          }
          input {
            padding: 8px;
            font-size: 14px;
            border: 1px solid #ddd;
            border-radius: 5px;
            width: 100%;
            box-sizing: border-box;
          }
          button {
            padding: 10px;
            font-size: 16px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          button:hover {
            background-color: #45a049;
          }
          p {
            font-size: 12px;
            color: #777;
          }
          a {
            color: #4CAF50;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Конвертер валют</h1>
          <form method="POST" action="/convert">
            <label>Сумма: <input type="number" name="amount" step="0.01" required></label>
            <label>Из: <input type="text" name="from" placeholder="USD" required></label>
            <label>В: <input type="text" name="to" placeholder="EUR" required></label>
            <button type="submit">Конвертировать</button>
          </form>
          <p>Примеры валют: USD, EUR, RUB, JPY</p>
        </div>
      </body>
    </html>
  `);
});

// Обработка конвертации
app.post('/convert', async (req, res) => {
  const { amount, from, to } = req.body;

  if (!from || !to || !amount || isNaN(amount) || from.length !== 3 || to.length !== 3) {
    return res.send(`
      <html>
        <head><style>${getStyles()}</style></head>
        <body>
          <div class="container">
            <h1>Ошибка: Введите корректные данные (валюты — 3 буквы, например, USD)</h1>
            <a href="/">Назад</a>
          </div>
        </body>
      </html>
    `);
  }

  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    if (!response.ok) {
      throw new Error(`API вернул ошибку: ${response.status}`);
    }
    const data = await response.json();

    if (!data.rates || !data.rates[to]) {
      throw new Error('Неподдерживаемая валюта или ошибка API');
    }

    const rate = data.rates[to];
    const result = (amount * rate).toFixed(2);
    res.send(`
      <html>
        <head><style>${getStyles()}</style></head>
        <body>
          <div class="container">
            <h1>Результат: ${result} ${to}</h1>
            <a href="/">Назад</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    res.send(`
      <html>
        <head><style>${getStyles()}</style></head>
        <body>
          <div class="container">
            <h1>Ошибка: ${error.message}</h1>
            <a href="/">Назад</a>
          </div>
        </body>
      </html>
    `);
  }
});

// Функция для повторного использования стилей
function getStyles() {
  return `
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f9;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      width: 400px;
      text-align: center;
    }
    h1 {
      color: #333;
      font-size: 24px;
    }
    a {
      color: #4CAF50;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  `;
}

// Слушаем на 0.0.0.0
app.listen(port, '0.0.0.0', () => {
  console.log(`Конвертер запущен на http://0.0.0.0:${port}`);
});
