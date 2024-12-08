$(document).ready(function() {
    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');
    let gridSize = 32;
    let pixelSize = 10;
    let currentColor = '#000000';
    let currentTool = 'pencil';
    let isDrawing = false;

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetWidth;
        pixelSize = canvas.width / gridSize;
        drawGrid();
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#e5e5e5';
        
        for (let i = 0; i <= gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * pixelSize, 0);
            ctx.lineTo(i * pixelSize, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * pixelSize);
            ctx.lineTo(canvas.width, i * pixelSize);
            ctx.stroke();
        }
    }

    function drawPixel(x, y) {
        const pixelX = Math.floor(x / pixelSize);
        const pixelY = Math.floor(y / pixelSize);
        
        if (currentTool === 'pencil') {
            ctx.fillStyle = currentColor;
            ctx.fillRect(pixelX * pixelSize, pixelY * pixelSize, pixelSize, pixelSize);
        } else if (currentTool === 'eraser') {
            ctx.clearRect(pixelX * pixelSize, pixelY * pixelSize, pixelSize, pixelSize);
        }
    }

    function fillArea(x, y, targetColor) {
        const pixelX = Math.floor(x / pixelSize);
        const pixelY = Math.floor(y / pixelSize);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const stack = [[pixelX, pixelY]];

        while (stack.length > 0) {
            const [x, y] = stack.pop();
            if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue;

            const index = (y * gridSize + x) * 4;
            if (imageData.data[index + 3] !== targetColor[3] ||
                imageData.data[index] !== targetColor[0] ||
                imageData.data[index + 1] !== targetColor[1] ||
                imageData.data[index + 2] !== targetColor[2]) continue;

            ctx.fillStyle = currentColor;
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }

    function eyedropper(x, y) {
        const pixelX = Math.floor(x / pixelSize);
        const pixelY = Math.floor(y / pixelSize);
        const imageData = ctx.getImageData(pixelX * pixelSize, pixelY * pixelSize, 1, 1).data;
        currentColor = `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
        $('#colorPicker').val(rgbToHex(imageData[0], imageData[1], imageData[2]));
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    $('#pixelCanvas').on('mousedown touchstart', function(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.originalEvent.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.originalEvent.touches[0].clientY) - rect.top;

        if (currentTool === 'fill') {
            const imageData = ctx.getImageData(x, y, 1, 1).data;
            fillArea(x, y, imageData);
        } else if (currentTool === 'eyedropper') {
            eyedropper(x, y);
        } else {
            drawPixel(x, y);
        }
    });

    $('#pixelCanvas').on('mousemove touchmove', function(e) {
        if (isDrawing && (currentTool === 'pencil' || currentTool === 'eraser')) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.originalEvent.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.originalEvent.touches[0].clientY) - rect.top;
            drawPixel(x, y);
        }
    });

    $(document).on('mouseup touchend', function() {
        isDrawing = false;
    });

    $('#colorPicker').on('input', function() {
        currentColor = $(this).val();
    });

    $('#gridSize').on('input', function() {
        gridSize = parseInt($(this).val());
        $('#gridSizeValue').text(`${gridSize} x ${gridSize}`);
        resizeCanvas();
    });

    $('.tool-btn').on('click', function() {
        $('.tool-btn').removeClass('active');
        $(this).addClass('active');
        currentTool = $(this).attr('id').replace('Tool', '');
    });

    $('#clearBtn').on('click', function() {
        if (confirm('Are you sure you want to clear the canvas?')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGrid();
        }
    });

    $('#downloadBtn').on('click', function() {
        const link = document.createElement('a');
        link.download = 'pixel-art.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    $(window).on('resize', resizeCanvas);
    resizeCanvas();
});

