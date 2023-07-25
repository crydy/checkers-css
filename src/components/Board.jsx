import { useGameContext } from "../context/GameContext";
import { removeRedundantSpaces } from "../functions/functions";
import Cell from "./Cell";

function Board() {
    const { isNextWhite, isNextPlayerMarked, cellsData } = useGameContext();

    return (
        <div
            className={removeRedundantSpaces(
                `board ${
                    isNextPlayerMarked
                        ? isNextWhite
                            ? "next-white"
                            : "next-black"
                        : ""
                }`
            )}
        >
            {cellsData.map((cellData) => {
                return <Cell cellData={cellData} key={cellData.id} />;
            })}
        </div>
    );
}

export default Board;
