import { useEffect } from "react";

export function useKeydown(keyNames, callback) {
    useEffect(() => {
        document.addEventListener("keydown", onKeyDown);

        function onKeyDown(event) {
            if (
                keyNames.find(
                    (keyName) =>
                        keyName.toLowerCase() === event.code.toLowerCase()
                )
            )
                callback();
        }

        return () => document.removeEventListener("keydown", onKeyDown);
    }, [callback]);
}
