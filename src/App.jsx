import { useState, useEffect, useReducer } from "react";
import { reducer } from "./functions/reducer";
import { useKeydown } from "./hooks/useKeydown";
import "./App.css";

import testData from "./data/testGameStates";

import Menu from "./components/Menu";
import Board from "./components/Board";
import StartScreen from "./StartScreen";

const initCellsData = createInitialData();

const initState = {
    isGameMode: false,
    isMenuOpened: false,
    isDevMode: false,
    isNextPlayerMarked: true,
    cellsData: initCellsData,
    history: [initCellsData],
    boardSide: "white",
};

export default function App() {
    const [
        {
            isGameMode,
            isMenuOpened,
            isDevMode,
            isNextPlayerMarked,
            boardSide,
            cellsData,
            history,
        },
        dispatch,
    ] = useReducer(reducer, initState);

    const [deletedCheckers, setDeletedCheckers] = useState([0, 0]);

    useKeydown(["Backspace", "Delete"], () =>
        dispatch({ type: "undoLastMove" })
    );

    useEffect(() => {
        setDeletedCheckers([
            12 -
                cellsData.filter((cellData) => cellData.checker === "white")
                    .length,
            12 -
                cellsData.filter((cellData) => cellData.checker === "black")
                    .length,
        ]);
    }, [cellsData, setDeletedCheckers]);

    const isNextWhite = history.length % 2 === 0 ? false : true;
    const showCellNumbers = isDevMode ? true : false;

    if (!isGameMode) return <StartScreen dispatch={dispatch} />;

    return (
        <div className="app">
            <Menu
                isDevMode={isDevMode}
                isMenuOpened={isMenuOpened}
                isNextPlayerMarked={isNextPlayerMarked}
                boardSide={boardSide}
                history={history}
                testCasesAmount={testData.length}
                dispatch={dispatch}
            />

            <div
                className={`game-field ${getBoardSideClassName(
                    isNextWhite,
                    boardSide
                )}`}
            >
                <Board
                    isNextPlayerMarked={isNextPlayerMarked}
                    isNextWhite={isNextWhite}
                    cellsData={cellsData}
                    showCellNumbers={showCellNumbers}
                    dispatch={dispatch}
                />
                <DeletedCheckers color="black" amount={deletedCheckers[1]} />
                <DeletedCheckers color="white" amount={deletedCheckers[0]} />
            </div>
        </div>
    );
}

function DeletedCheckers({ color, amount }) {
    return (
        <div
            className={`deleted-section ${
                color === "black" ? "reverse" : "normal"
            }`}
        >
            {Array.from({ length: amount }).map((_, index) => {
                return (
                    <div
                        className={`cell out-of-game trans ${color} checker`}
                        key={index}
                    ></div>
                );
            })}
        </div>
    );
}

function getBoardSideClassName(isNextWhite, boardSide) {
    let rotateState;

    switch (boardSide) {
        case "auto":
            rotateState =
                isNextWhite && boardSide === "auto" ? "normal" : "reverse";
            break;

        case "white":
            rotateState = "normal";
            break;

        case "black":
            rotateState = "reverse";
            break;
    }

    return rotateState;
}

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
                isControversial: false,
                isControversialHover: false,
            };

            cellsData.push(currentCellData);
            index++;
        }
    }

    return cellsData;
}
