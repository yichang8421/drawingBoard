//1. 初始化数据
let canvas = <HTMLCanvasElement>document.getElementById("canvas"),
    ctx: CanvasRenderingContext2D = canvas.getContext("2d"),
    eraserEnabled = false,
    pen = document.getElementById("pen"),
    eraser = document.getElementById("eraser"),
    color = document.getElementById("color"),
    thickness = document.getElementById("thickness"),
    actions = document.getElementById("actions");

//2. 设置画布自动布满视口
autoSetCanvasSize(canvas);

//3. 执行用户动作
painting(canvas);

color.addEventListener("click", changeColor);
thickness.addEventListener("click", changeThickness);
actions.addEventListener("click", (e?: MouseEvent) => {
    if (e.target.tagName === "svg") {
        takeAction(e.target.id);
    } else {
        if (e.target.tagName === "use") {
            takeAction(e.target.parentElement.id);
        } else {
            if (e.target.tagName === "LI") {
                takeAction(e.target.children[0].id);
            }
        }
    }
});

/****************************/

/* 绘制操作 */
function painting(canvas: HTMLCanvasElement) {
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.lineWidth = 2;
    ctx.radius = 1;
    let isUsing = false;        //是否正在使用
    let previousPoint: PreviousPoint = {};
    //特性检测
    if (document.body.ontouchstart !== undefined) {
        //移动端
        canvas.addEventListener("touchstart", touchStart.bind(null, previousPoint));
        canvas.addEventListener("touchmove", touchMove.bind(null, previousPoint));
        canvas.addEventListener("touchcancel", touchCancel);
    } else {
        //PC端
        canvas.onmousedown = (e?: MouseEvent) => {
            isUsing = true;
            let x = e.clientX;
            let y = e.clientY;
            if (!eraserEnabled) {
                previousPoint = {x: x, y: y};
                drawPoint(x, y, ctx.radius);
            } else {
                ctx.clearRect(x - 5, y - 5, 10, 10);
            }
        };
        canvas.onmousemove = (e?: MouseEvent) => {
            if (isUsing) {
                let x = e.clientX;
                let y = e.clientY;
                let newPoint = {x: x, y: y};
                if (!eraserEnabled) {
                    drawPoint(x, y, ctx.radius);
                    drawLine(previousPoint.x, previousPoint.y, newPoint.x, newPoint.y);
                    previousPoint = newPoint;
                } else {
                    ctx.clearRect(x - 5, y - 5, 10, 10);
                }
            }
        };
        canvas.onmouseup = () => {
            isUsing = false;
        };
    }
}

function touchStart(point: {}, e: TouchEvent) {
    e.preventDefault();
    let x: number, y: number;
    for (let touch of (e.changedTouches as unknown as Touch[])) {
        x = Math.floor(touch.clientX);
        y = Math.floor(touch.clientY);
        if (!eraserEnabled) {
            point[touch.identifier] = {x: x, y: y};
            drawPoint(x, y, ctx.radius);
        } else {
            ctx.clearRect(x - 5, y - 5, 10, 10);
        }
    }
}

function touchMove(originalPoint: number, e: TouchEvent): void {
    e.preventDefault();
    let x: number, y: number, newPoint = {};
    for (let touch of (e.changedTouches as unknown as Touch[])) {
        x = Math.floor(touch.clientX);
        y = Math.floor(touch.clientY);
        if (!eraserEnabled) {
            newPoint[touch.identifier] = {x: x, y: y};
            drawPoint(x, y, ctx.radius);           // 避免在lineWidth变大时不完整
            drawLine(originalPoint[touch.identifier].x, originalPoint[touch.identifier].y, newPoint[touch.identifier].x, newPoint[touch.identifier].y);
            originalPoint[touch.identifier] = newPoint[touch.identifier];
        } else {
            ctx.clearRect(x - 8, y - 8, 16, 16);
        }
    }
}

function touchCancel(): void {
    alert("超过最大可触屏限制：最多允许五指触屏");
}

/* 选笔触颜色 */
function changeColor(e?: MouseEvent): void {
    let selectedColor = e.target.id;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    whichActived(selectedColor, "color");
}

/* 选笔触粗细 */
function changeThickness(e?: MouseEvent): void {
    let selectedThickness = e.target.id;
    if (selectedThickness === "thin") {
        ctx.lineWidth = 2;
        ctx.radius = 1;
    } else if (selectedThickness === "middle") {
        ctx.lineWidth = 6;
        ctx.radius = 3;
    } else if (selectedThickness === "thick") {
        ctx.lineWidth = 10;
        ctx.radius = 5;
    }
    whichActived(selectedThickness, "thickness");
}

function whichActived(target: string, parentID: string): void {
    let parentNode: HTMLElement;
    if (parentID === "color") {
        parentNode = color;
    } else if (parentID === "thickness") {
        parentNode = thickness;
    }
    for (let i = 0; i < parentNode.children.length; i++) {
        if (target === parentNode.children[i].id) {
            parentNode.children[i].className = "active";
        } else if (target !== parentID) {
            parentNode.children[i].className = "";
        }
    }
}

/* 画圆点 */
function drawPoint(x: number, y: number, radius: number): void {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

/* 画轨迹（线条） */
function drawLine(x1: number, y1: number, x2: number, y2: number): void {
    // 解决IOS中获取不到ctx设置的问题
    if (ctx.lineWidth === 1) {
        ctx.lineWidth = 2;
        ctx.radius = 1;
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

/* 选择哪个动作 */
function takeAction(element: string): void {
    if (element === "pen") {
        eraserEnabled = false;
        pen.classList.add("active");
        eraser.classList.remove("active");
        color.className = "active";
        thickness.className = "active";
    } else if (element === "eraser") {
        eraserEnabled = true;
        pen.classList.remove("active");
        eraser.classList.add("active");
        color.className = "remove";
        thickness.className = "remove";
    } else if (element === "clearall") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //清屏
        eraserEnabled = false;
        pen.classList.add("active");
        eraser.classList.remove("active");
        color.className = "active";
        thickness.className = "active";
    } else if (element === "save") {
        let a = document.createElement("a");
        a.href = canvas.toDataURL();           //获得图片地址
        a.target = "_blank";
        a.download = "image.png";
        a.click();
    }
}

/* 自动调整画布宽高 */
function autoSetCanvasSize(canvas: HTMLCanvasElement): void {
    setCanvasSize(canvas);
    window.onresize = () => {
        setCanvasSize(canvas);
    };

    //设置画布宽高
    function setCanvasSize(canvas: HTMLCanvasElement): void {
        let pageWidth = document.documentElement.clientWidth;
        let pageHeight = document.documentElement.clientHeight;
        canvas.width = pageWidth;
        canvas.height = pageHeight;
    }
}