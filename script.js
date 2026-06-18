document.addEventListener('DOMContentLoaded', () => {
        
    // clock function
    function UpdateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US');

        const clockElement = document.querySelector('.clock');
        if (clockElement) {
            clockElement.innerText = timeString;
        }
    }

    UpdateClock();
    setInterval(UpdateClock, 1000);

    // date function
    function UpdateDate() {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const statusElement = document.querySelector('.status');
        if (statusElement) {
            statusElement.innerText = dateString;
        }
    }

    UpdateDate();
    setInterval(UpdateDate, 1000 * 60 * 60);

    //draggable windows
    const allWindows = document.querySelectorAll('.window');

    allWindows.forEach(win => {
        const header = win.querySelector('.window-header')
        if (!header) return;

        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX = 0;
        let initialY = 0;
        let xOffset = 0;
        let yOffset = 0;
        
        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            allWindows.forEach(w => w.style.zIndex = "100");
            win.style.zIndex = "1000";

            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target == header || header.contains(e.target)) {
                isDragging = true
                header.style.cursor = 'grabbing';
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();

                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
            }
        }

        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            header.style.cursor = 'grab';
        }
    });

    //doubleclick
    const icons = document.querySelectorAll('.icon');

    icons.forEach(icon => {
        icon.addEventListener('dblclick', () => {
            const windowId = icon.dataset.window || 'window-1';
            const targetWindow = document.getElementById(windowId);
            if (targetWindow) {
                targetWindow.style.display = 'flex';
                targetWindow.style.zIndex = "1000";
            }
        });
    });

    //desktop icons grid snapping
    const desktop = document.querySelector('.desktop');
    const cellSize = 120;
    const gridOffset = 0;

    const occupied = new Set();
    const cellKey = (col, row) => `${col},${row}`;

    function getColumnsCount() {
        return Math.max(1, Math.floor(desktop.clientWidth / cellSize));
    }

    function findFreeCell() {
        const cols = getColumnsCount();
        let row = 0;
        while (true) {
            for (let col = 0; col < cols; col++) {
                if (!occupied.has(cellKey(col, row))) return {col, row};
            }
            row++;
        }
    }

    function placeIcon(icon, col, row) {
        icon.style.left = `${gridOffset + col * cellSize}px`;
        icon.style.top = `${gridOffset + row * cellSize}px`;
        icon.dataset.col = col;
        icon.dataset.row = row;
        occupied.add(cellKey(col, row));
    }

    function nearestCell(left, top) {
        return {
            col: Math.max(0, Math.round((left - gridOffset) / cellSize)),
            row: Math.max(0, Math.round((top - gridOffset) / cellSize))
        };
    }

    document.querySelectorAll('.icon').forEach(icon => {
        const free = findFreeCell();
        placeIcon(icon, free.col, free.row)
    });

    document.querySelectorAll('.icon').forEach(icon => {
        let dragging = false;
        let startX, startY, originLeft, originTop;

        icon.addEventListener('mousedown', (e) => {
            e.preventDefault();
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            originLeft = parseInt(icon.style.left, 10);
            originTop = parseInt(icon.style.top, 10);
            icon.style.zIndex = 10;
        });

        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            icon.style.left = `${originLeft + (e.clientX - startX)}px`
            icon.style.top = `${originTop + (e.clientY - startY)}px`
        });

        document.addEventListener('mouseup', () => {
            if(!dragging) return;
            dragging = false;
            icon.style.zIndex = '';

            const target = nearestCell(parseInt(icon.style.left), parseInt(icon.style.top));
            const targetKey = cellKey(target.col, target.row);
            const originKey = cellKey(icon.dataset.col, icon.dataset.row);

            if (targetKey !== originKey && occupied.has(targetKey)) {
                placeIcon(icon, parseInt(icon.dataset.col), parseInt(icon.dataset.row));
            } else {
                occupied.delete(originKey);
                placeIcon(icon, target.col, target.row);
            }
        });
    });

    // do not open app
    const brainrotMessages = [
        "SKIBIDI RIZZ OVERFLOW ERROR",
        "OHIO VIRUS DETECTED",
        "FANUM TAX APPLIED TO YOUR FILES",
        "SIGMA GRINDSET CORRUPTED",
        "GYATT.EXE HAS STOPPED WORKING",
        "WARNING: TOO MUCH RIZZ",
        "NPC BEHAVIOR DETECTED",
        "YOUR AURA IS NEGATIVE",
        "MEWING PROTOCOL FAILED",
        "CAUGHT IN 4K",
        "NO CAP DETECTED: CAP FOUND",
        "TOUCH GRASS IMMEDIATELY",
        "BRAIN.ROT FILE CORRUPTED",
        "DELULU LEVEL: MAXIMUM",
        "IT'S GIVING ERROR",
        "W RIZZ NOT FOUND",
        "SUSSY BEHAVIOR ALERT",
        "CHAT IS THIS REAL?",
        "BASED DEPARTMENT OFFLINE",
        "RIZZ SCORE: -999"
    ];

    const maxErrors = 15;
    let errorCount = 0;
    let spawnInterval = null;

    function spawnErrorWindow() {
        if (errorCount >= maxErrors) {
            clearInterval(spawnInterval);
            spawnInterval = null;
            return;
        }

        const msg = brainrotMessages[Math.floor(Math.random() * brainrotMessages.length)];
        const desktopEl = document.querySelector('.desktop');
        const maxX = desktopEl.clientWidth - 300;
        const maxY = desktopEl.clientHeight - 120;

        const popup = document.createElement('div');
        popup.classList.add('error-popup');
        popup.style.left = `${Math.floor(Math.random() * maxX)}px`
        popup.style.top = `${Math.floor(Math.random() * maxY)}px`

        popup.innerHTML = `
            <div class="error-header">
                <span>CRITICAL ERROR</span>
                <button class="error-close">X</button>
            </div>
            <div class="error-body">${msg}</div>
        `;

        popup.querySelector('.error-close').addEventListener('click', () => {
            popup.remove();
            errorCount--;
        });

        desktopEl.appendChild(popup);
        errorCount++;
    }

    const dontClickBtn = document.getElementById('dont-click-btn');
    if (dontClickBtn) {
        dontClickBtn.addEventListener('click', () => {
            if (spawnInterval || errorCount >= maxErrors) return;
            spawnInterval = setInterval(() => {
                spawnErrorWindow();
                if (errorCount >= maxErrors) {
                    clearInterval(spawnInterval);
                    spawnInterval = null;
                }
            }, 600);
        });
    }
});