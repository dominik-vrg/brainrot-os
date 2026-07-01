document.addEventListener('DOMContentLoaded', () => {

    //settings

    const storageKey = 'brainrotOS.settings';

    const defaultSettings = {
        accent: '#00ff41',
        wallpaper: 'default',
        sound: false,
        reduceMotion: false,
        showBoot: true
    };

    const wallpapers = {
        default: { a: '#5500ff', b: '#000000' },
        sunset: { a: '#ff5500', b: '#1a0000' },
        matrix: { a: '#003300', b: '#000000' },
        deepsea: { a: '#0044ff', b: '#000010' }
    };

    function loadSettings() {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return { ...defaultSettings };
            return { ...defaultSettings, ...JSON.parse(raw) };
        } catch (e) {
            return { ...defaultSettings };
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(settings));
        } catch (e) {
            // storage unavailable right now
        }
    }

    const settings = loadSettings();

    function applyAccent(hex) {
        document.documentElement.style.setProperty('--accent', hex);
        document.querySelectorAll('.swatch').forEach(sw => {
            sw.classList.toggle('active', sw.style.background === hexToRgbMatch(hex) || sw.getAttribute('style')?.includes(hex));
        });
    }

    function hexToRgbMatch(hex) {
        return hex;
    }

    function applyWallpaper(name) {
        const wp = wallpapers[name] || wallpapers.default;
        document.documentElement.style.setProperty('--wp-a', wp.a);
        document.documentElement.style.setProperty('--wp-b', wp.b);
        document.querySelectorAll('.wallpaper-swatch').forEach(sw => {
            sw.classList.toggle('active', sw.dataset.wallpaper === name);
        });
    }

    function applyReduceMotion(on) {
        document.documentElement.classList.toggle('reduce-motion', on);
        const toggle = document.getElementById('motion-toggle');
        if (toggle) toggle.checked = on;
    }

    function applySoundToggleUI(on) {
        const toggle = document.getElementById('sound-toggle');
        if (toggle) toggle.checked = on;
    }

    function applyBootToggleUI(on) {
        const toggle = document.getElementById('boot-toggle');
        if (toggle) toggle.checked = on;
    }

    function markActiveAccentSwatch(hex) {
        document.querySelectorAll('.swatch').forEach(sw => {
            const swHex = (sw.getAttribute('style') || '').match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
            sw.classList.toggle('active', swHex && ('#' + swHex[1]).toLowerCase() === hex.toLowerCase());
        });
    }

    function applyAllSettings() {
        document.documentElement.style.setProperty('--accent', settings.accent);
        markActiveAccentSwatch(settings.accent);
        applyWallpaper(settings.wallpaper);
        applyReduceMotion(settings.reduceMotion);
        applySoundToggleUI(settings.sound);
        applyBootToggleUI(settings.showBoot);
    }

    applyAllSettings();

    //sounds

    let audioCtx = null;

    function beep(freq = 440, duration = 0.06, type = 'square', volume = 0.04) {
        if (!settings.sound) return;
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.value = volume;
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            //ignore, unavailable audio
        }
    }

    const sounds = {
        open: () => beep(660, 0.07, 'square'),
        close: () => beep(220, 0.08, 'square'),
        click: () => beep(880, 0.04, 'square'),
        key: () => beep(440, 0.03, 'square')
    };

    //boot screen
    const bootLines = [
        "BRAINROT OS v67.420",
        "Copyright (c) 2026 Ohio Industries",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "Initializing SKIBIDI BIOS...",
        "Checking RAM ....................... 67GB [ OK ]",
        "Loading sigma.exe .................. [ OK ]",
        "Initializing rizz drivers ........... [ OK ]",
        "Calibrating aura levels ............. [ WARNING: LOW ]",
        "Mounting /dev/ohio .................. [ OK ]",
        "Starting NPC daemon ................. [ OK ]",
        "Applying fanum tax .................. [ 3 FILES STOLEN ]",
        "Detecting gyatt peripherals .......... [ NONE FOUND ]",
        "Mewing protocol ..................... [ ACTIVE ]",
        "Loading brainrot.core ............... [ OK ]",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "SYSTEM READY. WELCOME BACK KING 👑",
        "",
        "Starting desktop environment..."
    ];

    const bootScreen = document.getElementById('boot-screen');
    const bootTextEl = document.getElementById('boot-text');
    const bootCursor = document.querySelector('.boot-cursor');

    if (bootScreen && bootTextEl) {
        if (!settings.showBoot) {
            bootScreen.style.display = 'none';
        } else {
            let lineIndex = 0;

            function showNextLine() {
                if (lineIndex < bootLines.length) {
                    bootTextEl.textContent += bootLines[lineIndex] + '\n';
                    lineIndex++;
                    const line = bootLines[lineIndex - 1];
                    const delay = line === '' ? 180 : Math.random() * 90 + 60;
                    setTimeout(showNextLine, delay);
                } else {
                    if (bootCursor) bootCursor.style.display = 'none';
                    setTimeout(() => {
                        bootScreen.style.opacity = '0';
                        setTimeout(() => {
                            bootScreen.style.display = 'none';
                        }, 800);
                    }, 1000);
                }
            }

            showNextLine();
        }
    }
        
    // clock function
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US');
        const clockElement = document.querySelector('.clock');
        if (clockElement) clockElement.innerText = timeString;
    }

    updateClock();
    setInterval(updateClock, 1000);

    // date function
    function updateDate() {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const statusElement = document.querySelector('.status');
        if (statusElement) statusElement.innerText = dateString;
    }

    updateDate();
    setInterval(updateDate, 1000 * 60 * 60);

    //uptime in about panel

    const sessionStart = Date.now();

    function updateUptime() {
        const el = document.getElementById('uptime-display');
        if (!el) return;
        const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        el.textContent = `Brainrot Uptime: ${m}m ${s}s`;
    }

    updateUptime();
    setInterval(updateUptime, 1000);

    //window manager

    const allWindows = document.querySelectorAll('.window');

    function bringToFront(win) {
        allWindows.forEach(w => { w.style.zIndex = '100'; });
        win.style.zIndex = '1000';
    }

    function isOpen(win) {
        return win.style.display === 'flex';
    }

    function setDockRunning(windowId, running) {
        document.querySelectorAll(`.dock-icon[data-window="${windowId}"]`).forEach(d => {
            d.classList.toggle('running', running);
        });
    }

    function openWindow(windowId) {
        const win = document.getElementById(windowId);
        if (!win) return;
        const wasOpen = isOpen(win);
        win.style.display = 'flex';
        bringToFront(win);
        setDockRunning(windowId, true);
        if (!wasOpen) sounds.open();
    }
 
    function closeWindow(win) {
        win.style.display = 'none';
        win.classList.remove('maximized');
        setDockRunning(win.id, false);
        sounds.close();
    }

    function toggleMaximize(win) {
        win.classList.toggle('maximized');
    }

    function dockIconClicked(windowId) {
        const win = document.getElementById(windowId);
        if (!win) return;
        sounds.click();

        if (!isOpen(win)) {
            openWindow(windowId);
            return;
        }

        const isFrontmost = parseInt(win.style.zIndex || '100', 10) >= 1000;
        if (isFrontmost) {
            win.style.display = 'none';
        } else {
            win.style.display = 'flex';
            bringToFront(win);
        }
    }

    allWindows.forEach(win => {
        const header = win.querySelector('.window-header');
        if (!header) return;

        const closeBtn = win.querySelector('.traffic-light.close');
        const minBtn = win.querySelector('.traffic-light.minimize');
        const maxBtn = win.querySelector('.traffic-light.maximize');

        if (closeBtn) closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeWindow(win);
        });
        if (minBtn) minBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            win.style.display = 'none';
            sounds.close();
        });
        if (maxBtn) maxBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMaximize(win);
        });

        win.addEventListener('mousedown', () => bringToFront(win));

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
            if (e.target.closest('.traffic-light')) return;
            if (win.classList.contains('maximized')) return;

            bringToFront(win);

            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
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

                win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            }
        }

        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            header.style.cursor = 'grab';
        }
    });

    //desktop icons

    const icons = document.querySelectorAll('.icon');

    icons.forEach(icon => {
        icon.addEventListener('dblclick', () => {
            const windowId = icon.dataset.window || 'window-1';
            openWindow(windowId);
        });

        icon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openWindow(icon.dataset.window || 'window-1');
            }
        });
    });

    document.querySelector('.desktop')?.addEventListener('click', (e) => {
        if (!e.target.closest('.icon')) {
            icons.forEach(i => i.classList.remove('selected'));
        }
    });

    //dock

    document.querySelectorAll('.dock-icon').forEach(dockIcon => {
        dockIcon.addEventListener('click', () => {
            dockIconClicked(dockIcon.dataset.window);
        });
        dockIcon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dockIconClicked(dockIcon.dataset.window);
            }
        });
    });

    //desktop icons grid snapping
    const desktop = document.querySelector('.desktop');
    const cellSize = 144;
    const gridOffset = 20;

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
                if (!occupied.has(cellKey(col, row))) return { col, row };
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

    function layoutAllIcons() {
        occupied.clear();
        document.querySelectorAll('.icon').forEach(icon => {
            const free = findFreeCell();
            placeIcon(icon, free.col, free.row);
        });
    }

    layoutAllIcons();

    document.querySelectorAll('.icon').forEach(icon => {
        let dragging = false;
        let moved = false;
        let startX, startY, originLeft, originTop;

        icon.addEventListener('mousedown', (e) => {
            e.preventDefault();
            dragging = true;
            moved = false;
            startX = e.clientX;
            startY = e.clientY;
            originLeft = parseInt(icon.style.left, 10);
            originTop = parseInt(icon.style.top, 10);
            icon.style.zIndex = 10;
        });

        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) moved = true;
            icon.style.left = `${originLeft + (e.clientX - startX)}px`;
            icon.style.top = `${originTop + (e.clientY - startY)}px`;
        });

        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            dragging = false;
            icon.style.zIndex = '';

            if (!moved) {
                icons.forEach(i => { if (i !== icon) i.classList.remove('selected'); });
                icon.classList.toggle('selected');
                return;
            }

            const target = nearestCell(parseInt(icon.style.left), parseInt(icon.style.top));
            const targetKey = cellKey(target.col, target.row);
            const originKey = cellKey(icon.dataset.col, icon.dataset.row);

            if (targetKey !== originKey && occupied.has(targetKey)) {
                placeIcon(icon, parseInt(icon.dataset.col, 10), parseInt(icon.dataset.row, 10));
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
        const maxX = Math.max(0, desktopEl.clientWidth - 300);
        const maxY = Math.max(0, desktopEl.clientHeight - 120);

        const popup = document.createElement('div');
        popup.classList.add('error-popup');
        popup.style.left = `${Math.floor(Math.random() * maxX)}px`;
        popup.style.top = `${Math.floor(Math.random() * maxY)}px`;

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

    //calculator

    const calcDisplay = document.getElementById('calc-display');
    
    if (calcDisplay) {
        let current = '0';
        let previous = null;
        let operator = null;
        let justEvaluated = false;

        function render() {
            calcDisplay.textContent = current;
        }

        function inputDigit(d) {
            if (justEvaluated) {
                current = d;
                justEvaluated = false;
            } else {
                current = current === '0' ? d : current + d;
            }
        }

        function inputDecimal() {
            justEvaluated = false;
            if (!current.includes('.')) current += '.';
        }

        function chooseOperator(op) {
            if (operator && previous !== null) {
                evaluate();
            }
            previous = parseFloat(current);
            operator = op;
            current = '0';
            justEvaluated = false;
        }

        function evaluate() {
            if (operator === null || previous === null) return;
            const a = previous;
            const b = parseFloat(current);
            let result = 0;

            switch (operator) {
                case '+': result = a + b; break;
                case '-': result = a - b; break;
                case '*': result = a * b; break;
                case '/': result = b === 0 ? NaN : a / b; break;
                default: result = b;
            }

            current = Number.isNaN(result) ? 'Error' : trimNumber(result);
            previous = null;
            operator = null;
            justEvaluated = true;
        }

        function trimNumber(n) {
            const rounded = Math.round(n * 1e10) / 1e10;
            return String(rounded);
        }

        function clearAll() {
            current = '0';
            previous = null;
            operator = null;
            justEvaluated = false;
        }

        function backspace() {
            if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
                current = '0';
            } else {
                current = current.slice(0, -1);
            }
        }

        function percent() {
            current = trimNumber(parseFloat(current) / 100);
        }

        document.querySelectorAll('.calc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sounds.key();
                const val = btn.dataset.value;

                if (val === 'C') clearAll();
                else if (val === 'back') backspace();
                else if (val === '%') percent();
                else if (val === '=') evaluate();
                else if (val === '.') inputDecimal();
                else if (['+', '-', '*', '/'].includes(val)) chooseOperator(val);
                else inputDigit(val);

                render();
            });
        });

        render();
    }

    //settings app

    //tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`panel-${tab.dataset.tab}`)?.classList.add('active');
        });
    });

    function openSettingsToTab(tabName) {
        openWindow('window-5');
        document.querySelectorAll('.settings-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tabName);
        });
        document.querySelectorAll('.settings-panel').forEach(p => {
            p.classList.toggle('active', p.id === `panel-${tabName}`);
        });
    }

    document.querySelectorAll('.swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            const styleAttr = sw.getAttribute('style') || '';
            const match = styleAttr.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
            const hex = match ? '#' + match[1] : '#00ff41';
            settings.accent = hex;
            saveSettings();
            document.documentElement.style.setProperty('--accent', hex);
            markActiveAccentSwatch(hex);
            sounds.click();
        });
    });

    //wallpaper swacthes
    document.querySelectorAll('.wallpaper-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            settings.wallpaper = sw.dataset.wallpaper;
            saveSettings();
            applyWallpaper(settings.wallpaper);
            sounds.click();
        });
    });

    //reduce motion
    document.getElementById('motion-toggle')?.addEventListener('change', (e) => {
        settings.reduceMotion = e.target.checked;
        saveSettings();
        applyReduceMotion(settings.reduceMotion);
    });

    //sound effects
    document.getElementById('sound-toggle')?.addEventListener('change', (e) => {
        settings.sound = e.target.checked;
        saveSettings();
        if (settings.sound) beep(660, 0.07, 'square');
    });

    //bootscreen on load
    document.getElementById('boot-toggle')?.addEventListener('change', (e) => {
        settings.showBoot = e.target.checked;
        saveSettings();
    });

    //reset icon positions
    document.getElementById('reset-icons-btn')?.addEventListener('click', () => {
        layoutAllIcons();
        sounds.click();
    });

    //reset all settings
    document.getElementById('reset-settings-btn')?.addEventListener('click', () => {
        const sure = window.confirm('Reset all Brainrot OS settings to default?');
        if (!sure) return;
        try { localStorage.removeItem(storageKey); } catch (e) {/*ignore*/}
        location.reload();
    });

    //context menu (desktop right click)

    const contextMenu = document.getElementById('context-menu');
    const wallpaperOrder = ['default', 'sunset', 'matrix', 'deepsea'];

    function hideContextMenu() {
        contextMenu?.classList.add('hidden');
    }

    document.querySelector('.desktop')?.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (!contextMenu) return;

        contextMenu.classList.remove('hidden');
        
        const menuRect = contextMenu.getBoundingClientRect();
        const maxLeft = window.innerWidth - menuRect.width - 8;
        const maxTop = window.innerHeight - menuRect.height - 8;

        contextMenu.style.left = `${Math.min(e.clientX, maxLeft)}px`;
        contextMenu.style.top = `${Math.min(e.clientY, maxTop)}px`;
    });

    document.addEventListener('click', (e) => {
        if (contextMenu && !contextMenu.contains(e.target)) hideContextMenu();
    });

    document.getElementById('ctx-wallpaper')?.addEventListener('click', () => {
        const idx = wallpaperOrder.indexOf(settings.wallpaper);
        const next = wallpaperOrder[(idx + 1) % wallpaperOrder.length];
        settings.wallpaper = next;
        saveSettings();
        applyWallpaper(next);
        hideContextMenu();
    });

    document.getElementById('ctx-sound')?.addEventListener('click', () => {
        settings.sound = !settings.sound;
        saveSettings();
        applySoundToggleUI(settings.sound);
        if (settings.sound) beep(660, 0.07, 'square');
        hideContextMenu();
    });

    document.getElementById('ctx-spotlight')?.addEventListener('click', () => {
        hideContextMenu();
        openSpotlight();
    });

    document.getElementById('ctx-about')?.addEventListener('click', () => {
        hideContextMenu();
        openSettingsToTab('about');
    });

    document.getElementById('ctx-refresh')?.addEventListener('click', () => {
        layoutAllIcons();
        hideContextMenu();
        sounds.click();
    });

    //settings button, menu bar

    document.getElementById('settings-trigger')?.addEventListener('click', () => {
        openWindow('window-5');
    });

    //spotlight search

    const spotlightOverlay = document.getElementById('spotlight-overlay');
    const spotlightInput = document.getElementById('spotlight-input');
    const spotlightResults = document.getElementById('spotlight-results');

    function getApps() {
        return Array.from(document.querySelectorAll('.icon')).map(icon => {
            const label = icon.querySelector('.icon-label')?.textContent.trim() || 'app';
            const emoji = icon.querySelector('.icon-emoji');
            return {
                windowId: icon.dataset.window,
                label,
                glyph: emoji ? emoji.textContent : '📁'
            };
        });
    }

    let highlightedIndex = 0;

    function renderSpotlightResults(query) {
        if (!spotlightResults) return;
        const apps = getApps().filter(a => a.label.toLowerCase().includes(query.toLowerCase()));
        spotlightResults.innerHTML = '';
        highlightedIndex = 0;

        if (apps.length === 0) {
            spotlightResults.innerHTML = '<div class="spotlight-empty">no brainrot found</div>';
            return;
        }

        apps.forEach((app, i) => {
            const row = document.createElement('div');
            row.className = 'spotlight-result' + (i === 0 ? ' highlighted' : '');
            row.innerHTML = `<span class="sr-icon">${app.glyph}</span><span>${app.label}</span>`;
            row.addEventListener('click', () => {
                openWindow(app.windowId);
                closeSpotlight();
            });
            spotlightResults.appendChild(row);
        });
    }

    function openSpotlight() {
        if (!spotlightOverlay) return;
        spotlightOverlay.classList.remove('hidden');
        if (spotlightInput) {
            spotlightInput.value = '';
            spotlightInput.focus();
        }
        renderSpotlightResults('');
    }

    function closeSpotlight() {
        spotlightOverlay?.classList.add('hidden');
    }

    document.getElementById('spotlight-trigger')?.addEventListener('click', openSpotlight);

    spotlightInput?.addEventListener('input', (e) => renderSpotlightResults(e.target.value));

    spotlightInput?.addEventListener('keydown', (e) => {
        const rows = spotlightResults ? Array.from(spotlightResults.querySelectorAll('.spotlight-result')) : [];
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!rows.length) return;
                rows[highlightedIndex]?.classList.remove('highlighted');
                highlightedIndex = Math.min(highlightedIndex + 1, rows.length - 1);
                rows[highlightedIndex]?.classList.add('highlighted');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!rows.length) return;
                rows[highlightedIndex]?.classList.remove('highlighted');
                highlightedIndex = Math.max(highlightedIndex - 1, 0);
                rows[highlightedIndex]?.classList.add('highlighted');
            } else if (e.key === 'Enter') {
                rows[highlightedIndex]?.dispatchEvent(new Event('click'));
            } else if (e.key === 'Escape') {
                closeSpotlight();
            }
    });

    spotlightOverlay?.addEventListener('mousedown', (e) => {
        if (e.target === spotlightOverlay) closeSpotlight();
    });

    document.addEventListener('keydown', (e) => {
        const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
        if (cmdK) {
            e.preventDefault();
            spotlightOverlay?.classList.contains('hidden') ? openSpotlight() : closeSpotlight();
        } else if (e.key === 'Escape' && !spotlightOverlay?.classList.contains('hidden')) {
            closeSpotlight();
        }
    });

});