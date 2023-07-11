import { useState } from "react";
import { useKeydown } from "../hooks/useKeydown";

function Menu({
    isNextPlayerMarked,
    onMarkNextPlayer,
    boardSide,
    onSelectBoardSide,
    history,
    onUndoLastMove,
    onGoBackInHistory,
    isDevMode,
    onSetDevMode,
    testData,
    onChangeTestCase,
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useKeydown(["Enter", "Escape"], handleOpenMenu);

    function handleOpenMenu() {
        setIsMenuOpen((currentState) => !currentState);
    }

    return (
        <>
            <div className="menu">
                <a
                    href="#"
                    className={`menu-burger ${isMenuOpen && "open"}`}
                    onClick={handleOpenMenu}
                >
                    <span></span>
                </a>

                {isMenuOpen && (
                    <div className="menu-items">
                        <select
                            className="menu-select"
                            value={boardSide}
                            onChange={(event) =>
                                onSelectBoardSide(event.target.value)
                            }
                        >
                            <option value="auto">Board side: auto</option>
                            <option value="white">Board side: white</option>
                            <option value="black">Board side: black</option>
                        </select>

                        <button
                            className="menu-button"
                            onClick={onMarkNextPlayer}
                        >
                            {isNextPlayerMarked
                                ? "🚩Not mark next player"
                                : "🚩Mark next player"}
                        </button>

                        {history.length > 1 && (
                            <button
                                className="menu-button"
                                onClick={onUndoLastMove}
                            >
                                &#x21D0; Undo last move
                            </button>
                        )}

                        {history.length > 2 && (
                            <select
                                className="menu-select"
                                onChange={(event) =>
                                    onGoBackInHistory(+event.target.value)
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
                                                    : {
                                                          color: "rgb(255, 113, 70)",
                                                      }
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
                            {isDevMode ? "👈 Quit dev move" : "🛠 Dev mode"}
                        </button>

                        {isDevMode && (
                            <select
                                className="menu-select"
                                onChange={(event) =>
                                    onChangeTestCase(event.target.value)
                                }
                            >
                                <option value="">🔥 Test Case:</option>
                                {testData.map((data, index) => (
                                    <option
                                        style={{ color: "rgb(255, 113, 70)" }}
                                        value={index}
                                        key={index}
                                    >{`- case ${index + 1}`}</option>
                                ))}
                            </select>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default Menu;
