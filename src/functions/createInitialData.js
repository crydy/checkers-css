export function createInitialData() {
    const cellsData = [];
    let index = 1;

    for (let row = 0; row < 8; row++) {
        for (let cell = 0; cell < 8; cell++) {
            let bgColor;
            let checker;

            if (row % 2 === 0) {
                bgColor = cell % 2 !== 0 ? "dark" : "light";
            } else {
                bgColor = cell % 2 === 0 ? "dark" : "light";
            }

            if (bgColor === "dark") {
                if (row < 3) checker = "black";
                else if (row > 4) checker = "white";
                else checker = null;
            } else {
                checker = null;
            }

            const currentCellData = {
                bg: bgColor,
                row: row + 1,
                column: cell + 1,
                id: `${row + 1}-${cell + 1}`,
                checker,
                isKing: false,
                isFieldToMove: false,
                isActive: false,
                isUnderAttack: false,
                isControversial: false,
                isControversialHover: false,
            };

            cellsData.push(currentCellData);
            index++;
        }
    }

    return cellsData;
}
