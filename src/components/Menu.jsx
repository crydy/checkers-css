import { useGameContext } from "../context/GameContext";
import testData from "../data/testGameStates";
import { useKeydown } from "../hooks/useKeydown";

function Menu() {
    const {
        isDevMode,
        isMenuOpened,
        isNextPlayerMarked,
        boardSide,
        history,
        dispatch,
    } = useGameContext();

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

                        {/* Next player mark */}
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

                        {/* Undo last move */}
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

                        {/* History */}
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

                        {/* Dev mode activation */}
                        <button
                            className="menu-button"
                            onClick={() => dispatch({ type: "toggleDevMode" })}
                        >
                            {isDevMode ? "👈 Quit dev move" : "🛠 Dev mode"}
                        </button>

                        {/* Select test case */}
                        {isDevMode && (
                            <select
                                className="menu-select"
                                onChange={(e) =>
                                    dispatch({
                                        type: "setTestCase",
                                        payload: e.target.value,
                                    })
                                }
                            >
                                <option value="">🔥 Choose test Case:</option>
                                {Object.keys(testData).map(
                                    (caseName, index) => (
                                        <option
                                            style={{
                                                color: "rgb(255, 113, 70)",
                                            }}
                                            value={caseName}
                                            key={index}
                                        >{`- ${
                                            index + 1
                                        }: ${caseName}`}</option>
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
