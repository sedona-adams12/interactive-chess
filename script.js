const board = document.getElementById("board");
const status = document.getElementById("status");

const pieces = [
    ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
    ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
];

let currentPlayer = "white";
let selectedSquare = null;
let selectedRow = null;
let selectedCol = null;
let gameOver = false;


// Get the color of a piece
function getPieceColor(piece) {

    if ("♙♖♘♗♕♔".includes(piece)) {
        return "white";
    }

    if ("♟♜♞♝♛♚".includes(piece)) {
        return "black";
    }

    return null;
}


// Check if a position is on the board
function isInsideBoard(row, col) {

    return (
        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8
    );
}


// Check if there are pieces blocking the path
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


// Check if a move follows the piece's movement rules
function isValidMove(
    startRow,
    startCol,
    endRow,
    endCol,
    checkKingSafety = true
) {

    if (!isInsideBoard(endRow, endCol)) {
        return false;
    }

    const piece = pieces[startRow][startCol];

    if (piece === "") {
        return false;
    }

    const pieceColor = getPieceColor(piece);
    const targetPiece = pieces[endRow][endCol];

    // Do not allow a piece to capture its own color
    if (
        targetPiece !== "" &&
        getPieceColor(targetPiece) === pieceColor
    ) {
        return false;
    }

    // Kings should not be captured
    if (targetPiece === "♔" || targetPiece === "♚") {
        return false;
    }

    const rowDifference = endRow - startRow;
    const colDifference = endCol - startCol;

    const rowDistance = Math.abs(rowDifference);
    const colDistance = Math.abs(colDifference);

    let validMovement = false;


    // Pawn movement
    if (piece === "♙" || piece === "♟") {

        const direction =
            pieceColor === "white" ? -1 : 1;

        const startingRow =
            pieceColor === "white" ? 6 : 1;

        // Move one square forward
        if (
            colDifference === 0 &&
            rowDifference === direction &&
            targetPiece === ""
        ) {
            validMovement = true;
        }

        // Move two squares from the starting row
        else if (
            colDifference === 0 &&
            rowDifference === direction * 2 &&
            startRow === startingRow &&
            targetPiece === "" &&
            pieces[startRow + direction][startCol] === ""
        ) {
            validMovement = true;
        }

        // Capture another piece diagonally
        else if (
            colDistance === 1 &&
            rowDifference === direction &&
            targetPiece !== "" &&
            getPieceColor(targetPiece) !== pieceColor
        ) {
            validMovement = true;
        }
    }


    // Knight movement
    else if (piece === "♘" || piece === "♞") {

        validMovement =
            (rowDistance === 2 && colDistance === 1) ||
            (rowDistance === 1 && colDistance === 2);
    }


    // Bishop movement
    else if (piece === "♗" || piece === "♝") {

        if (rowDistance === colDistance) {

            validMovement = isPathClear(
                startRow,
                startCol,
                endRow,
                endCol
            );
        }
    }


    // Rook movement
    else if (piece === "♖" || piece === "♜") {

        if (
            rowDifference === 0 ||
            colDifference === 0
        ) {

            validMovement = isPathClear(
                startRow,
                startCol,
                endRow,
                endCol
            );
        }
    }


    // Queen movement
    else if (piece === "♕" || piece === "♛") {

        const straightMove =
            rowDifference === 0 ||
            colDifference === 0;

        const diagonalMove =
            rowDistance === colDistance;

        if (straightMove || diagonalMove) {

            validMovement = isPathClear(
                startRow,
                startCol,
                endRow,
                endCol
            );
        }
    }


    // King movement
    else if (piece === "♔" || piece === "♚") {

        validMovement =
            rowDistance <= 1 &&
            colDistance <= 1 &&
            !(rowDistance === 0 && colDistance === 0);
    }


    if (!validMovement) {
        return false;
    }


    // Make sure the move does not expose the king
    if (checkKingSafety) {

        return !wouldBeInCheck(
            startRow,
            startCol,
            endRow,
            endCol,
            pieceColor
        );
    }

    return true;
}


