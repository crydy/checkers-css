import Cell from "./Cell";

export let activeCheckerID = null;
export const possibleAttacks = [];

function Board({
    isNextPlayerMarked,
    boardSide,
    cellsData,
    setCellsData,
    isNextWhite,
    showCellNumbers,
    updateHistoryWithNextChanging,
}) {
    //
    //---------------------------- Main game logic -------------------------------

    function handleChangeSellsData(clickedCellData) {
        const isMoveInit = isPlayerChecker(clickedCellData);
        const isClickOnActive = activeCheckerID === clickedCellData.id;
        const isMoveOrAttack =
            clickedCellData.isFieldToMove && !clickedCellData.isControversial;
        const isResolveOfControversialAttack = clickedCellData.isControversial;

        if (isMoveInit) {
            if (isClickOnActive) {
                clearMoveInit();
                return;
            }

            activeCheckerID = clickedCellData.id;

            const cellsToMoveData = getClosestCellsData(
                clickedCellData,
                clickedCellData.isKing
            ).filter((cellData) => cellData && isEmptyField(cellData));

            const attackableEnemiesData = [];
            let lastChainID;

            // gather all possible attacks and related moves
            // function works recursively and call itself
            // for every next empty cell behind enemy checker
            setAttacks(clickedCellData);

            function setAttacks(startCellData) {
                const previousLevelAttack = possibleAttacks.find(
                    (attackObj) =>
                        attackObj.moveID === startCellData.id &&
                        attackObj.chainID === lastChainID
                );

                const enemiesNearbyData = getClosestCellsData(
                    startCellData,
                    clickedCellData.isKing
                ).filter((cellData) => isEnemyChecker(cellData));

                if (enemiesNearbyData.length > 0) {
                    enemiesNearbyData.forEach((enemyData) => {
                        const cellBehindEnemyData = getCellBehindData(
                            startCellData,
                            enemyData
                        );

                        const isCellBehindEnemyEmpty =
                            cellBehindEnemyData &&
                            isEmptyField(cellBehindEnemyData);

                        const isNotPreviousChainLink =
                            !previousLevelAttack?.cellsToPassIDs.includes(
                                cellBehindEnemyData?.id
                            );

                        if (isCellBehindEnemyEmpty && isNotPreviousChainLink) {
                            if (!previousLevelAttack) {
                                // start new chain
                                const newChainID = createNewID();
                                lastChainID = newChainID;

                                // first level attack object
                                possibleAttacks.push({
                                    chainID: newChainID,
                                    moveID: cellBehindEnemyData.id,
                                    enemyIDs: [enemyData.id],
                                    cellsToPassIDs: [],
                                });
                            } else {
                                // continue the chain
                                lastChainID = previousLevelAttack.chainID;

                                // next level attack object
                                // gather all previous cells to pass and enemies to attack
                                possibleAttacks.push({
                                    chainID: previousLevelAttack.chainID,
                                    moveID: cellBehindEnemyData.id,
                                    enemyIDs: [
                                        ...previousLevelAttack.enemyIDs,
                                        enemyData.id,
                                    ],
                                    cellsToPassIDs: [
                                        ...previousLevelAttack.cellsToPassIDs,
                                        previousLevelAttack.moveID,
                                    ],
                                });
                            }

                            cellsToMoveData.push(cellBehindEnemyData);
                            attackableEnemiesData.push(enemyData);

                            // repeat recursively for every next empty cell
                            // behind every enemy checker which under attack
                            setAttacks(cellBehindEnemyData);
                        }
                    });
                }
            }

            setBeforeMoveStates({
                active: clickedCellData,
                attackableSet: attackableEnemiesData,
                movableSet: cellsToMoveData,
            });
        } else if (isMoveOrAttack) {
            const currentAttackVarians = possibleAttacks.filter(
                (attackObj) => attackObj.moveID === clickedCellData.id
            );
            const isControversialAttack = currentAttackVarians.length > 1;

            if (!isControversialAttack) {
                // regular move, attack move

                const activeCheckerData = getData(activeCheckerID);
                const checkersUnderAttackData =
                    possibleAttacks
                        .find(
                            (attackObj) =>
                                attackObj.moveID === clickedCellData.id
                        )
                        ?.enemyIDs.map((id) => getData(id)) ?? [];

                updateHistoryWithNextChanging();
                setAfterMoveStates({
                    active: activeCheckerData,
                    dest: clickedCellData,
                    removeSet: checkersUnderAttackData,
                });

                clearMoveInit();
            } else {
                // set controversial attack state
                // (if several attacks with one destination cell are possible)

                currentAttackVarians.forEach(
                    (attackObj) => (attackObj.isControversial = true)
                );

                const contrCellsData = currentAttackVarians.map((attackObj) =>
                    [...attackObj.enemyIDs, ...attackObj.cellsToPassIDs].map(
                        (id) => getData(id)
                    )
                );

                contrCellsData.forEach((contrIDsArray) => {
                    setControversialState(contrIDsArray);
                });

                return;
            }
        } else if (isResolveOfControversialAttack) {
            const thisAttackObj = possibleAttacks.find(
                (attackObj) =>
                    (attackObj.isControversial &&
                        attackObj.enemyIDs.includes(clickedCellData.id)) ||
                    (attackObj.isControversial &&
                        attackObj.cellsToPassIDs.includes(clickedCellData.id))
            );

            const activeCheckerData = getData(activeCheckerID);
            const destCellData = getData(thisAttackObj.moveID);

            updateHistoryWithNextChanging();
            setAfterMoveStates({
                active: activeCheckerData,
                dest: destCellData,
                removeSet: thisAttackObj.enemyIDs.map((id) => getData(id)),
            });

            clearMoveInit();
        } else {
            clearMoveInit();
        }
    }

    function handleMarkActiveContraversials(event, cellData) {
        if (!cellData.isControversial && !cellData.isControversialHover) return;

        const thisAttackObject = possibleAttacks
            .filter((attackObj) => attackObj.isControversial)
            .find(
                (attackObj) =>
                    attackObj.cellsToPassIDs.includes(cellData.id) ||
                    attackObj.enemyIDs.includes(cellData.id)
            );

        const cellsToMarkData = [
            ...thisAttackObject.enemyIDs,
            ...thisAttackObject.cellsToPassIDs,
        ].map((id) => getData(id));

        if (event._reactName === "onMouseEnter") {
            setControversialHoverCells(cellsToMarkData);
        }

        if (event._reactName === "onMouseLeave") {
            setControversialHoverCells(cellsToMarkData, "remove active mark");
        }

        function setControversialHoverCells(cellsToMarkData, reverse = false) {
            setCellsData((prevState) => {
                return prevState.map((cellData) => {
                    return cellsToMarkData?.find((cellToMoveData) => {
                        return cellToMoveData?.id === cellData.id;
                    })
                        ? {
                              ...cellData,
                              isControversialHover: !reverse ? true : false,
                          }
                        : cellData;
                });
            });
        }

        function getData(id) {
            return cellsData.find((cellData) => cellData.id === id);
        }
    }

    // ---------------------------------------------------------------------------

    function isPlayerChecker(cellData) {
        return (
            (isNextWhite && cellData?.checker === "white") ||
            (!isNextWhite && cellData?.checker === "black")
        );
    }

    function isEnemyChecker(cellData) {
        return (
            (isNextWhite && cellData?.checker === "black") ||
            (!isNextWhite && cellData?.checker === "white")
        );
    }

    function isEmptyField(cellData) {
        return !cellData?.checker;
    }

    function createNewID() {
        return (Date.now() + Math.random()).toString();
    }

    function getData(id) {
        return cellsData.find((cellData) => cellData.id === id);
    }

    function getClosestCellsData(cellData, isKingMode = false) {
        const id = cellData.id;

        let possibleMoveCells = [];

        const rowShift = isNextWhite ? -1 : 1;

        // check cell on forward-left
        if (id[2] !== "1")
            possibleMoveCells.push(
                getData(`${+id[0] + rowShift}-${+id[2] - 1}`)
            );
        // check cell on forward-right
        if (id[2] !== "8")
            possibleMoveCells.push(
                getData(`${+id[0] + rowShift}-${+id[2] + 1}`)
            );

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
    }

    function getCellBehindData(subjectData, targetData) {
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

        return getData(cellBehindID);
    }

    function getBoardSideClassName(isNextWhite, boardSide) {
        let rotateState;

        switch (boardSide) {
            case "auto":
                rotateState =
                    isNextWhite && boardSide === "auto" ? "" : "board-inverse";
                break;

            case "white":
                rotateState = "";
                break;

            case "black":
                rotateState = "board-inverse";
                break;

            case "90":
                rotateState = "board-90";
                break;
        }

        return rotateState;
    }

    function setBeforeMoveStates({ active, attackableSet, movableSet }) {
        setCellsData((prevState) => {
            return prevState.map((cellData) => {
                const isActive = active.id === cellData.id;
                const isMovable = movableSet.find(
                    (movableCellData) => movableCellData.id === cellData.id
                );
                const isAttackable = attackableSet?.find(
                    (attackableCellData) =>
                        attackableCellData.id === cellData.id
                );

                if (isActive) {
                    return { ...cellData, isActive: true };
                } else if (isMovable) {
                    return { ...cellData, isFieldToMove: true };
                } else if (isAttackable) {
                    return { ...cellData, isUnderAttack: true };
                } else {
                    return {
                        ...cellData,
                        isActive: false,
                        isFieldToMove: false,
                        isUnderAttack: false,
                        isControversial: false,
                        isControversialHover: false,
                    };
                }
            });
        });
    }

    function setAfterMoveStates({ active, dest, removeSet }) {
        setCellsData(
            cellsData.map((cellData) => {
                const isTargetCell = cellData.id === dest.id;
                const isLeavedCell = cellData.id === active.id;
                const isEnemy = removeSet.find(
                    (enemyCellData) => cellData.id === enemyCellData.id
                );
                const isKingEvent = isLastRow(dest) && !active.isKing;

                if (isTargetCell) {
                    return {
                        ...cellData,
                        checker: active.checker,
                        isKing: active.isKing || isKingEvent ? true : false,
                    };
                } else if (isLeavedCell || isEnemy) {
                    return { ...cellData, checker: null, isKing: false };
                } else {
                    return {
                        ...cellData,
                        isActive: false,
                        isFieldToMove: false,
                        isUnderAttack: false,
                        isControversial: false,
                        isControversialHover: false,
                    };
                }
            })
        );

        function isLastRow(cellData) {
            return (
                (isNextWhite && cellData.row === 1) ||
                (!isNextWhite && cellData.row === 8)
            );
        }
    }

    function setControversialState(cellsToMarkData) {
        setCellsData((prevState) => {
            return prevState.map((cellData) => {
                return cellsToMarkData?.find((cellToMoveData) => {
                    return cellToMoveData?.id === cellData.id;
                })
                    ? { ...cellData, isControversial: true }
                    : cellData;
            });
        });
    }

    function clearMoveInit() {
        activeCheckerID = null;
        clearBeforeMoveStates();
        possibleAttacks.length = 0;
    }

    function clearBeforeMoveStates() {
        setCellsData((prevState) => {
            return prevState.map((cellData) => {
                return {
                    ...cellData,
                    isActive: false,
                    isUnderAttack: false,
                    isFieldToMove: false,
                    isControversial: false,
                    isControversialHover: false,
                };
            });
        });
    }

    return (
        <div
            className={`board ${getBoardSideClassName(
                isNextWhite,
                boardSide
            )} ${
                isNextPlayerMarked
                    ? isNextWhite
                        ? "next-white"
                        : "next-black"
                    : ""
            }`}
        >
            {cellsData.map((cellData) => {
                return (
                    <Cell
                        cellData={cellData}
                        isNextWhite={isNextWhite}
                        onUpdateCellData={handleChangeSellsData}
                        onMarkActiveContraversials={
                            handleMarkActiveContraversials
                        }
                        key={cellData.id}
                        showCellNumbers={showCellNumbers}
                    />
                );
            })}
        </div>
    );
}

export default Board;
