// Get canvas and context
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const paddleWidth = 16;
const paddleHeight = 100;
const ballRadius = 10;
const maxScore = 5;

// Game state variables
let paused = false;
let gameOver = false;

// Player paddle
const player = {
    x: 0,
    y: (canvas.height - paddleHeight) / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#4CAF50",
    score: 0
};

// AI paddle
const ai = {
    x: canvas.width - paddleWidth,
    y: (canvas.height - paddleHeight) / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#F44336",
    score: 0
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: "#fff"
};

// Utility: draw rectangle (paddles, background, net)
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Utility: draw ball
function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

// Utility: draw score text
function drawText(text, x, y) {
    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.fillText(text, x, y);
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 5;
}

// Detect collision between ball and paddle
function collision(b, p) {
    return (
        b.x + b.radius > p.x &&
        b.x - b.radius < p.x + p.width &&
        b.y + b.radius > p.y &&
        b.y - b.radius < p.y + p.height
    );
}

// Move player paddle with mouse
canvas.addEventListener("mousemove", (evt) => {
    let rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;

    // Clamp paddle within canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height)
        player.y = canvas.height - player.height;
});

// Pause/resume button
document.getElementById("pauseBtn").addEventListener("click", () => {
    if (gameOver) return;
    paused = !paused;
    document.getElementById("pauseBtn").textContent = paused ? "Resume" : "Pause";
});

// Restart button
document.getElementById("restartBtn").addEventListener("click", () => {
    player.score = 0;
    ai.score = 0;
    gameOver = false;
    paused = false;
    ball.speed = 5;
    resetBall();
    document.getElementById("pauseBtn").textContent = "Pause";
    document.getElementById("statusMsg").textContent = "";
});

// Game update logic
function update() {
    if (paused || gameOver) return;

    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Bounce off top and bottom
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Player paddle collision
    if (collision(ball, player)) {
        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = 1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.3;
    }

    // AI paddle collision
    if (collision(ball, ai)) {
        let collidePoint = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.3;
    }

    // Score conditions
    if (ball.x - ball.radius < 0) {
        ai.score++;
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }

    // Simple AI movement
    let aiCenter = ai.y + ai.height / 2;
    if (ball.y < aiCenter - 10) ai.y -= 4;
    else if (ball.y > aiCenter + 10) ai.y += 4;

    // Clamp AI within canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height)
        ai.y = canvas.height - ai.height;

    // Game over check
    if (player.score >= maxScore || ai.score >= maxScore) {
        gameOver = true;
        document.getElementById("statusMsg").textContent =
            player.score > ai.score ? "🎉 You Win!" : "💀 AI Wins!";
    }
}

// Draw all game objects
function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#222");

    // Net
    for (let i = 0; i < canvas.height; i += 30) {
        drawRect(canvas.width / 2 - 2, i, 4, 20, "#fff");
    }

    // Paddles and ball
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);

    // Scores
    drawText(player.score, canvas.width / 4, 60);
    drawText(ai.score, (3 * canvas.width) / 4, 60);
}

// Main game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
