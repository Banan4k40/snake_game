const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Завантаження зображень
const ground = new Image();
ground.src = "img/bg.png";

const foodImg = new Image();
foodImg.src = "img/food.png";

// Константи
const box = 32;

// Змінні гри
let score = 0;
let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
let level = 1;
let speed = 100;
let isPaused = false;
let isGameOver = false;
let game;

// Оновлення відображення рахунку
document.getElementById('best-score').textContent = bestScore;

// Їжа
let food = {
    x: Math.floor((Math.random() * 14 + 1)) * box,
    y: Math.floor((Math.random() * 12 + 3)) * box,
};

// Змійка
let snake = [];
snake[0] = {
    x: 9 * box,
    y: 10 * box
};

// Напрямок
let dir;

// Обробка клавіш
document.addEventListener("keydown", handleKeyPress);

function handleKeyPress(event) {
    // Рестарт гри (Space)
    if(event.keyCode === 32 && isGameOver) {
        restartGame();
        return;
    }

    // Пауза (P)
    if(event.keyCode === 80 && !isGameOver) {
        isPaused = !isPaused;
        return;
    }

    // Рух змійки
    if(event.keyCode === 37 && dir !== "right")
        dir = "left";
    else if (event.keyCode === 38 && dir !== "down")
        dir = "up";
    else if (event.keyCode === 39 && dir !== "left")
        dir = "right";
    else if (event.keyCode === 40 && dir !== "up")
        dir = "down";
}

// Генерація їжі (перевірка, щоб не з'являлася на змійці)
function generateFood() {
    let validPosition = false;

    while(!validPosition) {
        food = {
            x: Math.floor((Math.random() * 14 + 1)) * box,
            y: Math.floor((Math.random() * 12 + 3)) * box,
        };

        validPosition = true;

        // Перевірка, чи їжа не на змійці
        for(let i = 0; i < snake.length; i++) {
            if(food.x === snake[i].x && food.y === snake[i].y) {
                validPosition = false;
                break;
            }
        }
    }
}

// Перевірка зіткнення з хвостом
function eatTail(head, arr) {
    for(let i = 0; i < arr.length; i++) {
        if(head.x === arr[i].x && head.y === arr[i].y) {
            return true;
        }
    }
    return false;
}

// Game Over
function gameOver() {
    isGameOver = true;
    clearInterval(game);

    // Оновлення найкращого рахунку
    if(score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore.toString());
        document.getElementById('best-score').textContent = bestScore;
    }

    // Напівпрозорий фон
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Текст Game Over
    ctx.fillStyle = "#ff6b6b";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);

    // Рахунок
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Рахунок: " + score, canvas.width / 2, canvas.height / 2);

    // Найкращий рахунок
    if(score === bestScore && score > 0) {
        ctx.fillStyle = "#ffd700";
        ctx.font = "25px Arial";
        ctx.fillText("🏆 Новий рекорд! 🏆", canvas.width / 2, canvas.height / 2 + 40);
    } else {
        ctx.fillStyle = "#95a5a6";
        ctx.font = "25px Arial";
        ctx.fillText("Кращий: " + bestScore, canvas.width / 2, canvas.height / 2 + 40);
    }

    // Підказка для рестарту
    ctx.fillStyle = "#74b9ff";
    ctx.font = "22px Arial";
    ctx.fillText("Натисніть SPACE для рестарту", canvas.width / 2, canvas.height / 2 + 100);
}

// Рестарт гри
function restartGame() {
    score = 0;
    level = 1;
    speed = 100;
    isPaused = false;
    isGameOver = false;
    dir = undefined;

    snake = [];
    snake[0] = {
        x: 9 * box,
        y: 10 * box
    };

    generateFood();
    updateScoreDisplay();

    clearInterval(game);
    game = setInterval(drawGame, speed);
}

// Оновлення відображення рахунку
function updateScoreDisplay() {
    document.getElementById('current-score').textContent = score;
    document.getElementById('level').textContent = level;
}

// Основна функція малювання
function drawGame() {
    // Пауза
    if(isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "bold 50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("ПАУЗА", canvas.width / 2, canvas.height / 2);

        ctx.font = "20px Arial";
        ctx.fillText("Натисніть P для продовження", canvas.width / 2, canvas.height / 2 + 50);
        return;
    }

    // Малювання фону
    ctx.drawImage(ground, 0, 0);

    // Малювання їжі
    ctx.drawImage(foodImg, food.x, food.y);

    // Малювання змійки з покращеною графікою
    for(let i = 0; i < snake.length; i++) {
        // Основний колір
        if(i === 0) {
            // Голова
            ctx.fillStyle = "#2ecc71";
        } else {
            // Тіло
            ctx.fillStyle = "#27ae60";
        }

        ctx.fillRect(snake[i].x, snake[i].y, box, box);

        // Обводка
        ctx.strokeStyle = "#1e8449";
        ctx.lineWidth = 2;
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);

        // Очі для голови
        if(i === 0) {
            ctx.fillStyle = "white";

            if(dir === "left") {
                ctx.fillRect(snake[i].x + 5, snake[i].y + 8, 6, 6);
                ctx.fillRect(snake[i].x + 5, snake[i].y + 18, 6, 6);
            } else if(dir === "right") {
                ctx.fillRect(snake[i].x + 21, snake[i].y + 8, 6, 6);
                ctx.fillRect(snake[i].x + 21, snake[i].y + 18, 6, 6);
            } else if(dir === "up") {
                ctx.fillRect(snake[i].x + 8, snake[i].y + 5, 6, 6);
                ctx.fillRect(snake[i].x + 18, snake[i].y + 5, 6, 6);
            } else if(dir === "down") {
                ctx.fillRect(snake[i].x + 8, snake[i].y + 21, 6, 6);
                ctx.fillRect(snake[i].x + 18, snake[i].y + 21, 6, 6);
            } else {
                // За замовчуванням
                ctx.fillRect(snake[i].x + 8, snake[i].y + 8, 6, 6);
                ctx.fillRect(snake[i].x + 18, snake[i].y + 8, 6, 6);
            }
        }
    }

    // Рахунок на полі
    ctx.fillStyle = "white";
    ctx.font = "bold 45px Arial";
    ctx.textAlign = "left";
    ctx.fillText(score, box * 2.5, box * 1.7);

    // Рівень
    ctx.font = "20px Arial";
    ctx.fillText("Рівень " + level, box * 13, box * 1.5);

    // Логіка руху
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // Перевірка їжі
    if(snakeX === food.x && snakeY === food.y) {
        score++;
        updateScoreDisplay();

        // Генерація нової їжі
        generateFood();

        // Збільшення рівня кожні 5 очок
        if(score % 5 === 0 && score > 0) {
            level++;
            speed = Math.max(50, speed - 10);
            clearInterval(game);
            game = setInterval(drawGame, speed);
            updateScoreDisplay();
        }
    } else {
        snake.pop();
    }

    // Перевірка зіткнення зі стінами
    if(snakeX < box || snakeX > box * 17 || snakeY < 3 * box || snakeY > box * 17) {
        gameOver();
        return;
    }

    // Рух змійки
    if(dir === "left") snakeX -= box;
    if(dir === "right") snakeX += box;
    if(dir === "up") snakeY -= box;
    if(dir === "down") snakeY += box;

    let newHead = {
        x: snakeX,
        y: snakeY,
    };

    // Перевірка зіткнення з хвостом
    if(eatTail(newHead, snake)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);
}

// Запуск гри
game = setInterval(drawGame, speed);