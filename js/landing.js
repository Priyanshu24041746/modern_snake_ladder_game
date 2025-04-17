// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const playButton = document.getElementById('play-btn');
    const howToPlayButton = document.getElementById('how-to-play-btn');
    const gameModal = document.getElementById('game-modal');
    const howToPlayModal = document.getElementById('how-to-play-modal');
    const closeButtons = document.querySelectorAll('.close-btn');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const gameModes = document.querySelectorAll('.game-mode');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const difficultyOptions = document.querySelectorAll('.difficulty-option');
    const startGameBtn = document.getElementById('start-game-btn');
    const themeToggle = document.querySelector('.theme-toggle');
    const featureCards = document.querySelectorAll('.feature-card');
    const diceElement = document.querySelector('.dice');
    const achievements = document.querySelectorAll('.achievement');
    
    // Game configuration
    let gameConfig = {
        mode: null,
        avatar: null,
        players: 1,
        difficulty: 'medium' // Default difficulty
    };

    // Initialize with a random background color theme
    initRandomBackgroundTheme();

    // Theme toggle functionality
    themeToggle.addEventListener('click', function() {
        const html = document.documentElement;
        if (html.getAttribute('data-theme') === 'dark') {
            html.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            playToggleSound('light');
        } else {
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            playToggleSound('dark');
        }
    });

    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Open game modal when Play button is clicked
    playButton.addEventListener('click', function() {
        openModal(gameModal);
        playButtonSound();
    });

    // How to Play button click handler
    howToPlayButton.addEventListener('click', function() {
        openModal(howToPlayModal);
        playButtonSound();
    });
    
    // Close buttons for modals
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
            playButtonSound();
        });
    });
    
    // Close how-to-play modal with the Got It button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
            playButtonSound();
        });
    }
    
    // Close modal when clicking outside of modal content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Achievements hover effect
    achievements.forEach(achievement => {
        achievement.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            playHoverSound('achievement');
        });
        
        achievement.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Feature card interactions
    featureCards.forEach(card => {
        // Hover sound effects
        card.addEventListener('mouseenter', function() {
            let type = 'snake';
            if (this.classList.contains('ladder-card')) {
                type = 'ladder';
            } else if (this.classList.contains('mystery-card')) {
                type = 'mystery';
            }
            playHoverSound(type);
            
            // Show specific card effects
            const cardEffect = this.querySelector('.card-effect');
            if (cardEffect) {
                cardEffect.style.opacity = '0.7';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            // Hide card effects
            const cardEffect = this.querySelector('.card-effect');
            if (cardEffect) {
                cardEffect.style.opacity = '0';
            }
        });
        
        // Click effect for feature cards
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            
            // Highlight the related feature
            let featureType = 'snake';
            if (this.classList.contains('ladder-card')) {
                featureType = 'ladder';
                showFeatureDetails('Ladder Mode', 'Climb to victory faster! Ladders provide strategic shortcuts to higher positions on the board.');
            } else if (this.classList.contains('mystery-card')) {
                featureType = 'mystery';
                showFeatureDetails('Mystery Challenge Mode', 'Take risks or play it safe! Mystery challenges offer rewards or penalties based on your choices.');
            } else {
                showFeatureDetails('Snake Mode', 'Watch out for those snakes! They\'ll send you sliding back down the board when you least expect it.');
            }
            
            playFeatureSound(featureType);
            
            setTimeout(() => {
                this.style.transform = 'translateY(-10px) scale(1.03)';
            }, 200);
        });
    });
    
    // Dice interaction
    if (diceElement) {
        diceElement.addEventListener('click', function() {
            rollDice();
        });
    }
    
    // Difficulty options selection
    difficultyOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all difficulty options
            difficultyOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Update game configuration
            gameConfig.difficulty = this.dataset.difficulty;
            
            // Play select sound
            playSelectSound();
        });
    });
    
    // Select medium difficulty by default
    const mediumDifficulty = document.querySelector('[data-difficulty="medium"]');
    if (mediumDifficulty) {
        mediumDifficulty.classList.add('selected');
    }
    
    // Function to simulate dice roll
    function rollDice() {
        if (diceElement) {
            diceElement.style.animation = 'none';
            // Trigger reflow
            void diceElement.offsetWidth;
            diceElement.style.animation = 'diceRoll 1s ease';
            
            // Play dice roll sound
            playDiceSound();
            
            // Simulate random dice face (for when we implement actual dice faces)
            const randomFace = Math.floor(Math.random() * 6) + 1;
            console.log(`Rolled: ${randomFace}`);
            
            // Could switch dice image here in a full implementation
            // diceElement.src = `Assests/dice_face_${randomFace}.png`;
        }
    }
    
    // Show feature details (placeholder for now)
    function showFeatureDetails(title, description) {
        console.log(`${title}: ${description}`);
        // In a full implementation, this would show a tooltip or info panel
    }
    
    // Function to open modal with animation
    function openModal(modal) {
        modal.style.display = 'flex';
        // Add animation
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transition = 'opacity 0.3s ease';
        }, 10);
    }
    
    // Function to close modal with animation
    function closeModal(modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // Game mode selection
    gameModes.forEach(mode => {
        mode.addEventListener('click', function() {
            // Remove selected class from all modes
            gameModes.forEach(m => m.classList.remove('selected'));
            // Add selected class to clicked mode
            this.classList.add('selected');
            
            // Update game configuration
            const modeButton = this.querySelector('.mode-btn');
            if (modeButton) {
                gameConfig.mode = modeButton.dataset.mode;
                
                // Update players count based on mode
                if (gameConfig.mode === 'single') {
                    gameConfig.players = 1;
                } else {
                    // Default to 2 players for multiplayer
                    gameConfig.players = 2;
                }
            }
            
            // Enable start button if both mode and avatar are selected
            checkIfCanStart();
            
            // Play select sound
            playSelectSound();
        });
    });
    
    // Mode button click handlers
    modeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling to parent
            
            // Find the parent game-mode element and trigger its click
            const gameMode = this.closest('.game-mode');
            if (gameMode) {
                gameMode.click();
            }
        });
    });
    
    // Avatar selection
    avatarOptions.forEach(avatar => {
        avatar.addEventListener('click', function() {
            // Remove selected class from all avatars
            avatarOptions.forEach(a => a.classList.remove('selected'));
            // Add selected class to clicked avatar
            this.classList.add('selected');
            
            // Update game configuration
            gameConfig.avatar = this.dataset.avatar;
            
            // Enable start button if both mode and avatar are selected
            checkIfCanStart();
            
            // Play select sound
            playSelectSound();
        });
    });
    
    // Check if we can enable the Start Game button
    function checkIfCanStart() {
        if (gameConfig.mode && gameConfig.avatar) {
            startGameBtn.disabled = false;
            startGameBtn.classList.add('active');
        } else {
            startGameBtn.disabled = true;
            startGameBtn.classList.remove('active');
        }
    }
    
    // Start Game button click handler
    startGameBtn.addEventListener('click', function() {
        if (gameConfig.mode && gameConfig.avatar) {
            // For now, just close the modal
            // In a real implementation, this would redirect to the game page with config
            closeModal(gameModal);
            
            // Play start game sound
            playStartGameSound();
            
            // Alert for demonstration purposes (would be removed in production)
            setTimeout(() => {
                alert(`Starting game with mode: ${gameConfig.mode}, avatar: ${gameConfig.avatar}, difficulty: ${gameConfig.difficulty}, players: ${gameConfig.players}`);
            }, 500);
            
            // This is where you would redirect to the game page
            // window.location.href = `game.html?mode=${gameConfig.mode}&avatar=${gameConfig.avatar}&difficulty=${gameConfig.difficulty}&players=${gameConfig.players}`;
        }
    });
    
    // Initialize the start button as disabled
    startGameBtn.disabled = true;
    
    // Add animated elements
    addVisualEffects();
});

