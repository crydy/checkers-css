import { useState } from "react";
import "./App.css";

export default function App() {
    return (
        <div>
            <Board />
        </div>
    );
}

let isNextWhite = true;
let activeCheckerID = null;
const possibleAttacks = [];

function Board() {
    const [cellsData, setCellsData] = useState(createInitialData());

    function createInitialData() {
        const cellsData = [];
        let index = 1;

        for (let row = 0; row < 8; row++) {
            for (let cell = 0; cell < 8; cell++) {
                let bgColor;
                let checker;

                if (row % 2 === 0) {
                    bgColor = cell % 2 !== 0 ? "dark" : "light";
                } else {
                    bgColor = cell % 2 === 0 ? "dark" : "light";
                }

                if (bgColor === "dark") {
                    if (row < 3) checker = "black";
                    else if (row > 4) checker = "white";
                    else checker = null;
                } else {
                    checker = null;
                }

                const currentCellData = {
                    row: row + 1,
                    column: cell + 1,
                    id: `${row + 1}-${cell + 1}`,
                    checker,
                    isKing: false,
                    bg: bgColor,
                    isFieldToMove: false,
                    isActive: false,
                    isUnderAttack: false,
                };

                cellsData.push(currentCellData);
                index++;
            }
        }

        return cellsData;
    }

    function handleSellData(clickedCellData) {
        // start player move
        if (isPlayerChecker(clickedCellData)) {
            if (activeCheckerID === clickedCellData.id) {
                clearStartMoveState();
                return;
            }

            activeCheckerID = clickedCellData.id;

            const cellsToMove = getClosestCellsData(clickedCellData).filter(
                (cellData) => isEmptyField(cellData)
            );

            const attackableCells = [];

            setAttacks(clickedCellData);

            function setAttacks(subjectCellData) {
                console.log("work with " + subjectCellData.id);

                const cellsWithEnemiesNearby = getClosestCellsData(
                    subjectCellData
                ).filter((cellData) => isEnemyChecker(cellData));

                if (cellsWithEnemiesNearby.length > 0) {
                    cellsWithEnemiesNearby.forEach((enemyData) => {
                        const cellBehindData = getCellBehindData(
                            subjectCellData,
                            enemyData
                        );

                        if (cellBehindData && isEmptyField(cellBehindData)) {
                            const previousLevelAttack = possibleAttacks.find(
                                (item) => item.moveID === subjectCellData.id
                            );

                            if (!previousLevelAttack) {
                                possibleAttacks.push({
                                    moveID: cellBehindData.id,
                                    enemyIDs: [enemyData.id],
                                });
                            } else {
                                possibleAttacks.push({
                                    moveID: cellBehindData.id,
                                    enemyIDs: [
                                        ...previousLevelAttack.enemyIDs,
                                        enemyData.id,
                                    ],
                                });
                            }

                            cellsToMove.push(cellBehindData);
                            attackableCells.push(enemyData);

                            // repeat recursively for every next empty cell
                            // behind every enemy checker which under attack
                            setAttacks(cellBehindData);
                        }
                    });
                }
            }

            console.log(possibleAttacks);

            markActiveChecker(clickedCellData);
            markAttacableCells(attackableCells);
            markMovableCells(cellsToMove);

            // move
        } else if (clickedCellData.isFieldToMove) {
            moveChecker(getData(activeCheckerID), clickedCellData);

            const checkersUnderAttackIDs = possibleAttacks.find(
                (attackObj) => attackObj.moveID === clickedCellData.id
            )?.enemyIDs;

            if (checkersUnderAttackIDs) {
                const checkersUnderAttackData = checkersUnderAttackIDs.map(
                    (id) => getData(id)
                );

                removeCheckers(checkersUnderAttackData);
            }

            clearStartMoveState();

            isNextWhite = !isNextWhite;

            // just clear start move
        } else {
            clearStartMoveState();
        }

        function getData(id) {
            return cellsData.find((cellData) => cellData.id === id);
        }

        function getClosestCellsData(cellData) {
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

            return possibleMoveCells;
        }

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

        function getCellBehindData(subjectData, targetData) {
            const rowShift = isNextWhite ? -1 : 1;

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

        function isEmptyField(cellData) {
            return !cellData?.checker;
        }

        function markActiveChecker(targetData) {
            setCellsData((prevState) => {
                return prevState.map((cellData) => {
                    return cellData.id === targetData.id
                        ? { ...cellData, isActive: true }
                        : { ...cellData, isActive: false };
                });
            });
        }

        function markMovableCells(cellsToMoveData) {
            setCellsData((prevState) => {
                return prevState.map((cellData) => {
                    return cellsToMoveData.find((cellToMoveData) => {
                        return cellToMoveData.id === cellData.id;
                    })
                        ? { ...cellData, isFieldToMove: true }
                        : { ...cellData, isFieldToMove: false };
                });
            });
        }

        function markAttacableCells(cellsToAttackData) {
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

        function removeAllMarks() {
            setCellsData((prevState) => {
                return prevState.map((cellData) => {
                    return {
                        ...cellData,
                        isActive: false,
                        isUnderAttack: false,
                        isFieldToMove: false,
                    };
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
                              }
                            : cellData;
                    })
                    .map((cellData) => {
                        // remove checker from previous place
                        return cellData.id === checkerCellData.id
                            ? { ...cellData, checker: null }
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
            removeAllMarks();
            possibleAttacks.length = 0;
        }
    }

    return (
        <div className={`board ${isNextWhite ? "" : "board-inverse"}`}>
            {cellsData.map((cellData) => {
                return (
                    <Cell
                        cellData={cellData}
                        key={cellData.id}
                        onUpdateCellData={handleSellData}
                    />
                );
            })}
        </div>
    );
}

function Cell({ cellData, onUpdateCellData }) {
    return (
        <div
            className={`cell
                ${cellData.bg}
                ${cellData.checker ? cellData.checker : ""}
                ${cellData.isFieldToMove ? "possible-move" : ""}
                ${cellData.isActive ? "active" : ""}
                ${cellData.isUnderAttack ? "attack" : ""}
                ${cellData.isCanPlay ? "available" : ""}
                ${isNextWhite ? "" : "cell-inverse"}
            `}
            onClick={() => onUpdateCellData(cellData)}
        >
            {cellData.id}
        </div>
    );
}
