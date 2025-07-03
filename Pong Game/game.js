const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 16;
const paddleHeight = 100;
const ballRadius = 10;

const player = {
    x: 0,
    y: (canvas.height - paddleHeight) / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#4CAF50",
    score: 0
};

const ai = {
    x: canvas.width - paddleWidth,
    y: (canvas.height - paddleHeight) / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#F44336",
    score: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: "#fff"
};

// Draw a rectangle
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Draw a circle (for ball)
function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

// Draw text (for scores)
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

// Collision detection
function collision(b, p) {
    return (
        b.x + b.radius > p.x &&
        b.x - b.radius < p.x + p.width &&
        b.y + b.radius > p.y &&
        b.y - b.radius < p.y + p.height
    );
}

// Control left paddle using mouse
canvas.addEventListener("mousemove", movePaddle);

function movePaddle(evt) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;

    // Clamp paddle within canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

let paused = false;

document.addEventListener('keydown', function (e) {
    if (e.key === 'p' || e.key === 'P') {
        paused = !paused;
    }
});

function gameLoop() {
    if (!paused) {
        update();
        render();
    }
    requestAnimationFrame(gameLoop);
}

document.getElementById("restartBtn").addEventListener("click", () => {
    player.score = 0;
    ai.score = 0;
    resetBall();
});

let maxScore = 5;
let gameOver = false;

function update() {
    if (gameOver) return;

    // ... existing update logic

    if (player.score >= maxScore || ai.score >= maxScore) {
        gameOver = true;
        alert(player.score >= maxScore ? "You Win!" : "AI Wins!");
    }
}


// Update game objects
function update() {
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Left paddle collision
    if (collision(ball, player)) {
        // Calculate collision point
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);

        // Calculate angle in radians (max 45deg)
        let angleRad = (Math.PI / 4) * collidePoint;
        // X direction after hit
        let direction = 1;

        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // Slightly increase speed
        ball.speed += 0.3;
    }

    // Right paddle collision (AI)
    if (collision(ball, ai)) {
        let collidePoint = ball.y - (ai.y + ai.height / 2);
        collidePoint = collidePoint / (ai.height / 2);

        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = -1;

        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        ball.speed += 0.3;
    }

    // Left or right wall: score
    if (ball.x - ball.radius < 0) {
        // AI scores
        ai.score++;
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        // Player scores
        player.score++;
        resetBall();
    }

    // AI paddle movement (basic)
    let aiCenter = ai.y + ai.height / 2;
    if (ball.y < aiCenter - 10) {
        ai.y -= 4;
    } else if (ball.y > aiCenter + 10) {
        ai.y += 4;
    }

    // Clamp AI paddle within canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

// Render game objects
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
    drawText(ai.score, 3 * canvas.width / 4, 60);
}

// Main game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();