// Function to add visual effects and animations
function addVisualEffects() {
    // Add subtle hover effects to buttons
    const allButtons = document.querySelectorAll('.btn');
    allButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add fade-in animations to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        // Add slight delay for each card to create a staggered animation
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 150);
    });
    
    // Animate the card effects
    animateCardEffects();
    
    // Hero image animation
    const heroImage = document.querySelector('.game-board');
    if (heroImage) {
        heroImage.style.opacity = '0';
        
        setTimeout(() => {
            heroImage.style.transition = 'opacity 0.7s ease';
            heroImage.style.opacity = '1';
        }, 300);
    }

    // Animate floating emojis
    animateFloatingEmojis();
    
    // Animate achievements
    animateAchievements();
}

// Function to animate achievements
function animateAchievements() {
    const achievements = document.querySelectorAll('.achievement');
    
    achievements.forEach((achievement, index) => {
        // Set initial state
        achievement.style.opacity = '0';
        achievement.style.transform = 'translateY(20px)';
        
        // Fade in with delay
        setTimeout(() => {
            achievement.style.transition = 'all 0.5s ease';
            achievement.style.opacity = '1';
            achievement.style.transform = 'translateY(0)';
        }, 1000 + index * 200); // Staggered appearance after other elements
    });
}

// Function to animate card effects
function animateCardEffects() {
    // The mystery card's yes/no choices
    const yesChoice = document.querySelector('.choice-yes');
    const noChoice = document.querySelector('.choice-no');
    
    if (yesChoice && noChoice) {
        // Initially hidden
        yesChoice.style.opacity = '0';
        noChoice.style.opacity = '0';
        
        // Animated on hover via CSS
    }
    
    // The ladder effect
    const ladderEffect = document.querySelector('.ladder-effect');
    if (ladderEffect) {
        ladderEffect.style.opacity = '0';
        // Ladder will appear from bottom right on hover
    }
    
    // The snake effect
    const snakeEffect = document.querySelector('.snake-effect');
    if (snakeEffect) {
        snakeEffect.style.opacity = '0';
        // Snake will appear from bottom right on hover
    }
}