// Find a player's king
function findKing(color) {

    const king =
        color === "white" ? "♔" : "♚";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            if (pieces[row][col] === king) {

                return {
                    row: row,
                    col: col
                };
            }
        }
    }

    return null;
}


// Check if a piece attacks a square
function pieceAttacksSquare(
    startRow,
    startCol,
    targetRow,
    targetCol
) {

    const piece = pieces[startRow][startCol];

    if (piece === "") {
        return false;
    }

    const pieceColor = getPieceColor(piece);

    const rowDifference =
        targetRow - startRow;

    const colDifference =
        targetCol - startCol;

    const rowDistance =
        Math.abs(rowDifference);

    const colDistance =
        Math.abs(colDifference);


    // Pawn attacks
    if (piece === "♙" || piece === "♟") {

        const direction =
            pieceColor === "white" ? -1 : 1;

        return (
            rowDifference === direction &&
            colDistance === 1
        );
    }


    // Knight attacks
    if (piece === "♘" || piece === "♞") {

        return (
            (rowDistance === 2 && colDistance === 1) ||
            (rowDistance === 1 && colDistance === 2)
        );
    }


    // Bishop attacks
    if (piece === "♗" || piece === "♝") {

        return (
            rowDistance === colDistance &&
            isPathClear(
                startRow,
                startCol,
                targetRow,
                targetCol
            )
        );
    }


    // Rook attacks
    if (piece === "♖" || piece === "♜") {

        return (
            (rowDifference === 0 ||
                colDifference === 0) &&
            isPathClear(
                startRow,
                startCol,
                targetRow,
                targetCol
            )
        );
    }


    // Queen attacks
    if (piece === "♕" || piece === "♛") {

        const straight =
            rowDifference === 0 ||
            colDifference === 0;

        const diagonal =
            rowDistance === colDistance;

        return (
            (straight || diagonal) &&
            isPathClear(
                startRow,
                startCol,
                targetRow,
                targetCol
            )
        );
    }


    // King attacks
    if (piece === "♔" || piece === "♚") {

        return (
            rowDistance <= 1 &&
            colDistance <= 1 &&
            !(rowDistance === 0 && colDistance === 0)
        );
    }

    return false;
}


// Check if a square is attacked by a color
function isSquareAttacked(row, col, attackingColor) {

    for (let startRow = 0; startRow < 8; startRow++) {

        for (let startCol = 0; startCol < 8; startCol++) {

            const piece = pieces[startRow][startCol];

            if (piece === "") {
                continue;
            }

            if (getPieceColor(piece) !== attackingColor) {
                continue;
            }

            if (
                pieceAttacksSquare(
                    startRow,
                    startCol,
                    row,
                    col
                )
            ) {
                return true;
            }
        }
    }

    return false;
}


// Check if a king is in check
function isKingInCheck(color) {

    const kingPosition = findKing(color);

    if (kingPosition === null) {
        return false;
    }

    const enemyColor =
        color === "white" ? "black" : "white";

    return isSquareAttacked(
        kingPosition.row,
        kingPosition.col,
        enemyColor
    );
}


// Temporarily make a move to check king safety
function wouldBeInCheck(
    startRow,
    startCol,
    endRow,
    endCol,
    color
) {

    const originalPiece =
        pieces[startRow][startCol];

    const capturedPiece =
        pieces[endRow][endCol];


    pieces[endRow][endCol] =
        originalPiece;

    pieces[startRow][startCol] =
        "";


    const kingInCheck =
        isKingInCheck(color);


    // Undo the temporary move
    pieces[startRow][startCol] =
        originalPiece;

    pieces[endRow][endCol] =
        capturedPiece;


    return kingInCheck;
}


// Get every legal move for one piece
function getLegalMoves(row, col) {

    const legalMoves = [];

    for (let targetRow = 0; targetRow < 8; targetRow++) {

        for (let targetCol = 0; targetCol < 8; targetCol++) {

            if (
                isValidMove(
                    row,
                    col,
                    targetRow,
                    targetCol
                )
            ) {

                legalMoves.push({
                    row: targetRow,
                    col: targetCol
                });
            }
        }
    }

    return legalMoves;
}


