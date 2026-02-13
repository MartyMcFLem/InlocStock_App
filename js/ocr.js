/**
 * Module OCR pour extraire les numéros de série des images
 * Utilise Tesseract.js
 */

class OCRManager {
    constructor() {
        this.worker = null;
        this.isProcessing = false;
        this.onProgress = null;
        this.onComplete = null;
        this.onError = null;
    }

    /**
     * Initialiser le worker Tesseract
     */
    async init(language = 'eng') {
        if (this.worker) {
            return this.worker;
        }

        try {
            this.worker = await Tesseract.createWorker(language, 1, {
                logger: (m) => {
                    console.log('Tesseract:', m);
                    if (this.onProgress && m.status === 'recognizing text') {
                        this.onProgress(Math.round(m.progress * 100));
                    }
                }
            });

            console.log('Worker Tesseract initialisé');
            return this.worker;
        } catch (error) {
            console.error('Erreur d\'initialisation de Tesseract:', error);
            throw error;
        }
    }

    /**
     * Extraire le texte d'une image
     */
    async extractText(imageSource, options = {}) {
        if (this.isProcessing) {
            throw new Error('OCR déjà en cours de traitement');
        }

        this.isProcessing = true;

        try {
            // Initialiser si nécessaire
            if (!this.worker) {
                await this.init(options.language || 'eng');
            }

            // Pré-traiter l'image si nécessaire
            let processedImage = imageSource;
            if (options.preprocess) {
                processedImage = await this.preprocessImage(imageSource);
            }

            // Effectuer la reconnaissance
            const result = await this.worker.recognize(processedImage);
            
            this.isProcessing = false;

            // Extraire et nettoyer le texte
            const extractedText = result.data.text.trim();
            
            // Tenter d'extraire les numéros de série
            const serials = this.extractSerialNumbers(extractedText);

            return {
                text: extractedText,
                confidence: result.data.confidence,
                serials: serials,
                lines: result.data.lines.map(line => ({
                    text: line.text,
                    confidence: line.confidence
                }))
            };

        } catch (error) {
            this.isProcessing = false;
            console.error('Erreur OCR:', error);
            throw error;
        }
    }

    /**
     * Scanner une image depuis un fichier
     */
    async scanFile(file) {
        try {
            // Créer une URL pour l'image
            const imageUrl = URL.createObjectURL(file);
            
            // Extraire le texte
            const result = await this.extractText(imageUrl, { preprocess: true });
            
            // Libérer l'URL
            URL.revokeObjectURL(imageUrl);
            
            if (this.onComplete) {
                this.onComplete(result);
            }
            
            return result;
        } catch (error) {
            console.error('Erreur de scan du fichier:', error);
            if (this.onError) {
                this.onError(error.message);
            }
            throw error;
        }
    }

