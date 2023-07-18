export default function StartScreen({ dispatch }) {
    return (
        <>
            <h1>American checkers</h1>
            <button onClick={() => dispatch({ type: "startGame" })}>
                Start Game
            </button>
        </>
    );
}
