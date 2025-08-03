class CandyCrushGame {
    constructor() {
        this.board = [];
        this.boardSize = 8;
        this.candyTypes = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒'];
        this.selectedCandy = null;
        this.score = 0;
        this.moves = 30;
        this.target = 1000;
        this.isAnimating = false;
        this.combo = 0;
        
        this.initializeGame();
        this.bindEvents();
    }
    
    initializeGame() {
        this.createBoard();
        this.renderBoard();
        this.updateUI();
    }
    
    createBoard() {
        this.board = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                do {
                    this.board[row][col] = Math.floor(Math.random() * this.candyTypes.length);
                } while (this.hasInitialMatches(row, col));
            }
        }
    }
    
    hasInitialMatches(row, col) {
        const candyType = this.board[row][col];
        
        // 检查水平匹配
        if (col >= 2 && 
            this.board[row][col-1] === candyType && 
            this.board[row][col-2] === candyType) {
            return true;
        }
        
        // 检查垂直匹配
        if (row >= 2 && 
            this.board[row-1][col] === candyType && 
            this.board[row-2][col] === candyType) {
            return true;
        }
        
        return false;
    }
    
    renderBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const candy = document.createElement('div');
                candy.className = 'candy';
                candy.dataset.row = row;
                candy.dataset.col = col;
                candy.dataset.type = this.board[row][col];
                candy.textContent = this.candyTypes[this.board[row][col]];
                candy.addEventListener('click', () => this.handleCandyClick(row, col));
                gameBoard.appendChild(candy);
            }
        }
    }
    
    handleCandyClick(row, col) {
        if (this.isAnimating || this.moves <= 0) return;
        
        const clickedCandy = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (!this.selectedCandy) {
            this.selectedCandy = { row, col };
            clickedCandy.classList.add('selected');
        } else {
            const prevSelected = document.querySelector('.selected');
            if (prevSelected) prevSelected.classList.remove('selected');
            
            if (this.selectedCandy.row === row && this.selectedCandy.col === col) {
                this.selectedCandy = null;
                return;
            }
            
            if (this.isAdjacent(this.selectedCandy.row, this.selectedCandy.col, row, col)) {
                this.swapCandies(this.selectedCandy.row, this.selectedCandy.col, row, col);
            }
            
            this.selectedCandy = null;
        }
    }
    
    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    async swapCandies(row1, col1, row2, col2) {
        this.isAnimating = true;
        
        // 交换数据
        const temp = this.board[row1][col1];
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;
        
        // 更新视觉效果
        this.updateCandyDisplay(row1, col1);
        this.updateCandyDisplay(row2, col2);
        
        await this.delay(300);
        
        const matches = this.findMatches();
        if (matches.length > 0) {
            this.moves--;
            this.combo = 0;
            await this.processMatches();
        } else {
            // 如果没有匹配，撤销交换
            const temp = this.board[row1][col1];
            this.board[row1][col1] = this.board[row2][col2];
            this.board[row2][col2] = temp;
            this.updateCandyDisplay(row1, col1);
            this.updateCandyDisplay(row2, col2);
        }
        
        this.updateUI();
        this.checkGameEnd();
        this.isAnimating = false;
    }
    
    updateCandyDisplay(row, col) {
        const candy = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (candy) {
            candy.dataset.type = this.board[row][col];
            candy.textContent = this.candyTypes[this.board[row][col]];
        }
    }
    
    findMatches() {
        const matches = [];
        
        // 查找水平匹配
        for (let row = 0; row < this.boardSize; row++) {
            let count = 1;
            let currentType = this.board[row][0];
            
            for (let col = 1; col < this.boardSize; col++) {
                if (this.board[row][col] === currentType) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let i = col - count; i < col; i++) {
                            matches.push({ row, col: i });
                        }
                    }
                    count = 1;
                    currentType = this.board[row][col];
                }
            }
            
            if (count >= 3) {
                for (let i = this.boardSize - count; i < this.boardSize; i++) {
                    matches.push({ row, col: i });
                }
            }
        }
        
        // 查找垂直匹配
        for (let col = 0; col < this.boardSize; col++) {
            let count = 1;
            let currentType = this.board[0][col];
            
            for (let row = 1; row < this.boardSize; row++) {
                if (this.board[row][col] === currentType) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let i = row - count; i < row; i++) {
                            matches.push({ row: i, col });
                        }
                    }
                    count = 1;
                    currentType = this.board[row][col];
                }
            }
            
            if (count >= 3) {
                for (let i = this.boardSize - count; i < this.boardSize; i++) {
                    matches.push({ row: i, col });
                }
            }
        }
        
        return matches;
    }
    
    async processMatches() {
        let matches = this.findMatches();
        
        while (matches.length > 0) {
            this.combo++;
            
            // 标记匹配的糖果
            matches.forEach(match => {
                const candy = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`);
                if (candy) candy.classList.add('matching');
            });
            
            await this.delay(500);
            
            // 计算分数
            const baseScore = matches.length * 10;
            const comboBonus = this.combo > 1 ? (this.combo - 1) * 50 : 0;
            const totalScore = baseScore + comboBonus;
            this.score += totalScore;
            
            // 显示连击效果
            if (this.combo > 1) {
                this.showComboEffect(this.combo);
            }
            
            // 创建粒子效果
            matches.forEach(match => {
                this.createParticles(match.row, match.col);
            });
            
            // 移除匹配的糖果
            matches.forEach(match => {
                this.board[match.row][match.col] = -1;
            });
            
            await this.delay(200);
            
            // 让糖果下落
            await this.dropCandies();
            
            // 填充新糖果
            this.fillBoard();
            
            await this.delay(300);
            
            // 检查新的匹配
            matches = this.findMatches();
        }
    }
    
    async dropCandies() {
        for (let col = 0; col < this.boardSize; col++) {
            let writePos = this.boardSize - 1;
            
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (this.board[row][col] !== -1) {
                    if (row !== writePos) {
                        this.board[writePos][col] = this.board[row][col];
                        this.board[row][col] = -1;
                        
                        // 更新视觉效果
                        const candy = document.querySelector(`[data-row="${writePos}"][data-col="${col}"]`);
                        if (candy) {
                            candy.dataset.type = this.board[writePos][col];
                            candy.textContent = this.candyTypes[this.board[writePos][col]];
                            candy.classList.add('falling');
                        }
                    }
                    writePos--;
                }
            }
        }
        
        await this.delay(500);
        
        // 移除动画类
        document.querySelectorAll('.falling').forEach(candy => {
            candy.classList.remove('falling');
        });
    }
    
    fillBoard() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === -1) {
                    this.board[row][col] = Math.floor(Math.random() * this.candyTypes.length);
                    
                    const candy = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (candy) {
                        candy.dataset.type = this.board[row][col];
                        candy.textContent = this.candyTypes[this.board[row][col]];
                        candy.classList.add('falling');
                        candy.classList.remove('matching');
                    }
                }
            }
        }
    }
    
    createParticles(row, col) {
        const candy = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!candy) return;
        
        const rect = candy.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
            
            const angle = (i / 8) * Math.PI * 2;
            const velocity = 50 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--vx', vx + 'px');
            particle.style.setProperty('--vy', vy + 'px');
            
            document.getElementById('particles').appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }
    }
    
    showComboEffect(combo) {
        const comboText = document.createElement('div');
        comboText.className = 'combo-text';
        comboText.textContent = `连击 x${combo}!`;
        comboText.style.left = '50%';
        comboText.style.top = '50%';
        comboText.style.transform = 'translate(-50%, -50%)';
        
        document.body.appendChild(comboText);
        
        setTimeout(() => {
            if (comboText.parentNode) {
                comboText.parentNode.removeChild(comboText);
            }
        }, 1000);
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('moves').textContent = this.moves;
        
        const progress = Math.min((this.score / this.target) * 100, 100);
        document.getElementById('progressFill').style.width = progress + '%';
    }
    
    checkGameEnd() {
        if (this.score >= this.target) {
            this.showGameOverModal('恭喜过关！', '你成功达到了目标分数！');
        } else if (this.moves <= 0) {
            this.showGameOverModal('游戏结束', '步数用完了，再试一次吧！');
        }
    }
    
    showGameOverModal(title, message) {
        document.getElementById('gameOverTitle').textContent = title;
        document.getElementById('gameOverMessage').textContent = message;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverModal').style.display = 'block';
    }
    
    newGame() {
        this.score = 0;
        this.moves = 30;
        this.combo = 0;
        this.selectedCandy = null;
        this.isAnimating = false;
        
        document.getElementById('gameOverModal').style.display = 'none';
        
        this.createBoard();
        this.renderBoard();
        this.updateUI();
    }
    
    showHint() {
        if (this.isAnimating) return;
        
        // 简单的提示：高亮一个可能的移动
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                // 检查右边
                if (col < this.boardSize - 1) {
                    const temp = this.board[row][col];
                    this.board[row][col] = this.board[row][col + 1];
                    this.board[row][col + 1] = temp;
                    
                    if (this.findMatches().length > 0) {
                        const candy1 = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                        const candy2 = document.querySelector(`[data-row="${row}"][data-col="${col + 1}"]`);
                        
                        candy1.style.boxShadow = '0 0 20px #00ff00';
                        candy2.style.boxShadow = '0 0 20px #00ff00';
                        
                        setTimeout(() => {
                            candy1.style.boxShadow = '';
                            candy2.style.boxShadow = '';
                        }, 2000);
                        
                        // 恢复原状
                        const temp2 = this.board[row][col];
                        this.board[row][col] = this.board[row][col + 1];
                        this.board[row][col + 1] = temp2;
                        return;
                    }
                    
                    // 恢复原状
                    const temp2 = this.board[row][col];
                    this.board[row][col] = this.board[row][col + 1];
                    this.board[row][col + 1] = temp2;
                }
                
                // 检查下面
                if (row < this.boardSize - 1) {
                    const temp = this.board[row][col];
                    this.board[row][col] = this.board[row + 1][col];
                    this.board[row + 1][col] = temp;
                    
                    if (this.findMatches().length > 0) {
                        const candy1 = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                        const candy2 = document.querySelector(`[data-row="${row + 1}"][data-col="${col}"]`);
                        
                        candy1.style.boxShadow = '0 0 20px #00ff00';
                        candy2.style.boxShadow = '0 0 20px #00ff00';
                        
                        setTimeout(() => {
                            candy1.style.boxShadow = '';
                            candy2.style.boxShadow = '';
                        }, 2000);
                        
                        // 恢复原状
                        const temp2 = this.board[row][col];
                        this.board[row][col] = this.board[row + 1][col];
                        this.board[row + 1][col] = temp2;
                        return;
                    }
                    
                    // 恢复原状
                    const temp2 = this.board[row][col];
                    this.board[row][col] = this.board[row + 1][col];
                    this.board[row + 1][col] = temp2;
                }
            }
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    bindEvents() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.newGame());
        
        // 点击模态框外部关闭
        document.getElementById('gameOverModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('gameOverModal')) {
                document.getElementById('gameOverModal').style.display = 'none';
            }
        });
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new CandyCrushGame();
});