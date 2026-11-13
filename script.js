const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const turnElement = document.getElementById("turn");
const moveCountElement = document.getElementById("move-count");
const moveHistoryElement = document.getElementById("move-history");
const whiteCapturedElement = document.getElementById("white-captured");
const blackCapturedElement = document.getElementById("black-captured");

const newGameButton = document.getElementById("new-game");
const undoButton = document.getElementById("undo-button");

const PIECES = {
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

let board;
let currentPlayer;
let selectedSquare;
let moveHistory;
let capturedPieces;
let gameOver;
let lastMove;
let historyStack;


/* =========================================================
   GAME SETUP
========================================================= */

function createPiece(color, type) {
    return {
        color: color,
        type: type,
        hasMoved: false
    };
}


function createInitialBoard() {

    const newBoard = Array.from(
        { length: 8 },
        () => Array(8).fill(null)
    );

    const backRank = [
        "rook",
        "knight",
        "bishop",
        "queen",
        "king",
        "bishop",
        "knight",
        "rook"
    ];

    for (let col = 0; col < 8; col++) {

        newBoard[0][col] =
            createPiece("black", backRank[col]);

        newBoard[1][col] =
            createPiece("black", "pawn");

        newBoard[6][col] =
            createPiece("white", "pawn");

        newBoard[7][col] =
            createPiece("white", backRank[col]);
    }

    return newBoard;
}


function resetGame() {

    board = createInitialBoard();

    currentPlayer = "white";

    selectedSquare = null;

    moveHistory = [];

    capturedPieces = {
        white: [],
        black: []
    };

    gameOver = false;

    lastMove = null;

    historyStack = [];

    render();

    updateStatus();
}


/* =========================================================
   RENDER BOARD
========================================================= */

function render() {

    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("square");

            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];

            if (piece) {
                square.textContent =
                    PIECES[piece.color][piece.type];
            }

            if (
                selectedSquare &&
                selectedSquare.row === row &&
                selectedSquare.col === col
            ) {
                square.classList.add("selected");
            }

            if (
                lastMove &&
                (
                    (
                        lastMove.from.row === row &&
                        lastMove.from.col === col
                    ) ||
                    (
                        lastMove.to.row === row &&
                        lastMove.to.col === col
                    )
                )
            ) {
                square.classList.add("last-move");
            }

            if (selectedSquare) {

                const legalMoves =
                    getLegalMoves(
                        selectedSquare.row,
                        selectedSquare.col
                    );

                const validMove =
                    legalMoves.some(
                        move =>
                            move.row === row &&
                            move.col === col
                    );

                if (validMove) {

                    if (piece) {
                        square.classList.add("capture-move");
                    } else {
                        square.classList.add("valid-move");
                    }
                }
            }

            square.addEventListener(
                "click",
                handleSquareClick
            );

            boardElement.appendChild(square);
        }
    }

    highlightKingInCheck();

    updateInterface();
}


/* =========================================================
   USER INTERACTION
========================================================= */

function handleSquareClick(event) {

    if (gameOver) {
        return;
    }

    const row =
        Number(event.currentTarget.dataset.row);

    const col =
        Number(event.currentTarget.dataset.col);

    const piece = board[row][col];


    if (!selectedSquare) {

        if (
            piece &&
            piece.color === currentPlayer
        ) {

            selectedSquare = {
                row,
                col
            };

            render();
        }

        return;
    }


    const legalMoves =
        getLegalMoves(
            selectedSquare.row,
            selectedSquare.col
        );


    const isLegal =
        legalMoves.some(
            move =>
                move.row === row &&
                move.col === col
        );


    if (isLegal) {

        saveGameState();

        makeMove(
            selectedSquare.row,
            selectedSquare.col,
            row,
            col
        );

        selectedSquare = null;

        switchPlayer();

        render();

        updateStatus();

        return;
    }


    if (
        piece &&
        piece.color === currentPlayer
    ) {

        selectedSquare = {
            row,
            col
        };

        render();

    } else {

        selectedSquare = null;

        render();
    }
}


/* =========================================================
   MOVE EXECUTION
========================================================= */

