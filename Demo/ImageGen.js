const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const downloadLink = document.getElementById("downloadLink");
const overlay = document.getElementById("overlay");

function makeRng(seed) {
    let x = seed | 0;
    return () => {
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        return (x >>> 0) / 0xFFFFFFFF;
    };
}

async function sha512Seed(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    let seed = 0;
    for (let i = 0; i < hashArray.length; i++) {
        seed ^= (hashArray[i] << (i % 24));
    }
    return seed >>> 0;
}

function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
}

function fileToSeed(file, callback) {
    const reader = new FileReader();
    reader.onload = async e => {
        const text = e.target.result;
        const hash = await sha512Seed(text);
        const rng = makeRng(hash);
        const angle = Math.floor(rng() * 360);
        const gradientType = rng() > 0.5 ? "linear" : "radial";
        const hue1 = Math.floor(rng() * 360);
        const hue2 = Math.floor(rng() * 360);
        const sat1 = 50 + rng() * 50;
        const sat2 = 50 + rng() * 50;
        const light1 = 40 + rng() * 20;
        const light2 = 40 + rng() * 20;
        const color1 = hslToRgb(hue1, sat1, light1);
        const color2 = hslToRgb(hue2, sat2, light2);
        callback({ rng, angle, gradientType, color1, color2 });
    };
    reader.readAsText(file);
}

function generateImage({ rng, angle, gradientType, color1, color2 }) {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    const rad = angle * Math.PI / 180;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            let t;
            if (gradientType === "linear") {
                const dx = x - cx;
                const dy = y - cy;
                const proj = dx * Math.cos(rad) + dy * Math.sin(rad);
                t = (proj / (canvas.width / 2)) * 0.5 + 0.5;
            } else {
                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                t = dist / (Math.sqrt(cx * cx + cy * cy));
            }
            t = Math.max(0, Math.min(1, t));
            const r = Math.floor(color1[0] * (1 - t) + color2[0] * t);
            const g = Math.floor(color1[1] * (1 - t) + color2[1] * t);
            const b = Math.floor(color1[2] * (1 - t) + color2[2] * t);
            const noise = (rng() - 0.5) * 60;
            data[i] = Math.max(0, Math.min(255, r + noise));
            data[i + 1] = Math.max(0, Math.min(255, g + noise));
            data[i + 2] = Math.max(0, Math.min(255, b + noise));
            data[i + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = "noise_gradient.png";
        downloadLink.textContent = "生成した画像を保存";
        overlay.style.visibility = "hidden";
    }, "image/png");
}
document.getElementById("fileInput").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    overlay.style.visibility = "visible";
    fileToSeed(file, params => {
        generateImage(params);
    });

});
