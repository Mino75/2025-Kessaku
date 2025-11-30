// main.js - Mobile-first Image Editor with Canvas Sizing
class ImageObject {
    constructor(type, data) {
        this.id = Date.now() + Math.random();
        this.type = type;
        this.x = 50;
        this.y = 50;
        this.width = 200;
        this.height = 200;
        this.rotation = 0;
        this.visible = true;
        this.zIndex = 0;
        this.data = data;
        this.selected = false;
        
        if (type === 'image' && data.image) {
            this.aspectRatio = data.image.width / data.image.height;
            this.height = this.width / this.aspectRatio;
        }
    }

    setSize(width, height, maintainAspectRatio = true) {
        if (maintainAspectRatio && this.aspectRatio) {
            this.width = width;
            this.height = width / this.aspectRatio;
        } else {
            this.width = width;
            this.height = height;
        }
    }

    contains(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    draw(ctx) {
        if (!this.visible) return;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

        if (this.type === 'image' && this.data.image) {
            ctx.drawImage(this.data.image, this.x, this.y, this.width, this.height);
        } else if (this.type === 'shape') {
            ctx.fillStyle = this.data.color || '#667eea';
            if (this.data.shape === 'rectangle') {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            } else if (this.data.shape === 'circle') {
                ctx.beginPath();
                const radius = Math.min(this.width, this.height) / 2;
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, radius, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        if (this.selected) {
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.setLineDash([]);
            
            const handleSize = 10;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 2;
            
            [[this.x, this.y], [this.x + this.width, this.y],
             [this.x, this.y + this.height], [this.x + this.width, this.y + this.height]]
            .forEach(([hx, hy]) => {
                ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
                ctx.strokeRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
            });
        }

        ctx.restore();
    }
}

class ImageEditor {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.objects = [];
        this.selectedObject = null;
        this.history = [];
        this.historyStep = -1;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.currentTool = 'select';
        this.color = '#667eea';
        this.brushSize = 5;
        this.opacity = 1;
        
        this.init();
    }

    init() {
        this.setCanvasSize(1080, 1080);
        this.setupEventListeners();
        this.updateDimensionDisplay();
        this.saveState();
    }

    setCanvasSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.clearCanvas();
        this.render();
    }

    updateDimensionDisplay() {
        const display = document.getElementById('canvasDimensions');
        display.textContent = `${this.canvas.width} × ${this.canvas.height} px`;
    }

    setupEventListeners() {
        // Mobile menu
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('mobileMenu').classList.add('active');
        });

        document.getElementById('menuClose').addEventListener('click', () => {
            document.getElementById('mobileMenu').classList.remove('active');
        });

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = { clientX: touch.clientX, clientY: touch.clientY };
            this.handleMouseDown(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = { clientX: touch.clientX, clientY: touch.clientY };
            this.handleMouseMove(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleMouseUp();
        });

