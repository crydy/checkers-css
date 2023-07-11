function Cell({
    cellData,
    onUpdateCellData,
    onMarkActiveContraversials,
    isNextWhite,
    showCellNumbers,
}) {
    const isPlayerChecker =
        (isNextWhite && cellData?.checker === "white") ||
        (!isNextWhite && cellData?.checker === "black");
    const isMovalbe = cellData.checker && isPlayerChecker && !cellData.isActive;

    return (
        <div
            className={`cell
                ${cellData.bg}
                ${cellData.checker ? `checker ${cellData.checker}` : ""}
                ${isMovalbe && "movable"}
                ${cellData.checker && isPlayerChecker && "pointer"}
                ${cellData.isFieldToMove ? "field-to-move" : ""}
                ${cellData.isActive ? "active" : ""}
                ${cellData.isKing ? "king" : ""}
                ${cellData.isUnderAttack ? "under-attack" : ""}
                ${cellData.isControversial ? "controversial" : ""}
                ${cellData.isControversialHover ? "controversial-hover" : ""}
            `.replace(/\s+/g, " ")}
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
