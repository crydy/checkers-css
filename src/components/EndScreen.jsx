import { useGameContext } from "../context/GameContext";

function EndScreen() {
    const { winner, dispatch } = useGameContext();

    const color = winner === "white" ? "white" : "black";

    return (
        <div className="overlay">
            <div className="end-screen-content">
                <div className="end-screen-title-wrapper">
                    <h1 className="end-screen-title">{"["}</h1>
                    <div
                        className={`cell cell--ending trans ${color} checker`}
                    ></div>
                    <h1 className="end-screen-title">{"]"} won the match!</h1>
                </div>

                <div className="menu menu--end">
                    <button onClick={() => dispatch({ type: "startGame" })}>
                        🎲 Start new Game
                    </button>
                    <button onClick={() => dispatch({ type: "undoLastMove" })}>
                        &#x21D0; Undo last move
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EndScreen;
