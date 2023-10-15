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

app.append(canvas);


const cursor = { active: false, x: 0, y: 0 };


canvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
});

const ctx = canvas.getContext("2d")!;
ctx.lineWidth = 2;

canvas.addEventListener("mousemove", (e) => {
    if (cursor.active) {
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        cursor.x = e.offsetX;
        cursor.y = e.offsetY;
    }
});

canvas.addEventListener("mouseup", () => {
    cursor.active = false;
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(clearButton);

const origin: {x:number, y:number} = {x: 0, y: 0};
clearButton.addEventListener("click", () => {
    ctx.clearRect(origin.x, origin.y, canvas.width, canvas.height);
});
