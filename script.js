// Canvas and Context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Paddle Object
const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball Object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 8,
    dx: 5,
    dy: 5,
    speed: 5
};

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    if (mouseY - paddleHeight / 2 > 0 && mouseY + paddleHeight / 2 < canvas.height) {
        player.y = mouseY - paddleHeight / 2;
    }
});

// Start button
document.getElementById('startButton').addEventListener('click', startGame);

function startGame() {
    gameRunning = true;
    playerScore = 0;
    computerScore = 0;
    resetBall();
    updateScore();
    document.getElementById('startButton').disabled = true;
    document.getElementById('gameStatus').textContent = 'Game Started!';
    gameLoop();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    
    // Random direction
    const angle = (Math.random() - 0.5) * Math.PI / 4;
    const speed = ball.speed;
    ball.dx = speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = speed * Math.sin(angle);
}

function updatePlayerPaddle() {
    // Arrow key controls
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= paddleSpeed;
    }
    if (keys['ArrowDown'] && player.y + paddleHeight < canvas.height) {
        player.y += paddleSpeed;
    }

    // Boundary check for mouse-controlled paddle (handled in mousemove)
    if (player.y < 0) player.y = 0;
    if (player.y + paddleHeight > canvas.height) {
        player.y = canvas.height - paddleHeight;
    }
}

function updateComputerPaddle() {
    const computerCenter = computer.y + paddleHeight / 2;
    
    // AI logic: follow the ball with some difficulty
    if (computerCenter < ball.y - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ball.y + 35) {
        computer.y -= computer.speed;
    }

    // Boundary check
    if (computer.y < 0) computer.y = 0;
    if (computer.y + paddleHeight > canvas.height) {
        computer.y = canvas.height - paddleHeight;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy *= -1;
        // Keep ball in bounds
        if (ball.y - ball.size < 0) ball.y = ball.size;
        if (ball.y + ball.size > canvas.height) ball.y = canvas.height - ball.size;
    }

    // Left wall (player side) - game over
    if (ball.x - ball.size < 0) {
        computerScore++;
        updateScore();
        resetBall();
    }

    // Right wall (computer side) - game over
    if (ball.x + ball.size > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }

    // Paddle collision - Player
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx *= -1.05; // Increase speed slightly
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 4;
    }

    // Paddle collision - Computer
    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx *= -1.05; // Increase speed slightly
        ball.x = computer.x - ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 4;
    }
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function drawPaddle(paddle) {
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Glow effect
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow effect
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.stroke();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw elements
    drawCenterLine();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

function gameLoop() {
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
        draw();

        // Check for max score (optional: end game at 10 points)
        if (playerScore >= 10 || computerScore >= 10) {
            endGame();
        } else {
            requestAnimationFrame(gameLoop);
        }
    }
}

function endGame() {
    gameRunning = false;
    const winner = playerScore > computerScore ? 'Player' : 'Computer';
    document.getElementById('gameStatus').textContent = `Game Over! ${winner} Wins! ${playerScore} - ${computerScore}`;
    document.getElementById('startButton').disabled = false;
}
