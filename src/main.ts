import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Paint!";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas: HTMLCanvasElement = document.createElement("canvas");
//from https://shoddy-paint.glitch.me/paint0.html
canvas.width = 256;
canvas.height = 256;
canvas.style.border = "5px solid black";
canvas.style.borderRadius = "10%";
canvas.style.setProperty("filter", "drop-shadow(5px 5px 5px #000)");
canvas.style.backgroundColor = "white";
const ctx = canvas.getContext("2d")!;
ctx.lineWidth = 2;

app.append(canvas);

const bus = new EventTarget();

function notify(name: string) {
    bus.dispatchEvent(new Event(name));
}

bus.addEventListener("drawing-changed", () => {
    console.log(lines);
    redraw();
});
//observer
bus.addEventListener("cursor-changed", () => {
    console.log(lines);
    redraw();
});
const firstLineIndex = 0;
const lines: { x: number, y: number }[][] = [];
const redoLines: { x: number, y: number }[][] = [];

const origin: { x: number, y: number } = { x: 0, y: 0 };
let currentLine: { x: number, y: number }[] = [];
const cursor = { active: false, x: 0, y: 0 };
function redraw() {
    ctx.clearRect(origin.x, origin.y, canvas.width, canvas.height);
    const minPoints = 1;
    for (const line of lines) {
        if (line.length > minPoints) {
            ctx.beginPath();
            const { x, y } = line[firstLineIndex];
            ctx.moveTo(x, y);
            for (const { x, y } of line) {
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
}


canvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    //ONE array of points
    currentLine = [];
    //this just clears the redo array

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    redoLines.splice(0, redoLines.length);
    //record the new x,y's for the current line
    currentLine.push({ x: cursor.x, y: cursor.y });
    //save the line
    lines.push(currentLine);

    redraw();
});


canvas.addEventListener("mousemove", (e) => {
    if (cursor.active) {
        const x = e.offsetX;
        const y = e.offsetY;
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        cursor.x = x;
        cursor.y = y;
        currentLine.push({ x, y });
    }
    notify("cursor-changed");
});

canvas.addEventListener("mouseup", () => {
    cursor.active = false;
    notify("drawing-changed");
});

const toolsDiv = document.createElement("div");
toolsDiv.style.display = "flex";
toolsDiv.style.justifyContent = "space-around";
app.append(toolsDiv);

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
toolsDiv.append(clearButton);

clearButton.addEventListener("click", () => {
    lines.splice(firstLineIndex, lines.length);
    notify("drawing-changed");
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
toolsDiv.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
toolsDiv.append(redoButton);

undoButton.addEventListener("click", () => {
    if (lines.length) {
        const line: { x: number, y: number }[] = lines.pop()!;
        redoLines.push(line);
    }
    notify("drawing-changed");
});

redoButton.addEventListener("click", () => {
    if (redoLines.length) {
        const line: { x: number, y: number }[] = redoLines.pop()!;
        lines.push(line);
    }
    notify("drawing-changed");
});
