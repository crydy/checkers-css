import { useState } from "react";
import "./App.css";

let isNextWhite = true;
let activeCheckerID = null;
const possibleAttacks = [];

export default function App() {
    const [boardSide, setBoardSide] = useState("white");

    function handleSelectBoardSide(value) {
        setBoardSide(value);
    }

    return (
        <div>
            <Menu
                boardSide={boardSide}
                onSelectBoardSide={handleSelectBoardSide}
            />
            <Board boardSide={boardSide} />
        </div>
    );
}

function Menu({ boardSide, onSelectBoardSide }) {
    return (
        <div className="menu">
            <select
                value={boardSide}
                onChange={(event) => onSelectBoardSide(event.target.value)}
            >
                <option value="auto">Side: auto</option>
                <option value="white">Side: white</option>
                <option value="black">Side: black</option>
                <option value="90">Side: 90°</option>
            </select>
        </div>
    );
}

function Board({ boardSide }) {
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
                    bg: bgColor,
                    row: row + 1,
                    column: cell + 1,
                    id: `${row + 1}-${cell + 1}`,
                    checker,
                    isKing: false,
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

            const cellsToMove = getClosestCellsData(
                clickedCellData,
                clickedCellData.isKing
            ).filter((cellData) => isEmptyField(cellData));

            const attackableCells = [];

            // recurstion limit base
            const argumentsOfSetAttacksCalls = [];

            // function works recursively and call itself
            // for every next empty cell behind enemy checker
            setAttacks(clickedCellData);

            function setAttacks(subjectCellData) {
                // prevent backward movement in chain of cheking cells to avoid forever loop
                if (argumentsOfSetAttacksCalls.includes(subjectCellData.id))
                    return;
                argumentsOfSetAttacksCalls.push(subjectCellData.id);

                const cellsWithEnemiesNearby = getClosestCellsData(
                    subjectCellData,
                    clickedCellData.isKing
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

            setActiveChecker(clickedCellData);
            setAttacableCells(attackableCells);
            setMovableCells(cellsToMove);

            // move
        } else if (clickedCellData.isFieldToMove) {
            const activeCheckerData = getData(activeCheckerID);

            moveChecker(activeCheckerData, clickedCellData);

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

            const isLastRow =
                (isNextWhite && clickedCellData.row === 1) ||
                (!isNextWhite && clickedCellData.row === 8);

            if (isLastRow && !activeCheckerData.isKing)
                setKing(clickedCellData);

            isNextWhite = !isNextWhite;

            // just clear start move
        } else {
            clearStartMoveState();
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

        function setActiveChecker(targetData) {
            setCellsData((prevState) => {
                return prevState.map((cellData) => {
                    return cellData.id === targetData.id
                        ? { ...cellData, isActive: true }
                        : { ...cellData, isActive: false };
                });
            });
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

        function clearBeforeMoveStates() {
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
    }

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

    return (
        <div className={`board ${rotateState}`}>
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
    const isPlayerChecker =
        (isNextWhite && cellData?.checker === "white") ||
        (!isNextWhite && cellData?.checker === "black");
    const isMovalbe = cellData.checker && isPlayerChecker && !cellData.isActive;

    return (
        <div
            className={`cell
                ${cellData.bg}
                ${cellData.checker ? `checker ${cellData.checker}` : ""}
                ${isMovalbe && "movable"}
                ${cellData.checker && isPlayerChecker && "pointer"}
                ${cellData.isFieldToMove ? "possible-move" : ""}
                ${cellData.isActive ? "active" : ""}
                ${cellData.isKing ? "king" : ""}
                ${cellData.isUnderAttack ? "attack" : ""}
            `}
            onClick={() => onUpdateCellData(cellData)}
        >
            {/* {cellData.id} */}
        </div>
    );
}
