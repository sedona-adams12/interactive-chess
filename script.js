const board = document.getElementById("board");
const status = document.getElementById("status");
const turnDisplay = document.getElementById("turn");
const moveCountDisplay = document.getElementById("move-count");
const moveHistoryDisplay = document.getElementById("move-history");
const whiteCapturedDisplay = document.getElementById("white-captured");
const blackCapturedDisplay = document.getElementById("black-captured");
const newGameButton = document.getElementById("new-game");
const undoButton = document.getElementById("undo-button");

let currentPlayer = "white";
let selectedSquare = null;
let gameOver = false;
let moveCount = 0;

let moveHistory = [];

let capturedPieces = {
    white: [],
    black: []
};

let gameStates = [];

let pieces = createStartingBoard();

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

function copyBoard(boardToCopy) {
    return boardToCopy.map(function (row) {
        return row.map(function (piece) {
            if (!piece) {
                return null;
            }

            return {
                color: piece.color,
                type: piece.type,
                hasMoved: piece.hasMoved
            };
        });
    });
}

function saveGameState() {
    gameStates.push({
        pieces: copyBoard(pieces),
        currentPlayer: currentPlayer,
        moveCount: moveCount,
        moveHistory: JSON.parse(JSON.stringify(moveHistory)),
        capturedPieces: {
            white: capturedPieces.white.map(function (piece) {
                return {
                    color: piece.color,
                    type: piece.type,
                    hasMoved: piece.hasMoved
                };
            }),

            black: capturedPieces.black.map(function (piece) {
                return {
                    color: piece.color,
                    type: piece.type,
                    hasMoved: piece.hasMoved
                };
            })
        }
    });
}

function restoreGameState(state) {
    pieces = copyBoard(state.pieces);

    currentPlayer = state.currentPlayer;
    moveCount = state.moveCount;

    moveHistory = JSON.parse(
        JSON.stringify(state.moveHistory)
    );

    capturedPieces = {
        white: state.capturedPieces.white.map(function (piece) {
            return {
                color: piece.color,
                type: piece.type,
                hasMoved: piece.hasMoved
            };
        }),

        black: state.capturedPieces.black.map(function (piece) {
            return {
                color: piece.color,
                type: piece.type,
                hasMoved: piece.hasMoved
            };
        })
    };

    gameOver = false;
    selectedSquare = null;
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

    if (destination && destination.color === piece.color) {
        return false;
    }

    if (destination && destination.type === "king") {
        return false;
    }

    if (piece.type === "pawn") {
        const direction = piece.color === "white" ? -1 : 1;
        const startingRow = piece.color === "white" ? 6 : 1;

        if (
            colDifference === 0 &&
            rowDifference === direction
        ) {
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
            return (
                destination !== null &&
                destination.color !== piece.color
            );
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
            isPathClear(
                startRow,
                startCol,
                endRow,
                endCol
            )
        );
    }

    if (piece.type === "rook") {
        return (
            (rowDifference === 0 || colDifference === 0) &&
            isPathClear(
                startRow,
                startCol,
                endRow,
                endCol
            )
        );
    }

    if (piece.type === "queen") {
        const movesStraight =
            rowDifference === 0 || colDifference === 0;

        const movesDiagonal =
            rowDistance === colDistance;

        return (
            (movesStraight || movesDiagonal) &&
            isPathClear(
                startRow,
                startCol,
                endRow,
                endCol
            )
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
                return {
                    row: row,
                    col: col
                };
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
        const direction =
            piece.color === "white" ? -1 : 1;

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
            isPathClear(
                startRow,
                startCol,
                targetRow,
                targetCol
            )
        );
    }

    if (piece.type === "rook") {
        return (
            (rowDifference === 0 || colDifference === 0) &&
            isPathClear(
                startRow,
                startCol,
                targetRow,
                targetCol
            )
        );
    }

    if (piece.type === "queen") {
        const movesStraight =
            rowDifference === 0 || colDifference === 0;

        const movesDiagonal =
            rowDistance === colDistance;

        return (
            (movesStraight || movesDiagonal) &&
            isPathClear(
                startRow,
                startCol,
                targetRow,
                targetCol
            )
        );
    }

    return false;
}

