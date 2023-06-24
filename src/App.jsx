import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
    return (
        <div>
            <Board />
        </div>
    );
}

let isMoveMode = false;
let isNextWhite = true;
let possibleMovesObjects = null;

function Board() {
    // const [nextWhite, setNextWhite] = useState(true);
    // const [possibleMoveIDs, setPossibleMoveIDs] = useState(null);
    // const [active, setActive] = useState(null);
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
                    index: index,
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
        // start move, cancel move
        if (
            (isNextWhite && clickedCellData.checker === "white") ||
            (!isNextWhite && clickedCellData.checker === "black")
        ) {
            if (!clickedCellData.isActive) {
                isMoveMode = true;
                possibleMovesObjects = getNextMoveIDs(clickedCellData.id);
                console.log(possibleMovesObjects);

                setCellsData(
                    cellsData
                        // set active
                        .map((cellData) => {
                            return cellData.id === clickedCellData.id
                                ? { ...cellData, isActive: true }
                                : { ...cellData, isActive: false };
                        })
                        // mark possible moves
                        .map((cellData) => {
                            return possibleMovesObjects?.find((moveObj) => {
                                return moveObj.cellToMoveID === cellData.id;
                            })
                                ? { ...cellData, isFieldToMove: true }
                                : { ...cellData, isFieldToMove: false };
                        })
                        // mark enemy under attack
                        .map((cellData) => {
                            return possibleMovesObjects?.find((moveObj) => {
                                return moveObj.enemyID === cellData.id;
                            })
                                ? { ...cellData, isUnderAttack: true }
                                : { ...cellData, isUnderAttack: false };
                        })
                );
            } else {
                setCellsData(
                    cellsData.map((cellData) => {
                        // clear special marks for all
                        return {
                            ...cellData,
                            isActive: false,
                            isFieldToMove: false,
                            isUnderAttack: false,
                        };
                    })
                );
                isMoveMode = false;
            }
        } else {
            setCellsData(
                cellsData.map((cellData) => {
                    // clear special marks for all
                    return {
                        ...cellData,
                        isActive: false,
                        isFieldToMove: false,
                        isUnderAttack: false,
                    };
                })
            );

            isMoveMode = false;
        }

        // make move
        if (
            // if click on availible to move cell
            possibleMovesObjects?.find(
                (moveObj) => clickedCellData.id === moveObj.cellToMoveID
            )
        ) {
            const activeID = cellsData.find(
                (cellData) => cellData.isActive === true
            ).id;

            const targetMoveObj = possibleMovesObjects?.find(
                (moveObj) => clickedCellData.id === moveObj.cellToMoveID
            );

            console.log(targetMoveObj);

            setCellsData(
                cellsData
                    .map((cellData) => {
                        // place checker on new place
                        return cellData.id === targetMoveObj.cellToMoveID
                            ? {
                                  ...cellData,
                                  checker: isNextWhite ? "white" : "black",
                              }
                            : cellData;
                    })
                    .map((cellData) => {
                        // remove checker from previous place
                        return cellData.id === activeID
                            ? { ...cellData, checker: null }
                            : cellData;
                    })
                    .map((cellData) => {
                        // remove enemy
                        return cellData.isUnderAttack &&
                            targetMoveObj.enemyID === cellData.id
                            ? { ...cellData, checker: null }
                            : cellData;
                    })
                    .map((cellData) => {
                        // clear active and possible moves
                        return {
                            ...cellData,
                            isActive: false,
                            isFieldToMove: false,
                            isUnderAttack: false,
                        };
                    })
            );

            isMoveMode = false;
            isNextWhite = !isNextWhite;
        }
    }

    function getNextMoveIDs(id) {
        const rowShift = isNextWhite ? -1 : 1;

        // cells to check
        let nextMovePossibleCells = getClosestCellsIDs(id);
        const attack = getAttackIDs(nextMovePossibleCells);

        nextMovePossibleCells = nextMovePossibleCells.map((id) => {
            return { isAttack: false, cellToMoveID: id };
        });

        if (!attack) return nextMovePossibleCells;
        else return [...nextMovePossibleCells, ...attack];

        function getClosestCellsIDs(id) {
            let nextMovePossibleCells = [];

            // check cell on forward-left
            if (id[2] !== "1")
                nextMovePossibleCells.push(
                    `${+id[0] + rowShift}-${+id[2] - 1}`
                );
            // check cell on forward-right
            if (id[2] !== "8")
                nextMovePossibleCells.push(
                    `${+id[0] + rowShift}-${+id[2] + 1}`
                );
            return nextMovePossibleCells;
        }

        function getAttackIDs(cellsToCheck) {
            const possibleAttacks = [];

            cellsToCheck.forEach((possibleMoveID) => {
                // get data for target cell
                const targetData = cellsData.find(
                    (cellData) => cellData.id === possibleMoveID
                );

                // if is occupied - remove from possible fields
                if (targetData.checker) {
                    nextMovePossibleCells = nextMovePossibleCells.filter(
                        (id) => id !== targetData.id
                    );
                }

                // if is occupied by enemy
                if (
                    (isNextWhite && targetData.checker === "black") ||
                    (!isNextWhite && targetData.checker === "white")
                ) {
                    const rowToCheck = targetData.row + rowShift;

                    // check field behind
                    const cellIndexToCheck =
                        targetData.column < id[2]
                            ? targetData.column - 1
                            : targetData.column + 1;

                    const cellToJumpOverID =
                        rowToCheck + "-" + cellIndexToCheck;

                    const isCanJumpOver = !cellsData.find(
                        (cellData) => cellData.id === cellToJumpOverID
                    ).checker;

                    // create attack object
                    if (isCanJumpOver)
                        possibleAttacks.push({
                            isAttack: true,
                            cellToMoveID: cellToJumpOverID,
                            enemyID: targetData.id,
                        });
                }
            });

            return possibleAttacks.length > 0 ? possibleAttacks : null;
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