// Highlight the possible moves for a selected piece
function showValidMoves(row, col) {

    const legalMoves = getLegalMoves(row, col);

    for (const move of legalMoves) {

        const squareIndex =
            move.row * 8 + move.col;

        const square =
            board.children[squareIndex];

        const targetPiece =
            pieces[move.row][move.col];

        if (targetPiece === "") {
            square.classList.add("valid-move");
        } else {
            square.classList.add("capture-move");
        }
    }
}


// Remove all move highlights
function clearHighlights() {

    const squares =
        document.querySelectorAll(".valid-move, .capture-move");

    squares.forEach(function (square) {

        square.classList.remove("valid-move");
        square.classList.remove("capture-move");
    });
}


// Check if a player has at least one legal move
function hasAnyLegalMoves(color) {

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece = pieces[row][col];

            if (piece === "") {
                continue;
            }

            if (getPieceColor(piece) !== color) {
                continue;
            }

            const legalMoves =
                getLegalMoves(row, col);

            if (legalMoves.length > 0) {
                return true;
            }
        }
    }

    return false;
}


// Check for checkmate
function isCheckmate(color) {

    return (
        isKingInCheck(color) &&
        !hasAnyLegalMoves(color)
    );
}


// Check for stalemate
function isStalemate(color) {

    return (
        !isKingInCheck(color) &&
        !hasAnyLegalMoves(color)
    );
}


// Move a piece and update the game
function movePiece(
    startRow,
    startCol,
    endRow,
    endCol
) {

    pieces[endRow][endCol] =
        pieces[startRow][startCol];

    pieces[startRow][startCol] =
        "";


    currentPlayer =
        currentPlayer === "white"
            ? "black"
            : "white";


    selectedSquare = null;
    selectedRow = null;
    selectedCol = null;

    clearHighlights();
    renderBoard();


    const playerName =
        currentPlayer.charAt(0).toUpperCase() +
        currentPlayer.slice(1);


    // Check if the game has ended
    if (isCheckmate(currentPlayer)) {

        status.textContent =
            "Checkmate! " +
            (currentPlayer === "white" ? "Black" : "White") +
            " wins.";

        gameOver = true;

    } else if (isStalemate(currentPlayer)) {

        status.textContent =
            "Stalemate! The game is a draw.";

        gameOver = true;

    } else if (isKingInCheck(currentPlayer)) {

        status.textContent =
            playerName + "'s king is in check!";

    } else {

        status.textContent =
            playerName + "'s turn";
    }
}


// Handle clicking on a square
function handleSquareClick(row, col, square) {

    if (gameOver) {
        return;
    }

    const piece = pieces[row][col];


    // Select a piece
    if (selectedSquare === null) {

        if (piece === "") {
            return;
        }

        const pieceColor =
            getPieceColor(piece);

        if (pieceColor !== currentPlayer) {

            status.textContent =
                "It's " + currentPlayer + "'s turn";

            return;
        }

        clearHighlights();

        square.classList.add("selected");

        selectedSquare = square;
        selectedRow = row;
        selectedCol = col;

        showValidMoves(row, col);

        status.textContent =
            "Selected " + piece;

        return;
    }


    // Unselect the current piece
    if (
        row === selectedRow &&
        col === selectedCol
    ) {

        square.classList.remove("selected");

        selectedSquare = null;
        selectedRow = null;
        selectedCol = null;

        clearHighlights();

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

        status.textContent =
            "Invalid move";
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

            square.textContent =
                pieces[row][col];


            // Show kings that are in check
            if (
                pieces[row][col] === "♔" &&
                isKingInCheck("white")
            ) {
                square.classList.add("in-check");
            }

            if (
                pieces[row][col] === "♚" &&
                isKingInCheck("black")
            ) {
                square.classList.add("in-check");
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