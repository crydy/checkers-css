function Cell({
    cellData,
    isNextWhite,
    onUpdateCellData,
    onMarkActiveContraversials,
    showCellNumbers,
}) {
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
            onClick={() => onUpdateCellData(cellData)}
            onMouseEnter={(event) =>
                onMarkActiveContraversials(event, cellData)
            }
            onMouseLeave={(event) =>
                onMarkActiveContraversials(event, cellData)
            }
        >
            {showCellNumbers ? cellData.id : null}
        </div>
    );
}

export default Cell;

function removeRedundantSpaces(string) {
    return string.replace(/\s+/g, " ");
}
