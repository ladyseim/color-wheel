// Color Wheel App - Main Application Logic

class ColorWheelApp {
    constructor() {
        this.canvas = document.getElementById('colorWheel');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.wheelCenter = document.getElementById('wheelCenter');
        this.wheelMarker = document.getElementById('wheelMarker');
        this.harmonyMarkersContainer = document.getElementById('harmonyMarkers');
        this.hexInput = document.getElementById('hexInput');
        this.currentColorSwatch = document.getElementById('currentColorSwatch');
        this.currentColorValue = document.getElementById('currentColorValue');
        this.paletteContainer = document.getElementById('colorPalette');
        this.paletteTitle = document.getElementById('paletteTitle');
        this.photoUpload = document.getElementById('photoUpload');
        this.photoPreview = document.getElementById('photoPreview');
        this.photoPreviewContainer = document.getElementById('photoPreviewContainer');
        
        this.currentColor = { h: 0, s: 100, l: 50 }; // Red
        this.harmonyMode = 'analogous';
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.drawColorWheel();
        this.setupEventListeners();
        this.updateColor(this.currentColor);
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const size = container.clientWidth;
        
        // Use 2x resolution for smoother rendering
        const scale = 2;
        this.canvas.width = size * scale;
        this.canvas.height = size * scale;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        
        this.centerX = (size * scale) / 2;
        this.centerY = (size * scale) / 2;
        this.radius = ((size * scale) / 2) - 10 * scale;
        
        // Scale the context to match
        this.ctx.scale(scale, scale);
    }