function makeMove(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const piece =
        board[fromRow][fromCol];

    const captured =
        board[toRow][toCol];


    const moveNotation =
        createNotation(
            piece,
            fromRow,
            fromCol,
            toRow,
            toCol,
            captured
        );


    if (captured) {

        capturedPieces[
            captured.color
        ].push(captured);
    }


    /* En passant */

    if (
        piece.type === "pawn" &&
        fromCol !== toCol &&
        !captured
    ) {

        const capturedPawn =
            board[fromRow][toCol];

        if (
            capturedPawn &&
            capturedPawn.type === "pawn"
        ) {

            capturedPieces[
                capturedPawn.color
            ].push(capturedPawn);

            board[fromRow][toCol] = null;
        }
    }


    /* Move piece */

    board[toRow][toCol] =
        board[fromRow][fromCol];

    board[fromRow][fromCol] =
        null;


    /* Castling */

    if (
        piece.type === "king" &&
        Math.abs(toCol - fromCol) === 2
    ) {

        if (toCol === 6) {

            const rook =
                board[toRow][7];

            board[toRow][5] = rook;

            board[toRow][7] = null;

            if (rook) {
                rook.hasMoved = true;
            }

        } else if (toCol === 2) {

            const rook =
                board[toRow][0];

            board[toRow][3] = rook;

            board[toRow][0] = null;

            if (rook) {
                rook.hasMoved = true;
            }
        }
    }


    piece.hasMoved = true;


    /* Promotion */

    if (
        piece.type === "pawn" &&
        (toRow === 0 || toRow === 7)
    ) {

        const promotion =
            prompt(
                "Promote pawn to queen, rook, bishop, or knight:",
                "queen"
            );


        const validPromotions = [
            "queen",
            "rook",
            "bishop",
            "knight"
        ];


        if (
            promotion &&
            validPromotions.includes(
                promotion.toLowerCase()
            )
        ) {

            piece.type =
                promotion.toLowerCase();

        } else {

            piece.type = "queen";
        }
    }


    lastMove = {

        from: {
            row: fromRow,
            col: fromCol
        },

        to: {
            row: toRow,
            col: toCol
        }
    };


    moveHistory.push({
        notation: moveNotation,
        color: piece.color
    });
}


/* =========================================================
   MOVE NOTATION
========================================================= */

function createNotation(
    piece,
    fromRow,
    fromCol,
    toRow,
    toCol,
    captured
) {

    const files = "abcdefgh";

    const from =
        files[fromCol] +
        (8 - fromRow);

    const to =
        files[toCol] +
        (8 - toRow);


    const letters = {

        king: "K",
        queen: "Q",
        rook: "R",
        bishop: "B",
        knight: "N",
        pawn: ""
    };


    const captureSymbol =
        captured ? "x" : "-";


    return (
        letters[piece.type] +
        from +
        captureSymbol +
        to
    );
}


/* =========================================================
   TURN MANAGEMENT
========================================================= */

function switchPlayer() {

    currentPlayer =
        currentPlayer === "white"
            ? "black"
            : "white";
}


/* =========================================================
   BOARD UTILITIES
========================================================= */

function isInsideBoard(row, col) {

    return (
        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8
    );
}


/* =========================================================
   PAWN MOVEMENT
========================================================= */

function getPawnMoves(
    row,
    col,
    piece
) {

    const moves = [];

    const direction =
        piece.color === "white"
            ? -1
            : 1;

    const startRow =
        piece.color === "white"
            ? 6
            : 1;


    const oneStep =
        row + direction;


    if (
        isInsideBoard(oneStep, col) &&
        !board[oneStep][col]
    ) {

        moves.push({
            row: oneStep,
            col
        });


        const twoStep =
            row + direction * 2;


        if (
            row === startRow &&
            !board[twoStep][col]
        ) {

            moves.push({
                row: twoStep,
                col
            });
        }
    }


    /* Normal captures */

    for (const dc of [-1, 1]) {

        const captureRow =
            row + direction;

        const captureCol =
            col + dc;


        if (
            !isInsideBoard(
                captureRow,
                captureCol
            )
        ) {
            continue;
        }


        const target =
            board[captureRow][captureCol];


        if (
            target &&
            target.color !== piece.color
        ) {

            moves.push({
                row: captureRow,
                col: captureCol
            });
        }
    }


    /* En passant */

    if (lastMove) {

        const adjacentPiece =
            board[row][lastMove.to.col];


        if (
            adjacentPiece &&
            adjacentPiece.type === "pawn" &&
            adjacentPiece.color !== piece.color &&
            lastMove.from.row ===
                lastMove.to.row +
                (piece.color === "white" ? 2 : -2) &&
            lastMove.to.row === row &&
            Math.abs(
                lastMove.to.col - col
            ) === 1
        ) {

            moves.push({
                row: row + direction,
                col: lastMove.to.col
            });
        }
    }


    return moves;
}


