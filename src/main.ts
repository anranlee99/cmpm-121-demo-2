import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "MacroHard Paint";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);
const canvasDiv = document.createElement("div");
canvasDiv.style.display = "flex";
canvasDiv.style.justifyContent = "space-between";
app.append(canvasDiv);

const canvas: HTMLCanvasElement = document.createElement("canvas");
//from https://shoddy-paint.glitch.me/paint0.html
canvas.width = 256;
canvas.height = 256;
canvas.style.border = "5px solid black";
canvas.style.borderRadius = "10%";
canvas.style.setProperty("filter", "drop-shadow(5px 5px 5px #000)");
canvas.style.backgroundColor = "white";
const ctx = canvas.getContext("2d")!;
canvasDiv.append(canvas);

const toolDiv = document.createElement("div");
toolDiv.style.display = "flex";
toolDiv.style.flexDirection = "column";
toolDiv.style.alignItems = "center";
canvasDiv.append(toolDiv);

let globalLineWidth = 2;
const thicknessRef = { thin: 2, thick: 5 };
const thinButton = document.createElement("button");
thinButton.innerHTML = "thin";
toolDiv.append(thinButton);
thinButton.addEventListener("click", () => {
  globalLineWidth = thicknessRef.thin;
  notify("cursor-changed");
});

const thickButton = document.createElement("button");
thickButton.innerHTML = "thick";
toolDiv.append(thickButton);
thickButton.addEventListener("click", () => {
  globalLineWidth = thicknessRef.thick;
  notify("cursor-changed");
});

class LineCommand {
  markers: { x: number; y: number }[];
  thickness: number;
  constructor(startX: number, startY: number, thickness: number) {
    this.markers = [{ x: startX, y: startY }];
    this.thickness = thickness;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = this.thickness;
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
class CursorCommand {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  draw(width: number) {
    ctx.beginPath();
    const origin = 0;
    const fullCircle = Math.PI + Math.PI;
    ctx.arc(this.x, this.y, width, origin, fullCircle);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }
}
let cursorCommand: CursorCommand | null = null;

const bus = new EventTarget();

function notify(name: string) {
  bus.dispatchEvent(new Event(name));
}

bus.addEventListener("drawing-changed", () => {
  redraw();
});
//observer
bus.addEventListener("cursor-changed", () => {
  redraw();
});
const firstLineIndex = 0;
const lines: LineCommand[] = [];
const redoLines: LineCommand[] = [];

const origin: { x: number; y: number } = { x: 0, y: 0 };
const cursor = { active: false, x: 0, y: 0 };
function redraw() {
  ctx.clearRect(origin.x, origin.y, canvas.width, canvas.height);
  for (const line of lines) {
    line.display(ctx);
  }
  if (cursorCommand) {
    cursorCommand.draw(ctx.lineWidth);
  }
}

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  ctx.lineWidth = globalLineWidth;
  cursorCommand?.draw(ctx.lineWidth);
  const lineObject = new LineCommand(cursor.x, cursor.y, ctx.lineWidth);
  redoLines.splice(firstLineIndex, redoLines.length);
  lines.push(lineObject);

  redraw();
});

canvas.addEventListener("mousemove", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;
  if (cursor.active) {
    const decrement = -1;
    const newestLineIndex = lines.length + decrement;
    const line = lines[newestLineIndex];
    line.drag(x, y);
  }
  cursorCommand = new CursorCommand(x, y);
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

function updateLineWidth(): void {
  ctx.lineWidth = globalLineWidth;
  window.requestAnimationFrame(updateLineWidth);
}

window.requestAnimationFrame(updateLineWidth);
