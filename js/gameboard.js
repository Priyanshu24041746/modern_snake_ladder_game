// Gameboard.js - Snakes and Ladders Game
document.addEventListener('DOMContentLoaded', function() {
    // Game elements - Added support for new UI elements
    const gameBoard = document.getElementById('gameBoard');
    const tokensContainer = document.getElementById('tokensContainer');
    const rollDiceBtn = document.getElementById('rollDiceBtn');
    const diceElement = document.getElementById('dice');
    const diceContainer = document.getElementById('diceContainer');
    const currentPlayerAvatar = document.getElementById('currentPlayerAvatar');
    const currentPlayerName = document.getElementById('currentPlayerName');
    const currentPlayerPosition = document.getElementById('currentPlayerPosition');
    const playersContainer = document.getElementById('playersContainer');
    const scorecardBody = document.getElementById('scorecardBody');
    const gameLog = document.getElementById('gameLog');
    const newGameBtn = document.getElementById('newGameBtn');
    const homeBtn = document.getElementById('homeBtn');
    const legendBtn = document.getElementById('legendBtn');
    const soundToggleBtn = document.getElementById('soundToggleBtn');

    // Modal elements
    const tutorialModal = document.getElementById('tutorialModal');
    const legendModal = document.getElementById('legendModal');
    const winnerModal = document.getElementById('winnerModal');
    const mysteryModal = document.getElementById('mysteryModal');
    const closeButtons = document.querySelectorAll('.close-btn');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const acceptMysteryBtn = document.getElementById('acceptMysteryBtn');
    const declineMysteryBtn = document.getElementById('declineMysteryBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const returnHomeBtn = document.getElementById('returnHomeBtn');
    
    // Stats elements
    const winnerAvatar = document.getElementById('winnerAvatar');
    const winnerName = document.getElementById('winnerName');
    const totalRolls = document.getElementById('totalRolls');
    const laddersClimbed = document.getElementById('laddersClimbed');
    const snakesBitten = document.getElementById('snakesBitten');
    const mysteriesSolved = document.getElementById('mysteriesSolved');
    const luckFactor = document.getElementById('luckFactor');
    
    // Sound settings
    let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    
    // Game constants
    const BOARD_SIZE = 10;
    const TOTAL_CELLS = 100;
    const START_POSITION = 1;
    const WINNING_POSITION = 100;
    
    // Board layout - Snakes, Ladders, and Mystery squares
    const snakes = {
        16: 6,
        47: 26,
        49: 11,
        56: 53,
        62: 19,
        64: 60,
        87: 24,
        93: 73,
        95: 75,
        98: 78
    };
    
    const ladders = {
        // Removed ladder from square 1
        4: 14,
        9: 31,
        21: 42,
        28: 84,
        36: 44,
        51: 67,
        71: 91,
        80: 100
    };
    
    const mysterySquares = [7, 23, 32, 48, 69, 76, 85, 92];
    
    // Mystery challenges
    const mysteryChallenges = [
        { text: "Found a shortcut! Move forward 5 spaces.", effect: 5 },
        { text: "Oh no! You took a wrong turn. Move back 3 spaces.", effect: -3 },
        { text: "You found a power-up! Roll the dice again for an extra move.", effect: "extraRoll" },
        { text: "You're feeling lucky! Advance to the nearest ladder.", effect: "nearestLadder" },
        { text: "Watch out! The ground is shaking. Move to the nearest safe square.", effect: "moveToSafe" },
        { text: "You've been blessed with good fortune! Jump ahead 10 spaces.", effect: 10 },
        { text: "You stepped on quicksand! Go back 7 spaces.", effect: -7 },
        { text: "You found a treasure map! Choose any non-snake square to move to.", effect: "chooseSquare" },
        { text: "A strong wind pushes you back to where you were before your last roll.", effect: "previousPosition" },
        { text: "You found a magic carpet! Fly over the next snake you land on.", effect: "skipNextSnake" }
    ];
    
    // Game state
    let players = [];
    let currentPlayerIndex = 0;
    let gameActive = false;
    let rollInProgress = false;
    let diceValue = 1;
    let gameStats = {};
    let mysteryChallenge = null;
    let skipNextSnake = false;
    
    // Initialize the game
    function initGame() {
        // Load player data from localStorage
        const playersData = JSON.parse(localStorage.getItem('snakeLadderPlayers') || '[]');
        const gameMode = localStorage.getItem('snakeLadderGameMode') || 'single';
        const difficulty = localStorage.getItem('snakeLadderDifficulty') || 'medium';
        
        // If no players data, create default
        if (playersData.length === 0) {
            players = [
                {
                    id: 1,
                    name: "Player 1",
                    avatar: "boy_avatar_1",
                    color: "red",
                    position: 0,
                    isLocked: true,
                    isComputer: false,
                    stats: { rolls: 0, ladders: 0, snakes: 0, mysteries: 0 }
                },
                {
                    id: 2,
                    name: gameMode === 'single' ? "Computer" : "Player 2",
                    avatar: "boy_avatar_2",
                    color: "blue",
                    position: 0,
                    isLocked: true,
                    isComputer: gameMode === 'single', // Only computer in single mode
                    stats: { rolls: 0, ladders: 0, snakes: 0, mysteries: 0 }
                }
            ];
        } else {
            // Create players from loaded data
            players = playersData.map(player => {
                return {
                    id: player.id,
                    name: player.name,
                    avatar: player.avatar,
                    color: player.color,
                    position: 0,
                    isLocked: true,
                    isComputer: gameMode === 'single' ? player.isComputer : false, // Force all to human in multiplayer
                    stats: { rolls: 0, ladders: 0, snakes: 0, mysteries: 0 }
                };
            });
        }
        
        // Create game board
        createGameBoard();
        
        // Create player tokens
        createPlayerTokens();
        
        // Populate players list
        updatePlayersUI();
        
        // Update current player indicator
        updateCurrentPlayerUI();
        
        // Display tutorial modal on first load
        setTimeout(() => {
            openModal(tutorialModal);
        }, 500);
        
        // Set game as active
        gameActive = true;
        
        // Add event listeners
        setupEventListeners();
    }
    
    // Create the game board
    function createGameBoard() {
        gameBoard.innerHTML = '';
        // Create cells starting from 1 at top left, criss-cross (snake) numbering
        let direction = 1; // 1 for left to right, -1 for right to left
        for (let row = 0; row < BOARD_SIZE; row++) {
            let start = row * BOARD_SIZE + 1;
            let end = (row + 1) * BOARD_SIZE;
            let cells = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                let cellNumber = direction === 1 ? start + col : end - col;
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${cellNumber}`;
                cell.setAttribute('data-number', cellNumber);
                const numberElement = document.createElement('div');
                numberElement.className = 'cell-number';
                numberElement.textContent = cellNumber;
                cell.appendChild(numberElement);
                if (snakes[cellNumber]) {
                    cell.classList.add('snake-head');
                    const snakeElement = document.createElement('img');
                    snakeElement.className = 'special-element snake-element';
                    snakeElement.src = 'assets/snake.png';
                    snakeElement.alt = 'Snake';
                    cell.appendChild(snakeElement);
                    const tailCell = document.getElementById(`cell-${snakes[cellNumber]}`);
                    if (tailCell) {
                        tailCell.classList.add('snake-tail');
                    }
                }
                if (Object.values(ladders).includes(cellNumber)) {
                    cell.classList.add('ladder-end');
                    const ladderStart = Object.keys(ladders).find(key => ladders[key] === cellNumber);
                    if (ladderStart) {
                        const startCell = document.getElementById(`cell-${ladderStart}`);
                        if (startCell) {
                            startCell.classList.add('ladder-start');
                            const ladderElement = document.createElement('img');
                            ladderElement.className = 'special-element ladder-element';
                            ladderElement.src = 'assets/ladder.png';
                            ladderElement.alt = 'Ladder';
                            startCell.appendChild(ladderElement);
                        }
                    }
                }
                if (mysterySquares.includes(cellNumber)) {
                    cell.classList.add('mystery');
                    const mysteryElement = document.createElement('img');
                    mysteryElement.className = 'special-element mystery-element';
                    mysteryElement.src = 'assets/mystery.png';
                    mysteryElement.alt = 'Mystery';
                    cell.appendChild(mysteryElement);
                }
                if (cellNumber === 100) {
                    cell.classList.add('winner-cell');
                    const trophyElement = document.createElement('img');
                    trophyElement.className = 'special-element';
                    trophyElement.src = 'assets/success.png';
                    trophyElement.alt = 'Finish';
                    cell.appendChild(trophyElement);
                }
                gameBoard.appendChild(cell);
            }
            direction *= -1;
        }
    }
    
    // Create player tokens
    function createPlayerTokens() {
        tokensContainer.innerHTML = '';
        
        players.forEach((player, index) => {
            const token = document.createElement('div');
            token.className = `player-token-piece token-${player.color}`;
            token.id = `player-token-${player.id}`;
            
            // Add player avatar inside token
            const avatarImg = document.createElement('img');
            avatarImg.src = `assets/${player.avatar}.png`;
            avatarImg.alt = player.name;
            token.appendChild(avatarImg);
            
            // Position at the starting area (outside the board)
            positionTokenAtStart(token, index);
            
            tokensContainer.appendChild(token);
        });
    }
    
    // Position token at starting position outside the board
    function positionTokenAtStart(token, playerIndex) {
        const offset = playerIndex * 30;
        token.style.bottom = '10px';
        token.style.left = `calc(50% - 15px + ${offset}px)`;
        token.style.transform = 'translateY(calc(100% + 20px))';
    }
    
    // Position token at a specific cell using grid math for accuracy
    function positionTokenAtCell(token, cellNumber, playerIndex) {
        if (cellNumber < 1 || cellNumber > 100) return;
        const boardSize = 10;
        const n = cellNumber - 1;
        const row = Math.floor(n / boardSize);
        let col;
        if (row % 2 === 0) {
            col = n % boardSize;
        } else {
            col = boardSize - 1 - (n % boardSize);
        }
        const cellSize = 100 / boardSize;
        const topPercent = (row + 0.5) * cellSize;
        const leftPercent = (col + 0.5) * cellSize;
        const offsetX = ((playerIndex % 2) * 18) - 9;
        const offsetY = (Math.floor(playerIndex / 2) * 18) - 9;
        token.style.position = 'absolute';
        token.style.top = `calc(${topPercent}% + ${offsetY}px)`;
        token.style.left = `calc(${leftPercent}% + ${offsetX}px)`;
        token.style.transform = 'translate(-50%, -50%)';
    }
    
    // Update players UI
    function updatePlayersUI() {
        playersContainer.innerHTML = '';
        scorecardBody.innerHTML = '';
        
        players.forEach((player, index) => {
            // Add player to players list
            const playerItem = document.createElement('div');
            playerItem.className = `player-item ${index === currentPlayerIndex ? 'active' : ''}`;
            
            playerItem.innerHTML = `
                <div class="player-avatar">
                    <img src="assets/${player.avatar}.png" alt="${player.name}">
                </div>
                <div class="player-details">
                    <h4>${player.name}</h4>
                    <span class="player-position">Position: ${player.position}</span>
                </div>
                <div class="player-token token-${player.color}"></div>
            `;
            
            playersContainer.appendChild(playerItem);
            
            // Add player to scorecard
            const scorecardRow = document.createElement('div');
            scorecardRow.className = 'scorecard-row';
            
            scorecardRow.innerHTML = `
                <div class="scorecard-cell">
                    <div class="player-score-info">
                        <div class="token-indicator token-${player.color}"></div>
                        <span>${player.name}</span>
                    </div>
                </div>
                <div class="scorecard-cell">${player.position}</div>
                <div class="scorecard-cell">${player.stats.ladders}</div>
                <div class="scorecard-cell">${player.stats.snakes}</div>
                <div class="scorecard-cell">${player.stats.mysteries}</div>
            `;
            
            scorecardBody.appendChild(scorecardRow);
        });
    }
    
    // Update current player UI
    function updateCurrentPlayerUI() {
        const player = players[currentPlayerIndex];
        
        currentPlayerAvatar.src = `assets/${player.avatar}.png`;
        currentPlayerName.textContent = player.name;
        currentPlayerPosition.textContent = `Position: ${player.position}`;
        
        // Highlight current player token
        players.forEach((p, index) => {
            const token = document.getElementById(`player-token-${p.id}`);
            if (index === currentPlayerIndex) {
                token.classList.add('current');
            } else {
                token.classList.remove('current');
            }
        });
        
        // Update player list
        const playerItems = document.querySelectorAll('.player-item');
        playerItems.forEach((item, index) => {
            if (index === currentPlayerIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // If computer's turn, automatically roll after a delay
        if (player.isComputer && gameActive) {
            rollDiceBtn.disabled = true;
            setTimeout(() => {
                rollDice();
            }, 1000);
        } else {
            rollDiceBtn.disabled = false;
        }
    }
    
    // Roll the dice with enhanced animation
    function rollDice() {
        if (rollInProgress || !gameActive) return;
        rollInProgress = true;
        const player = players[currentPlayerIndex];
        // Enhanced dice animation (null check for diceContainer)
        if (diceContainer) diceContainer.classList.add('shake');
        diceElement.classList.add('rolling');
        player.stats.rolls++;
        playSound('dice');
        diceValue = Math.floor(Math.random() * 6) + 1;
        // Reduce animation delay for faster dice roll
        setTimeout(() => {
            let dicePath;
            switch(diceValue) {
                case 1:
                    dicePath = 'assets/dice_face_1.png';
                    break;
                case 2:
                    dicePath = 'assets/dice_face_2.png';
                    break;
                case 3:
                    dicePath = 'assets/dice_face_3.png';
                    break;
                case 4:
                    dicePath = 'assets/dice_face_4.png';
                    break;
                case 5:
                    dicePath = 'assets/dice_face_5 .png';
                    break;
                case 6:
                    dicePath = 'assets/dice_face_6 (2).png';
                    break;
                default:
                    dicePath = 'assets/dice_face_1.png';
            }
            diceElement.src = dicePath;
            diceElement.classList.remove('rolling');
            if (diceContainer) diceContainer.classList.remove('shake');
            addLogEntry(`${player.name} rolled a ${diceValue}!`, 'highlight');
            setTimeout(() => {
                movePlayer(player, diceValue);
            }, 200); // Faster move after dice roll
        }, 250); // Faster dice animation
    }
    
    // Move player
    function movePlayer(player, spaces) {
        if (!gameActive) return;
        
        const token = document.getElementById(`player-token-${player.id}`);
        
        // Check if player is locked and needs a 1 to start
        if (player.isLocked) {
            if (spaces === 1) {
                player.isLocked = false;
                player.position = START_POSITION;
                addLogEntry(`${player.name} is now on the board!`);
                
                // Position token at the first cell
                token.classList.add('moving');
                positionTokenAtCell(token, player.position, players.indexOf(player));
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    token.classList.remove('moving');
                    checkSpecialSquare(player);
                }, 500);
            } else {
                addLogEntry(`${player.name} needs to roll a 1 to start.`);
                
                // End turn
                setTimeout(() => {
                    nextPlayer();
                }, 1000);
            }
            return;
        }
        
        // Calculate new position
        const newPosition = Math.min(player.position + spaces, WINNING_POSITION);
        
        // Animate movement step by step
        animateMovement(player, player.position, newPosition);
    }
    
    // Animate player movement step by step
    function animateMovement(player, startPos, endPos, stepDelay = 300) {
        if (startPos === endPos) {
            // Movement is complete
            checkSpecialSquare(player);
            return;
        }
        
        const token = document.getElementById(`player-token-${player.id}`);
        const nextPos = startPos + 1;
        
        // Update player position
        player.position = nextPos;
        
        // Update player UI
        updatePlayersUI();
        
        // Add animation class for movement
        token.classList.add('moving');
        
        // Position token at next cell
        positionTokenAtCell(token, nextPos, players.indexOf(player));
        
        // Play move sound
        playSound('move');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            token.classList.remove('moving');
            
            // Continue to next step
            setTimeout(() => {
                animateMovement(player, nextPos, endPos, stepDelay);
            }, stepDelay);
        }, stepDelay);
    }
    
    // Check for special squares (snake, ladder, mystery)
    function checkSpecialSquare(player) {
        const position = player.position;
        
        // Check for win condition
        if (position === WINNING_POSITION) {
            handleWin(player);
            return;
        }
        
        // Check for ladder
        if (ladders[position]) {
            setTimeout(() => {
                handleLadder(player, position, ladders[position]);
            }, 500);
            return;
        }
        
        // Check for snake
        if (snakes[position]) {
            if (skipNextSnake) {
                addLogEntry(`${player.name} skipped a snake with magic carpet!`, 'highlight');
                skipNextSnake = false;
                handleTurnEnd();
                return;
            }
            
            setTimeout(() => {
                handleSnake(player, position, snakes[position]);
            }, 500);
            return;
        }
        
        // Check for mystery square
        if (mysterySquares.includes(position)) {
            setTimeout(() => {
                handleMystery(player);
            }, 500);
            return;
        }
        
        // No special square, end turn
        handleTurnEnd();
    }
    
    // Handle ladder climb
    function handleLadder(player, fromPos, toPos) {
        const token = document.getElementById(`player-token-${player.id}`);
        
        // Update player stats
        player.stats.ladders++;
        
        // Log the ladder climb
        addLogEntry(`${player.name} climbed a ladder from ${fromPos} to ${toPos}!`, 'ladder');
        
        // Play ladder sound
        playSound('ladder');
        
        // Animate from and to cells
        const fromCell = document.getElementById(`cell-${fromPos}`);
        const toCell = document.getElementById(`cell-${toPos}`);
        if (fromCell) {
            fromCell.classList.add('ladder-animate');
            showMoveLabel(fromCell, `Ladder!`);
            setTimeout(() => fromCell.classList.remove('ladder-animate'), 1200);
        }
        if (toCell) {
            toCell.classList.add('ladder-animate');
            setTimeout(() => toCell.classList.remove('ladder-animate'), 1200);
        }
        
        // Add climbing animation
        token.classList.add('climbing');
        
        // Create path animation
        createPathAnimation(fromPos, toPos, 'ladder');
        
        // Update player position
        player.position = toPos;
        
        // Update player UI
        updatePlayersUI();
        
        // Position token at new cell
        positionTokenAtCell(token, toPos, players.indexOf(player));
        
        // Remove animation class after animation completes
        setTimeout(() => {
            token.classList.remove('climbing');
            
            // Check for other special squares at the new position
            setTimeout(() => {
                checkSpecialSquare(player);
            }, 500);
        }, 1200);
    }
    
    // Handle snake bite
    function handleSnake(player, fromPos, toPos) {
        const token = document.getElementById(`player-token-${player.id}`);
        
        // Update player stats
        player.stats.snakes++;
        
        // Log the snake bite
        addLogEntry(`${player.name} got bitten by a snake and slid from ${fromPos} to ${toPos}!`, 'snake');
        
        // Play snake sound
        playSound('snake');
        
        // Animate from and to cells
        const fromCell = document.getElementById(`cell-${fromPos}`);
        const toCell = document.getElementById(`cell-${toPos}`);
        if (fromCell) {
            fromCell.classList.add('snake-animate');
            showMoveLabel(fromCell, `Snake!`);
            setTimeout(() => fromCell.classList.remove('snake-animate'), 1200);
        }
        if (toCell) {
            toCell.classList.add('snake-animate');
            setTimeout(() => toCell.classList.remove('snake-animate'), 1200);
        }
        
        // Add sliding animation
        token.classList.add('sliding');
        
        // Create path animation
        createPathAnimation(fromPos, toPos, 'snake');
        
        // Update player position
        player.position = toPos;
        
        // Update player UI
        updatePlayersUI();
        
        // Position token at new cell
        positionTokenAtCell(token, toPos, players.indexOf(player));
        
        // Remove animation class after animation completes
        setTimeout(() => {
            token.classList.remove('sliding');
            
            // Check for other special squares at the new position
            setTimeout(() => {
                checkSpecialSquare(player);
            }, 500);
        }, 1200);
    }
    
    // Show move label (arrow/label for snake/ladder)
    function showMoveLabel(cell, text) {
        if (!cell) return;
        const label = document.createElement('div');
        label.className = 'move-label';
        label.textContent = text;
        cell.appendChild(label);
        setTimeout(() => {
            if (label.parentNode) label.parentNode.removeChild(label);
        }, 1200);
    }
    
    // Show animation path for ladder climb
    function createPathAnimation(fromPos, toPos, type) {
        // Get cell positions
        const fromCell = document.getElementById(`cell-${fromPos}`);
        const toCell = document.getElementById(`cell-${toPos}`);
        
        if (!fromCell || !toCell) return;
        
        const boardRect = gameBoard.getBoundingClientRect();
        const fromRect = fromCell.getBoundingClientRect();
        const toRect = toCell.getBoundingClientRect();
        
        // Calculate relative positions
        const fromX = (fromRect.left + fromRect.width/2) - boardRect.left;
        const fromY = (fromRect.top + fromRect.height/2) - boardRect.top;
        const toX = (toRect.left + toRect.width/2) - boardRect.left;
        const toY = (toRect.top + toRect.height/2) - boardRect.top;
        
        // Create path element
        const path = document.createElement('div');
        path.className = `movement-path ${type}-path`;
        
        // Create arrow points along the path
        const pointsCount = 5; // Number of arrow points
        
        for (let i = 1; i < pointsCount; i++) {
            const point = document.createElement('div');
            point.className = `path-point ${type}-point`;
            
            // Position along the path
            const ratio = i / pointsCount;
            const x = fromX + (toX - fromX) * ratio;
            const y = fromY + (toY - fromY) * ratio;
            
            point.style.left = `${x}px`;
            point.style.top = `${y}px`;
            
            // Animation delay for sequential appearance
            point.style.animationDelay = `${i * 0.1}s`;
            
            // Add direction indication
            const arrowChar = type === 'ladder' ? '↑' : '↓';
            point.textContent = arrowChar;
            
            path.appendChild(point);
        }
        
        // Add path to the board
        gameBoard.appendChild(path);
        
        // Remove path after animation
        setTimeout(() => {
            if (path.parentNode) {
                path.parentNode.removeChild(path);
            }
        }, 1500);
    }
    
    // Handle mystery challenge
    function handleMystery(player) {
        // Update player stats
        player.stats.mysteries++;
        
        // Log the mystery challenge
        addLogEntry(`${player.name} landed on a mystery square!`, 'mystery');
        
        // Play mystery sound
        playSound('mystery');
        
        // Select a random mystery challenge
        mysteryChallenge = mysteryChallenges[Math.floor(Math.random() * mysteryChallenges.length)];
        
        // Update the mystery modal with the challenge details
        const mysteryDesc = document.getElementById('mysteryDescription');
        if (mysteryDesc) {
            mysteryDesc.textContent = mysteryChallenge.text;
        } else {
            console.error('Mystery description element not found');
        }
        
        // Highlight the mystery square
        const mysteryCell = document.getElementById(`cell-${player.position}`);
        if (mysteryCell) {
            mysteryCell.classList.add('active-mystery');
            setTimeout(() => {
                mysteryCell.classList.remove('active-mystery');
            }, 3000);
        }
        
        // Open the mystery modal
        const mysteryModal = document.getElementById('mysteryModal');
        if (mysteryModal) {
            openModal(mysteryModal);
        } else {
            console.error('Mystery modal not found');
            // Fallback in case modal isn't found - apply effect automatically
            applyMysteryEffect(player, mysteryChallenge.effect);
        }
    }
    
    // Accept mystery challenge
    function acceptMysteryChallenge() {
        const player = players[currentPlayerIndex];
        
        // Close the mystery modal
        closeModal(mysteryModal);
        
        // Apply the mystery effect
        applyMysteryEffect(player, mysteryChallenge.effect);
    }
    
    // Decline mystery challenge
    function declineMysteryChallenge() {
        const player = players[currentPlayerIndex];
        
        // Close the mystery modal
        closeModal(mysteryModal);
        
        // Log the declined challenge
        addLogEntry(`${player.name} declined the mystery challenge.`);
        
        // End turn
        handleTurnEnd();
    }
    
    // Apply mystery effect
    function applyMysteryEffect(player, effect) {
        // Get the player token
        const token = document.getElementById(`player-token-${player.id}`);
        
        // Based on the effect type, apply different actions
        if (typeof effect === 'number') {
            // Simple movement forward or backward
            const newPosition = Math.max(1, Math.min(player.position + effect, WINNING_POSITION));
            
            if (effect > 0) {
                addLogEntry(`${player.name} moved forward ${effect} spaces from the mystery challenge!`, 'highlight');
            } else {
                addLogEntry(`${player.name} moved back ${Math.abs(effect)} spaces from the mystery challenge!`, 'highlight');
            }
            
            // Animate movement
            animateMovement(player, player.position, newPosition);
            
        } else if (effect === 'extraRoll') {
            // Extra dice roll
            addLogEntry(`${player.name} gets an extra roll from the mystery challenge!`, 'highlight');
            
            // End turn without switching players
            setTimeout(() => {
                rollInProgress = false;
                rollDiceBtn.disabled = false;
            }, 500);
            
        } else if (effect === 'nearestLadder') {
            // Find nearest ladder
            let nearestLadder = null;
            let shortestDistance = Infinity;
            
            for (const startPos in ladders) {
                const start = parseInt(startPos);
                if (start > player.position && (start - player.position) < shortestDistance) {
                    nearestLadder = start;
                    shortestDistance = start - player.position;
                }
            }
            
            if (nearestLadder) {
                addLogEntry(`${player.name} advances to the nearest ladder at position ${nearestLadder}!`, 'highlight');
                
                // Animate movement to ladder
                animateMovement(player, player.position, nearestLadder);
            } else {
                addLogEntry(`${player.name} couldn't find a ladder ahead!`);
                handleTurnEnd();
            }
            
        } else if (effect === 'moveToSafe') {
            // Find nearest safe square (not a snake head or mystery)
            let safeMoves = [];
            for (let i = 1; i <= 5; i++) {
                const potentialPos = player.position + i;
                if (potentialPos <= WINNING_POSITION && 
                    !snakes[potentialPos] && 
                    !mysterySquares.includes(potentialPos)) {
                    safeMoves.push(potentialPos);
                }
            }
            
            if (safeMoves.length > 0) {
                const safePos = safeMoves[safeMoves.length - 1]; // Furthest safe position
                addLogEntry(`${player.name} moves to a safe square at position ${safePos}!`, 'highlight');
                
                // Animate movement
                animateMovement(player, player.position, safePos);
            } else {
                addLogEntry(`${player.name} couldn't find a safe square nearby!`);
                handleTurnEnd();
            }
            
        } else if (effect === 'previousPosition') {
            // Calculate the position before the last dice roll
            const previousPosition = Math.max(1, player.position - diceValue);
            
            addLogEntry(`${player.name} returns to position ${previousPosition}!`, 'highlight');
            
            // Update player position
            player.position = previousPosition;
            
            // Update UI
            updatePlayersUI();
            
            // Position token
            token.classList.add('moving');
            positionTokenAtCell(token, previousPosition, players.indexOf(player));
            
            // Remove animation class after animation completes
            setTimeout(() => {
                token.classList.remove('moving');
                handleTurnEnd();
            }, 500);
            
        } else if (effect === 'skipNextSnake') {
            // Grant immunity to next snake
            skipNextSnake = true;
            
            addLogEntry(`${player.name} is now protected from the next snake!`, 'highlight');
            
            // End turn
            handleTurnEnd();
            
        } else if (effect === 'chooseSquare') {
            // For simplicity, just move forward 15 spaces avoiding snakes
            let bestPosition = player.position;
            const maxMove = Math.min(player.position + 15, WINNING_POSITION);
            
            for (let pos = player.position + 1; pos <= maxMove; pos++) {
                if (!snakes[pos]) {
                    bestPosition = pos;
                }
            }
            
            addLogEntry(`${player.name} uses the treasure map to move to position ${bestPosition}!`, 'highlight');
            
            // Animate movement
            animateMovement(player, player.position, bestPosition);
        }
    }
    
    // Handle turn end
    function handleTurnEnd() {
        // End the current player's turn
        setTimeout(() => {
            nextPlayer();
        }, 1000);
    }
    
    // Go to next player
    function nextPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        rollInProgress = false;
        
        // Add turn change animation
        animatePlayerChange();
        
        // Update UI
        updateCurrentPlayerUI();
    }

    // Animate player change
    function animatePlayerChange() {
        // Get the player info container
        const playerInfo = document.querySelector('.current-player');
        if (!playerInfo) return;
        
        // Add animation class
        playerInfo.classList.add('turn-change');
        
        // Play turn change sound
        playSound('turnChange');
        
        // Get the new player's token
        const newPlayer = players[currentPlayerIndex];
        const token = document.getElementById(`player-token-${newPlayer.id}`);
        if (token) {
            // Add attention animation to the token
            token.classList.add('attention');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                token.classList.remove('attention');
            }, 2000);
        }
        
        // Remove animation class after animation completes
        setTimeout(() => {
            playerInfo.classList.remove('turn-change');
        }, 1000);
    }
    
    // Handle win condition
    function handleWin(player) {
        gameActive = false;
        
        // Log the win
        addLogEntry(`${player.name} has won the game!`, 'highlight');
        
        // Play win sound
        playSound('win');
        
        // Calculate stats for winner modal
        calculateGameStats(player);
        
        // Update winner modal with player details
        winnerAvatar.src = `assets/${player.avatar}.png`;
        winnerName.textContent = player.name;
        totalRolls.textContent = player.stats.rolls;
        laddersClimbed.textContent = player.stats.ladders;
        snakesBitten.textContent = player.stats.snakes;
        mysteriesSolved.textContent = player.stats.mysteries;
        
        // Calculate luck factor
        const luck = calculateLuckFactor(player);
        luckFactor.textContent = `${luck}%`;
        
        // Show winner modal after a delay
        setTimeout(() => {
            openModal(winnerModal);
        }, 1500);
    }
    
    // Calculate game statistics
    function calculateGameStats(winner) {
        // Implemented simplified luck factor calculation
        const luck = calculateLuckFactor(winner);
        
        gameStats = {
            winner: winner.name,
            totalRolls: winner.stats.rolls,
            laddersClimbed: winner.stats.ladders,
            snakesBitten: winner.stats.snakes,
            mysteriesSolved: winner.stats.mysteries,
            luckFactor: luck
        };
    }
    
    // Calculate luck factor (0-100%)
    function calculateLuckFactor(player) {
        // Formula: (ladders climbed * 10 - snakes bitten * 8 + mysteries solved * 5) / totalRolls
        const baseScore = (player.stats.ladders * 10) - (player.stats.snakes * 8) + (player.stats.mysteries * 5);
        const normalizedScore = baseScore / Math.max(1, player.stats.rolls);
        
        // Convert to percentage (0-100)
        const luckPercentage = Math.min(100, Math.max(0, Math.round(normalizedScore * 10 + 50)));
        
        return luckPercentage;
    }
    
    // Add entry to game log
    function addLogEntry(text, type = '') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = text;
        
        gameLog.appendChild(entry);
        gameLog.scrollTop = gameLog.scrollHeight;
    }
    
    // Reset the game
    function resetGame() {
        // Reset player positions and status
        players.forEach(player => {
            player.position = 0;
            player.isLocked = true;
            player.stats = { rolls: 0, ladders: 0, snakes: 0, mysteries: 0 };
            
            // Reset token positions
            const token = document.getElementById(`player-token-${player.id}`);
            positionTokenAtStart(token, players.indexOf(player));
        });
        
        // Use fixed positions: 5 ladders, 5 snakes, 5 mysteries
        // (No randomization)
        
        // Recreate game board with fixed positions
        createGameBoard();
        
        // Reset game state
        currentPlayerIndex = 0;
        gameActive = true;
        rollInProgress = false;
        skipNextSnake = false;
        
        // Reset UI
        updatePlayersUI();
        updateCurrentPlayerUI();
        
        // Clear game log except for first entry
        gameLog.innerHTML = '<div class="log-entry">Game started! Good luck!</div>';
        
        // Enable roll button
        rollDiceBtn.disabled = false;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Roll dice button
        rollDiceBtn.addEventListener('click', rollDice);
        
        // New game button
        newGameBtn.addEventListener('click', () => {
            resetGame();
        });
        
        // Home button
        homeBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // Legend button 
        if (legendBtn) {
            legendBtn.addEventListener('click', () => {
                openModal(legendModal);
            });
        }
        
        // Close modal buttons
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });
        
        // Close tutorial modal button
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        }
        
        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal(this);
                }
            });
        });
        
        // Mystery challenge buttons
        acceptMysteryBtn.addEventListener('click', acceptMysteryChallenge);
        declineMysteryBtn.addEventListener('click', declineMysteryChallenge);
        
        // Winner modal buttons
        playAgainBtn.addEventListener('click', () => {
            closeModal(winnerModal);
            resetGame();
        });
        
        returnHomeBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        // Sound toggle
        if (soundToggleBtn) {
            soundToggleBtn.addEventListener('click', toggleSound);
            // Set initial state based on saved preference
            updateSoundButtonState();
        }
        
        // Load saved theme preference
        loadThemePreference();
    }
    
    // Update sound button state
    function updateSoundButtonState() {
        if (soundToggleBtn) {
            if (soundEnabled) {
                soundToggleBtn.classList.remove('sound-off');
                soundToggleBtn.classList.add('sound-on');
                soundToggleBtn.title = "Sound On (Click to mute)";
            } else {
                soundToggleBtn.classList.remove('sound-on');
                soundToggleBtn.classList.add('sound-off');
                soundToggleBtn.title = "Sound Off (Click to unmute)";
            }
        }
    }
    
    // Play sound effects based on sound setting
    function playSound(type) {
        // If sound is disabled, don't play anything
        if (!soundEnabled) return;
        
        // In a real implementation, this would play actual sound files
        console.log(`Playing sound: ${type}`);
        
        // Here we would have code to play different sound effects based on type
        // For example: const sound = new Audio(`assets/sounds/${type}.mp3`); sound.play();
    }

    // Toggle sound on/off
    function toggleSound() {
        soundEnabled = !soundEnabled;
        
        // Update button appearance
        updateSoundButtonState();
        
        // Save setting
        localStorage.setItem('soundEnabled', soundEnabled);
    }
    
    // Open modal
    function openModal(modal) {
        modal.style.display = 'flex';
        // Add animation
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transition = 'opacity 0.3s ease';
        }, 10);
    }
    
    // Close modal
    function closeModal(modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // Toggle theme between light and dark
    function toggleTheme() {
        const html = document.documentElement;
        if (html.getAttribute('data-theme') === 'dark') {
            html.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    }
    
    // Load theme preference from storage
    function loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
    
    // Initialize the game
    initGame();
});