// Function to animate floating emojis
function animateFloatingEmojis() {
    const emojis = document.querySelectorAll('.floating-emoji');
    
    emojis.forEach((emoji, index) => {
        // Set initial state
        emoji.style.opacity = '0';
        
        // Fade in with delay
        setTimeout(() => {
            emoji.style.transition = 'opacity 1s ease';
            emoji.style.opacity = '1';
        }, 800 + index * 200); // Staggered appearance
    });
}

// Function to initialize random background theme colors
function initRandomBackgroundTheme() {
    const shapes = document.querySelectorAll('.shape');
    const colors = [
        'rgba(92, 107, 192, 0.15)', // Blue (accent color)
        'rgba(38, 166, 154, 0.15)',  // Green (ladder color)
        'rgba(151, 117, 205, 0.15)',  // Purple (mystery color)
        'rgba(239, 83, 80, 0.15)'   // Red (snake color)
    ];
    
    shapes.forEach(shape => {
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        shape.style.background = `linear-gradient(45deg, ${color1}, ${color2})`;
    });
}

// Sound effect functions (placeholder for future implementation)
function playButtonSound() {
    // In the future, this will play a button click sound
    console.log('Button sound');
}

function playToggleSound(theme) {
    // In the future, this will play a theme toggle sound
    console.log('Theme toggle sound: ' + theme);
}

function playHoverSound(type) {
    // In the future, this will play different sounds for different feature cards
    console.log('Hover sound: ' + type);
}

function playSelectSound() {
    // In the future, this will play a selection sound
    console.log('Select sound');
}

function playFeatureSound(type) {
    // In the future, this will play a specific sound for each feature
    console.log('Feature sound: ' + type);
}

function playStartGameSound() {
    // In the future, this will play a game start sound
    console.log('Game start sound');
}

function playDiceSound() {
    // In the future, this will play a dice rolling sound
    console.log('Dice rolling sound');
}