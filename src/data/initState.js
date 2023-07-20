import { createInitialData } from "../functions/createInitialData";
import testData from "./testGameStates";

const initCellsData = createInitialData();
// const initCellsData = testData["stucked checker (after attack from 5-8)"];

const initState = {
    isGameMode: false,
    isMenuOpened: false,
    isDevMode: false,
    isNextPlayerMarked: true,
    winner: null,
    cellsData: initCellsData,
    history: [initCellsData],
    boardSide: "white",
};

export default initState;
