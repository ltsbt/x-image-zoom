let lens: HTMLElement | null = null;
let zoomLevel = 3;
let lensSize = 400;
let img: HTMLImageElement | null = null;
const borderWidth = 2;
const minLensSize = 100;
const minZoom = 1;
const maxZoom = 10;

function createLens() {
    if (lens) return;
    lens = document.createElement('div');
    lens.style.position = 'absolute';
    lens.style.border = borderWidth + 'px solid #fff';
    lens.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    lens.style.borderRadius = '50%';
    lens.style.width = lensSize + 'px';
    lens.style.height = lensSize + 'px';
    lens.style.overflow = 'hidden';
    lens.style.pointerEvents = 'none';
    lens.style.backgroundRepeat = 'no-repeat';
    document.body.appendChild(lens);
}

document.addEventListener(
    'mousedown',
    (e) => {
        if (!e.shiftKey || e.button !== 0) return;
        if (!(e.target instanceof HTMLImageElement)) return;
        e.preventDefault();
        e.stopPropagation();
        createLens();
        document.styleSheets[0].insertRule('img { cursor: none; }', 0);
        if (!lens) return;
        lens.style.display = 'block';
        img = e.target as HTMLImageElement;
        updateLens(e);
    },
    { passive: false, capture: true },
);

document.addEventListener('mouseup', () => {
    if (lens) lens.style.display = 'none';
    img = null;
    document.styleSheets[0].deleteRule(0);
});

document.addEventListener('mousemove', (e) => {
    updateLens(e);
});

document.addEventListener(
    'wheel',
    (e) => {
        if (!img || !lens) return;
        e.preventDefault();
        if (e.ctrlKey) {
            lensSize += e.deltaY * -0.1;
            if (lensSize < minLensSize) lensSize = minLensSize;
            if (lensSize > window.innerWidth) lensSize = window.innerWidth;
            lens.style.width = lensSize + 'px';
            lens.style.height = lensSize + 'px';
        } else {
            zoomLevel += e.deltaY * -0.01;
            if (zoomLevel < minZoom) zoomLevel = minZoom;
            if (zoomLevel > maxZoom) zoomLevel = maxZoom;
        }
        updateLens(e);
    },
    { passive: false },
);

function updateLens(e: MouseEvent) {
    if (!lens || !img) return;
    const rect = img.getBoundingClientRect();

    lens.style.backgroundImage = `url(${img.src})`;
    lens.style.backgroundSize = `${img.width * zoomLevel}px ${img.height * zoomLevel}px`;

    const bgx = (e.pageX - rect.left) * zoomLevel - lens.offsetWidth / 2 + borderWidth;
    const bgy = (e.pageY - rect.top) * zoomLevel - lens.offsetHeight / 2 + borderWidth;

    lens.style.backgroundPositionX = `-${bgx}px`;
    lens.style.backgroundPositionY = `-${bgy}px`;

    const imgX = e.clientX - rect.left;
    const imgY = e.clientY - rect.top;
    const lensX = imgX - lensSize / 2;
    const lensY = imgY - lensSize / 2;

    lens.style.left = rect.left + lensX + 'px';
    lens.style.top = rect.top + lensY + 'px';
}
