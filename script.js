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


// Make sure a position is on the board
function isInsideBoard(row, col) {

    return (
        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8
    );
}


// Check if there is a piece blocking the way
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

    // Can't move onto one of your own pieces
    if (
        targetPiece !== "" &&
        getPieceColor(targetPiece) === pieceColor
    ) {
        return false;
    }

    const rowDifference = endRow - startRow;
    const colDifference = endCol - startCol;

    const rowDistance = Math.abs(rowDifference);
    const colDistance = Math.abs(colDifference);

    let validMovement = false;


    // Pawn moves
    if (piece === "♙" || piece === "♟") {

        const direction =
            pieceColor === "white" ? -1 : 1;

        const startingRow =
            pieceColor === "white" ? 6 : 1;

        // Move one space
        if (
            colDifference === 0 &&
            rowDifference === direction &&
            targetPiece === ""
        ) {
            validMovement = true;
        }

        // Move two spaces from the starting position
        else if (
            colDifference === 0 &&
            rowDifference === direction * 2 &&
            startRow === startingRow &&
            targetPiece === "" &&
            pieces[startRow + direction][startCol] === ""
        ) {
            validMovement = true;
        }

        // Pawn captures diagonally
        else if (
            colDistance === 1 &&
            rowDifference === direction &&
            targetPiece !== "" &&
            getPieceColor(targetPiece) !== pieceColor
        ) {
            validMovement = true;
        }
    }


    // Knight moves
    else if (piece === "♘" || piece === "♞") {

        validMovement =
            (rowDistance === 2 && colDistance === 1) ||
            (rowDistance === 1 && colDistance === 2);
    }


    // Bishop moves
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


    // Rook moves
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


    // Queen moves
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


    // King moves
    else if (piece === "♔" || piece === "♚") {

        validMovement =
            rowDistance <= 1 &&
            colDistance <= 1 &&
            !(rowDistance === 0 && colDistance === 0);
    }


    if (!validMovement) {
        return false;
    }


    // Make sure the move doesn't leave the king in check
    if (checkKingSafety) {

        const moveIsSafe = !wouldBeInCheck(
            startRow,
            startCol,
            endRow,
            endCol,
            pieceColor
        );

        return moveIsSafe;
    }

    return true;
}


// Find the king for a given color
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


// Check if a piece can attack a certain square
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


// See if a square is being attacked
function isSquareAttacked(
    row,
    col,
    attackingColor
) {

    for (
        let startRow = 0;
        startRow < 8;
        startRow++
    ) {

        for (
            let startCol = 0;
            startCol < 8;
            startCol++
        ) {

            const piece =
                pieces[startRow][startCol];

            if (piece === "") {
                continue;
            }

            if (
                getPieceColor(piece) !==
                attackingColor
            ) {
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


// Check if the king is currently in check
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


// Temporarily make a move to see if it puts the king in check
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


    // Put the board back the way it was
    pieces[startRow][startCol] =
        originalPiece;

    pieces[endRow][endCol] =
        capturedPiece;


    return kingInCheck;
}


// Move the piece and switch turns
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


    renderBoard();


    const playerName =
        currentPlayer.charAt(0).toUpperCase() +
        currentPlayer.slice(1);


    if (isKingInCheck(currentPlayer)) {

        status.textContent =
            playerName + "'s king is in check!";

    } else {

        status.textContent =
            playerName + "'s turn";
    }
}


// Handles clicking on a square
function handleSquareClick(
    row,
    col,
    square
) {

    const piece = pieces[row][col];


    // Nothing has been selected yet
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


        square.classList.add("selected");

        selectedSquare = square;
        selectedRow = row;
        selectedCol = col;


        status.textContent =
            "Selected " + piece;

        return;
    }


    // Click the selected piece again to unselect it
    if (
        row === selectedRow &&
        col === selectedCol
    ) {

        square.classList.remove("selected");

        selectedSquare = null;
        selectedRow = null;
        selectedCol = null;


        const playerName =
            currentPlayer.charAt(0).toUpperCase() +
            currentPlayer.slice(1);


        status.textContent =
            playerName + "'s turn";

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


            // Show when a king is in check
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

                    handleSquareClick(
                        row,
                        col,
                        square
                    );
                }
            );


            board.appendChild(square);
        }
    }
}


// Start the game
renderBoard();