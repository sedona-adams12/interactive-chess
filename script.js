const board = document.getElementById("board");
const status = document.getElementById("status");

let currentPlayer = "white";
let selectedRow = null;
let selectedCol = null;
let gameOver = false;


// Create a piece with its color, type, and movement history
function createPiece(color, type) {

    return {
        color: color,
        type: type,
        hasMoved: false
    };
}


// Convert a piece object into a chess symbol
function getPieceSymbol(piece) {

    if (piece === null) {
        return "";
    }

    const symbols = {
        white: {
            king: "♔",
            queen: "♕",
            rook: "♖",
            bishop: "♗",
            knight: "♘",
            pawn: "♙"
        },

        black: {
            king: "♚",
            queen: "♛",
            rook: "♜",
            bishop: "♝",
            knight: "♞",
            pawn: "♟"
        }
    };

    return symbols[piece.color][piece.type];
}


// Create the starting board
function createStartingBoard() {

    const boardState = Array.from(
        { length: 8 },
        function () {
            return Array(8).fill(null);
        }
    );


    // Black's back row
    boardState[0] = [
        createPiece("black", "rook"),
        createPiece("black", "knight"),
        createPiece("black", "bishop"),
        createPiece("black", "queen"),
        createPiece("black", "king"),
        createPiece("black", "bishop"),
        createPiece("black", "knight"),
        createPiece("black", "rook")
    ];


    // Black's pawns
    for (let col = 0; col < 8; col++) {
        boardState[1][col] =
            createPiece("black", "pawn");
    }


    // White's pawns
    for (let col = 0; col < 8; col++) {
        boardState[6][col] =
            createPiece("white", "pawn");
    }


    // White's back row
    boardState[7] = [
        createPiece("white", "rook"),
        createPiece("white", "knight"),
        createPiece("white", "bishop"),
        createPiece("white", "queen"),
        createPiece("white", "king"),
        createPiece("white", "bishop"),
        createPiece("white", "knight"),
        createPiece("white", "rook")
    ];

    return boardState;
}


let pieces = createStartingBoard();


// Check if a position is on the board
function isInsideBoard(row, col) {

    return (
        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8
    );
}


// Check if pieces are blocking a straight or diagonal move
function isPathClear(startRow, startCol, endRow, endCol) {

    const rowDirection =
        Math.sign(endRow - startRow);

    const colDirection =
        Math.sign(endCol - startCol);

    let row = startRow + rowDirection;
    let col = startCol + colDirection;

    while (row !== endRow || col !== endCol) {

        if (pieces[row][col] !== null) {
            return false;
        }

        row += rowDirection;
        col += colDirection;
    }

    return true;
}


// Check the normal movement rules for a piece
function followsMovementRules(
    startRow,
    startCol,
    endRow,
    endCol
) {

    const piece = pieces[startRow][startCol];

    if (piece === null) {
        return false;
    }

    const targetPiece = pieces[endRow][endCol];

    // A piece cannot capture another piece of the same color
    if (
        targetPiece !== null &&
        targetPiece.color === piece.color
    ) {
        return false;
    }

    const rowDifference = endRow - startRow;
    const colDifference = endCol - startCol;

    const rowDistance = Math.abs(rowDifference);
    const colDistance = Math.abs(colDifference);


    // Pawns
    if (piece.type === "pawn") {

        const direction =
            piece.color === "white" ? -1 : 1;

        const startingRow =
            piece.color === "white" ? 6 : 1;


        // Move forward one square
        if (
            colDifference === 0 &&
            rowDifference === direction &&
            targetPiece === null
        ) {
            return true;
        }


        // Move forward two squares
        if (
            colDifference === 0 &&
            rowDifference === direction * 2 &&
            startRow === startingRow &&
            !piece.hasMoved &&
            targetPiece === null &&
            pieces[startRow + direction][startCol] === null
        ) {
            return true;
        }


        // Capture diagonally
        if (
            colDistance === 1 &&
            rowDifference === direction &&
            targetPiece !== null &&
            targetPiece.color !== piece.color
        ) {
            return true;
        }

        return false;
    }


    // Knights can jump over pieces
    if (piece.type === "knight") {

        return (
            (rowDistance === 2 && colDistance === 1) ||
            (rowDistance === 1 && colDistance === 2)
        );
    }


    // Bishops move diagonally
    if (piece.type === "bishop") {

        return (
            rowDistance === colDistance &&
            isPathClear(
                startRow,
                startCol,
                endRow,
                endCol
            )
        );
    }


    // Rooks move horizontally or vertically
    if (piece.type === "rook") {

        return (
            (
                rowDifference === 0 ||
                colDifference === 0
            ) &&
            isPathClear(
                startRow,
                startCol,
                endRow,
                endCol
            )
        );
    }


    // Queens move like rooks or bishops
    if (piece.type === "queen") {

        const straightMove =
            rowDifference === 0 ||
            colDifference === 0;

        const diagonalMove =
            rowDistance === colDistance;

        return (
            (straightMove || diagonalMove) &&
            isPathClear(
                startRow,
                startCol,
                endRow,
                endCol
            )
        );
    }


    // Kings move one square at a time for now
    if (piece.type === "king") {

        return (
            rowDistance <= 1 &&
            colDistance <= 1 &&
            !(rowDistance === 0 && colDistance === 0)
        );
    }

    return false;
}


