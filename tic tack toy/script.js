document.addEventListener('DOMContentLoaded', function() {
    const gameStatus = document.getElementById('game-status');
    const resetBtn = document.getElementById('reset-btn');
    const resetScoresBtn = document.getElementById('reset-scores-btn');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    const scoreDraw = document.getElementById('score-draw');
    const modeSelect = document.getElementById('mode-select');
    const playerXNameInput = document.getElementById('player-x-name');
    const playerONameInput = document.getElementById('player-o-name');

    let currentPlayer = 'x';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let scores = { x: 0, o: 0, draw: 0 };
    let mode = "two"; // default mode
    
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function getPlayerName(player) {
        if (player === 'x') {
            return playerXNameInput.value.trim() || "Player X";
        } else {
            if (mode === "two") {
                return playerONameInput.value.trim() || "Player O";
            } else {
                return playerONameInput.value.trim() || "Computer";
            }
        }
    }

    function handleCellClick(e) {
        const cell = e.target;
        const cellIndex = parseInt(cell.getAttribute('data-index'));
        
        if (gameState[cellIndex] !== '' || !gameActive) return;
        
        makeMove(cellIndex, currentPlayer);
        
        if (gameActive && mode !== "two" && currentPlayer === 'o') {
            setTimeout(computerMove, 500);
        }
    }
    
    function makeMove(index, player) {
        gameState[index] = player;
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        cell.classList.add(player);
        
        if (checkWinner(player)) {
            gameStatus.textContent = `${getPlayerName(player)} Wins!`;
            gameStatus.classList.add('status-win');
            scores[player]++;
            updateScores();
            gameActive = false;
            return;
        }
        
        if (checkDraw()) {
            gameStatus.textContent = 'Game Draw!';
            gameStatus.classList.add('status-draw');
            scores.draw++;
            updateScores();
            gameActive = false;
            return;
        }
        
        currentPlayer = player === 'x' ? 'o' : 'x';
        gameStatus.textContent = `${getPlayerName(currentPlayer)}'s Turn`;
    }

    function computerMove() {
        let index;
        if (mode === "easy") {
            index = randomMove();
        } else if (mode === "moderate") {
            index = smartMove() ?? randomMove();
        } else if (mode === "hard") {
            index = bestMove();
        }
        if (index !== undefined) makeMove(index, 'o');
    }
    
    // --- Difficulty Functions ---
    function randomMove() {
        let available = gameState.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
        return available[Math.floor(Math.random() * available.length)];
    }
    
    function smartMove() {
        for (let [a, b, c] of winningConditions) {
            if (gameState[a] === 'o' && gameState[b] === 'o' && gameState[c] === '') return c;
            if (gameState[a] === 'o' && gameState[c] === 'o' && gameState[b] === '') return b;
            if (gameState[b] === 'o' && gameState[c] === 'o' && gameState[a] === '') return a;
        }
        for (let [a, b, c] of winningConditions) {
            if (gameState[a] === 'x' && gameState[b] === 'x' && gameState[c] === '') return c;
            if (gameState[a] === 'x' && gameState[c] === 'x' && gameState[b] === '') return b;
            if (gameState[b] === 'x' && gameState[c] === 'x' && gameState[a] === '') return a;
        }
        return null;
    }
    
    function bestMove() {
        let bestScore = -Infinity;
        let move;
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'o';
                let score = minimax(gameState, 0, false);
                gameState[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }
    
    function minimax(board, depth, isMaximizing) {
        if (checkWinner('o')) return 10 - depth;
        if (checkWinner('x')) return depth - 10;
        if (checkDraw()) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'o';
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'x';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    // --- Helpers ---
    function checkWinner(player) {
        return winningConditions.some(cond => cond.every(idx => gameState[idx] === player));
    }
    
    function checkDraw() {
        return gameState.every(cell => cell !== '');
    }
    
    function resetGame() {
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'x';
        gameStatus.textContent = `${getPlayerName(currentPlayer)}'s Turn`;
        gameStatus.classList.remove('status-win', 'status-draw');
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('x', 'o');
        });
    }
    
    function resetScores() {
        scores = { x: 0, o: 0, draw: 0 };
        updateScores();
        resetGame();
    }
    
    function updateScores() {
        scoreX.textContent = scores.x;
        scoreO.textContent = scores.o;
        scoreDraw.textContent = scores.draw;
    }
    
    // --- Event Listeners ---
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    resetBtn.addEventListener('click', resetGame);
    resetScoresBtn.addEventListener('click', resetScores);
    modeSelect.addEventListener('change', () => {
        mode = modeSelect.value;
        resetGame();
    });
    
    // Init
    resetGame();
    updateScores();
});
