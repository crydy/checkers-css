import { useState, useEffect, useRef } from "react";
import { useKeydown } from "./hooks/useKeydown";
import "./App.css";

import testData from "./data/testGameStates";
import Menu from "./components/Menu";
import Board from "./components/Board";

export default function App() {
    const [isDevMode, setIsDevMode] = useState(false);

    const [cellsData, setCellsData] = useState(createInitialData());
    const [history, setHistory] = useState([cellsData]);

    const [isNextPlayerMarked, setIsNextPlayerMarked] = useState(true);
    const [boardSide, setBoardSide] = useState("white");
    const [deletedCheckers, setDeletedCheckers] = useState([0, 0]);

    const historyBeforeDevMode = useRef(null);
    const updateHistory = useRef(false);

    useKeydown(["Backspace", "Delete"], handleUndoLastMove);

    useEffect(() => {
        setDeletedCheckers([
            12 -
                cellsData.filter((cellData) => cellData.checker === "white")
                    .length,
            12 -
                cellsData.filter((cellData) => cellData.checker === "black")
                    .length,
        ]);
        console.log();
    }, [cellsData, setDeletedCheckers]);

    useEffect(() => {
        if (updateHistory.current) {
            handleUpdateHistory();
            updateHistory.current = false;
        }
    }, [cellsData, updateHistory.current, handleUpdateHistory]);

    const isNextWhite = history.length % 2 === 0 ? false : true;
    const showCellNumbers = isDevMode ? true : false;

    function handleMarkNextPlayer() {
        setIsNextPlayerMarked((isMarked) => !isMarked);
    }

    function updateHistoryWithNextChanging() {
        updateHistory.current = true;
    }

    function handleUpdateHistory() {
        setHistory((prevState) => {
            return [
                ...prevState,
                cellsData.map((cellData) => {
                    return {
                        ...cellData,
                        isActive: false,
                        isFieldToMove: false,
                        isEnemyChecker: false,
                        isUnderAttack: false,
                        isControversial: false,
                        isControversialHover: false,
                    };
                }),
            ];
        });
    }

    function handleGoBackInHistory(historyIndex) {
        setCellsData(history[historyIndex]);
        setHistory(history.slice(0, historyIndex + 1));
    }

    function handleUndoLastMove() {
        if (history.length - 1) {
            handleGoBackInHistory(history.length - 2);
        }
    }

    function handleSetDevMode() {
        if (isDevMode && historyBeforeDevMode.current) {
            setHistory(historyBeforeDevMode.current);
            setCellsData(historyBeforeDevMode.current.at(-1));
            historyBeforeDevMode.current = null;
        }
        setIsDevMode((isDev) => !isDev);
    }

    function handleChangeTestCase(testDataIndex) {
        const requiredState = testData.at(testDataIndex);

        // need to set it only first time when test case choosen
        if (!historyBeforeDevMode.current)
            historyBeforeDevMode.current = history;

        setCellsData(requiredState);
        setHistory([requiredState]);
    }

    function handleSelectBoardSide(value) {
        setBoardSide(value);
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

    return (
        <div className="app">
            <Menu
                isNextPlayerMarked={isNextPlayerMarked}
                onMarkNextPlayer={handleMarkNextPlayer}
                boardSide={boardSide}
                onSelectBoardSide={handleSelectBoardSide}
                history={history}
                onUndoLastMove={handleUndoLastMove}
                onGoBackInHistory={handleGoBackInHistory}
                isDevMode={isDevMode}
                onSetDevMode={handleSetDevMode}
                testData={testData}
                onChangeTestCase={handleChangeTestCase}
            />

            <div
                className={`game-field ${getBoardSideClassName(
                    isNextWhite,
                    boardSide
                )}`}
            >
                <Board
                    isNextPlayerMarked={isNextPlayerMarked}
                    cellsData={cellsData}
                    setCellsData={setCellsData}
                    isNextWhite={isNextWhite}
                    showCellNumbers={showCellNumbers}
                    updateHistoryWithNextChanging={
                        updateHistoryWithNextChanging
                    }
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
