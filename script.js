const board = document.getElementById("board");
const status = document.getElementById("status");

const pieces = [
    ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
    ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
];

let currentPlayer = "white";
let selectedSquare = null;

function getPieceColor(piece) {

    if ("♙♖♘♗♕♔".includes(piece)) {
        return "white";
    }

    if ("♟♜♞♝♛♚".includes(piece)) {
        return "black";
    }

    return null;
}

function handleSquareClick(row, col, square) {

    const piece = pieces[row][col];

    if (piece === "") {
        return;
    }

    const pieceColor = getPieceColor(piece);

    if (pieceColor !== currentPlayer) {
        status.textContent = "It's " + currentPlayer + "'s turn";
        return;
    }

    if (selectedSquare !== null) {
        selectedSquare.classList.remove("selected");
    }

    square.classList.add("selected");

    selectedSquare = square;

    status.textContent = "Selected " + piece;
}

for (let row = 0; row < 8; row++) {

    for (let col = 0; col < 8; col++) {

        const square = document.createElement("div");

        square.classList.add("square");

        if ((row + col) % 2 === 0) {
            square.classList.add("light");
        } else {
            square.classList.add("dark");
        }

        square.textContent = pieces[row][col];

        square.addEventListener("click", function () {
            handleSquareClick(row, col, square);
        });

        board.appendChild(square);
    }
}