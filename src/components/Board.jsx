import Cell from "./Cell";
import { useRef } from "react";

function Board({
    isNextPlayerMarked,
    isNextWhite,
    cellsData,
    showCellNumbers,
    dispatch,
}) {
    //---------------------------- Main game logic -------------------------------

    const activeCheckerID = useRef(null);
    const possibleAttacks = useRef([]);

    function handleChangeSellsData(clickedCellData) {
        const isMoveInit = isPlayerChecker(clickedCellData);
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
                clickedCellData.isKing
            ).filter((cellData) => cellData && isEmptyField(cellData));

            const attackableEnemiesData = [];
            let lastChainID;

            // gather all possible attacks and related moves
            // function works recursively and call itself
            // for every next empty cell behind enemy checker
            setAttacks(clickedCellData);

            function setAttacks(startCellData) {
                const previousLevelAttack = possibleAttacks.current.find(
                    (attackObj) =>
                        attackObj.moveID === startCellData.id &&
                        attackObj.chainID === lastChainID
                );

                const enemiesNearbyData = getClosestCellsData(
                    startCellData,
                    clickedCellData.isKing
                ).filter((cellData) => isEnemyChecker(cellData));

                if (enemiesNearbyData.length > 0) {
                    enemiesNearbyData.forEach((enemyData) => {
                        const cellBehindEnemyData = getCellBehindData(
                            startCellData,
                            enemyData
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
                type: "setBeforeMove",
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
            const isControversialAttack = currentAttackVarians.length > 1;

            if (!isControversialAttack) {
                // regular move, attack move

                const activeCheckerData = getData(activeCheckerID.current);
                const checkersUnderAttackData =
                    possibleAttacks.current
                        .find(
                            (attackObj) =>
                                attackObj.moveID === clickedCellData.id
                        )
                        ?.enemyIDs.map((id) => getData(id)) ?? [];

                dispatch({
                    type: "setAfterMove",
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

                const contrCellsData = currentAttackVarians
                    .map((attackObj) =>
                        [
                            ...attackObj.enemyIDs,
                            ...attackObj.cellsToPassIDs,
                        ].map((id) => getData(id))
                    )
                    .reduce((prev, current) => {
                        return [...prev, ...current];
                    }, []);

                dispatch({ type: "setControversial", payload: contrCellsData });
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
                type: "setAfterMove",
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

        function getData(id) {
            return cellsData.find((cellData) => cellData.id === id);
        }
    }

    // ---------------------------------------------------------------------------

    function isPlayerChecker(cellData) {
        return (
            (isNextWhite && cellData?.checker === "white") ||
            (!isNextWhite && cellData?.checker === "black")
        );
    }

    function isEnemyChecker(cellData) {
        return (
            (isNextWhite && cellData?.checker === "black") ||
            (!isNextWhite && cellData?.checker === "white")
        );
    }

    function isEmptyField(cellData) {
        return !cellData?.checker;
    }

    function createNewID() {
        return (Date.now() + Math.random()).toString();
    }

    function getData(id) {
        return cellsData.find((cellData) => cellData.id === id);
    }

    function getClosestCellsData(cellData, isKingMode = false) {
        const id = cellData.id;

        let possibleMoveCells = [];

        const rowShift = isNextWhite ? -1 : 1;

        // check cell on forward-left
        if (id[2] !== "1")
            possibleMoveCells.push(
                getData(`${+id[0] + rowShift}-${+id[2] - 1}`)
            );
        // check cell on forward-right
        if (id[2] !== "8")
            possibleMoveCells.push(
                getData(`${+id[0] + rowShift}-${+id[2] + 1}`)
            );

        if (isKingMode) {
            // check cell on back-left
            if (id[2] !== "1")
                possibleMoveCells.push(
                    getData(`${+id[0] - rowShift}-${+id[2] - 1}`)
                );
            // check cell on back-right
            if (id[2] !== "8")
                possibleMoveCells.push(
                    getData(`${+id[0] - rowShift}-${+id[2] + 1}`)
                );
        }

        return possibleMoveCells;
    }

    function getCellBehindData(subjectData, targetData) {
        const rowShift = subjectData.row > targetData.row ? -1 : 1;

        const rowToCheck = subjectData.row + rowShift;

        // check field behind
        const cellCulumnToCheck =
            subjectData.column > targetData.column
                ? subjectData.column - 2
                : subjectData.column + 2;

        const isOnBoard =
            rowToCheck > 0 &&
            rowToCheck < 9 &&
            cellCulumnToCheck > 0 &&
            cellCulumnToCheck < 9;

        const cellBehindID = isOnBoard
            ? `${rowToCheck + rowShift}-${cellCulumnToCheck}`
            : null;

        return getData(cellBehindID);
    }

    function clearMoveInit() {
        activeCheckerID.current = null;
        dispatch({ type: "clearBeforeMove" });
        possibleAttacks.current.length = 0;
    }

    return (
        <div
            className={`board  ${
                isNextPlayerMarked
                    ? isNextWhite
                        ? "next-white"
                        : "next-black"
                    : ""
            }`}
        >
            {cellsData.map((cellData) => {
                return (
                    <Cell
                        cellData={cellData}
                        isNextWhite={isNextWhite}
                        onUpdateCellData={handleChangeSellsData}
                        onMarkActiveContraversials={
                            handleMarkActiveContraversials
                        }
                        showCellNumbers={showCellNumbers}
                        key={cellData.id}
                    />
                );
            })}
        </div>
    );
}

export default Board;