    /**
     * Scanner depuis la caméra
     */
    async scanFromCamera() {
        try {
            // Créer un input file temporaire
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';

            return new Promise((resolve, reject) => {
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        try {
                            const result = await this.scanFile(file);
                            resolve(result);
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        reject(new Error('Aucun fichier sélectionné'));
                    }
                };

                input.click();
            });
        } catch (error) {
            console.error('Erreur de scan depuis la caméra:', error);
            throw error;
        }
    }

    /**
     * Pré-traiter l'image pour améliorer la reconnaissance
     */
    async preprocessImage(imageSource) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Dessiner l'image
                ctx.drawImage(img, 0, 0);
                
                // Récupérer les pixels
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Convertir en niveaux de gris et augmenter le contraste
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    
                    // Augmenter le contraste (seuillage)
                    const threshold = 128;
                    const value = avg > threshold ? 255 : 0;
                    
                    data[i] = value;     // R
                    data[i + 1] = value; // G
                    data[i + 2] = value; // B
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                resolve(canvas.toDataURL());
            };
            
            img.onerror = reject;
            img.src = imageSource;
        });
    }

    /**
     * Extraire les numéros de série du texte
     * Patterns courants: XXX-XXXXX, XXXXXXXXXXXX, etc.
     */
    extractSerialNumbers(text) {
        const serials = [];
        
        // Patterns de numéros de série courants
        const patterns = [
            /\b[A-Z0-9]{3}-[A-Z0-9]{5}\b/g,           // XXX-XXXXX
            /\b[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}\b/g, // XXXX-XXXX-XXXX
            /\b[A-Z0-9]{8,16}\b/g,                    // 8 à 16 caractères alphanumériques
            /\bS\/N[:\s]*([A-Z0-9-]{6,})\b/gi,        // S/N: XXXXXX
            /\bSERIAL[:\s]*([A-Z0-9-]{6,})\b/gi,      // SERIAL: XXXXXX
            /\b[A-Z]{2}[0-9]{6,}\b/g,                 // XX123456...
        ];

        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    // Nettoyer et ajouter si pas déjà présent
                    const cleaned = match.replace(/^(S\/N|SERIAL)[:\s]*/i, '').trim();
                    if (cleaned.length >= 6 && !serials.includes(cleaned)) {
                        serials.push(cleaned);
                    }
                });
            }
        });

        return serials;
    }

    /**
     * Valider un numéro de série
     */
    validateSerial(serial) {
        // Critères de validation basiques
        const minLength = 6;
        const maxLength = 20;
        
        if (!serial || serial.length < minLength || serial.length > maxLength) {
            return false;
        }

        // Doit contenir au moins un chiffre ou une lettre
        return /[A-Z0-9]/.test(serial);
    }

    /**
     * Améliorer la qualité de l'image
     */
    async enhanceImage(imageSource) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Augmenter la résolution
                const scale = 2;
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                // Améliorer le rendu
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Appliquer un filtre de netteté
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const sharpened = this.applySharpen(imageData);
                ctx.putImageData(sharpened, 0, 0);
                
                resolve(canvas.toDataURL());
            };
            
            img.onerror = reject;
            img.src = imageSource;
        });
    }

    /**
     * Appliquer un filtre de netteté
     */
    applySharpen(imageData) {
        const weights = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ];
        
        const side = Math.round(Math.sqrt(weights.length));
        const halfSide = Math.floor(side / 2);
        const src = imageData.data;
        const sw = imageData.width;
        const sh = imageData.height;
        
        const output = new ImageData(sw, sh);
        const dst = output.data;
        
        for (let y = 0; y < sh; y++) {
            for (let x = 0; x < sw; x++) {
                const sy = y;
                const sx = x;
                const dstOff = (y * sw + x) * 4;
                let r = 0, g = 0, b = 0;
                
                for (let cy = 0; cy < side; cy++) {
                    for (let cx = 0; cx < side; cx++) {
                        const scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
                        const scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
                        const srcOff = (scy * sw + scx) * 4;
                        const wt = weights[cy * side + cx];
                        
                        r += src[srcOff] * wt;
                        g += src[srcOff + 1] * wt;
                        b += src[srcOff + 2] * wt;
                    }
                }
                
                dst[dstOff] = Math.min(255, Math.max(0, r));
                dst[dstOff + 1] = Math.min(255, Math.max(0, g));
                dst[dstOff + 2] = Math.min(255, Math.max(0, b));
                dst[dstOff + 3] = src[dstOff + 3]; // Alpha
            }
        }
        
        return output;
    }

    /**
     * Libérer les ressources
     */
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            console.log('Worker Tesseract terminé');
        }
    }

    /**
     * Obtenir les langues supportées
     */
    getSupportedLanguages() {
        return [
            { code: 'eng', name: 'English' },
            { code: 'fra', name: 'Français' },
            { code: 'deu', name: 'Deutsch' },
            { code: 'spa', name: 'Español' },
            { code: 'ita', name: 'Italiano' },
            { code: 'nld', name: 'Nederlands' }
        ];
    }
}

// Instance globale de l'OCR
window.ocrManager = new OCRManager();
