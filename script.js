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
let selectedRow = null;
let selectedCol = null;

function getPieceColor(piece) {

    if ("♙♖♘♗♕♔".includes(piece)) {
        return "white";
    }

    if ("♟♜♞♝♛♚".includes(piece)) {
        return "black";
    }

    return null;
}

function isInsideBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isPathClear(startRow, startCol, endRow, endCol) {

    const rowDirection = Math.sign(endRow - startRow);
    const colDirection = Math.sign(endCol - startCol);

    let row = startRow + rowDirection;
    let col = startCol + colDirection;

    while (row !== endRow || col !== endCol) {

        if (pieces[row][col] !== "") {
            return false;
        }

        row += rowDirection;
        col += colDirection;
    }

    return true;
}

function isValidMove(startRow, startCol, endRow, endCol) {

    if (!isInsideBoard(endRow, endCol)) {
        return false;
    }

    const piece = pieces[startRow][startCol];

    if (piece === "") {
        return false;
    }

    const pieceColor = getPieceColor(piece);
    const targetPiece = pieces[endRow][endCol];

    if (targetPiece !== "" && getPieceColor(targetPiece) === pieceColor) {
        return false;
    }

    const rowDifference = endRow - startRow;
    const colDifference = endCol - startCol;

    const rowDistance = Math.abs(rowDifference);
    const colDistance = Math.abs(colDifference);

    // Pawn movement
    if (piece === "♙" || piece === "♟") {

        const direction = pieceColor === "white" ? -1 : 1;
        const startingRow = pieceColor === "white" ? 6 : 1;

        // Move forward one square
        if (colDifference === 0 &&
            rowDifference === direction &&
            targetPiece === "") {

            return true;
        }

        // Move forward two squares from starting position
        if (colDifference === 0 &&
            rowDifference === direction * 2 &&
            startRow === startingRow &&
            targetPiece === "" &&
            pieces[startRow + direction][startCol] === "") {

            return true;
        }

        // Capture diagonally
        if (colDistance === 1 &&
            rowDifference === direction &&
            targetPiece !== "" &&
            getPieceColor(targetPiece) !== pieceColor) {

            return true;
        }

        return false;
    }

    // Knight movement
    if (piece === "♘" || piece === "♞") {

        return (
            (rowDistance === 2 && colDistance === 1) ||
            (rowDistance === 1 && colDistance === 2)
        );
    }

    // Bishop movement
    if (piece === "♗" || piece === "♝") {

        if (rowDistance !== colDistance) {
            return false;
        }

        return isPathClear(startRow, startCol, endRow, endCol);
    }

    // Rook movement
    if (piece === "♖" || piece === "♜") {

        if (rowDifference !== 0 && colDifference !== 0) {
            return false;
        }

        return isPathClear(startRow, startCol, endRow, endCol);
    }

    // Queen movement
    if (piece === "♕" || piece === "♛") {

        const straightMove = rowDifference === 0 || colDifference === 0;
        const diagonalMove = rowDistance === colDistance;

        if (!straightMove && !diagonalMove) {
            return false;
        }

        return isPathClear(startRow, startCol, endRow, endCol);
    }

    // King movement
    if (piece === "♔" || piece === "♚") {

        return rowDistance <= 1 && colDistance <= 1;
    }

    return false;
}

function movePiece(startRow, startCol, endRow, endCol) {

    pieces[endRow][endCol] = pieces[startRow][startCol];
    pieces[startRow][startCol] = "";

    currentPlayer = currentPlayer === "white" ? "black" : "white";

    selectedSquare = null;
    selectedRow = null;
    selectedCol = null;

    renderBoard();

    status.textContent =
        currentPlayer.charAt(0).toUpperCase() +
        currentPlayer.slice(1) +
        "'s turn";
}

function handleSquareClick(row, col, square) {

    const piece = pieces[row][col];

    // Nothing selected yet
    if (selectedSquare === null) {

        if (piece === "") {
            return;
        }

        const pieceColor = getPieceColor(piece);

        if (pieceColor !== currentPlayer) {
            status.textContent = "It's " + currentPlayer + "'s turn";
            return;
        }

        square.classList.add("selected");

        selectedSquare = square;
        selectedRow = row;
        selectedCol = col;

        status.textContent = "Selected " + piece;

        return;
    }

    // A piece is already selected
    if (row === selectedRow && col === selectedCol) {

        square.classList.remove("selected");

        selectedSquare = null;
        selectedRow = null;
        selectedCol = null;

        status.textContent =
            currentPlayer.charAt(0).toUpperCase() +
            currentPlayer.slice(1) +
            "'s turn";

        return;
    }

    // Try to move the selected piece
    if (isValidMove(selectedRow, selectedCol, row, col)) {

        movePiece(selectedRow, selectedCol, row, col);

    } else {

        status.textContent = "Invalid move";
    }
}

function renderBoard() {

    board.innerHTML = "";

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
}

renderBoard();