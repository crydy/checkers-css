import { useState } from "react";
import "./App.css";
import testData from "./data/testGameStates";
import Menu from "./components/Menu";
import Board from "./components/Board";

export default function App() {
    const [isDevMode, setIsDevMode] = useState(false);
    const [cellsData, setCellsData] = useState(createInitialData());
    const [history, setHistory] = useState([cellsData]);
    const [boardSide, getBoardSideClassName] = useState("white");

    const isNextWhite = history.length % 2 === 0 ? false : true;
    const showCellNumbers = isDevMode ? true : false;

    function handleSetDevMode() {
        setIsDevMode((isDev) => !isDev);
        setCellsData(testData.at(2));
    }

    function handleSelectBoardSide(value) {
        getBoardSideClassName(value);
    }

    function handleUndoLastMove() {
        setCellsData(history.at(-1));
        setHistory(history.slice(0, history.length - 1));
    }

    function handleSaveInHistory() {
        setHistory((prevState) => [
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
        ]);
    }

    function handleGoBackInHistory(historyIndex) {
        if (!historyIndex) return;

        setCellsData(history[historyIndex]);
        setHistory(history.slice(0, historyIndex));
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
                boardSide={boardSide}
                onSelectBoardSide={handleSelectBoardSide}
                history={history}
                onUndoLastMove={handleUndoLastMove}
                onGoBackInHistory={handleGoBackInHistory}
                isDevMode={isDevMode}
                onSetDevMode={handleSetDevMode}
            />
            <Board
                boardSide={boardSide}
                cellsData={cellsData}
                setCellsData={setCellsData}
                history={history}
                setHistory={setHistory}
                saveInHistory={handleSaveInHistory}
                isNextWhite={isNextWhite}
                showCellNumbers={showCellNumbers}
            />
        </div>
    );
}
