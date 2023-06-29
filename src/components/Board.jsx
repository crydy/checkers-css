import Cell from "./Cell";
import { isNextWhite } from "../App";

export let activeCheckerID = null;
export const possibleAttacks = [];

function Board({ boardSide, cellsData, setCellsData, saveInHistory }) {
    //
    //---------------------------- Main game logic -------------------------------

    function handleChangeSellsData(clickedCellData) {
        if (isPlayerChecker(clickedCellData)) {
            // initiate player move

            clearStartMoveState();

            if (activeCheckerID === clickedCellData.id) {
                return;
            }

            activeCheckerID = clickedCellData.id;

            const cellsToMoveData = getClosestCellsData(
                clickedCellData,
                clickedCellData.isKing
            ).filter((cellData) => isEmptyField(cellData));

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

            setActiveChecker(clickedCellData);
            setAttacableCells(attackableEnemiesData);
            setMovableCells(cellsToMoveData);
        } else if (
            // move, attack, set controversial attack if needed
            clickedCellData.isFieldToMove &&
            !clickedCellData.isControversial
        ) {
            const currentAttackVarians = possibleAttacks.filter(
                (attackObj) => attackObj.moveID === clickedCellData.id
            );

            if (currentAttackVarians.length > 1) {
                // set controversial attack state
                // (if several attacks with one target cell are possible)
                currentAttackVarians.forEach(
                    (attackObj) => (attackObj.isControversial = true)
                );

                const contrCellsData = currentAttackVarians.map((attackObj) =>
                    [...attackObj.enemyIDs, ...attackObj.cellsToPassIDs].map(
                        (id) => getData(id)
                    )
                );

                contrCellsData.forEach((contrIDsArray) => {
                    setControversialCells(contrIDsArray);
                });

                return;
            } else {
                // regular move, attack move (no contraversials)
                const activeCheckerData = getData(activeCheckerID);
                const checkersUnderAttackIDs = possibleAttacks.find(
                    (attackObj) => attackObj.moveID === clickedCellData.id
                )?.enemyIDs;

                moveChecker(activeCheckerData, clickedCellData);
                setKingOnLastLine(activeCheckerData, clickedCellData);

                if (checkersUnderAttackIDs)
                    removeCheckers(
                        checkersUnderAttackIDs.map((id) => getData(id))
                    );

                clearStartMoveState();
                saveInHistory(cellsData);
            }
        } else if (clickedCellData.isControversial) {
            // attack with resolving contraversial
            const thisAttackObj = possibleAttacks.find(
                (attackObj) =>
                    (attackObj.isControversial &&
                        attackObj.enemyIDs.includes(clickedCellData.id)) ||
                    (attackObj.isControversial &&
                        attackObj.cellsToPassIDs.includes(clickedCellData.id))
            );

            const thisMoveSubjects = [
                getData(activeCheckerID),
                getData(thisAttackObj.moveID),
            ];

            moveChecker(...thisMoveSubjects);
            setKingOnLastLine(...thisMoveSubjects);
            removeCheckers(thisAttackObj.enemyIDs.map((id) => getData(id)));
            clearStartMoveState();
            saveInHistory(cellsData);
        } else {
            // cancel move
            clearStartMoveState();
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
        // const rowShift = isNextWhite ? -1 : 1;
        const rowShift = subjectData.row > targetData.row ? -1 : 1;

        const rowToCheck = subjectData.row + rowShift;

        // check field behind
        const cellIndexToCheck =
            subjectData.column > targetData.column
                ? subjectData.column - 2
                : subjectData.column + 2;

        const isOnBoard =
            rowToCheck > 0 &&
            rowToCheck < 9 &&
            cellIndexToCheck > 0 &&
            cellIndexToCheck < 9;

        const cellBehindID = isOnBoard
            ? `${rowToCheck + rowShift}-${cellIndexToCheck}`
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

    function setActiveChecker(targetData) {
        setCellsData((prevState) => {
            return prevState.map((cellData) => {
                return cellData.id === targetData.id
                    ? { ...cellData, isActive: true }
                    : { ...cellData, isActive: false };
            });
        });
    }

    function setKingOnLastLine(checkerCell, targetCell) {
        if (isLastRow(targetCell) && !checkerCell.isKing) setKing(targetCell);

        function isLastRow(cellData) {
            return (
                (isNextWhite && cellData.row === 1) ||
                (!isNextWhite && cellData.row === 8)
            );
        }

        function setKing(targetCellData) {
            setCellsData((prevState) => {
                return prevState.map((cellData) => {
                    return cellData.id === targetCellData.id
                        ? { ...cellData, isKing: true }
                        : cellData;
                });
            });
        }
    }

    function setMovableCells(cellsToMoveData) {
        setCellsData((prevState) => {
            return prevState.map((cellData) => {
                return cellsToMoveData?.find((cellToMoveData) => {
                    return cellToMoveData?.id === cellData.id;
                })
                    ? { ...cellData, isFieldToMove: true }
                    : { ...cellData, isFieldToMove: false };
            });
        });
    }

    function setControversialCells(cellsToMarkData) {
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

    function setAttacableCells(cellsToAttackData) {
        setCellsData((prevState) => {
            return prevState.map((cellData) => {
                return cellsToAttackData.find((cellToMoveData) => {
                    return cellToMoveData.id === cellData.id;
                })
                    ? { ...cellData, isUnderAttack: true }
                    : cellData;
            });
        });
    }

    function moveChecker(checkerCellData, targetCellData) {
        setCellsData(
            cellsData
                .map((cellData) => {
                    // place checker on new place
                    return cellData.id === targetCellData.id
                        ? {
                              ...cellData,
                              checker: isNextWhite ? "white" : "black",
                              isKing: checkerCellData.isKing ? true : false,
                          }
                        : cellData;
                })
                .map((cellData) => {
                    // remove checker from previous place
                    return cellData.id === checkerCellData.id
                        ? { ...cellData, checker: null, isKing: false }
                        : cellData;
                })
        );
    }

    function removeCheckers(cellsToClearData) {
        setCellsData((prevState) => {
            return prevState.map((cellData) => {
                return cellsToClearData.find((cellToClearData) => {
                    return cellToClearData.id === cellData.id;
                })
                    ? { ...cellData, checker: null }
                    : cellData;
            });
        });
    }

    function clearStartMoveState() {
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
            className={`board ${getBoardSideClassName(isNextWhite, boardSide)}`}
        >
            {cellsData.map((cellData) => {
                return (
                    <Cell
                        cellData={cellData}
                        key={cellData.id}
                        onUpdateCellData={handleChangeSellsData}
                        onMarkActiveContraversials={
                            handleMarkActiveContraversials
                        }
                    />
                );
            })}
        </div>
    );
}

export default Board;
