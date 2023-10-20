import { createInitialData } from "../functions/createInitialData";

const initCellsData = createInitialData();

const initState = {
    isGameMode: false,
    isMenuOpened: false,
    isDevMode: false,
    isNextPlayerMarked: true,
    winner: null,
    cellsData: initCellsData,
    history: [initCellsData],
    historyBeforeDevMode: null,
    boardSide: "white",
};

export { initState };
