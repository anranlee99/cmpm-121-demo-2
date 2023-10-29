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
thinButton.addEventListener("click", (e) => {
  globalLineWidth = thicknessRef.thin;
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY);
  notify("cursor-changed");
});

const thickButton = document.createElement("button");
thickButton.innerHTML = "thick";
toolDiv.append(thickButton);
thickButton.addEventListener("click", (e) => {
  globalLineWidth = thicknessRef.thick;
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY);
  notify("cursor-changed");
});

const stickerStrings = ["😎", "⭐", "❤️"];
for (const stickerString of stickerStrings) {
  createStickers(stickerString);
}

const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "➕";
toolDiv.append(customStickerButton);
customStickerButton.addEventListener("click", () => {
  const stickerString = prompt("Enter a sticker:");
  stickerStrings.push(stickerString!);
  if (stickerString) {
    createStickers(stickerString);
  }
});
function createStickers(img: string) {
  const stickerButton = document.createElement("button");
  stickerButton.innerHTML = img;
  toolDiv.append(stickerButton);
  stickerButton.addEventListener("click", (e) => {
    cursorCommand = new CursorCommand(e.offsetX, e.offsetY, img);
    notify("cursor-changed");
  });
}

class LineCommand {
  markers: { x: number; y: number; img: string }[];
  thickness: number;
  img: string;
  constructor(startX: number, startY: number, thickness: number, img = "") {
    this.markers = [{ x: startX, y: startY, img }];
    this.thickness = thickness;
    this.img = img;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = this.thickness;
    ctx.beginPath();

    const firstMarker = this.markers[firstLineIndex];
    ctx.moveTo(firstMarker.x, firstMarker.y);
    for (const marker of this.markers) {
      if (marker.img) {
        ctx.font = "32px monospace";
        ctx.fillText(marker.img, marker.x, marker.y);
      } else {
        ctx.lineTo(marker.x, marker.y);
      }
    }
    ctx.stroke();
  }

  drag(x: number, y: number, img = "") {
    this.markers.push({ x, y, img });
  }
}
class CursorCommand {
  x: number;
  y: number;
  img: string;
  constructor(x: number, y: number, img = "") {
    this.x = x;
    this.y = y;
    this.img = img;
  }
  draw() {
    ctx.beginPath();
    if (this.img) {
      ctx.font = "32px monospace";
      ctx.fillText(this.img, this.x, this.y);
    } else {
      const origin = 0;
      const fullCircle = Math.PI + Math.PI;

      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      const radius = globalLineWidth / 2;
      ctx.arc(this.x, this.y, radius, origin, fullCircle);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fill();
      ctx.lineWidth = globalLineWidth;
    }
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
  ctx.lineWidth = globalLineWidth;
  cursorCommand?.draw();
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
    cursorCommand.draw();
  }
}

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  ctx.lineWidth = globalLineWidth;
  cursorCommand?.draw();
  const lineObject = new LineCommand(
    cursor.x,
    cursor.y,
    ctx.lineWidth,
    cursorCommand?.img
  );
  redoLines.splice(firstLineIndex, redoLines.length);
  lines.push(lineObject);
  cursorCommand = new CursorCommand(cursor.x, cursor.y, cursorCommand?.img);
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
  cursorCommand = new CursorCommand(x, y, cursorCommand?.img);
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

const exportButton = document.createElement("button");
exportButton.innerHTML = "export";
toolsDiv.append(exportButton);
exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d")!;
  const scaleRatio = 4;
  exportCtx.scale(scaleRatio, scaleRatio);
  for (const line of lines) {
    line.display(exportCtx);
  }
  const exportLink = document.createElement("a");
  exportLink.href = exportCanvas.toDataURL("image/png");
  exportLink.download = Date.now() + ".png";
  exportLink.click();
});
