import { useRef } from "react";
import { useGameContext } from "../context/GameContext";
import {
    isPlayerChecker,
    isEnemyChecker,
    isEmptyField,
    getClosestCellsData,
    getCellBehindData,
    createNewID,
    removeRedundantSpaces,
} from "../functions/functions";
import Cell from "./Cell";

function Board() {
    //---------------------------- Main game logic -------------------------------
    const { isNextWhite, isNextPlayerMarked, cellsData, dispatch } =
        useGameContext();

    const activeCheckerID = useRef(null);
    const possibleAttacks = useRef([]);

    function handleChangeSellsData(clickedCellData) {
        const isMoveInit = isPlayerChecker(clickedCellData, isNextWhite);
        const isClickOnActive = activeCheckerID.current === clickedCellData.id;
        const isMoveOrAttack =
            clickedCellData.isFieldToMove && !clickedCellData.isControversial;
        const isResolveOfControversialAttack = clickedCellData.isControversial;

        if (isMoveInit) {
            if (isClickOnActive) {
                clearMoveInit();
                return;
            }

            activeCheckerID.current = clickedCellData.id;

            const cellsToMoveData = getClosestCellsData(
                clickedCellData,
                cellsData,
                clickedCellData.isKing,
                isNextWhite
            ).filter((cellData) => cellData && isEmptyField(cellData));

            const attackableEnemiesData = [];
            let lastChainID;

            // gather all possible attacks and related moves
            // (function works recursively and call itself
            // for every next empty cell behind enemy checker)
            setAttacks(clickedCellData);

            function setAttacks(startCellData) {
                const previousLevelAttack = possibleAttacks.current.find(
                    (attackObj) =>
                        attackObj.moveID === startCellData.id &&
                        attackObj.chainID === lastChainID
                );

                const enemiesNearbyData = getClosestCellsData(
                    startCellData,
                    cellsData,
                    clickedCellData.isKing,
                    isNextWhite
                ).filter((cellData) => isEnemyChecker(cellData, isNextWhite));

                if (enemiesNearbyData.length > 0) {
                    enemiesNearbyData.forEach((enemyData) => {
                        const cellBehindEnemyData = getCellBehindData(
                            startCellData,
                            enemyData,
                            cellsData
                        );

                        const isCellBehindEnemyEmpty =
                            cellBehindEnemyData &&
                            isEmptyField(cellBehindEnemyData);

                        const isNotPreviousChainLink =
                            !previousLevelAttack?.cellsToPassIDs.includes(
                                cellBehindEnemyData?.id
                            );

                        if (isCellBehindEnemyEmpty && isNotPreviousChainLink) {
                            if (!previousLevelAttack) {
                                // start new chain
                                const newChainID = createNewID();
                                lastChainID = newChainID;

                                // first level attack object
                                possibleAttacks.current.push({
                                    chainID: newChainID,
                                    moveID: cellBehindEnemyData.id,
                                    enemyIDs: [enemyData.id],
                                    cellsToPassIDs: [],
                                });
                            } else {
                                // continue the chain
                                lastChainID = previousLevelAttack.chainID;

                                // next level attack object
                                // gather all previous cells to pass and enemies to attack
                                possibleAttacks.current.push({
                                    chainID: previousLevelAttack.chainID,
                                    moveID: cellBehindEnemyData.id,
                                    enemyIDs: [
                                        ...previousLevelAttack.enemyIDs,
                                        enemyData.id,
                                    ],
                                    cellsToPassIDs: [
                                        ...previousLevelAttack.cellsToPassIDs,
                                        previousLevelAttack.moveID,
                                    ],
                                });
                            }

                            cellsToMoveData.push(cellBehindEnemyData);
                            attackableEnemiesData.push(enemyData);

                            // repeat recursively for every next empty cell
                            // behind every enemy checker which is under attack
                            setAttacks(cellBehindEnemyData);
                        }
                    });
                }
            }

            dispatch({
                type: "initMove",
                payload: {
                    active: clickedCellData,
                    attackableSet: attackableEnemiesData,
                    movableSet: cellsToMoveData,
                },
            });
        } else if (isMoveOrAttack) {
            const currentAttackVarians = possibleAttacks.current.filter(
                (attackObj) => attackObj.moveID === clickedCellData.id
            );
            const isOnlyMovePossible = !(currentAttackVarians.length > 1);

            if (isOnlyMovePossible) {
                const activeCheckerData = getData(activeCheckerID.current);
                const checkersUnderAttackData =
                    possibleAttacks.current
                        .find(
                            (attackObj) =>
                                attackObj.moveID === clickedCellData.id
                        )
                        ?.enemyIDs.map((id) => getData(id)) ?? [];

                dispatch({
                    type: "resolveMove",
                    payload: {
                        active: activeCheckerData,
                        dest: clickedCellData,
                        removeSet: checkersUnderAttackData,
                    },
                });

                clearMoveInit();
            } else {
                // set controversial attack state
                // (if several attacks with one destination cell are possible)

                currentAttackVarians.forEach(
                    (attackObj) => (attackObj.isControversial = true)
                );

                const cellsToHoverData = currentAttackVarians
                    .map((attackObj) =>
                        [
                            ...attackObj.enemyIDs,
                            ...attackObj.cellsToPassIDs,
                        ].map((id) => getData(id))
                    )
                    .reduce((prev, current) => {
                        return [...prev, ...current];
                    }, []);

                dispatch({
                    type: "setControversial",
                    payload: cellsToHoverData,
                });

                return;
            }
        } else if (isResolveOfControversialAttack) {
            const thisAttackObj = possibleAttacks.current.find(
                (attackObj) =>
                    (attackObj.isControversial &&
                        attackObj.enemyIDs.includes(clickedCellData.id)) ||
                    (attackObj.isControversial &&
                        attackObj.cellsToPassIDs.includes(clickedCellData.id))
            );

            const activeCheckerData = getData(activeCheckerID.current);
            const destCellData = getData(thisAttackObj.moveID);

            dispatch({
                type: "resolveMove",
                payload: {
                    active: activeCheckerData,
                    dest: destCellData,
                    removeSet: thisAttackObj.enemyIDs.map((id) => getData(id)),
                },
            });

            clearMoveInit();
        } else {
            clearMoveInit();
        }
    }

    function handleMarkActiveContraversials(event, cellData) {
        if (!cellData.isControversial && !cellData.isControversialHover) return;

        const thisAttackObject = possibleAttacks.current
            .filter((attackObj) => attackObj.isControversial)
            .find(
                (attackObj) =>
                    attackObj.cellsToPassIDs.includes(cellData.id) ||
                    attackObj.enemyIDs.includes(cellData.id)
            );

        const cellsToMarkData = [
            ...thisAttackObject.enemyIDs,
            ...thisAttackObject.cellsToPassIDs,
        ].map((id) => getData(id));

        if (event._reactName === "onMouseEnter") {
            dispatch({
                type: "setContraversialHover",
                payload: cellsToMarkData,
            });
        }

        if (event._reactName === "onMouseLeave") {
            dispatch({
                type: "removeContraversialHover",
                payload: cellsToMarkData,
            });
        }
    }

    return (
        <div
            className={removeRedundantSpaces(
                `board ${
                    isNextPlayerMarked
                        ? isNextWhite
                            ? "next-white"
                            : "next-black"
                        : ""
                }`
            )}
        >
            {cellsData.map((cellData) => {
                return (
                    <Cell
                        cellData={cellData}
                        onUpdateCellData={handleChangeSellsData}
                        onMarkActiveContraversials={
                            handleMarkActiveContraversials
                        }
                        key={cellData.id}
                    />
                );
            })}
        </div>
    );

    function getData(id) {
        return cellsData.find((cellData) => cellData.id === id);
    }

    function clearMoveInit() {
        activeCheckerID.current = null;
        possibleAttacks.current.length = 0;
        dispatch({ type: "clearInitMove" });
    }
}

export default Board;
