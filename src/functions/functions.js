export function isPlayerChecker(cellData, isNextWhite) {
    return (
        (isNextWhite && cellData?.checker === "white") ||
        (!isNextWhite && cellData?.checker === "black")
    );
}

export function isEnemyChecker(cellData, isNextWhite) {
    return (
        (isNextWhite && cellData?.checker === "black") ||
        (!isNextWhite && cellData?.checker === "white")
    );
}

export function isEmptyField(cellData) {
    return !cellData?.checker;
}

export function isPlayerHasMoves(checkerCells, allCellsData, isNextWhite) {
    let playerHasMoves = false;

    checkerCells.forEach((checkerCellData) => {
        const closestCellsData = getClosestCellsData(
            checkerCellData,
            allCellsData,
            checkerCellData.isKing,
            isNextWhite
        );

        closestCellsData.forEach((closestCellData) => {
            const isRegularMovePossible =
                closestCellData && isEmptyField(closestCellData);

            let isAttackPossible = false;

            if (isEnemyChecker(closestCellData, isNextWhite)) {
                isAttackPossible = isEmptyField(
                    getCellBehindData(
                        checkerCellData,
                        closestCellData,
                        allCellsData
                    )
                );
            }

            if (isRegularMovePossible || isAttackPossible) {
                playerHasMoves = true;
                return;
            }
        });
    });

    return playerHasMoves;
}

export function getClosestCellsData(
    cellData,
    allCellsData,
    isKingMode = false,
    isNextWhite
) {
    const id = cellData.id;

    let possibleMoveCells = [];

    const rowShift = isNextWhite ? -1 : 1;

    // check cell on forward-left
    if (id[2] !== "1")
        possibleMoveCells.push(getData(`${+id[0] + rowShift}-${+id[2] - 1}`));
    // check cell on forward-right
    if (id[2] !== "8")
        possibleMoveCells.push(getData(`${+id[0] + rowShift}-${+id[2] + 1}`));

    if (isKingMode) {
        // check cell on back-left
        if (id[2] !== "1")
            possibleMoveCells.push(
                getData(`${+id[0] - rowShift}-${+id[2] - 1}`)
            );
        // check cell on back-right
        if (id[2] !== "8")
            possibleMoveCells.push(
                getData(`${+id[0] - rowShift}-${+id[2] + 1}`)
            );
    }

    return possibleMoveCells;

    function getData(id) {
        return allCellsData.find((cellData) => cellData.id === id);
    }
}

export function getCellBehindData(subjectData, targetData, allCellsData) {
    const rowShift = subjectData.row > targetData.row ? -1 : 1;

    const rowToCheck = subjectData.row + rowShift;

    // check field behind
    const cellCulumnToCheck =
        subjectData.column > targetData.column
            ? subjectData.column - 2
            : subjectData.column + 2;

    const isOnBoard =
        rowToCheck > 0 &&
        rowToCheck < 9 &&
        cellCulumnToCheck > 0 &&
        cellCulumnToCheck < 9;

    const cellBehindID = isOnBoard
        ? `${rowToCheck + rowShift}-${cellCulumnToCheck}`
        : null;

    return allCellsData.find((cellData) => cellData.id === cellBehindID);
}

export function createNewID() {
    return (Date.now() + Math.random()).toString();
}
