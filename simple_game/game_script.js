document.addEventListener('DOMContentLoaded', function() {
    loadDescriptionsAndGenerateBoard();
});

let descriptions = [];

function loadDescriptionsAndGenerateBoard() {
    fetch('simple.txt')
    .then(response => response.text())
    .then(data => {
        descriptions = data.split('\n');
        generateBoard();
    })
    .catch(error => {
        console.error('no file to read!!!', error);
    })
}

function generateBoard() {
    const gameBoard = document.querySelector('.game-board');
    const colors = ['blue', 'red', 'neutral', 'black'];
    
    const shuffleColors = Array(7).fill('blue')
    .concat(Array(8).fill('red'))
    .concat(Array(9).fill('neutral'))
    .concat(Array(1).fill('black'));
    
    shuffleArray(shuffleColors);
    
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const box = document.createElement('div');
            box.classList.add('box');
            const randomIndex = Math.floor(Math.random() * descriptions.length);
            const randomDescription = descriptions[randomIndex].trim();
            box.textContent = randomDescription;
            box.dataset.color = shuffleColors[i * 5 + j];
            
            box.addEventListener('click', function() {
                const color = this.dataset.color;
                this.style.backgroundColor = color;
            });
            
            gameBoard.appendChild(box);
        }
    }

    const restartButton = document.getElementById('restartButton');
    restartButton.addEventListener('click', function() {
        restartGame();
    })
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function restartGame() {
    const gameBoard = document.querySelector('.game-board');
    gameBoard.innerHTML = '';
    generateBoard();
}