/* =========================================================
   KNIGHT MOVEMENT
========================================================= */

function getKnightMoves(
    row,
    col,
    piece
) {

    const moves = [];

    const offsets = [

        [-2, -1],
        [-2, 1],

        [-1, -2],
        [-1, 2],

        [1, -2],
        [1, 2],

        [2, -1],
        [2, 1]
    ];


    for (const [dr, dc] of offsets) {

        const newRow = row + dr;
        const newCol = col + dc;


        if (
            !isInsideBoard(
                newRow,
                newCol
            )
        ) {
            continue;
        }


        const target =
            board[newRow][newCol];


        if (
            !target ||
            target.color !== piece.color
        ) {

            moves.push({
                row: newRow,
                col: newCol
            });
        }
    }


    return moves;
}


/* =========================================================
   SLIDING PIECES
========================================================= */

function getSlidingMoves(
    row,
    col,
    piece,
    directions
) {

    const moves = [];


    for (const [dr, dc] of directions) {

        let newRow = row + dr;
        let newCol = col + dc;


        while (
            isInsideBoard(
                newRow,
                newCol
            )
        ) {

            const target =
                board[newRow][newCol];


            if (!target) {

                moves.push({
                    row: newRow,
                    col: newCol
                });

            } else {

                if (
                    target.color !==
                    piece.color
                ) {

                    moves.push({
                        row: newRow,
                        col: newCol
                    });
                }

                break;
            }


            newRow += dr;
            newCol += dc;
        }
    }


    return moves;
}


/* =========================================================
   KING MOVEMENT
========================================================= */

function getKingMoves(
    row,
    col,
    piece
) {

    const moves = [];


    for (let dr = -1; dr <= 1; dr++) {

        for (let dc = -1; dc <= 1; dc++) {

            if (
                dr === 0 &&
                dc === 0
            ) {
                continue;
            }


            const newRow =
                row + dr;

            const newCol =
                col + dc;


            if (
                !isInsideBoard(
                    newRow,
                    newCol
                )
            ) {
                continue;
            }


            const target =
                board[newRow][newCol];


            if (
                !target ||
                target.color !== piece.color
            ) {

                moves.push({
                    row: newRow,
                    col: newCol
                });
            }
        }
    }


    /* Castling */

    if (
        !piece.hasMoved &&
        !isKingInCheck(piece.color)
    ) {

        /* Kingside */

        const rookKingside =
            board[row][7];


        if (
            rookKingside &&
            rookKingside.type === "rook" &&
            !rookKingside.hasMoved &&
            !board[row][5] &&
            !board[row][6] &&
            !isSquareAttacked(
                row,
                5,
                oppositeColor(piece.color)
            ) &&
            !isSquareAttacked(
                row,
                6,
                oppositeColor(piece.color)
            )
        ) {

            moves.push({
                row,
                col: 6
            });
        }


        /* Queenside */

        const rookQueenside =
            board[row][0];


        if (
            rookQueenside &&
            rookQueenside.type === "rook" &&
            !rookQueenside.hasMoved &&
            !board[row][1] &&
            !board[row][2] &&
            !board[row][3] &&
            !isSquareAttacked(
                row,
                3,
                oppositeColor(piece.color)
            ) &&
            !isSquareAttacked(
                row,
                2,
                oppositeColor(piece.color)
            )
        ) {

            moves.push({
                row,
                col: 2
            });
        }
    }


    return moves;
}


/* =========================================================
   PSEUDO-LEGAL MOVES
========================================================= */

function getPseudoLegalMoves(
    row,
    col
) {

    const piece =
        board[row][col];


    if (!piece) {
        return [];
    }


    switch (piece.type) {

        case "pawn":

            return getPawnMoves(
                row,
                col,
                piece
            );


        case "knight":

            return getKnightMoves(
                row,
                col,
                piece
            );


        case "bishop":

            return getSlidingMoves(
                row,
                col,
                piece,
                [
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1]
                ]
            );


        case "rook":

            return getSlidingMoves(
                row,
                col,
                piece,
                [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ]
            );


        case "queen":

            return getSlidingMoves(
                row,
                col,
                piece,
                [
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1],
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ]
            );


        case "king":

            return getKingMoves(
                row,
                col,
                piece
            );


        default:

            return [];
    }
}


/* =========================================================
   LEGAL MOVES
========================================================= */

