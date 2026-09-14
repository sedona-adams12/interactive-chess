
const board = document.getElementById("board");
const status = document.getElementById("status");

let currentPlayer = "white";
let selectedSquare = null;
let gameOver = false;

function createPiece(color, type) {
    return {
        color: color,
        type: type,
        hasMoved: false
    };
}

function getPieceSymbol(piece) {
    if (!piece) {
        return "";
    }

    const symbols = {
        white: {
            pawn: "♙",
            rook: "♖",
            knight: "♘",
            bishop: "♗",
            queen: "♕",
            king: "♔"
        },
        black: {
            pawn: "♟",
            rook: "♜",
            knight: "♞",
            bishop: "♝",
            queen: "♛",
            king: "♚"
        }
    };

    return symbols[piece.color][piece.type];
}

function createStartingBoard() {
    return [
        [
            createPiece("black", "rook"),
            createPiece("black", "knight"),
            createPiece("black", "bishop"),
            createPiece("black", "queen"),
            createPiece("black", "king"),
            createPiece("black", "bishop"),
            createPiece("black", "knight"),
            createPiece("black", "rook")
        ],
        [
            createPiece("black", "pawn"),
            createPiece("black", "pawn"),
            createPiece("black", "pawn"),
            createPiece("black", "pawn"),
            createPiece("black", "pawn"),
            createPiece("black", "pawn"),
            createPiece("black", "pawn"),
            createPiece("black", "pawn")
        ],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [
            createPiece("white", "pawn"),
            createPiece("white", "pawn"),
            createPiece("white", "pawn"),
            createPiece("white", "pawn"),
            createPiece("white", "pawn"),
            createPiece("white", "pawn"),
            createPiece("white", "pawn"),
            createPiece("white", "pawn")
        ],
        [
            createPiece("white", "rook"),
            createPiece("white", "knight"),
            createPiece("white", "bishop"),
            createPiece("white", "queen"),
            createPiece("white", "king"),
            createPiece("white", "bishop"),
            createPiece("white", "knight"),
            createPiece("white", "rook")
        ]
    ];
}

let pieces = createStartingBoard();

function isInsideBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isPathClear(startRow, startCol, endRow, endCol) {
    const rowDirection = Math.sign(endRow - startRow);
    const colDirection = Math.sign(endCol - startCol);

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

function followsMovementRules(startRow, startCol, endRow, endCol) {
    const piece = pieces[startRow][startCol];

    if (!piece) {
        return false;
    }

    const rowDifference = endRow - startRow;
    const colDifference = endCol - startCol;

    const rowDistance = Math.abs(rowDifference);
    const colDistance = Math.abs(colDifference);

    const destination = pieces[endRow][endCol];

    // A piece cannot capture its own color.
    if (destination && destination.color === piece.color) {
        return false;
    }

    // Kings cannot be captured directly.
    if (destination && destination.type === "king") {
        return false;
    }

    if (piece.type === "pawn") {
        const direction = piece.color === "white" ? -1 : 1;
        const startingRow = piece.color === "white" ? 6 : 1;

        if (colDifference === 0 && rowDifference === direction) {
            return destination === null;
        }

        if (
            colDifference === 0 &&
            rowDifference === direction * 2 &&
            startRow === startingRow
        ) {
            return (
                destination === null &&
                pieces[startRow + direction][startCol] === null
            );
        }

        if (
            rowDifference === direction &&
            colDistance === 1
        ) {
            return destination !== null && destination.color !== piece.color;
        }

        return false;
    }

    if (piece.type === "knight") {
        return (
            (rowDistance === 2 && colDistance === 1) ||
            (rowDistance === 1 && colDistance === 2)
        );
    }

    if (piece.type === "bishop") {
        return (
            rowDistance === colDistance &&
            isPathClear(startRow, startCol, endRow, endCol)
        );
    }

    if (piece.type === "rook") {
        return (
            (rowDifference === 0 || colDifference === 0) &&
            isPathClear(startRow, startCol, endRow, endCol)
        );
    }

    if (piece.type === "queen") {
        const movesStraight = rowDifference === 0 || colDifference === 0;
        const movesDiagonal = rowDistance === colDistance;

        return (
            (movesStraight || movesDiagonal) &&
            isPathClear(startRow, startCol, endRow, endCol)
        );
    }

    if (piece.type === "king") {
        return rowDistance <= 1 && colDistance <= 1;
    }

    return false;
}

function findKing(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = pieces[row][col];

            if (
                piece &&
                piece.color === color &&
                piece.type === "king"
            ) {
                return { row, col };
            }
        }
    }

    return null;
}

