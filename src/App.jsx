// Conext
import { useGameContext } from "./context/GameContext";
// Functions
import { getBoardSideClassName } from "./functions/functions";
// Components
import StartScreen from "./components/StartScreen";
import EndScreen from "./components/EndScreen";
import MainMenu from "./components/MainMenu";
import Board from "./components/Board";
import DeletedCheckers from "./components/DeletedCheckers";
// Styles
import "./App.css";

export default function App() {
    const { isNextWhite, isGameMode, winner, boardSide, deletedCheckers } =
        useGameContext();

    if (!isGameMode && !winner) return <StartScreen />;

    return (
        <>
            {!isGameMode && winner && <EndScreen />}
            <div className="app">
                {!winner && <MainMenu />}

                <div
                    className={`game-field ${getBoardSideClassName(
                        isNextWhite,
                        boardSide
                    )}`}
                >
                    <Board />
                    <DeletedCheckers
                        color="black"
                        amount={deletedCheckers[1]}
                    />
                    <DeletedCheckers
                        color="white"
                        amount={deletedCheckers[0]}
                    />
                </div>
            </div>
        </>
    );
}