    drawColorWheel() {
        // Save the current transform
        this.ctx.save();
        // Reset scale for pixel manipulation
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const dx = x - this.centerX;
                const dy = y - this.centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= this.radius) {
                    const angle = Math.atan2(dy, dx);
                    const hue = ((angle * 180 / Math.PI) + 360) % 360;
                    const saturation = (distance / this.radius) * 100;
                    const lightness = 50;
                    
                    const rgb = this.hslToRgb(hue, saturation, lightness);
                    const index = (y * this.canvas.width + x) * 4;
                    
                    data[index] = rgb.r;
                    data[index + 1] = rgb.g;
                    data[index + 2] = rgb.b;
                    data[index + 3] = 255;
                }
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
        // Restore the transform
        this.ctx.restore();
    }

    setupEventListeners() {
        // Wheel interaction
        this.canvas.addEventListener('click', (e) => this.handleWheelClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleWheelClick(e.touches[0]);
        });

        // Hex input
        document.getElementById('applyHex').addEventListener('click', () => this.applyHexColor());
        this.hexInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.applyHexColor();
        });

        // Harmony mode buttons
        document.querySelectorAll('.harmony-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.harmony-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.harmonyMode = btn.dataset.mode;
                this.updatePalette();
                this.updateHarmonyMarkers(); // Update markers when harmony mode changes
            });
        });

        // Photo upload
        this.photoUpload.addEventListener('change', (e) => this.handlePhotoUpload(e));
        this.photoPreview.addEventListener('click', (e) => this.pickColorFromPhoto(e));
        this.photoPreview.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.pickColorFromPhoto(e.touches[0]);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.drawColorWheel();
            this.updateMarkerPosition();
        });
    }

    handleWheelClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scale = 2; // Match the canvas scale
        const x = (e.clientX - rect.left) * scale;
        const y = (e.clientY - rect.top) * scale;
        
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.radius) {
            const angle = Math.atan2(dy, dx);
            const hue = ((angle * 180 / Math.PI) + 360) % 360;
            const saturation = Math.min((distance / this.radius) * 100, 100);
            
            this.updateColor({ h: hue, s: saturation, l: 50 });
        }
    }

    handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            this.photoPreview.src = event.target.result;
            this.photoPreviewContainer.classList.add('active');
        };
        reader.readAsDataURL(file);
    }

    pickColorFromPhoto(e) {
        const rect = this.photoPreview.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create temporary canvas to read pixel data
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.photoPreview.naturalWidth;
        tempCanvas.height = this.photoPreview.naturalHeight;
        tempCtx.drawImage(this.photoPreview, 0, 0);

        // Calculate actual image coordinates
        const scaleX = this.photoPreview.naturalWidth / rect.width;
        const scaleY = this.photoPreview.naturalHeight / rect.height;
        const imageX = Math.floor(x * scaleX);
        const imageY = Math.floor(y * scaleY);

        const pixel = tempCtx.getImageData(imageX, imageY, 1, 1).data;
        const hsl = this.rgbToHsl(pixel[0], pixel[1], pixel[2]);
        
        this.updateColor(hsl);
        this.showToast('Color picked from photo!');
    }

    applyHexColor() {
        const hex = this.hexInput.value.trim();
        if (!hex.match(/^#?[0-9A-Fa-f]{6}$/)) {
            this.showToast('Invalid hex color');
            return;
        }

        const fullHex = hex.startsWith('#') ? hex : '#' + hex;
        const rgb = this.hexToRgb(fullHex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        this.updateColor(hsl);
    }

    updateColor(hsl) {
        this.currentColor = hsl;
        
        // Update UI
        const hex = this.hslToHex(hsl.h, hsl.s, hsl.l);
        this.hexInput.value = hex;
        this.currentColorValue.textContent = hex;
        this.currentColorSwatch.style.background = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        this.wheelCenter.style.background = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        
        this.updateMarkerPosition();
        this.updatePalette();
    }

    updateMarkerPosition() {
        const scale = 2; // Match the canvas scale
        const angle = (this.currentColor.h * Math.PI) / 180;
        const distance = (this.currentColor.s / 100) * this.radius;
        
        const x = (this.centerX + distance * Math.cos(angle)) / scale;
        const y = (this.centerY + distance * Math.sin(angle)) / scale;
        
        this.wheelMarker.style.left = `${x}px`;
        this.wheelMarker.style.top = `${y}px`;
        this.wheelMarker.style.background = `hsl(${this.currentColor.h}, ${this.currentColor.s}%, ${this.currentColor.l}%)`;
        
        // Update harmony markers
        this.updateHarmonyMarkers();
    }

    updateHarmonyMarkers() {
        // Clear existing markers
        this.harmonyMarkersContainer.innerHTML = '';
        
        // Get current harmony colors (excluding the base)
        const colors = this.getHarmonyColors(this.harmonyMode);
        const scale = 2; // Match the canvas scale
        
        colors.forEach((color, index) => {
            // Skip the base color (it's already shown with the main marker)
            if (color.role === 'Base' || color.role === 'Primary') return;
            
            const marker = document.createElement('div');
            marker.className = 'harmony-marker';
            
            const angle = (color.h * Math.PI) / 180;
            const distance = (color.s / 100) * this.radius;
            
            const x = (this.centerX + distance * Math.cos(angle)) / scale;
            const y = (this.centerY + distance * Math.sin(angle)) / scale;
            
            marker.style.left = `${x}px`;
            marker.style.top = `${y}px`;
            marker.style.background = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
            
            this.harmonyMarkersContainer.appendChild(marker);
        });
    }

    updatePalette() {
        const colors = this.getHarmonyColors(this.harmonyMode);
        const titles = {
            analogous: 'Analogous Harmony',
            monochromatic: 'Monochromatic Harmony',
            triadic: 'Triadic Harmony',
            complementary: 'Complementary Harmony',
            split: 'Split Complementary',
            square: 'Square Harmony',
            compound: 'Compound Harmony',
            shades: 'Shades'
        };
        
        this.paletteTitle.textContent = titles[this.harmonyMode];
        this.paletteContainer.innerHTML = '';
        
        colors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            
            const hex = this.hslToHex(color.h, color.s, color.l);
            
            swatch.innerHTML = `
                <div class="color-swatch-inner" style="background: hsl(${color.h}, ${color.s}%, ${color.l}%)">
                    <div class="color-role">${color.role}</div>
                    <div class="color-label">${hex}</div>
                </div>
            `;
            
            swatch.addEventListener('click', () => {
                this.updateColor({ h: color.h, s: color.s, l: color.l });
                this.showToast(`Switched to ${color.role}`);
            });
            
            this.paletteContainer.appendChild(swatch);
        });
    }

    getHarmonyColors(mode) {
        const base = this.currentColor;
        const colors = [];

        switch (mode) {
            case 'analogous':
                colors.push(
                    { h: (base.h - 60 + 360) % 360, s: base.s, l: base.l, role: 'Base' },
                    { h: (base.h - 30 + 360) % 360, s: base.s, l: base.l, role: 'Analog -30°' },
                    { ...base, role: 'Primary' },
                    { h: (base.h + 30) % 360, s: base.s, l: base.l, role: 'Analog +30°' },
                    { h: (base.h + 60) % 360, s: base.s, l: base.l, role: 'Analog +60°' }
                );
                break;

            case 'monochromatic':
                // Create a proper spread using available range on each side
                const stepDown = Math.min((base.l - 10) / 2, 20); // how much darker per step
                const stepUp = Math.min((95 - base.l) / 2, 20); // how much lighter per step
                
                colors.push(
                    { h: base.h, s: base.s, l: Math.max(10, base.l - stepDown * 2), role: 'Darker' },
                    { h: base.h, s: base.s, l: Math.max(10, base.l - stepDown), role: 'Dark' },
                    { ...base, role: 'Base' },
                    { h: base.h, s: base.s, l: Math.min(95, base.l + stepUp), role: 'Light' },
                    { h: base.h, s: base.s, l: Math.min(95, base.l + stepUp * 2), role: 'Lighter' }
                );
                break;

            case 'triadic':
                colors.push(
                    { ...base, role: 'Base' },
                    { h: (base.h + 120) % 360, s: base.s, l: base.l, role: 'Triad +120°' },
                    { h: (base.h + 240) % 360, s: base.s, l: base.l, role: 'Triad +240°' },
                    { h: (base.h + 120) % 360, s: Math.max(30, base.s - 20), l: base.l, role: 'Muted +120°' },
                    { h: (base.h + 240) % 360, s: Math.max(30, base.s - 20), l: base.l, role: 'Muted +240°' }
                );
                break;

            case 'complementary':
                const comp = (base.h + 180) % 360;
                colors.push(
                    { h: (base.h - 15 + 360) % 360, s: base.s, l: base.l, role: 'Base -15°' },
                    { ...base, role: 'Base' },
                    { h: (base.h + 15) % 360, s: base.s, l: base.l, role: 'Base +15°' },
                    { h: comp, s: base.s, l: base.l, role: 'Complement' },
                    { h: (comp + 15) % 360, s: base.s, l: base.l, role: 'Comp +15°' }
                );
                break;

            case 'split':
                colors.push(
                    { ...base, role: 'Base' },
                    { h: (base.h + 150) % 360, s: base.s, l: base.l, role: 'Split +150°' },
                    { h: (base.h + 210) % 360, s: base.s, l: base.l, role: 'Split +210°' },
                    { h: (base.h + 150) % 360, s: Math.max(40, base.s - 15), l: base.l, role: 'Muted +150°' },
                    { h: (base.h + 210) % 360, s: Math.max(40, base.s - 15), l: base.l, role: 'Muted +210°' }
                );
                break;

            case 'square':
                colors.push(
                    { ...base, role: 'Base' },
                    { h: (base.h + 90) % 360, s: base.s, l: base.l, role: 'Square +90°' },
                    { h: (base.h + 180) % 360, s: base.s, l: base.l, role: 'Square +180°' },
                    { h: (base.h + 270) % 360, s: base.s, l: base.l, role: 'Square +270°' },
                    { h: base.h, s: Math.max(30, base.s - 25), l: base.l, role: 'Muted Base' }
                );
                break;

            case 'compound':
                // Compound (complementary + analogous)
                const compoundComp = (base.h + 180) % 360;
                colors.push(
                    { ...base, role: 'Base' },
                    { h: (base.h + 30) % 360, s: base.s, l: base.l, role: 'Analog +30°' },
                    { h: (base.h - 30 + 360) % 360, s: base.s, l: base.l, role: 'Analog -30°' },
                    { h: compoundComp, s: base.s, l: base.l, role: 'Complement' },
                    { h: (compoundComp + 30) % 360, s: base.s, l: base.l, role: 'Comp +30°' }
                );
                break;

            case 'shades':
                // Create a proper spread using available range on each side
                const shadesStepDown = Math.min((base.l - 10) / 2, 20);
                const shadesStepUp = Math.min((95 - base.l) / 2, 20);
                
                colors.push(
                    { h: base.h, s: base.s, l: Math.max(10, base.l - shadesStepDown * 2), role: 'Very Dark' },
                    { h: base.h, s: base.s, l: Math.max(10, base.l - shadesStepDown), role: 'Dark' },
                    { ...base, role: 'Base' },
                    { h: base.h, s: base.s, l: Math.min(95, base.l + shadesStepUp), role: 'Light' },
                    { h: base.h, s: base.s, l: Math.min(95, base.l + shadesStepUp * 2), role: 'Very Light' }
                );
                break;
        }

        return colors;
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // Color conversion utilities
    hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (h >= 0 && h < 60) {
            r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
            r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
            r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
            r = x; g = 0; b = c;
        } else if (h >= 300 && h < 360) {
            r = c; g = 0; b = x;
        }

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        let s = 0;
        let l = (max + min) / 2;

        if (delta !== 0) {
            s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

            switch (max) {
                case r:
                    h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / delta + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / delta + 4) / 6;
                    break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    hslToHex(h, s, l) {
        const rgb = this.hslToRgb(h, s, l);
        return '#' + [rgb.r, rgb.g, rgb.b]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ColorWheelApp());
} else {
    new ColorWheelApp();
}
