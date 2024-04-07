let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let zoomLevel = 2;
let lensSize = 300;
let img: HTMLImageElement | null = null;

const minLensSize = 50;
const maxLensSize = window.innerWidth;
const minZoomLevel = 1;
const maxZoomLevel = 10;

const borderRadius = 50;

function createCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.width = lensSize;
    canvas.height = lensSize;
    canvas.style.position = 'fixed';
    canvas.style.pointerEvents = 'none';
    canvas.style.borderRadius = borderRadius + '%';
    canvas.style.boxShadow = '0 0 10px 5px rgba(0, 0, 0, 0.5)';
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');
}

function removeCanvas() {
    if (!canvas) return;
    document.body.removeChild(canvas);
    canvas.remove();
    canvas = null;
    ctx = null;
}

document.addEventListener(
    'mousedown',
    (e) => {
        if (!e.shiftKey || e.button !== 0) return;
        if (!(e.target instanceof HTMLImageElement)) return;
        document.styleSheets[0].insertRule('img { cursor: none; }', 0);
        e.preventDefault();
        e.stopImmediatePropagation();
        img = e.target;
        createCanvas();
        updateCanvas(e);
    },
    { capture: true, passive: false },
);

document.addEventListener('mouseup', (e) => {
    if (canvas) removeCanvas();
    document.styleSheets[0].deleteRule(0);
    img = null;
});

document.addEventListener('mousemove', (e) => {
    if (!canvas) return;
    updateCanvas(e);
});

document.addEventListener(
    'wheel',
    (e) => {
        if (!canvas || !img) return;
        e.preventDefault();
        if (e.ctrlKey) {
            lensSize += e.deltaY * -0.1;
            if (lensSize < minLensSize) lensSize = minLensSize;
            if (lensSize > maxLensSize) lensSize = maxLensSize;
            updateCanvas(e);
        } else {
            zoomLevel += e.deltaY * -0.005;
            if (zoomLevel < minZoomLevel) zoomLevel = minZoomLevel;
            if (zoomLevel > maxZoomLevel) zoomLevel = maxZoomLevel;
            updateCanvas(e);
        }
    },
    { passive: false },
);

function updateCanvas(e: MouseEvent) {
    if (!canvas || !ctx || !img) return;

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const sourceX = (x / rect.width) * img.naturalWidth - lensSize / (2 * zoomLevel);
    const sourceY = (y / rect.height) * img.naturalHeight - lensSize / (2 * zoomLevel);
    const sourceWidth = lensSize / zoomLevel;
    const sourceHeight = lensSize / zoomLevel;

    canvas.width = lensSize;
    canvas.height = lensSize;
    canvas.style.left = `${e.clientX - lensSize / 2}px`;
    canvas.style.top = `${e.clientY - lensSize / 2}px`;

    ctx.clearRect(0, 0, lensSize, lensSize);
    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, lensSize, lensSize);
}
