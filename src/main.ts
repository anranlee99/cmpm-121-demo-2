import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "MacroHard Paint";

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

class LineCommand {
  markers: { x: number; y: number }[];
  constructor(startX: number, startY: number) {
    this.markers = [{ x: startX, y: startY }];
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.beginPath();

    const firstMarker = this.markers[firstLineIndex];
    ctx.moveTo(firstMarker.x, firstMarker.y);
    for (const marker of this.markers) {
      ctx.lineTo(marker.x, marker.y);
    }
    ctx.stroke();
  }

  drag(x: number, y: number) {
    this.markers.push({ x, y });
  }
}
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
const lines: LineCommand[] = [];
const redoLines: LineCommand[] = [];

const origin: { x: number; y: number } = { x: 0, y: 0 };
const cursor = { active: false, x: 0, y: 0 };
function redraw() {
  ctx.clearRect(origin.x, origin.y, canvas.width, canvas.height);
  // const minPoints = 1;
  // for (const line of lines) {
  //   if (line.length > minPoints) {
  //     ctx.beginPath();
  //     const { x, y } = line[firstLineIndex];
  //     ctx.moveTo(x, y);
  //     for (const { x, y } of line) {
  //       ctx.lineTo(x, y);
  //     }
  //     ctx.stroke();
  //   }
  // }
  for (const line of lines) {
    line.display(ctx);
  }
}

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  const lineObject = new LineCommand(cursor.x, cursor.y);
  redoLines.splice(firstLineIndex, redoLines.length);
  lines.push(lineObject);

  redraw();
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    const x = e.offsetX;
      const y = e.offsetY;
    const decrement = -1;
    const newestLineIndex = lines.length + decrement;
    const line = lines[newestLineIndex];
    line.drag(x, y);
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
    const line: LineCommand = lines.pop()!;
    redoLines.push(line);
  }
  notify("drawing-changed");
});

redoButton.addEventListener("click", () => {
  if (redoLines.length) {
    const line: LineCommand = redoLines.pop()!;
    lines.push(line);
  }
  notify("drawing-changed");
});