// Check whether a move is valid
function isValidMove(
    startRow,
    startCol,
    endRow,
    endCol
) {

    if (!isInsideBoard(endRow, endCol)) {
        return false;
    }

    const piece = pieces[startRow][startCol];

    if (piece === null) {
        return false;
    }

    if (piece.color !== currentPlayer) {
        return false;
    }

    const targetPiece = pieces[endRow][endCol];

    // Kings cannot be captured
    if (
        targetPiece !== null &&
        targetPiece.type === "king"
    ) {
        return false;
    }

    return followsMovementRules(
        startRow,
        startCol,
        endRow,
        endCol
    );
}


// Move a piece to another square
function movePiece(
    startRow,
    startCol,
    endRow,
    endCol
) {

    const piece = pieces[startRow][startCol];

    pieces[endRow][endCol] = piece;
    pieces[startRow][startCol] = null;

    // Remember that this piece has moved
    piece.hasMoved = true;

    currentPlayer =
        currentPlayer === "white"
            ? "black"
            : "white";

    selectedRow = null;
    selectedCol = null;

    renderBoard();

    status.textContent =
        currentPlayer.charAt(0).toUpperCase() +
        currentPlayer.slice(1) +
        "'s turn";
}


// Remove the selected square styling
function clearSelection() {

    const selected =
        document.querySelector(".selected");

    if (selected !== null) {
        selected.classList.remove("selected");
    }

    selectedRow = null;
    selectedCol = null;
}


// Handle clicks on the chessboard
function handleSquareClick(row, col, square) {

    if (gameOver) {
        return;
    }

    const piece = pieces[row][col];


    // Select a piece
    if (selectedRow === null) {

        if (piece === null) {
            return;
        }

        if (piece.color !== currentPlayer) {

            status.textContent =
                "It's " + currentPlayer + "'s turn";

            return;
        }

        selectedRow = row;
        selectedCol = col;

        square.classList.add("selected");

        status.textContent =
            "Selected " + getPieceSymbol(piece);

        return;
    }


    // Click the same piece to unselect it
    if (
        row === selectedRow &&
        col === selectedCol
    ) {

        clearSelection();

        status.textContent =
            currentPlayer.charAt(0).toUpperCase() +
            currentPlayer.slice(1) +
            "'s turn";

        return;
    }


    // Try to move the selected piece
    if (
        isValidMove(
            selectedRow,
            selectedCol,
            row,
            col
        )
    ) {

        movePiece(
            selectedRow,
            selectedCol,
            row,
            col
        );

    } else {

        status.textContent = "Invalid move";
    }
}


// Draw the board
function renderBoard() {

    board.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square =
                document.createElement("div");

            square.classList.add("square");


            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }


            const piece = pieces[row][col];

            if (piece !== null) {
                square.textContent =
                    getPieceSymbol(piece);
            }


            square.addEventListener(
                "click",
                function () {
                    handleSquareClick(row, col, square);
                }
            );

            board.appendChild(square);
        }
    }
}


// Start the game
renderBoard();