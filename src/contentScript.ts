import browser from 'webextension-polyfill';

const MIN_LENS_SIZE = 50;
const MAX_LENS_SIZE = window.innerWidth;
const MIN_ZOOM_LEVEL = 1;
const MAX_ZOOM_LEVEL = 10;

const DEFAULT_BORDER_RADIUS = 0;
const DEFAULT_LENS_SIZE = 300;
const DEFAULT_ZOOM_LEVEL = 2;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let img: HTMLImageElement | null = null;

let zoomLevel: number;
let lensSize: number;
let borderRadius: number;

let didSettingsChange = false;

browser.storage.local.get().then((settings) => {
    zoomLevel = settings.zoomLevel || DEFAULT_ZOOM_LEVEL;
    lensSize = settings.lensSize || DEFAULT_LENS_SIZE;
    borderRadius = settings.borderRadius || DEFAULT_BORDER_RADIUS;
});

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

        e.preventDefault();
        e.stopImmediatePropagation();

        // Cannot set stylesheets when viewing images from pbs.twimg.com because of CORS policy
        if (window.location.hostname === 'twitter.com') {
            document.styleSheets[0].insertRule('img { cursor: none; }', 0);
        }

        img = e.target;
        createCanvas();
        updateCanvas(e);
    },
    { capture: true, passive: false },
);

document.addEventListener(
    'click',
    (e) => {
        if (!canvas) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        // Cannot set stylesheets when viewing images from pbs.twimg.com because of CORS policy
        if (window.location.hostname === 'twitter.com') {
            document.styleSheets[0].deleteRule(0);
        }

        img = null;
        removeCanvas();

        if (didSettingsChange) {
            browser.storage.local.set({ zoomLevel, lensSize, borderRadius });
            didSettingsChange = false;
        }
    },
    { capture: true, passive: false },
);

document.addEventListener('mousemove', (e) => {
    if (!canvas) return;
    updateCanvas(e);
});

document.addEventListener(
    'wheel',
    (e) => {
        if (!canvas || !img) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        didSettingsChange = true;

        if (e.ctrlKey) {
            lensSize += e.deltaY * -0.1;
            if (lensSize < MIN_LENS_SIZE) lensSize = MIN_LENS_SIZE;
            if (lensSize > MAX_LENS_SIZE) lensSize = MAX_LENS_SIZE;
            updateCanvas(e);
        } else {
            zoomLevel += e.deltaY * -0.005;
            if (zoomLevel < MIN_ZOOM_LEVEL) zoomLevel = MIN_ZOOM_LEVEL;
            if (zoomLevel > MAX_ZOOM_LEVEL) zoomLevel = MAX_ZOOM_LEVEL;
            updateCanvas(e);
        }
    },
    { capture: true, passive: false },
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