function pieceAttacksSquare(
    startRow,
    startCol,
    targetRow,
    targetCol
) {
    const piece = pieces[startRow][startCol];

    if (!piece) {
        return false;
    }

    const rowDifference = targetRow - startRow;
    const colDifference = targetCol - startCol;

    const rowDistance = Math.abs(rowDifference);
    const colDistance = Math.abs(colDifference);

    if (piece.type === "pawn") {
        const direction = piece.color === "white" ? -1 : 1;

        return (
            rowDifference === direction &&
            colDistance === 1
        );
    }

    if (piece.type === "knight") {
        return (
            (rowDistance === 2 && colDistance === 1) ||
            (rowDistance === 1 && colDistance === 2)
        );
    }

    if (piece.type === "king") {
        return rowDistance <= 1 && colDistance <= 1;
    }

    if (piece.type === "bishop") {
        return (
            rowDistance === colDistance &&
            isPathClear(startRow, startCol, targetRow, targetCol)
        );
    }

    if (piece.type === "rook") {
        return (
            (rowDifference === 0 || colDifference === 0) &&
            isPathClear(startRow, startCol, targetRow, targetCol)
        );
    }

    if (piece.type === "queen") {
        const movesStraight = rowDifference === 0 || colDifference === 0;
        const movesDiagonal = rowDistance === colDistance;

        return (
            (movesStraight || movesDiagonal) &&
            isPathClear(startRow, startCol, targetRow, targetCol)
        );
    }

    return false;
}

function isSquareAttacked(row, col, attackingColor) {
    for (let startRow = 0; startRow < 8; startRow++) {
        for (let startCol = 0; startCol < 8; startCol++) {
            const piece = pieces[startRow][startCol];

            if (!piece || piece.color !== attackingColor) {
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

function isKingInCheck(color) {
    const kingPosition = findKing(color);

    if (!kingPosition) {
        return false;
    }

    const opposingColor = color === "white" ? "black" : "white";

    return isSquareAttacked(
        kingPosition.row,
        kingPosition.col,
        opposingColor
    );
}

function wouldBeInCheck(
    startRow,
    startCol,
    endRow,
    endCol
) {
    const movingPiece = pieces[startRow][startCol];
    const capturedPiece = pieces[endRow][endCol];

    pieces[endRow][endCol] = movingPiece;
    pieces[startRow][startCol] = null;

    const result = isKingInCheck(movingPiece.color);

    pieces[startRow][startCol] = movingPiece;
    pieces[endRow][endCol] = capturedPiece;

    return result;
}

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

    if (startRow === endRow && startCol === endCol) {
        return false;
    }

    const piece = pieces[startRow][startCol];

    if (!piece || piece.color !== currentPlayer) {
        return false;
    }

    if (
        !followsMovementRules(
            startRow,
            startCol,
            endRow,
            endCol
        )
    ) {
        return false;
    }

    if (
        checkKingSafety &&
        wouldBeInCheck(
            startRow,
            startCol,
            endRow,
            endCol
        )
    ) {
        return false;
    }

    return true;
}

function clearSelection() {
    if (selectedSquare) {
        selectedSquare.classList.remove("selected");
    }

    selectedSquare = null;
}

function movePiece(startRow, startCol, endRow, endCol) {
    const movingPiece = pieces[startRow][startCol];

    pieces[endRow][endCol] = movingPiece;
    pieces[startRow][startCol] = null;

    movingPiece.hasMoved = true;

    currentPlayer = currentPlayer === "white" ? "black" : "white";

    clearSelection();
    renderBoard();

    if (isKingInCheck(currentPlayer)) {
        status.textContent =
            currentPlayer.charAt(0).toUpperCase() +
            currentPlayer.slice(1) +
            "'s king is in check!";
    } else {
        status.textContent =
            currentPlayer.charAt(0).toUpperCase() +
            currentPlayer.slice(1) +
            "'s turn";
    }
}

function handleSquareClick(row, col, square) {
    if (gameOver) {
        return;
    }

    const piece = pieces[row][col];

    if (!selectedSquare) {
        if (!piece) {
            return;
        }

        if (piece.color !== currentPlayer) {
            status.textContent = "It's " + currentPlayer + "'s turn";
            return;
        }

        square.classList.add("selected");
        selectedSquare = square;
        selectedSquare.dataset.row = row;
        selectedSquare.dataset.col = col;

        status.textContent = "Selected " + piece.type;
        return;
    }

    const startRow = Number(selectedSquare.dataset.row);
    const startCol = Number(selectedSquare.dataset.col);

    if (isValidMove(startRow, startCol, row, col)) {
        movePiece(startRow, startCol, row, col);
        return;
    }

    clearSelection();

    if (piece && piece.color === currentPlayer) {
        square.classList.add("selected");
        selectedSquare = square;
        selectedSquare.dataset.row = row;
        selectedSquare.dataset.col = col;

        status.textContent = "Selected " + piece.type;
    } else {
        status.textContent = "That is not a legal move";
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

            const piece = pieces[row][col];

            if (piece) {
                square.textContent = getPieceSymbol(piece);
            }

            if (
                piece &&
                piece.type === "king" &&
                isKingInCheck(piece.color)
            ) {
                square.classList.add("in-check");
            }

            square.addEventListener("click", function () {
                handleSquareClick(row, col, square);
            });

            board.appendChild(square);
        }
    }
}

renderBoard();