function getLegalMoves(
    row,
    col
) {

    const piece =
        board[row][col];


    if (!piece) {
        return [];
    }


    const pseudoMoves =
        getPseudoLegalMoves(
            row,
            col
        );


    return pseudoMoves.filter(
        move => {

            const simulated =
                simulateMove(
                    row,
                    col,
                    move.row,
                    move.col
                );


            return !isKingInCheck(
                piece.color,
                simulated
            );
        }
    );
}


/* =========================================================
   SIMULATE MOVE
========================================================= */

function simulateMove(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const simulated =
        board.map(
            row => row.map(
                piece =>
                    piece
                        ? { ...piece }
                        : null
            )
        );


    const piece =
        simulated[fromRow][fromCol];


    /* En passant */

    if (
        piece.type === "pawn" &&
        fromCol !== toCol &&
        !simulated[toRow][toCol]
    ) {

        simulated[fromRow][toCol] = null;
    }


    simulated[toRow][toCol] =
        piece;

    simulated[fromRow][fromCol] =
        null;


    /* Castling */

    if (
        piece.type === "king" &&
        Math.abs(
            toCol - fromCol
        ) === 2
    ) {

        if (toCol === 6) {

            simulated[toRow][5] =
                simulated[toRow][7];

            simulated[toRow][7] =
                null;

        } else if (toCol === 2) {

            simulated[toRow][3] =
                simulated[toRow][0];

            simulated[toRow][0] =
                null;
        }
    }


    return simulated;
}


/* =========================================================
   CHECK DETECTION
========================================================= */

function isKingInCheck(
    color,
    currentBoard = board
) {

    let kingPosition = null;


    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece =
                currentBoard[row][col];


            if (
                piece &&
                piece.color === color &&
                piece.type === "king"
            ) {

                kingPosition = {
                    row,
                    col
                };
            }
        }
    }


    if (!kingPosition) {
        return true;
    }


    const opponent =
        oppositeColor(color);


    return isSquareAttacked(
        kingPosition.row,
        kingPosition.col,
        opponent,
        currentBoard
    );
}


/* =========================================================
   SQUARE ATTACK DETECTION
========================================================= */

function isSquareAttacked(
    targetRow,
    targetCol,
    attackerColor,
    currentBoard = board
) {

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece =
                currentBoard[row][col];


            if (
                !piece ||
                piece.color !== attackerColor
            ) {
                continue;
            }


            if (
                pieceAttacksSquare(
                    row,
                    col,
                    targetRow,
                    targetCol,
                    currentBoard
                )
            ) {

                return true;
            }
        }
    }


    return false;
}


/* =========================================================
   PIECE ATTACK LOGIC
========================================================= */

function pieceAttacksSquare(
    row,
    col,
    targetRow,
    targetCol,
    currentBoard
) {

    const piece =
        currentBoard[row][col];


    const rowDifference =
        targetRow - row;

    const colDifference =
        targetCol - col;


    /* Pawn */

    if (piece.type === "pawn") {

        const direction =
            piece.color === "white"
                ? -1
                : 1;


        return (
            rowDifference === direction &&
            Math.abs(colDifference) === 1
        );
    }


    /* Knight */

    if (piece.type === "knight") {

        return (

            (
                Math.abs(rowDifference) === 2 &&
                Math.abs(colDifference) === 1
            )

            ||

            (
                Math.abs(rowDifference) === 1 &&
                Math.abs(colDifference) === 2
            )
        );
    }


    /* King */

    if (piece.type === "king") {

        return (
            Math.abs(rowDifference) <= 1 &&
            Math.abs(colDifference) <= 1
        );
    }


    let directions = [];


    if (
        piece.type === "bishop" ||
        piece.type === "queen"
    ) {

        directions.push(

            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        );
    }


    if (
        piece.type === "rook" ||
        piece.type === "queen"
    ) {

        directions.push(

            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        );
    }


    for (
        const [dr, dc]
        of directions
    ) {

        let r = row + dr;
        let c = col + dc;


        while (
            isInsideBoard(r, c)
        ) {

            if (
                r === targetRow &&
                c === targetCol
            ) {

                return true;
            }


            if (currentBoard[r][c]) {
                break;
            }


            r += dr;
            c += dc;
        }
    }


    return false;
}


/* =========================================================
   CHECKMATE / STALEMATE
========================================================= */

function hasLegalMoves(color) {

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece =
                board[row][col];


            if (
                piece &&
                piece.color === color
            ) {

                if (
                    getLegalMoves(
                        row,
                        col
                    ).length > 0
                ) {

                    return true;
                }
            }
        }
    }


    return false;
}


