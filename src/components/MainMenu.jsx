import {
    Menu,
    SubMenu,
    MenuItem,
    MenuButton,
    MenuDivider,
} from "@szhsin/react-menu";

import { useGameContext } from "../context/GameContext";
import { testData } from "../data/testGameStates";

import { BiCheckboxSquare, BiCheckbox, BiUndo } from "react-icons/bi";
import { MdArrowForwardIos, MdArrowBackIosNew } from "react-icons/md";
import { HiWrenchScrewdriver } from "react-icons/hi2";

function MainMenu() {
    const {
        isDevMode,
        isNextPlayerMarked,
        boardSide,
        history,
        historyBeforeDevMode,
        dispatch,
    } = useGameContext();

    const isTestCase = !!historyBeforeDevMode;

    function handleChooseBoardSide(e) {
        const chosenSide = e.target.textContent.toLowerCase();

        dispatch({
            type: "selectBoardSide",
            payload: chosenSide,
        });
    }

    function handleToggleNextPlayerMark(e) {
        e.keepOpen = true;
        dispatch({ type: "toggleNextPlayerMark" });
    }

    function handleUndoLastMove(e) {
        e.keepOpen = true;
        dispatch({ type: "undoLastMove" });
    }

    function handleBackInHistory(e) {
        const storyIndex = Number(e.target.getAttribute("data-story-index"));

        dispatch({
            type: "goBackInHistory",
            payload: storyIndex,
        });
    }

    function handleToggleDevMode(e) {
        e.keepOpen = true;
        dispatch({ type: "toggleDevMode" });
    }

    function handleChooseTestCase(e) {
        const caseName = e.target.getAttribute("data-case-name");

        dispatch({
            type: "setTestCase",
            payload: caseName,
        });
    }

    return (
        <>
            <div className="menu menu--main">
                <Menu menuButton={<MenuButton>menu</MenuButton>} transition>
                    {/* choose board side */}
                    <SubMenu
                        label={
                            <>
                                <span>board side ({boardSide})</span>
                                <span className="icon icon--submenu">
                                    <MdArrowForwardIos />
                                </span>
                            </>
                        }
                        onClick={handleChooseBoardSide}
                    >
                        <MenuItem>auto</MenuItem>
                        <MenuItem>white</MenuItem>
                        <MenuItem>black</MenuItem>
                    </SubMenu>

                    {/* mark next player */}
                    <MenuItem
                        type="checkbox"
                        checked={isNextPlayerMarked}
                        onClick={handleToggleNextPlayerMark}
                    >
                        <span>mark active player</span>
                        <span className="icon">
                            {isNextPlayerMarked ? (
                                <BiCheckboxSquare />
                            ) : (
                                <BiCheckbox />
                            )}
                        </span>
                    </MenuItem>

                    <MenuDivider />

                    {/* undo last move */}
                    {history.length > 1 && (
                        <MenuItem
                            onClick={handleUndoLastMove}
                            className="menu-undo-event-warning"
                        >
                            <span>undo last move</span>
                            <span className="icon">
                                <BiUndo />
                            </span>
                        </MenuItem>
                    )}

                    {/* back in game history */}
                    {history.length > 2 && (
                        <SubMenu
                            className="menu-submenu-scrollable"
                            label={
                                <>
                                    <span>game history </span>
                                    <span className="icon icon--submenu">
                                        <MdArrowForwardIos />
                                    </span>
                                </>
                            }
                            onClick={handleBackInHistory}
                        >
                            {history
                                .filter((_, index) => index !== 0)
                                .map((_, index) => (
                                    <MenuItem
                                        className="menu-undo-event-warning"
                                        data-story-index={index}
                                        key={index}
                                    >
                                        {index === 0
                                            ? "-- start game --"
                                            : `back to move ${index + 1}`}
                                    </MenuItem>
                                ))
                                .reverse()}
                        </SubMenu>
                    )}

                    <MenuDivider />

                    {/* toggle dev mode */}
                    <MenuItem
                        className="menu-dev-mode"
                        type="checkbox"
                        checked={isDevMode}
                        onClick={handleToggleDevMode}
                    >
                        {isTestCase ? (
                            <>
                                <span>
                                    <HiWrenchScrewdriver /> to regular game
                                </span>
                                <span className="icon">
                                    <BiUndo />
                                </span>
                            </>
                        ) : (
                            <>
                                <span>
                                    <HiWrenchScrewdriver /> dev mode
                                </span>
                                <span className="icon">
                                    {isDevMode ? (
                                        <BiCheckboxSquare />
                                    ) : (
                                        <BiCheckbox />
                                    )}
                                </span>
                            </>
                        )}
                    </MenuItem>

                    {/* choose test case */}
                    {isDevMode && (
                        <SubMenu
                            className="menu-dev-mode menu-submenu-scrollable"
                            label={
                                <>
                                    <span>
                                        <HiWrenchScrewdriver /> test case
                                    </span>
                                    <span className="icon icon--submenu">
                                        <MdArrowForwardIos />
                                    </span>
                                </>
                            }
                            onClick={handleChooseTestCase}
                        >
                            {Object.keys(testData).map((caseName, index) => (
                                <MenuItem
                                    className="menu-dev-mode"
                                    key={index}
                                    data-case-name={caseName}
                                >{`${index + 1}: ${caseName}`}</MenuItem>
                            ))}
                        </SubMenu>
                    )}
                </Menu>
            </div>

            {/* Outside main menu */}
            {history.length > 1 && (
                <button
                    className="menu-button menu-button--outside"
                    onClick={() => dispatch({ type: "undoLastMove" })}
                    title="Undo last move (Backspace)"
                >
                    <MdArrowBackIosNew />
                </button>
            )}
        </>
    );
}

export default MainMenu;
