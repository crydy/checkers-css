// Hooks
import { useState, useEffect, useReducer } from "react";
import { useKeydown } from "./hooks/useKeydown";
// Functions
import { reducer } from "./functions/reducer";
// Data
import initState from "./data/initState";
import testData from "./data/testGameStates";
// Components
import StartScreen from "./components/StartScreen";
import EndScreen from "./components/EndScreen";
import Menu from "./components/Menu";
import Board from "./components/Board";
import DeletedCheckers from "./components/DeletedCheckers";
// Styles
import "./App.css";

export default function App() {
    const [
        {
            isGameMode,
            isMenuOpened,
            isDevMode,
            isNextPlayerMarked,
            winner,
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
        const restOfWhites = cellsData.filter(
            (cellData) => cellData.checker === "white"
        ).length;
        const restofBlacks = cellsData.filter(
            (cellData) => cellData.checker === "black"
        ).length;

        setDeletedCheckers([12 - restOfWhites, 12 - restofBlacks]);

        if (!restOfWhites || !restofBlacks) {
            let winner = restOfWhites ? "white" : "black";
            dispatch({ type: "finishGame", payload: winner });
        }
    }, [cellsData, setDeletedCheckers]);

    const isNextWhite = history.length % 2 === 0 ? false : true;
    const showCellNumbers = isDevMode ? true : false;

    if (!isGameMode && !winner) return <StartScreen dispatch={dispatch} />;

    return (
        <>
            {!isGameMode && winner && (
                <EndScreen winner={winner} dispatch={dispatch} />
            )}
            <div className="app">
                {!winner && (
                    <Menu
                        isDevMode={isDevMode}
                        isMenuOpened={isMenuOpened}
                        isNextPlayerMarked={isNextPlayerMarked}
                        boardSide={boardSide}
                        history={history}
                        testCasesAmount={testData.length}
                        dispatch={dispatch}
                    />
                )}

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
                    <DeletedCheckers
                        color="black"
                        amount={deletedCheckers[1]}
                    />
                    <DeletedCheckers
                        color="white"
                        amount={deletedCheckers[0]}
                    />
                </div>
            </div>
        </>
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
