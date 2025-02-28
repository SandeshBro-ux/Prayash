// Updated Main JS content

// Game Controller - Handles all game logic and state
const gameController = {
    currentGame: null,
    score: 0,
    // Add background music
    backgroundMusic: new Audio('./sounds/Game.wav'),
    
    init: function() {
        console.log("Game controller initialized");
        this.setupEventListeners();
        // Set up background music
        this.backgroundMusic.loop = true; // Make it loop continuously
        this.backgroundMusic.volume = 1.0; // Full volume by default
    },
    
    setupEventListeners: function() {
        // Setup main menu buttons
        document.getElementById('start-playing').addEventListener('click', () => {
            document.querySelector('.hero').classList.add('hidden');
            document.getElementById('games-section').classList.remove('hidden');
            // Start playing background music when user clicks Start Playing
            this.backgroundMusic.play().catch(e => console.log('Error playing background music:', e));
        });
        
        // Setup game card click handlers
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameType = card.getAttribute('data-game');
                document.getElementById('games-section').classList.add('hidden');
                this.startGame(gameType);
            });
        });
        
        // Setup modal buttons
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('result-modal').classList.add('hidden');
        });
        
        document.getElementById('play-again').addEventListener('click', () => {
            document.getElementById('result-modal').classList.add('hidden');
            if (this.currentGame && this.currentGame.reset) {
                this.currentGame.reset();
            }
        });
        
        document.getElementById('back-to-menu').addEventListener('click', () => {
            document.getElementById('result-modal').classList.add('hidden');
            this.exitGame();
        });
        
        // Snake game specific start button
        document.getElementById('start-snake-game').addEventListener('click', () => {
            this.startGame('snake');
        });
        
        // Add exit game button handler
        document.getElementById('exit-game').addEventListener('click', () => {
            this.exitGame();
        });
    },
    
    startGame: function(gameType) {
        console.log(`Starting game: ${gameType}`);
        
        // Reset score
        this.score = 0;
        this.updateScore();
        
        // Show game area
        document.getElementById('game-area').classList.remove('hidden');
        
        // Update game title
        document.getElementById('current-game-title').textContent = 
            gameType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        // Hide all game containers
        document.querySelectorAll('.game-container').forEach(container => {
            container.classList.add('hidden');
        });
        
        // Show specific game container
        document.getElementById(`${gameType}-container`).classList.remove('hidden');
        
        // Initialize specific game logic
        switch(gameType) {
            case 'snake':
                // Snake game is handled by the snake-game.js
                break;
            case 'tic-tac-toe':
                // Initialize Tic-Tac-Toe game
                this.initTicTacToe();
                break;
            case 'rock-paper-scissors':
                this.initRockPaperScissors();
                break;
            case 'memory':
                console.log("Memory game case reached in main.js");
                // Memory game is handled by memory-game.js
                break;
            default:
                console.log(`Game type ${gameType} not implemented yet`);
                break;
        }
    },
    
    updateScore: function(animate = false) {
        const scoreElement = document.getElementById('game-score');
        scoreElement.textContent = `Score: ${this.score}`;
        
        if (animate) {
            scoreElement.classList.add('score-animated');
            setTimeout(() => {
                scoreElement.classList.remove('score-animated');
            }, 500);
        }
    },
    
    endGame: function(finalScore, message) {
        console.log(`Game over. Final score: ${finalScore}`);
        
        // Update modal content
        document.getElementById('result-title').textContent = 'Game Over';
        document.getElementById('result-message').textContent = `${message || 'Your score'}: ${finalScore}`;
        
        // Show modal
        document.getElementById('result-modal').classList.remove('hidden');
    },
    
    exitGame: function() {
        // Stop current game
        if (this.currentGame && this.currentGame.stop) {
            this.currentGame.stop();
        }
        
        // Hide game area
        document.getElementById('game-area').classList.add('hidden');
        
        // Show games section
        document.getElementById('games-section').classList.remove('hidden');
    },
    
    initTicTacToe: function() {
        // Game state
        const board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';
        let gameActive = true;
        
        // Sound effects with local paths
        const moveSound = new Audio('sounds/move.mp3');
        const winSound = new Audio('sounds/win.mp3');
        const drawSound = new Audio('sounds/draw.mp3');
        
        // Add these debug logs to check sound loading
        console.log("Loading sounds:", {
            moveSound: moveSound.src,
            winSound: winSound.src,
            drawSound: drawSound.src
        });
        
        // Add event listeners to detect loading issues
        moveSound.addEventListener('error', (e) => console.error('Error loading move sound:', e));
        winSound.addEventListener('error', (e) => console.error('Error loading win sound:', e));
        drawSound.addEventListener('error', (e) => console.error('Error loading draw sound:', e));
        
        // Preload sounds
        moveSound.load();
        winSound.load();
        drawSound.load();
        
        // Adjust volume
        moveSound.volume = 0.5;
        winSound.volume = 0.7;
        drawSound.volume = 0.5;
        
        // Get elements
        const cells = document.querySelectorAll('.cell');
        const statusDisplay = document.getElementById('tic-tac-toe-status');
        
        // Winning combinations
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        
        // Update the game status message
        const updateStatus = () => {
            statusDisplay.textContent = gameActive ? 
                `${currentPlayer}'s turn` : 
                (board.includes('') ? 'Game over! It\'s a draw!' : `Game over! ${currentPlayer} wins!`);
        };
        
        // Handle cell click
        const handleCellClick = (clickedCellEvent) => {
            console.log("Cell clicked:", clickedCellEvent.target);
            // Get clicked cell
            const clickedCell = clickedCellEvent.target;
            const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
            console.log("Cell index:", clickedCellIndex);
            
            // Check if cell already clicked or game over
            if (board[clickedCellIndex] !== '' || !gameActive) {
                console.log("Cell already marked or game over");
                return;
            }
            
            // Play move sound
            playBeep('move');
            
            // Update game state
            board[clickedCellIndex] = currentPlayer;
            clickedCell.textContent = currentPlayer;
            clickedCell.classList.add(currentPlayer.toLowerCase());
            console.log("Updated board:", board);
            
            // Check for win first, then for draw
            if (checkWin()) {
                // Player has won
                gameActive = false;
                
                // Highlight winning cells
                highlightWinningCells();
                
                // Play win sound immediately with more robust error handling
                try {
                    console.log("Attempting to play win sound");
                    playBeep('win');
                    
                    // Update status
                    statusDisplay.textContent = `Game over! ${currentPlayer} wins!`;
                    
                    // Update score
                    this.score += 100;
                    this.updateScore(true);
                    
                    // Return early to prevent draw check
                    return;
                } catch (e) {
                    console.error("Exception trying to play win sound:", e);
                }
            }
            
            // Only check for draw if no win
            if (!board.includes('')) {
                // It's a draw
                gameActive = false;
                statusDisplay.textContent = 'Game over! It\'s a draw!';
                
                // Play draw sound
                playBeep('draw');
                
                return;
            }
            
            // Switch player
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            
            // Update status message
            updateStatus();
        };
        
        // Function to check for win
        const checkWin = () => {
            for (let i = 0; i < winningConditions.length; i++) {
                const [a, b, c] = winningConditions[i];
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    console.log(`Winning condition found: ${a}, ${b}, ${c} with ${board[a]}`);
                    return true;
                }
            }
            return false;
        };
        
        // Function to highlight winning cells
        const highlightWinningCells = () => {
            for (let i = 0; i < winningConditions.length; i++) {
                const [a, b, c] = winningConditions[i];
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    document.querySelector(`[data-index="${a}"]`).classList.add('win');
                    document.querySelector(`[data-index="${b}"]`).classList.add('win');
                    document.querySelector(`[data-index="${c}"]`).classList.add('win');
                    break;
                }
            }
        };
        
        // Reset the game
        const resetGame = () => {
            board.fill('');
            gameActive = true;
            currentPlayer = 'X';
            
            // Clear cells
            cells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('x', 'o', 'win');
            });
            
            // Reset status
            updateStatus();
        };
        
        // Add event listeners
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
        
        // Setup restart button
        document.getElementById('restart-game').addEventListener('click', resetGame);
        
        // Initialize game status
        updateStatus();
        
        // Store game state and methods for restart
        this.currentGame = {
            reset: resetGame,
            stop: function() {} // Nothing to stop for tic-tac-toe
        };
    },
    
    initRockPaperScissors: function() {
        // Game state
        let playerScore = 0;
        let computerScore = 0;
        let roundsPlayed = 0;
        const maxRounds = 5; // Best of 5
        let gameActive = true;
        
        // Get elements
        const playerChoiceDisplay = document.getElementById('player-choice');
        const computerChoiceDisplay = document.getElementById('computer-choice');
        const statusDisplay = document.getElementById('rps-status');
        const choiceButtons = document.querySelectorAll('.rps-choice');
        
        // Visual elements for choices
        const choices = {
            rock: '<i class="fas fa-hand-rock"></i>',
            paper: '<i class="fas fa-hand-paper"></i>',
            scissors: '<i class="fas fa-hand-scissors"></i>'
        };
        
        // Get computer choice
        const getComputerChoice = () => {
            const options = ['rock', 'paper', 'scissors'];
            const randomIndex = Math.floor(Math.random() * 3);
            return options[randomIndex];
        };
        
        // Determine winner
        const determineWinner = (playerChoice, computerChoice) => {
            if (playerChoice === computerChoice) {
                return 'draw';
            }
            
            if (
                (playerChoice === 'rock' && computerChoice === 'scissors') ||
                (playerChoice === 'paper' && computerChoice === 'rock') ||
                (playerChoice === 'scissors' && computerChoice === 'paper')
            ) {
                return 'player';
            }
            
            return 'computer';
        };
        
        // Update the game status
        const updateStatus = (result, playerChoice, computerChoice) => {
            let message = '';
            
            switch (result) {
                case 'player':
                    message = `You win! ${playerChoice} beats ${computerChoice}`;
                    playerScore++;
                    this.score += 10;
                    this.updateScore(true);
                    break;
                case 'computer':
                    message = `You lose! ${computerChoice} beats ${playerChoice}`;
                    computerScore++;
                    break;
                case 'draw':
                    message = `It's a draw! Both chose ${playerChoice}`;
                    break;
            }
            
            // Display round result
            statusDisplay.textContent = message;
            
            // Check if game is over
            roundsPlayed++;
            if (roundsPlayed >= maxRounds || playerScore > maxRounds/2 || computerScore > maxRounds/2) {
                gameActive = false;
                
                // Show final result
                const finalMessage = playerScore > computerScore 
                    ? `You win the game! ${playerScore}-${computerScore}`
                    : computerScore > playerScore
                        ? `Computer wins the game! ${computerScore}-${playerScore}`
                        : `Game ended in a draw! ${playerScore}-${computerScore}`;
                
                statusDisplay.textContent = finalMessage;
                
                // Show game over modal with a slight delay
                setTimeout(() => {
                    this.endGame(this.score, finalMessage);
                }, 1500);
            }
        };
        
        // Handle player choice
        const handlePlayerChoice = (e) => {
            if (!gameActive) return;
            
            const playerChoice = e.currentTarget.getAttribute('data-choice');
            const computerChoice = getComputerChoice();
            
            // Display choices with animation
            playerChoiceDisplay.innerHTML = choices[playerChoice];
            computerChoiceDisplay.innerHTML = '?';
            statusDisplay.textContent = 'Computer is choosing...';
            
            // Add animation classes
            playerChoiceDisplay.classList.add('choice-animation');
            
            // Simulate computer "thinking"
            setTimeout(() => {
                // Remove animation classes
                playerChoiceDisplay.classList.remove('choice-animation');
                
                // Show computer choice
                computerChoiceDisplay.innerHTML = choices[computerChoice];
                computerChoiceDisplay.classList.add('choice-animation');
                
                // Determine winner
                const result = determineWinner(playerChoice, computerChoice);
                
                // Update status
                updateStatus(result, playerChoice, computerChoice);
                
                // Remove animation from computer choice
                setTimeout(() => {
                    computerChoiceDisplay.classList.remove('choice-animation');
                }, 500);
            }, 800);
        };
        
        // Reset the game
        const resetGame = () => {
            playerScore = 0;
            computerScore = 0;
            roundsPlayed = 0;
            gameActive = true;
            
            // Reset displays
            playerChoiceDisplay.innerHTML = '?';
            computerChoiceDisplay.innerHTML = '?';
            statusDisplay.textContent = 'Choose rock, paper, or scissors';
            
            // Reset score in game controller
            this.score = 0;
            this.updateScore();
        };
        
        // Add event listeners
        choiceButtons.forEach(button => {
            button.addEventListener('click', handlePlayerChoice);
        });
        
        // Setup restart button
        document.getElementById('restart-game').addEventListener('click', resetGame);
        
        // Store game state and methods for restart
        this.currentGame = {
            reset: resetGame,
            stop: function() {} // Nothing specific to stop in this game
        };
    },
    
    // Add method to reduce background music volume
    reduceBackgroundVolume: function() {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = 0.8; // Reduce to 80%
        }
    },
    
    // Add method to restore background music volume
    restoreBackgroundVolume: function() {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = 1.0; // Restore to 100%
        }
    }
};

// Initialize particles background if available
if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: "none", random: true, out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "bubble" },
                onclick: { enable: true, mode: "push" },
                resize: true
            },
            modes: {
                bubble: { distance: 400, size: 4, duration: 2, opacity: 0.8, speed: 3 },
                push: { particles_nb: 4 }
            }
        },
        retina_detect: true
    });
}

// Initialize the game controller when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    gameController.init();
});

// Optimize the playBeep function for better response time
const playBeep = (type) => {
    // Create audio context only once and reuse it
    if (!window.gameAudioContext) {
        try {
            window.gameAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API not supported:", e);
            return;
        }
    }
    
    const audioContext = window.gameAudioContext;
    if (!audioContext) return;
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Use minimal attack time for immediate sound
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    
    // Configure based on type with optimized timing
    switch(type) {
        case 'move':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
            
        case 'win':
            // Play a faster victory sequence
            oscillator.type = 'sine';
            // Start immediately
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            // Faster note transitions
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
            
        case 'draw':
            // Play a faster sad sequence
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime); // G4
            oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime + 0.15); // F4
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
    }
}


