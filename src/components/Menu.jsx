import { useKeydown } from "../hooks/useKeydown";

function Menu({
    isMenuOpened,
    isNextPlayerMarked,
    boardSide,
    history,
    isDevMode,
    dispatch,
    testCasesAmount,
}) {
    useKeydown(["Enter", "Escape"], () => dispatch({ type: "toggleMenu" }));

    return (
        <>
            <div className="menu menu--main">
                {/* Burger button */}
                <a
                    href="#"
                    className={`menu-burger ${isMenuOpened ? "open" : ""}`}
                    onClick={() => dispatch({ type: "toggleMenu" })}
                    title={!isMenuOpened ? "Open menu (Esc)" : ""}
                >
                    <span></span>
                </a>

                {/* Main manu */}
                {isMenuOpened && (
                    <div className="menu-items">
                        <select
                            className="menu-select"
                            value={boardSide}
                            onChange={(e) =>
                                dispatch({
                                    type: "selectBoardSide",
                                    payload: e.target.value,
                                })
                            }
                        >
                            <option value="auto">Board side: auto</option>
                            <option value="white">Board side: white</option>
                            <option value="black">Board side: black</option>
                        </select>

                        <button
                            className="menu-button"
                            onClick={() =>
                                dispatch({ type: "toggleNextPlayerMark" })
                            }
                        >
                            {isNextPlayerMarked
                                ? "🚩Not mark next player"
                                : "🚩Mark next player"}
                        </button>

                        {history.length > 1 && (
                            <button
                                className="menu-button"
                                onClick={() =>
                                    dispatch({ type: "undoLastMove" })
                                }
                            >
                                &#x21D0; Undo last move
                            </button>
                        )}

                        {history.length > 2 && (
                            <select
                                className="menu-select"
                                onChange={(e) =>
                                    dispatch({
                                        type: "goBackInHistory",
                                        payload: +e.target.value,
                                    })
                                }
                            >
                                <option value="">⏱ History:</option>
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
                                                : `- back to move ${index + 1}`}
                                        </option>
                                    ))}
                            </select>
                        )}

                        <button
                            className="menu-button"
                            onClick={() => dispatch({ type: "toggleDevMode" })}
                        >
                            {isDevMode ? "👈 Quit dev move" : "🛠 Dev mode"}
                        </button>

                        {isDevMode && (
                            <select
                                className="menu-select"
                                onChange={(e) =>
                                    dispatch({
                                        type: "setTestCase",
                                        payload: +e.target.value,
                                    })
                                }
                            >
                                <option value="">🔥 Choose test Case:</option>
                                {Array.from({ length: testCasesAmount }).map(
                                    (_, index) => (
                                        <option
                                            style={{
                                                color: "rgb(255, 113, 70)",
                                            }}
                                            value={index}
                                            key={index}
                                        >{`- case ${index + 1}`}</option>
                                    )
                                )}
                            </select>
                        )}
                    </div>
                )}
            </div>

            {/* Outside main menu */}
            {!isMenuOpened && history.length > 1 && (
                <button
                    className="menu-button menu-button--outside"
                    onClick={() => dispatch({ type: "undoLastMove" })}
                    title="Undo last move (Backspace)"
                >
                    {"<"}
                </button>
            )}
        </>
    );
}

export default Menu;
