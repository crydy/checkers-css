import testData from "../data/testGameStates";
import initState from "../data/initState";

export function reducer(state, action) {
    const isNextWhite = state.history.length % 2 === 0 ? false : true;

    switch (action.type) {
        case "startGame":
            return { ...initState, isGameMode: true };

        case "finishGame":
            return { ...state, winner: action.payload, isGameMode: false };

        case "toggleMenu":
            return { ...state, isMenuOpened: !state.isMenuOpened };

        case "selectBoardSide":
            return { ...state, boardSide: action.payload };

        case "toggleNextPlayerMark":
            return { ...state, isNextPlayerMarked: !state.isNextPlayerMarked };

        case "setBeforeMove": {
            const { active, attackableSet, movableSet } = action.payload;

            return {
                ...state,
                cellsData: state.cellsData.map((cellData) => {
                    const isActive = active.id === cellData.id;
                    const isMovable = movableSet.find(
                        (movableCellData) => movableCellData.id === cellData.id
                    );
                    const isAttackable = attackableSet?.find(
                        (attackableCellData) =>
                            attackableCellData.id === cellData.id
                    );

                    if (isActive) {
                        return { ...cellData, isActive: true };
                    } else if (isMovable) {
                        return { ...cellData, isFieldToMove: true };
                    } else if (isAttackable) {
                        return { ...cellData, isUnderAttack: true };
                    } else {
                        return {
                            ...cellData,
                            isActive: false,
                            isFieldToMove: false,
                            isUnderAttack: false,
                            isControversial: false,
                            isControversialHover: false,
                        };
                    }
                }),
            };
        }

        case "clearBeforeMove":
            return {
                ...state,
                cellsData: state.cellsData.map((cellData) => {
                    return {
                        ...cellData,
                        isActive: false,
                        isFieldToMove: false,
                        isUnderAttack: false,
                        isControversial: false,
                        isControversialHover: false,
                    };
                }),
            };

        case "setAfterMove": {
            const { active, dest, removeSet } = action.payload;

            const newCellsData = state.cellsData.map((cellData) => {
                const isTargetCell = cellData.id === dest.id;
                const isLeavedCell = cellData.id === active.id;
                const isEnemy = removeSet.find(
                    (enemyCellData) => cellData.id === enemyCellData.id
                );
                const isKingEvent = isLastRow(dest) && !active.isKing;

                if (isTargetCell) {
                    return {
                        ...cellData,
                        checker: active.checker,
                        isKing: active.isKing || isKingEvent ? true : false,

                        isActive: false,
                        isFieldToMove: false,
                        isUnderAttack: false,
                        isControversial: false,
                        isControversialHover: false,
                    };
                } else if (isLeavedCell || isEnemy) {
                    return {
                        ...cellData,
                        checker: null,

                        isKing: false,
                        isActive: false,
                        isFieldToMove: false,
                        isUnderAttack: false,
                        isControversial: false,
                        isControversialHover: false,
                    };
                } else {
                    return {
                        ...cellData,
                        isActive: false,
                        isFieldToMove: false,
                        isUnderAttack: false,
                        isControversial: false,
                        isControversialHover: false,
                    };
                }
            });

            return {
                ...state,
                cellsData: newCellsData,
                history: [...state.history, newCellsData],
            };
        }

        case "setControversial": {
            const cellsToSet = action.payload;
            return {
                ...state,
                cellsData: state.cellsData.map((cellData) => {
                    return cellsToSet?.find((cellToSet) => {
                        return cellToSet?.id === cellData.id;
                    })
                        ? { ...cellData, isControversial: true }
                        : cellData;
                }),
            };
        }

        case "setContraversialHover": {
            const cellsToSet = action.payload;

            return {
                ...state,
                cellsData: state.cellsData.map((cellData) => {
                    return cellsToSet?.find((cellToMoveData) => {
                        return cellToMoveData?.id === cellData.id;
                    })
                        ? {
                              ...cellData,
                              isControversialHover: true,
                          }
                        : cellData;
                }),
            };
        }

        case "removeContraversialHover": {
            const cellsToSet = action.payload;

            return {
                ...state,
                cellsData: state.cellsData.map((cellData) => {
                    return cellsToSet?.find((cellToMoveData) => {
                        return cellToMoveData?.id === cellData.id;
                    })
                        ? {
                              ...cellData,
                              isControversialHover: false,
                          }
                        : cellData;
                }),
            };
        }

        case "undoLastMove":
            return {
                ...state,
                winner: null,
                isGameMode: true,
                isMenuOpened: false,
                cellsData: state.history[state.history.length - 2],
                history: state.history.slice(0, state.history.length - 1),
            };

        case "goBackInHistory": {
            const index = action.payload;

            return {
                ...state,
                cellsData: state.history[index],
                history: state.history.slice(0, index + 1),
            };
        }

        case "toggleDevMode":
            if (state.historyBeforeDevMode) {
                return {
                    ...state,
                    isDevMode: !state.isDevMode,
                    history: state.historyBeforeDevMode,
                    cellsData: state.historyBeforeDevMode.at(-1),
                    historyBeforeDevMode: null,
                };
            } else {
                return { ...state, isDevMode: !state.isDevMode };
            }

        case "setTestCase": {
            const index = action.payload;
            const targetData = testData.at(index);

            return {
                ...state,
                historyBeforeDevMode: state.historyBeforeDevMode
                    ? state.historyBeforeDevMode
                    : state.history,
                cellsData: targetData,
                history: [targetData],
            };
        }

        default:
            throw new Error("Unknown action type");
    }

    function isLastRow(cellData) {
        return (
            (isNextWhite && cellData.row === 1) ||
            (!isNextWhite && cellData.row === 8)
        );
    }
}
