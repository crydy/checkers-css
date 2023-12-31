import { useGameContext } from "../context/GameContext";
import { removeRedundantSpaces } from "../functions/functions";

function Cell({ cellData }) {
    const {
        isNextWhite,
        isDevMode,
        handleChangeSellsData,
        handleMarkActiveContraversials,
    } = useGameContext();

    const isPlayerChecker =
        (isNextWhite && cellData?.checker === "white") ||
        (!isNextWhite && cellData?.checker === "black");
    const isMovalbe = cellData.checker && isPlayerChecker && !cellData.isActive;

    return (
        <div
            className={removeRedundantSpaces(`cell
                ${cellData.bg}
                ${cellData.checker && `checker ${cellData.checker}`}
                ${isMovalbe && "movable"}
                ${cellData.checker && isPlayerChecker && "pointer"}
                ${cellData.isFieldToMove && "field-to-move"}
                ${cellData.isActive && "active"}
                ${cellData.isKing && "king"}
                ${cellData.isUnderAttack && "under-attack"}
                ${cellData.isControversial && "controversial"}
                ${cellData.isControversialHover && "controversial-hover"}
            `)}
            onClick={() => handleChangeSellsData(cellData)}
            onMouseEnter={(event) =>
                handleMarkActiveContraversials(event, cellData)
            }
            onMouseLeave={(event) =>
                handleMarkActiveContraversials(event, cellData)
            }
        >
            {isDevMode ? cellData.id : null}
        </div>
    );
}

export default Cell;
