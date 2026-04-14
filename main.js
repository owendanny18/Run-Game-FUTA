document.addEventListener('DOMContentLoaded', () => {

    // UI Interface block to pass into Game
    const uiContext = {
        elStartScreen: document.getElementById('start-screen'),
        elGameOverScreen: document.getElementById('game-over-screen'),
        elPauseScreen: document.getElementById('pause-screen'),
        elScore: document.getElementById('score-val'),
        elHiScore: document.getElementById('hi-score-val'),
        elFinalScore: document.getElementById('final-score'),
        elGameOverReason: document.getElementById('game-over-reason'),
        elLives: document.getElementById('lives-val'),
        btnStart: document.getElementById('start-btn'),
        btnRestart: document.getElementById('restart-btn'),
        btnJump: document.getElementById('btn-jump'),
        btnDuck: document.getElementById('btn-duck'),
        btnPause: document.getElementById('btn-pause'),
        btnResume: document.getElementById('resume-btn'),

        hideScreens() {
            this.elStartScreen.classList.remove('active');
            this.elGameOverScreen.classList.remove('active');
            this.elPauseScreen.classList.remove('active');
        },

        showPause() {
            this.elPauseScreen.classList.add('active');
        },

        showGameOver(finalScore, reasonStr) {
            this.elFinalScore.innerText = finalScore;
            if (reasonStr) {
                this.elGameOverReason.innerText = reasonStr;
            }
            this.elGameOverScreen.classList.add('active');
        }
    };

    // Initialize Canvas Configuration
    const canvas = document.getElementById('gameCanvas');

    // Make canvas logical size match visual container size
    function resizeCanvas() {
        const container = document.getElementById('game-container');
        // We set fixed logical dimensions for deterministic gameplay logic, 
        // scaling relies on CSS for screen responsiveness.
        canvas.width = 900;
        canvas.height = 500;
        // If we wanted dynamic layout responsive canvas, we would update Game internal coords, 
        // but fixed resolution scaled via CSS is standard for 2D arcade games.
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Boot Game Instance
    const futaGame = new Game(canvas, uiContext);

    // Draw initial idle screen frame
    futaGame.draw();

    // Setup Buttons
    uiContext.btnStart.addEventListener('click', () => {
        futaGame.start();
    });

    uiContext.btnRestart.addEventListener('click', () => {
        futaGame.start();
    });

    // Mobile control bindings
    const handleJump = (e) => {
        e.preventDefault();
        futaGame.player.jump();
    };
    
    const handleDuckDown = (e) => {
        e.preventDefault();
        futaGame.player.duck();
    };
    
    const handleDuckUp = (e) => {
        e.preventDefault();
        futaGame.player.standUp();
    };

    uiContext.btnJump.addEventListener('touchstart', handleJump, { passive: false });
    uiContext.btnJump.addEventListener('mousedown', handleJump);

    uiContext.btnDuck.addEventListener('touchstart', handleDuckDown, { passive: false });
    uiContext.btnDuck.addEventListener('mousedown', handleDuckDown);
    
    uiContext.btnDuck.addEventListener('touchend', handleDuckUp, { passive: false });
    uiContext.btnDuck.addEventListener('mouseup', handleDuckUp);
    uiContext.btnDuck.addEventListener('mouseleave', handleDuckUp);

    uiContext.btnPause.addEventListener('click', () => {
        futaGame.pause();
    });

    uiContext.btnResume.addEventListener('click', () => {
        futaGame.resume();
    });

    // Add keyboard hook for Enter to start/restart
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
            if (futaGame.state === 'START' || futaGame.state === 'GAMEOVER') {
                futaGame.start();
            } else if (futaGame.state === 'PAUSED') {
                futaGame.resume();
            }
        } else if (e.code === 'Escape' || e.code === 'KeyP') {
            if (futaGame.state === 'PLAYING') {
                futaGame.pause();
            } else if (futaGame.state === 'PAUSED') {
                futaGame.resume();
            }
        }
    });

    console.log("FUTA Campus Runner initialized successfully!");
});