        // Tools
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTool = e.target.dataset.tool;
            });
        });

        // Color
        document.getElementById('colorPicker').addEventListener('input', (e) => {
            this.color = e.target.value;
        });

        // Brush size
        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.brushSize = e.target.value;
            document.getElementById('sizeValue').textContent = e.target.value;
        });

        // Opacity
        document.getElementById('opacity').addEventListener('input', (e) => {
            this.opacity = e.target.value / 100;
            document.getElementById('opacityValue').textContent = e.target.value;
        });

        // Brightness/Contrast display
        document.getElementById('brightness').addEventListener('input', (e) => {
            document.getElementById('brightValue').textContent = e.target.value;
        });
        document.getElementById('contrast').addEventListener('input', (e) => {
            document.getElementById('contrastValue').textContent = e.target.value;
        });

        // Actions
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('deleteBtn').addEventListener('click', () => this.deleteSelected());

        // File operations
        const imageInput = document.getElementById('imageInput');
        document.getElementById('openBtn').addEventListener('click', () => {
            imageInput.click();
            this.closeMenu();
        });
        document.getElementById('openBtn2').addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', (e) => {
            Array.from(e.target.files).forEach(file => this.loadImage(file));
            e.target.value = '';
        });

        document.getElementById('newBtn').addEventListener('click', () => {
            this.newProject();
            this.closeMenu();
        });

        // Resize canvas
        document.getElementById('resizeBtn').addEventListener('click', () => {
            this.showResizeModal();
            this.closeMenu();
        });

        document.getElementById('resizeApply').addEventListener('click', () => {
            const width = parseInt(document.getElementById('canvasWidth').value);
            const height = parseInt(document.getElementById('canvasHeight').value);
            if (width > 0 && height > 0) {
                this.setCanvasSize(width, height);
                this.updateDimensionDisplay();
                this.closeModal('resizeModal');
            }
        });

        document.getElementById('resizeCancel').addEventListener('click', () => {
            this.closeModal('resizeModal');
        });

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('canvasWidth').value = btn.dataset.width;
                document.getElementById('canvasHeight').value = btn.dataset.height;
            });
        });

        // Export
        document.getElementById('exportMenuBtn').addEventListener('click', () => {
            this.showExportModal();
            this.closeMenu();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportImage();
            this.closeModal('exportModal');
        });

        document.getElementById('exportCancel').addEventListener('click', () => {
            this.closeModal('exportModal');
        });

        // Z-index
        document.getElementById('bringFront').addEventListener('click', () => this.bringToFront());
        document.getElementById('sendBack').addEventListener('click', () => this.sendToBack());
        document.getElementById('moveUp').addEventListener('click', () => this.moveUp());
        document.getElementById('moveDown').addEventListener('click', () => this.moveDown());

        // Add objects
        document.getElementById('addRectBtn').addEventListener('click', () => this.addRectangle());

        // Object properties
        ['objWidth', 'objHeight'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updateObjectSize());
        });
        ['objX', 'objY'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updateObjectPosition());
        });
        document.getElementById('objRotation').addEventListener('input', (e) => {
            if (this.selectedObject) {
                this.selectedObject.rotation = parseInt(e.target.value);
                document.getElementById('rotValue').textContent = e.target.value;
                this.render();
            }
        });

        // Filters
        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());
        document.getElementById('resetFilters').addEventListener('click', () => this.resetFilters());

        // Effects
        document.querySelectorAll('.effect-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.applyEffect(e.target.dataset.effect));
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && this.selectedObject) {
                this.deleteSelected();
            }
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    this.undo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    this.redo();
                }
            }
        });
    }

    closeMenu() {
        document.getElementById('mobileMenu').classList.remove('active');
    }

    showResizeModal() {
        document.getElementById('canvasWidth').value = this.canvas.width;
        document.getElementById('canvasHeight').value = this.canvas.height;
        document.getElementById('resizeModal').classList.add('active');
    }

    showExportModal() {
        document.getElementById('exportModal').classList.add('active');
    }

    closeModal(id) {
        document.getElementById(id).classList.remove('active');
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);

        if (this.currentTool === 'select') {
            let found = false;
            for (let i = this.objects.length - 1; i >= 0; i--) {
                if (this.objects[i].contains(pos.x, pos.y)) {
                    this.selectObject(this.objects[i]);
                    this.isDragging = true;
                    this.dragStart = { x: pos.x - this.selectedObject.x, y: pos.y - this.selectedObject.y };
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.selectObject(null);
            }
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.selectedObject) return;

        const pos = this.getMousePos(e);
        this.selectedObject.x = pos.x - this.dragStart.x;
        this.selectedObject.y = pos.y - this.dragStart.y;
        this.render();
        this.updatePropertyInputs();
    }

    handleMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.saveState();
        }
    }

    selectObject(obj) {
        this.objects.forEach(o => o.selected = false);
        this.selectedObject = obj;
        if (obj) {
            obj.selected = true;
        }
        this.render();
        this.updateObjectsList();
        this.updatePropertyInputs();
    }

    addRectangle() {
        const rect = new ImageObject('shape', {
            shape: 'rectangle',
            color: this.color
        });
        rect.zIndex = this.objects.length;
        this.objects.push(rect);
        this.selectObject(rect);
        this.updateObjectsList();
        this.render();
        this.saveState();
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const imgObj = new ImageObject('image', { image: img });
                imgObj.zIndex = this.objects.length;
                
                const maxWidth = this.canvas.width * 0.6;
                const maxHeight = this.canvas.height * 0.6;
                
                if (imgObj.width > maxWidth || imgObj.height > maxHeight) {
                    const scale = Math.min(maxWidth / imgObj.width, maxHeight / imgObj.height);
                    imgObj.setSize(imgObj.width * scale, imgObj.height * scale, true);
                }
                
                this.objects.push(imgObj);
                this.selectObject(imgObj);
                this.updateObjectsList();
                this.render();
                this.saveState();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    deleteSelected() {
        if (this.selectedObject) {
            const index = this.objects.indexOf(this.selectedObject);
            if (index > -1) {
                this.objects.splice(index, 1);
                this.selectedObject = null;
                this.updateObjectsList();
                this.render();
                this.saveState();
            }
        }
    }

    bringToFront() {
        if (!this.selectedObject) return;
        const maxZ = Math.max(...this.objects.map(o => o.zIndex), 0);
        this.selectedObject.zIndex = maxZ + 1;
        this.sortObjectsByZIndex();
        this.render();
        this.saveState();
    }

    sendToBack() {
        if (!this.selectedObject) return;
        const minZ = Math.min(...this.objects.map(o => o.zIndex), 0);
        this.selectedObject.zIndex = minZ - 1;
        this.sortObjectsByZIndex();
        this.render();
        this.saveState();
    }

    moveUp() {
        if (!this.selectedObject) return;
        this.selectedObject.zIndex += 1;
        this.sortObjectsByZIndex();
        this.render();
        this.saveState();
    }

    moveDown() {
        if (!this.selectedObject) return;
        this.selectedObject.zIndex -= 1;
        this.sortObjectsByZIndex();
        this.render();
        this.saveState();
    }

    sortObjectsByZIndex() {
        this.objects.sort((a, b) => a.zIndex - b.zIndex);
        this.updateObjectsList();
    }

    updateObjectsList() {
        const list = document.getElementById('objectsList');
        list.innerHTML = '';

        if (this.objects.length === 0) {
            list.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No objects</div>';
            return;
        }

        [...this.objects].reverse().forEach((obj) => {
            const item = document.createElement('div');
            item.className = 'object-item' + (obj.selected ? ' selected' : '') + (obj.visible ? '' : ' hidden');
            
            const name = obj.type === 'image' ? 'Image' : 
                        obj.type === 'shape' ? `${obj.data.shape}` : 'Object';
            
            item.innerHTML = `
                <div class="object-info">
                    <div class="object-name">${name} #${obj.id.toString().slice(-4)}</div>
                    <div class="object-details">Z:${obj.zIndex} | ${Math.round(obj.width)}×${Math.round(obj.height)}px</div>
                </div>
                <div class="object-controls">
                    <button onclick="editor.toggleVisibility('${obj.id}')">${obj.visible ? '👁' : '👁‍🗨'}</button>
                    <button class="delete-btn" onclick="editor.deleteObject('${obj.id}')">×</button>
                </div>
            `;
            
            item.onclick = (e) => {
                if (!e.target.closest('button')) {
                    this.selectObject(obj);
                }
            };
            
            list.appendChild(item);
        });
    }

    toggleVisibility(id) {
        const obj = this.objects.find(o => o.id.toString() === id.toString());
        if (obj) {
            obj.visible = !obj.visible;
            this.updateObjectsList();
            this.render();
        }
    }

    deleteObject(id) {
        const index = this.objects.findIndex(o => o.id.toString() === id.toString());
        if (index > -1) {
            this.objects.splice(index, 1);
            if (this.selectedObject && this.selectedObject.id.toString() === id.toString()) {
                this.selectedObject = null;
            }
            this.updateObjectsList();
            this.render();
            this.saveState();
        }
    }

    updatePropertyInputs() {
        const props = ['objWidth', 'objHeight', 'objX', 'objY', 'objRotation'];
        
        if (this.selectedObject) {
            document.getElementById('objWidth').value = Math.round(this.selectedObject.width);
            document.getElementById('objHeight').value = Math.round(this.selectedObject.height);
            document.getElementById('objX').value = Math.round(this.selectedObject.x);
            document.getElementById('objY').value = Math.round(this.selectedObject.y);
            document.getElementById('objRotation').value = this.selectedObject.rotation;
            document.getElementById('rotValue').textContent = this.selectedObject.rotation;
            
            props.forEach(id => document.getElementById(id).disabled = false);
        } else {
            props.forEach(id => {
                document.getElementById(id).value = '';
                document.getElementById(id).disabled = true;
            });
            document.getElementById('rotValue').textContent = '0';
        }
    }

    updateObjectSize() {
        if (this.selectedObject) {
            const width = parseInt(document.getElementById('objWidth').value);
            this.selectedObject.setSize(width, 0, this.selectedObject.type === 'image');
            this.render();
            this.updatePropertyInputs();
        }
    }

    updateObjectPosition() {
        if (this.selectedObject) {
            this.selectedObject.x = parseInt(document.getElementById('objX').value);
            this.selectedObject.y = parseInt(document.getElementById('objY').value);
            this.render();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.objects.forEach(obj => obj.draw(this.ctx));
    }

    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    newProject() {
        if (confirm('Create new project? Unsaved work will be lost.')) {
            this.objects = [];
            this.selectedObject = null;
            this.history = [];
            this.historyStep = -1;
            this.clearCanvas();
            this.updateObjectsList();
            this.saveState();
        }
    }

    saveState() {
        this.historyStep++;
        if (this.historyStep < this.history.length) {
            this.history.length = this.historyStep;
        }
        this.history.push(this.canvas.toDataURL());
        if (this.history.length > 30) {
            this.history.shift();
            this.historyStep--;
        }
    }

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.restoreState();
        }
    }

    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.restoreState();
        }
    }

    restoreState() {
        const img = new Image();
        img.src = this.history[this.historyStep];
        img.onload = () => {
            this.clearCanvas();
            this.ctx.drawImage(img, 0, 0);
        };
    }

    applyFilters() {
        if (!this.selectedObject || this.selectedObject.type !== 'image') return;

        const brightness = document.getElementById('brightness').value;
        const contrast = document.getElementById('contrast').value;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.selectedObject.data.image.width;
        tempCanvas.height = this.selectedObject.data.image.height;
        
        tempCtx.drawImage(this.selectedObject.data.image, 0, 0);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        const brightnessFactor = brightness / 100;
        const contrastFactor = (259 * (parseFloat(contrast) + 255)) / (255 * (259 - parseFloat(contrast)));

        for (let i = 0; i < data.length; i += 4) {
            data[i] += brightnessFactor * 255;
            data[i + 1] += brightnessFactor * 255;
            data[i + 2] += brightnessFactor * 255;

            data[i] = contrastFactor * (data[i] - 128) + 128;
            data[i + 1] = contrastFactor * (data[i + 1] - 128) + 128;
            data[i + 2] = contrastFactor * (data[i + 2] - 128) + 128;

            data[i] = Math.max(0, Math.min(255, data[i]));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
        }

        tempCtx.putImageData(imageData, 0, 0);
        
        const newImg = new Image();
        newImg.src = tempCanvas.toDataURL();
        newImg.onload = () => {
            this.selectedObject.data.image = newImg;
            this.render();
            this.saveState();
        };
    }

    resetFilters() {
        document.getElementById('brightness').value = 0;
        document.getElementById('contrast').value = 0;
        document.getElementById('brightValue').textContent = '0';
        document.getElementById('contrastValue').textContent = '0';
    }

    applyEffect(effect) {
        if (!this.selectedObject || this.selectedObject.type !== 'image') return;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.selectedObject.data.image.width;
        tempCanvas.height = this.selectedObject.data.image.height;
        
        tempCtx.drawImage(this.selectedObject.data.image, 0, 0);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        switch(effect) {
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    data[i] = data[i + 1] = data[i + 2] = gray;
                }
                break;
            
            case 'invert':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }
                break;
            
            case 'sepia':
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                    data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                    data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                }
                break;
        }

        tempCtx.putImageData(imageData, 0, 0);
        
        const newImg = new Image();
        newImg.src = tempCanvas.toDataURL();
        newImg.onload = () => {
            this.selectedObject.data.image = newImg;
            this.render();
            this.saveState();
        };
    }

    exportImage() {
        const format = document.getElementById('exportFormat').value;
        const wasSelected = this.selectedObject;
        this.selectObject(null);
        
        switch(format) {
            case 'png':
            case 'jpeg':
            case 'webp':
                this.exportRaster(format);
                break;
            case 'svg':
                this.exportSVG();
                break;
        }
        
        if (wasSelected) {
            this.selectObject(wasSelected);
        }
    }

    exportRaster(format) {
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                        format === 'webp' ? 'image/webp' : 'image/png';
        const quality = format === 'jpeg' ? 0.95 : undefined;
        
        const link = document.createElement('a');
        link.download = `export-${Date.now()}.${format}`;
        link.href = this.canvas.toDataURL(mimeType, quality);
        link.click();
    }

    exportSVG() {
        let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${this.canvas.width}" height="${this.canvas.height}">
    <rect width="100%" height="100%" fill="white"/>
`;

        this.objects.forEach(obj => {
            if (!obj.visible) return;
            
            const transform = `rotate(${obj.rotation} ${obj.x + obj.width/2} ${obj.y + obj.height/2})`;
            
            if (obj.type === 'image' && obj.data.image) {
                svg += `    <image x="${obj.x}" y="${obj.y}" width="${obj.width}" height="${obj.height}" 
                       transform="${transform}" 
                       xlink:href="${obj.data.image.src}" preserveAspectRatio="none"/>\n`;
            } else if (obj.type === 'shape') {
                if (obj.data.shape === 'rectangle') {
                    svg += `    <rect x="${obj.x}" y="${obj.y}" width="${obj.width}" height="${obj.height}" 
                           fill="${obj.data.color}" transform="${transform}"/>\n`;
                }
            }
        });

        svg += '</svg>';

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = `export-${Date.now()}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
    }
}

let editor;
window.addEventListener('DOMContentLoaded', () => {
    editor = new ImageEditor();
});
