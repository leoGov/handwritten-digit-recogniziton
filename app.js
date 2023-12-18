"use strict";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
let isDragging = false;
let isModelLoaded = false;
let pos = { x: 0, y: 0 };
let model;

// Event listeners for mouse interactions
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);

// Event listeners for touch interactions
canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('touchend', handleEnd);

function handleStart(e) {
    isDragging = true;
    setPosition(e);
}

function handleEnd() {
    isDragging = false;
}

function setPosition(e) {
    const { clientX, clientY } = isTouchDevice() ? e.touches[0] : e;
    pos.x = clientX - ctx.canvas.offsetLeft;
    pos.y = clientY - ctx.canvas.offsetTop;
}

function handleMove(e) {
    e.preventDefault();
    e.stopPropagation();

    if (isDragging) {
        ctx.beginPath();
        ctx.lineWidth = 40;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'red';

        ctx.moveTo(pos.x, pos.y);
        setPosition(e);
        ctx.lineTo(pos.x, pos.y);

        ctx.stroke();
    }
}

function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = "Нарисованая цифра: ";
}

async function loadModel() {
    if (!model) {
        model = await tf.loadLayersModel('model/model.json');
        model.predict(tf.zeros([1, 28, 28, 1]));
        isModelLoaded = true;
    }
    return model;
}

function getImageData() {
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

async function predictModel() {
    if (!isModelLoaded) {
        await loadModel();
    }

    const imageData = getImageData();
    const image = tf.browser.fromPixels(imageData);
    const resizedImage = tf.image.resizeBilinear(image, [28, 28]).sum(2).expandDims(0).expandDims(-1);
    const prediction = await model.predict(resizedImage);
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = "Нарисованая цифра: " + prediction.argMax(1).dataSync();
}

// Load the model on page load
(async () => {
    await loadModel();
})();