function isSquareAttacked(row, col, attackingColor) {
    for (let startRow = 0; startRow < 8; startRow++) {
        for (let startCol = 0; startCol < 8; startCol++) {
            const piece = pieces[startRow][startCol];

            if (
                !piece ||
                piece.color !== attackingColor
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

function isKingInCheck(color) {
    const kingPosition = findKing(color);

    if (!kingPosition) {
        return false;
    }

    const opposingColor =
        color === "white" ? "black" : "white";

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

function isValidCastling(
    startRow,
    startCol,
    endRow,
    endCol
) {
    const king = pieces[startRow][startCol];

    if (!king || king.type !== "king") {
        return false;
    }

    if (king.hasMoved) {
        return false;
    }

    if (startRow !== endRow) {
        return false;
    }

    if (Math.abs(endCol - startCol) !== 2) {
        return false;
    }

    if (isKingInCheck(king.color)) {
        return false;
    }

    const direction =
        endCol > startCol ? 1 : -1;

    const rookCol =
        direction === 1 ? 7 : 0;

    const rook = pieces[startRow][rookCol];

    if (
        !rook ||
        rook.type !== "rook" ||
        rook.color !== king.color ||
        rook.hasMoved
    ) {
        return false;
    }

    const betweenStart =
        Math.min(startCol, rookCol) + 1;

    const betweenEnd =
        Math.max(startCol, rookCol);

    for (
        let col = betweenStart;
        col < betweenEnd;
        col++
    ) {
        if (pieces[startRow][col] !== null) {
            return false;
        }
    }

    const opposingColor =
        king.color === "white" ? "black" : "white";

    const middleCol =
        startCol + direction;

    if (
        isSquareAttacked(
            startRow,
            middleCol,
            opposingColor
        )
    ) {
        return false;
    }

    if (
        isSquareAttacked(
            startRow,
            endCol,
            opposingColor
        )
    ) {
        return false;
    }

    return true;
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

    if (
        startRow === endRow &&
        startCol === endCol
    ) {
        return false;
    }

    const piece = pieces[startRow][startCol];

    if (
        !piece ||
        piece.color !== currentPlayer
    ) {
        return false;
    }

    if (
        piece.type === "king" &&
        Math.abs(endCol - startCol) === 2
    ) {
        return isValidCastling(
            startRow,
            startCol,
            endRow,
            endCol
        );
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

function clearHighlights() {
    const squares =
        document.querySelectorAll(".square");

    squares.forEach(function (square) {
        square.classList.remove("valid-move");
        square.classList.remove("capture-move");
    });
}

function clearSelection() {
    if (selectedSquare) {
        selectedSquare.classList.remove("selected");
    }

    selectedSquare = null;

    clearHighlights();
}

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

function showValidMoves(row, col) {
    clearHighlights();

    const legalMoves =
        getLegalMoves(row, col);

    const squares =
        document.querySelectorAll(".square");

    legalMoves.forEach(function (move) {
        const index =
            move.row * 8 + move.col;

        const targetSquare =
            squares[index];

        targetSquare.classList.add("valid-move");

        if (
            pieces[move.row][move.col] !== null
        ) {
            targetSquare.classList.add(
                "capture-move"
            );
        }
    });
}

function hasAnyLegalMoves(color) {
    const originalPlayer = currentPlayer;

    currentPlayer = color;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = pieces[row][col];

            if (
                !piece ||
                piece.color !== color
            ) {
                continue;
            }

            if (
                getLegalMoves(row, col).length > 0
            ) {
                currentPlayer = originalPlayer;
                return true;
            }
        }
    }

    currentPlayer = originalPlayer;

    return false;
}

function isCheckmate(color) {
    return (
        isKingInCheck(color) &&
        !hasAnyLegalMoves(color)
    );
}

function isStalemate(color) {
    return (
        !isKingInCheck(color) &&
        !hasAnyLegalMoves(color)
    );
}

function promotePawn(row, col) {
    const piece = pieces[row][col];

    if (
        !piece ||
        piece.type !== "pawn"
    ) {
        return;
    }

    if (
        (piece.color === "white" && row === 0) ||
        (piece.color === "black" && row === 7)
    ) {
        piece.type = "queen";
    }
}

function movePiece(
    startRow,
    startCol,
    endRow,
    endCol
) {
    // Save the position before making the move.
    saveGameState();

    const movingPiece =
        pieces[startRow][startCol];

    const capturedPiece =
        pieces[endRow][endCol];

    const isCastling =
        movingPiece.type === "king" &&
        Math.abs(endCol - startCol) === 2;

    if (capturedPiece) {
        capturedPieces[
            capturedPiece.color
        ].push(capturedPiece);
    }

    pieces[endRow][endCol] =
        movingPiece;

    pieces[startRow][startCol] =
        null;

    movingPiece.hasMoved = true;

    if (isCastling) {
        const rookStartCol =
            endCol > startCol ? 7 : 0;

        const rookEndCol =
            endCol > startCol ? 5 : 3;

        const rook =
            pieces[startRow][rookStartCol];

        pieces[startRow][rookEndCol] =
            rook;

        pieces[startRow][rookStartCol] =
            null;

        rook.hasMoved = true;
    }

    promotePawn(endRow, endCol);

    moveCount++;

    moveHistory.push({
        piece: movingPiece.type,
        color: movingPiece.color,
        start: [startRow, startCol],
        end: [endRow, endCol],
        castling: isCastling
    });

    currentPlayer =
        currentPlayer === "white"
            ? "black"
            : "white";

    clearSelection();

    renderBoard();

    if (isCheckmate(currentPlayer)) {
        gameOver = true;

        const winner =
            currentPlayer === "white"
                ? "Black"
                : "White";

        status.textContent =
            winner + " wins by checkmate!";

        return;
    }

    if (isStalemate(currentPlayer)) {
        gameOver = true;

        status.textContent =
            "Draw by stalemate!";

        return;
    }

    if (isKingInCheck(currentPlayer)) {
        status.textContent =
            currentPlayer
                .charAt(0)
                .toUpperCase() +
            currentPlayer.slice(1) +
            "'s king is in check!";
    } else {
        status.textContent =
            currentPlayer
                .charAt(0)
                .toUpperCase() +
            currentPlayer.slice(1) +
            "'s turn";
    }

    updateGameInformation();
}

function undoMove() {
    if (gameStates.length === 0) {
        status.textContent =
            "There are no moves to undo.";
        return;
    }

    const previousState =
        gameStates.pop();

    restoreGameState(previousState);

    renderBoard();

    status.textContent =
        currentPlayer
            .charAt(0)
            .toUpperCase() +
        currentPlayer.slice(1) +
        "'s turn";
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
            status.textContent =
                "It's " +
                currentPlayer +
                "'s turn";

            return;
        }

        square.classList.add("selected");

        selectedSquare = square;

        selectedSquare.dataset.row = row;
        selectedSquare.dataset.col = col;

        showValidMoves(row, col);

        status.textContent =
            "Selected " + piece.type;

        return;
    }

    const startRow =
        Number(selectedSquare.dataset.row);

    const startCol =
        Number(selectedSquare.dataset.col);

    if (
        isValidMove(
            startRow,
            startCol,
            row,
            col
        )
    ) {
        movePiece(
            startRow,
            startCol,
            row,
            col
        );

        return;
    }

    clearSelection();

    if (
        piece &&
        piece.color === currentPlayer
    ) {
        square.classList.add("selected");

        selectedSquare = square;

        selectedSquare.dataset.row = row;
        selectedSquare.dataset.col = col;

        showValidMoves(row, col);

        status.textContent =
            "Selected " + piece.type;
    } else {
        status.textContent =
            "That is not a legal move";
    }
}

function updateGameInformation() {
    turnDisplay.textContent =
        currentPlayer
            .charAt(0)
            .toUpperCase() +
        currentPlayer.slice(1);

    moveCountDisplay.textContent =
        moveCount;

    if (moveHistory.length === 0) {
        moveHistoryDisplay.innerHTML =
            '<p class="empty">No moves yet</p>';
    } else {
        moveHistoryDisplay.innerHTML = "";

        moveHistory.forEach(function (
            move,
            index
        ) {
            const moveItem =
                document.createElement("p");

            let moveText =
                (index + 1) +
                ". " +
                move.color +
                " " +
                move.piece +
                " (" +
                move.start.join(",") +
                ") → (" +
                move.end.join(",") +
                ")";

            if (move.castling) {
                moveText += " Castling";
            }

            moveItem.textContent =
                moveText;

            moveHistoryDisplay.appendChild(
                moveItem
            );
        });
    }

    whiteCapturedDisplay.textContent =
        capturedPieces.white
            .map(function (piece) {
                return getPieceSymbol(piece);
            })
            .join(" ");

    blackCapturedDisplay.textContent =
        capturedPieces.black
            .map(function (piece) {
                return getPieceSymbol(piece);
            })
            .join(" ");
}

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

            const piece =
                pieces[row][col];

            if (piece) {
                square.textContent =
                    getPieceSymbol(piece);
            }

            if (
                piece &&
                piece.type === "king" &&
                isKingInCheck(piece.color)
            ) {
                square.classList.add(
                    "in-check"
                );
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

    updateGameInformation();
}

function startNewGame() {
    pieces = createStartingBoard();

    currentPlayer = "white";
    selectedSquare = null;
    gameOver = false;
    moveCount = 0;

    moveHistory = [];

    capturedPieces = {
        white: [],
        black: []
    };

    gameStates = [];

    status.textContent =
        "White's turn";

    renderBoard();
}

newGameButton.addEventListener(
    "click",
    function () {
        startNewGame();
    }
);

undoButton.addEventListener(
    "click",
    function () {
        undoMove();
    }
);

renderBoard();