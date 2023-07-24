import { useGameContext } from "../context/GameContext";

export default function StartScreen() {
    const { dispatch } = useGameContext();

    return (
        <>
            <h1>American checkers</h1>
            <h2>(2 players only)</h2>
            <button onClick={() => dispatch({ type: "startGame" })}>
                Start Game
            </button>
        </>
    );
}
