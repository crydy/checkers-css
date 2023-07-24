import {
    useState,
    useEffect,
    useReducer,
    createContext,
    useContext,
} from "react";

import initState from "../data/initState";
import { useKeydown } from "../hooks/useKeydown";
import { reducer } from "../functions/reducer";
import { isPlayerHasMoves } from "../functions/functions";

const GameContext = createContext();

const CHECKERS_AMOUNT_TO_START_CHECK_STUCK_CHECKERS = 5;

function GameStateProvider({ children }) {
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
    const isNextWhite = history.length % 2 === 0 ? false : true;

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

        // display out-of-board checkers
        setDeletedCheckers([12 - restOfWhites, 12 - restofBlacks]);

        // Check winner
        if (!restOfWhites || !restofBlacks) {
            let winner = restOfWhites ? "white" : "black";
            dispatch({ type: "finishGame", payload: winner });
        }

        // Check winner with stuck checkers
        const currentPlayerCheckers = cellsData.filter(
            (cellData) => cellData.checker === (isNextWhite ? "white" : "black")
        );

        if (
            CHECKERS_AMOUNT_TO_START_CHECK_STUCK_CHECKERS >=
            currentPlayerCheckers.length
        ) {
            if (
                !isPlayerHasMoves(currentPlayerCheckers, cellsData, isNextWhite)
            )
                dispatch({
                    type: "finishGame",
                    payload: isNextWhite ? "black" : "white",
                });
        }
    }, [cellsData, setDeletedCheckers]);

    return (
        <GameContext.Provider
            value={{
                isNextWhite,
                isGameMode,
                isMenuOpened,
                isDevMode,
                isNextPlayerMarked,
                winner,
                boardSide,
                cellsData,
                history,
                deletedCheckers,
                dispatch,
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

function useGameContext() {
    const context = useContext(GameContext);

    if (context === undefined)
        throw new Error("useContext was used outside contextProvider");

    return context;
}

export { GameStateProvider, useGameContext };
