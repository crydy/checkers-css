import { useState, useEffect } from "react";
import "./App.css";

import testData from "./data/testGameStates";
import Menu from "./components/Menu";
import Board from "./components/Board";

let historyBeforeDevMode = null;
let useEffectToUpdateHistory = false;

export default function App() {
    const [isDevMode, setIsDevMode] = useState(false);
    const [boardSide, getBoardSideClassName] = useState("white");
    const [cellsData, setCellsData] = useState(createInitialData());
    const [history, setHistory] = useState([cellsData]);
    const [isNextPlayerMarked, setIsNextPlayerMarked] = useState(false);

    useEffect(() => {
        if (useEffectToUpdateHistory) {
            handleUpdateHistory();
            useEffectToUpdateHistory = false;
        }
    }, [cellsData, useEffectToUpdateHistory, handleUpdateHistory]);

    const isNextWhite = history.length % 2 === 0 ? false : true;
    const showCellNumbers = isDevMode ? true : false;

    function handleMarkNextPlayer() {
        setIsNextPlayerMarked((isMarked) => !isMarked);
    }

    function updateHistoryWithNextChanging() {
        useEffectToUpdateHistory = true;
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
        setCellsData(history.at(-2));
        setHistory((prevState) => prevState.slice(0, prevState.length - 1));
    }

    function handleSetDevMode() {
        if (isDevMode && historyBeforeDevMode) {
            setHistory(historyBeforeDevMode);
            setCellsData(historyBeforeDevMode.at(-1));
            historyBeforeDevMode = null;
        }
        setIsDevMode((isDev) => !isDev);
    }

    function handleChangeTestCase(testDataIndex) {
        const requiredState = testData.at(testDataIndex);

        // need to set it only first time when test case choosen
        if (!historyBeforeDevMode) historyBeforeDevMode = history;

        setCellsData(requiredState);
        setHistory([requiredState]);
    }

    function handleSelectBoardSide(value) {
        getBoardSideClassName(value);
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
        <div>
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
            <Board
                isNextPlayerMarked={isNextPlayerMarked}
                boardSide={boardSide}
                cellsData={cellsData}
                setCellsData={setCellsData}
                history={history}
                setHistory={setHistory}
                saveInHistory={handleUpdateHistory}
                isNextWhite={isNextWhite}
                showCellNumbers={showCellNumbers}
                updateHistoryWithNextChanging={updateHistoryWithNextChanging}
            />
        </div>
    );
}
