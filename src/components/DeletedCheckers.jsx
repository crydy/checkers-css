export default function DeletedCheckers({ color, amount }) {
    return (
        <div
            className={`deleted-section ${
                color === "black" ? "reverse" : "normal"
            }`}
        >
            {Array.from({ length: amount }).map((_, index) => {
                return (
                    <div
                        className={`cell out-of-game trans ${color} checker`}
                        key={index}
                    ></div>
                );
            })}
        </div>
    );
}