function updateStatus() {

    if (gameOver) {
        return;
    }


    const inCheck =
        isKingInCheck(
            currentPlayer
        );


    const hasMoves =
        hasLegalMoves(
            currentPlayer
        );


    if (
        !hasMoves &&
        inCheck
    ) {

        const winner =
            oppositeColor(
                currentPlayer
            );


        statusElement.textContent =
            `Checkmate! ${capitalize(winner)} wins.`;

        gameOver = true;

        return;
    }


    if (
        !hasMoves &&
        !inCheck
    ) {

        statusElement.textContent =
            "Stalemate! The game is a draw.";

        gameOver = true;

        return;
    }


    if (inCheck) {

        statusElement.textContent =
            `${capitalize(currentPlayer)} is in check!`;

    } else {

        statusElement.textContent =
            `${capitalize(currentPlayer)}'s turn`;
    }
}


/* =========================================================
   HIGHLIGHT KING IN CHECK
========================================================= */

function highlightKingInCheck() {

    if (
        !isKingInCheck(
            currentPlayer
        )
    ) {
        return;
    }


    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece =
                board[row][col];


            if (
                piece &&
                piece.color === currentPlayer &&
                piece.type === "king"
            ) {

                const index =
                    row * 8 + col;


                const square =
                    boardElement.children[index];


                if (square) {
                    square.classList.add(
                        "in-check"
                    );
                }
            }
        }
    }
}


/* =========================================================
   UNDO SYSTEM
========================================================= */

function saveGameState() {

    historyStack.push({

        board: cloneBoard(board),

        currentPlayer,

        moveHistory:
            JSON.parse(
                JSON.stringify(
                    moveHistory
                )
            ),

        capturedPieces:
            JSON.parse(
                JSON.stringify(
                    capturedPieces
                )
            ),

        lastMove:
            lastMove
                ? JSON.parse(
                    JSON.stringify(
                        lastMove
                    )
                )
                : null
    });
}


function undoMove() {

    if (
        historyStack.length === 0 ||
        gameOver
    ) {
        return;
    }


    const previousState =
        historyStack.pop();


    board =
        previousState.board;


    currentPlayer =
        previousState.currentPlayer;


    moveHistory =
        previousState.moveHistory;


    capturedPieces =
        previousState.capturedPieces;


    lastMove =
        previousState.lastMove;


    selectedSquare = null;


    render();

    updateStatus();
}


function cloneBoard(sourceBoard) {

    return sourceBoard.map(
        row =>
            row.map(
                piece =>
                    piece
                        ? { ...piece }
                        : null
            )
    );
}


/* =========================================================
   INTERFACE
========================================================= */

function updateInterface() {

    turnElement.textContent =
        capitalize(
            currentPlayer
        );


    moveCountElement.textContent =
        moveHistory.length;


    updateMoveHistory();


    whiteCapturedElement.textContent =
        capturedPieces.white
            .map(
                piece =>
                    PIECES[
                        piece.color
                    ][
                        piece.type
                    ]
            )
            .join("");


    blackCapturedElement.textContent =
        capturedPieces.black
            .map(
                piece =>
                    PIECES[
                        piece.color
                    ][
                        piece.type
                    ]
            )
            .join("");
}


function updateMoveHistory() {

    if (
        moveHistory.length === 0
    ) {

        moveHistoryElement.innerHTML =
            '<p class="empty">No moves yet</p>';

        return;
    }


    moveHistoryElement.innerHTML = "";


    for (
        let i = 0;
        i < moveHistory.length;
        i += 2
    ) {

        const whiteMove =
            moveHistory[i];

        const blackMove =
            moveHistory[i + 1];


        const row =
            document.createElement(
                "div"
            );


        row.className = "move";


        row.innerHTML = `

            <span>
                ${Math.floor(i / 2) + 1}.
            </span>

            <span>
                ${whiteMove
                    ? whiteMove.notation
                    : ""}
            </span>

            <span>
                ${blackMove
                    ? blackMove.notation
                    : ""}
            </span>

        `;


        moveHistoryElement.appendChild(
            row
        );
    }
}


/* =========================================================
   HELPERS
========================================================= */

function oppositeColor(color) {

    return color === "white"
        ? "black"
        : "white";
}


function capitalize(word) {

    return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
    );
}


/* =========================================================
   BUTTONS
========================================================= */

newGameButton.addEventListener(
    "click",
    resetGame
);


undoButton.addEventListener(
    "click",
    undoMove
);


/* =========================================================
   START GAME
========================================================= */

resetGame();