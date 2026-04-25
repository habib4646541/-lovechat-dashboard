// Basic Math Tetris game simplified version

class MathTetris {
    constructor() {
        this.canvas = document.getElementById('tetrisCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 25;

        this.board = [];
        this.score = 0;
        this.level = 1;
        this.lines = 0;

        this.dropInterval = 1000;
        this.lastDrop = 0;

        this.currentPiece = null;
        this.nextPiece = null;

        this.gameOverFlag = false;
        this.paused = false;

        this.colors = {
            'I': '#00f0f0',
            'J': '#0000f0',
            'L': '#f0a000',
            'O': '#f0f000',
            'S': '#00f000',
            'T': '#a000f0',
            'Z': '#f00000'
        };

        this.pieces = {
            'I': [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            'J': [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            'L': [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            'O': [
                [1, 1],
                [1, 1]
            ],
            'S': [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            'T': [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            'Z': [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ]
        };

        this.init();
    }

    init() {
        this.resetBoard();
        this.spawnPiece();
        this.bindEvents();
        this.update();
    }

    resetBoard() {
        this.board = Array(this.BOARD_HEIGHT).fill(null).map(() => Array(this.BOARD_WIDTH).fill(0));
    }

    spawnPiece() {
        const types = Object.keys(this.pieces);
        this.currentPiece = {
            shape: this.pieces[types[Math.floor(Math.random() * types.length)]],
            x: Math.floor(this.BOARD_WIDTH / 2) - 1,
            y: 0
        };
    }

    bindEvents() {
        document.getElementById('gameStart').onclick = () => {
            this.resetBoard();
            this.spawnPiece();
            this.score = 0;
            this.level = 1;
            this.lines = 0;
            this.dropInterval = 1000;
            this.gameOverFlag = false;
            this.paused = false;
            this.updateStats();
            this.update();
        };

        document.getElementById('gamePause').onclick = () => {
            this.paused = !this.paused;
            document.getElementById('gamePause').textContent = this.paused ? "▶️ Resume" : "⏸️ Pause";
            if(!this.paused) this.update();
        };

        window.addEventListener('keydown', e => {
            if (this.gameOverFlag || this.paused) return;

            switch(e.key) {
                case 'ArrowLeft':
                    if (this.validMove(this.currentPiece.shape, this.currentPiece.x - 1, this.currentPiece.y)) {
                        this.currentPiece.x -= 1;
                        this.draw();
                    }
                    break;
                case 'ArrowRight':
                    if (this.validMove(this.currentPiece.shape, this.currentPiece.x + 1, this.currentPiece.y)) {
                        this.currentPiece.x +=1;
                        this.draw();
                    }
                    break;
                case 'ArrowDown':
                    if (this.validMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
                        this.currentPiece.y += 1;
                        this.draw();
                    } else {
                        this.lockPiece();
                        this.spawnPiece();
                        if (!this.validMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
                            this.gameOver();
                        }
                    }
                    this.update();
                    break;
                case 'ArrowUp':
                    const rotated = this.rotate(this.currentPiece.shape);
                    if (this.validMove(rotated, this.currentPiece.x, this.currentPiece.y)) {
                        this.currentPiece.shape = rotated;
                        this.draw();
                    }
                    break;
                case ' ':
                    while(this.validMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
                        this.currentPiece.y++;
                    }
                    this.lockPiece();
                    this.spawnPiece();
                    if (!this.validMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
                        this.gameOver();
                    }
                    this.draw();
                    this.update();
                    break;
            }
        });
    }

    validMove(shape, x, y) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    let newX = x + col;
                    let newY = y + row;
                    if (newX < 0 || newX >= this.BOARD_WIDTH || newY >= this.BOARD_HEIGHT)
                        return false;
                    if (newY >= 0 && this.board[newY][newX])
                        return false;
                }
            }
        }
        return true;
    }

    lockPiece() {
        let shape = this.currentPiece.shape;
        let x = this.currentPiece.x;
        let y = this.currentPiece.y;

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    let boardY = y + row;
                    let boardX = x + col;
                    if (boardY >= 0 && boardY < this.BOARD_HEIGHT && boardX >= 0 && boardX < this.BOARD_WIDTH) {
                        this.board[boardY][boardX] = 1; // using 1 for filled block
                    }
                }
            }
        }

        this.removeLines();
    }

    removeLines() {
        let linesCleared = 0;
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell === 1)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        if (linesCleared) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level -1) * 80);
            this.updateStats();
        }
    }

    rotate(shape) {
        const N = shape.length;
        let newShape = Array.from({length: N}, () => Array(N).fill(0));
        for(let i=0; i<N; i++) {
            for(let j=0; j<N; j++) {
                newShape[j][N - 1 - i] = shape[i][j];
            }
        }
        return newShape;
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
        this.ctx.strokeStyle = '#333';
        this.ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // draw board
        for(let y=0; y<this.BOARD_HEIGHT; y++) {
            for(let x=0; x<this.BOARD_WIDTH; x++) {
                if(this.board[y][x]) {
                    this.drawBlock(x, y, '#ff6b6b');
                }
            }
        }
        // draw current piece
        let shape = this.currentPiece.shape;
        for(let row=0; row<shape.length; row++) {
            for(let col=0; col<shape[row].length; col++) {
                if(shape[row][col]) {
                    this.drawBlock(this.currentPiece.x + col, this.currentPiece.y + row, '#ff6b6b');
                }
            }
        }
    }

    updateStats() {
        document.getElementById('gameScore').textContent = this.score;
        document.getElementById('gameLevel').textContent = this.level;
    }

    update() {
        if(this.gameOverFlag || this.paused) return;
        let now = Date.now();
        if(!this.lastDrop) this.lastDrop = now;
        if(now - this.lastDrop > this.dropInterval) {
            if(this.validMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
                this.currentPiece.y++;
            } else {
                this.lockPiece();
                this.spawnPiece();
                if(!this.validMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
                    this.gameOver();
                    return;
                }
            }
            this.lastDrop = now;
            this.updateStats();
            this.draw();
        }
        requestAnimationFrame(() => this.update());
    }

    gameOver() {
        this.gameOverFlag = true;
        alert(`Game Over!\nScore: ${this.score}\nLevel: ${this.level}\nLines: ${this.lines}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.tetris = new MathTetris();
});