if (piece.type === "pawn") {
    const direction =
        piece.color === "white" ? -1 : 1;

    const startingRow =
        piece.color === "white" ? 6 : 1;

    // Move one square forward.
    if (
        colDifference === 0 &&
        rowDifference === direction
    ) {
        return destination === null;
    }

    // Move two squares from the starting position.
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

    // Normal diagonal capture.
    if (
        rowDifference === direction &&
        colDistance === 1 &&
        destination !== null
    ) {
        return destination.color !== piece.color;
    }

    // En passant capture.
    if (
        rowDifference === direction &&
        colDistance === 1 &&
        destination === null
    ) {
        return isEnPassantMove(
            startRow,
            startCol,
            endRow,
            endCol
        );
    }

    return false;
}