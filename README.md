# ♟ Interactive Chess

A browser-based chess game built with HTML, CSS, and JavaScript. The game allows two players to play locally on the same device, with legal move validation, game status updates, move history, and other standard chess features.

## Project Overview

I built this project to practice JavaScript programming, object-oriented concepts, and implementing game logic. The goal was to create an interactive chess game that handles the rules of chess while providing a simple and easy-to-use interface.

Players take turns moving pieces on an 8×8 chessboard. The game tracks turns, validates moves, identifies check and checkmate situations, and allows players to undo moves or start a new game.

## Features

- **Interactive Chessboard:** An 8×8 board with clickable pieces and alternating square colors.
- **Legal Move Validation:** Checks whether moves follow the movement rules for each chess piece and prevents moves that leave a player's king in check.
- **Move Highlighting:** Highlights selected pieces, available moves, captures, and the most recent move.
- **Special Chess Moves:** Supports castling, en passant, and pawn promotion.
- **Check Detection:** Identifies when a king is in check and highlights the affected king.
- **Checkmate and Stalemate:** Detects when a game ends in checkmate or stalemate.
- **Move History:** Displays previous moves using chess-style coordinate notation.
- **Captured Pieces:** Tracks and displays captured pieces for both players.
- **Undo:** Allows players to reverse their previous move and restore the previous game state.
- **New Game:** Resets the board and starts a new game.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Structure and layout of the game |
| CSS3 | Board styling, layout, and responsive design |
| JavaScript | Game logic, move validation, and user interaction |
| DOM Manipulation | Dynamically updating the board and game interface |

## How to Play

1. Open the game in a web browser.
2. White moves first.
3. Click one of your pieces to select it.
4. Available legal moves are highlighted on the board.
5. Click a highlighted square to move the selected piece.
6. Players alternate turns until the game ends.

The sidebar displays the current turn, number of moves, captured pieces, and move history.

Players can also use the **Undo** button to reverse a move or **New Game** to restart.

## Running the Project Locally

No additional libraries or installations are required.

1. Clone the repository:

```bash
git clone https://github.com/sedona-adams12/interactive-chess.git
```

2. Navigate into the project directory:

```bash
cd interactive-chess
```

3. Open `index.html` in your preferred web browser.

## Project Structure

```text
interactive-chess/
│
├── index.html     # Game structure and interface
├── style.css      # Board styling and responsive layout
├── script.js      # Chess rules, game logic, and interactions
└── README.md      # Project documentation
```

## What I Learned

Through this project, I gained experience with:

- Implementing complex game logic using JavaScript.
- Working with arrays and objects to represent a chessboard and individual pieces.
- Validating moves based on piece-specific rules and game state.
- Using DOM manipulation and event listeners to create interactive features.
- Managing game state, move history, and undo functionality.
- Organizing code into functions to make a larger project easier to maintain.

## Future Improvements

Some features I would like to explore adding include:

- Playing against a computer-controlled opponent.
- Online multiplayer functionality.
- Timed chess games and player clocks.
- Improved move notation using standard algebraic chess notation.
- Additional visual themes and board customization.

---

**Author:** Sedona Adams  
**GitHub:** [sedona-adams12](https://github.com/sedona-adams12)
