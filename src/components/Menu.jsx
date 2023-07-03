import { useState } from "react";

function Menu({
    boardSide,
    onSelectBoardSide,
    history,
    onUndoLastMove,
    onGoBackInHistory,
    isDevMode,
    onSetDevMode,
}) {
    return (
        <div className="menu">
            <select
                className="menu-select"
                value={boardSide}
                onChange={(event) => onSelectBoardSide(event.target.value)}
            >
                <option value="auto">Side: auto</option>
                <option value="white">Side: white</option>
                <option value="black">Side: black</option>
                <option value="90">Side: 90°</option>
            </select>

            {history.length > 1 && (
                <button className="menu-button" onClick={onUndoLastMove}>
                    &#x21D0; Undo last move
                </button>
            )}

            {history.length > 2 && (
                <select
                    className="menu-select"
                    onChange={(event) =>
                        onGoBackInHistory(+event.target.value + 1)
                    }
                >
                    <option value="">History:</option>
                    {history
                        .filter((_, index) => index !== 0)
                        .map((_, index) => (
                            <option
                                value={index}
                                key={index}
                                style={
                                    index === 0
                                        ? { color: "red" }
                                        : { color: "rgb(255, 113, 70)" }
                                }
                            >
                                {index === 0
                                    ? "-- Start game --"
                                    : `- go to move ${index + 1}`}
                            </option>
                        ))}
                </select>
            )}

            <button className="menu-button" onClick={onSetDevMode}>
                {isDevMode ? "Normal mode" : "Dev mode"}
            </button>
        </div>
    );
}

export default Menu;
