/**
 * Module de scan QR Codes et Codes-barres
 * Utilise la bibliothèque html5-qrcode
 */

class ScannerManager {
    constructor() {
        this.html5QrCode = null;
        this.isScanning = false;
        this.onScanSuccess = null;
        this.onScanError = null;
    }

    /**
     * Initialiser le scanner
     */
    async init(elementId, onSuccess, onError) {
        this.onScanSuccess = onSuccess;
        this.onScanError = onError;

        try {
            // Vérifier les permissions de caméra
            await this.checkCameraPermission();

            // Créer l'instance du scanner
            this.html5QrCode = new Html5Qrcode(elementId);
            
            return true;
        } catch (error) {
            console.error('Erreur d\'initialisation du scanner:', error);
            if (this.onScanError) {
                this.onScanError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
            }
            return false;
        }
    }

    /**
     * Vérifier la permission de la caméra
     */
    async checkCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Arrêter immédiatement le stream après vérification
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            throw new Error('Permission de caméra refusée');
        }
    }

    /**
     * Démarrer le scan
     */
    async startScanning(config = {}) {
        if (this.isScanning) {
            console.warn('Le scanner est déjà actif');
            return;
        }

        const defaultConfig = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.DATA_MATRIX
            ]
        };

        const scanConfig = { ...defaultConfig, ...config };

        try {
            await this.html5QrCode.start(
                { facingMode: "environment" }, // Caméra arrière
                scanConfig,
                (decodedText, decodedResult) => {
                    this.handleScanSuccess(decodedText, decodedResult);
                },
                (errorMessage) => {
                    // Erreurs de scan (normales quand aucun code n'est détecté)
                    // console.log('Scan en cours...', errorMessage);
                }
            );

            this.isScanning = true;
            console.log('Scanner démarré');
        } catch (error) {
            console.error('Erreur de démarrage du scanner:', error);
            if (this.onScanError) {
                this.onScanError('Impossible de démarrer le scanner: ' + error.message);
            }
        }
    }

    /**
     * Arrêter le scan
     */
    async stopScanning() {
        if (!this.isScanning || !this.html5QrCode) {
            return;
        }

        try {
            await this.html5QrCode.stop();
            this.isScanning = false;
            console.log('Scanner arrêté');
        } catch (error) {
            console.error('Erreur d\'arrêt du scanner:', error);
        }
    }

    /**
     * Scanner un fichier image
     */
    async scanFile(file) {
        if (!this.html5QrCode) {
            await this.init('reader', this.onScanSuccess, this.onScanError);
        }

        try {
            const result = await this.html5QrCode.scanFile(file, true);
            if (this.onScanSuccess) {
                this.onScanSuccess(result, { format: 'FILE' });
            }
            return result;
        } catch (error) {
            console.error('Erreur de scan du fichier:', error);
            if (this.onScanError) {
                this.onScanError('Aucun code détecté dans l\'image');
            }
            return null;
        }
    }

    /**
     * Gérer le succès du scan
     */
    handleScanSuccess(decodedText, decodedResult) {
        console.log('Code scanné:', decodedText);
        
        // Vibration pour feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(200);
        }

        // Arrêter le scan après détection
        this.stopScanning();

        // Appeler le callback
        if (this.onScanSuccess) {
            this.onScanSuccess(decodedText, decodedResult);
        }
    }

    /**
     * Récupérer les caméras disponibles
     */
    async getCameras() {
        try {
            const devices = await Html5Qrcode.getCameras();
            return devices;
        } catch (error) {
            console.error('Erreur de récupération des caméras:', error);
            return [];
        }
    }

    /**
     * Changer de caméra
     */
    async switchCamera(cameraId) {
        if (this.isScanning) {
            await this.stopScanning();
        }

        try {
            await this.html5QrCode.start(
                { deviceId: cameraId },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText, decodedResult) => {
                    this.handleScanSuccess(decodedText, decodedResult);
                }
            );

            this.isScanning = true;
        } catch (error) {
            console.error('Erreur de changement de caméra:', error);
            if (this.onScanError) {
                this.onScanError('Impossible de changer de caméra');
            }
        }
    }

    /**
     * Détection du type de code
     */
    detectCodeType(decodedResult) {
        if (!decodedResult || !decodedResult.result) {
            return 'UNKNOWN';
        }

        const format = decodedResult.result.format;
        
        if (!format) {
            return 'UNKNOWN';
        }

        // Types de codes courants
        const codeTypes = {
            'QR_CODE': 'QR Code',
            'EAN_13': 'Code-barres EAN-13',
            'EAN_8': 'Code-barres EAN-8',
            'CODE_128': 'Code-barres Code 128',
            'CODE_39': 'Code-barres Code 39',
            'UPC_A': 'Code-barres UPC-A',
            'UPC_E': 'Code-barres UPC-E',
            'DATA_MATRIX': 'Data Matrix'
        };

        return codeTypes[format.formatName] || format.formatName;
    }

    /**
     * Libérer les ressources
     */
    async destroy() {
        if (this.isScanning) {
            await this.stopScanning();
        }

        if (this.html5QrCode) {
            try {
                await this.html5QrCode.clear();
            } catch (error) {
                console.error('Erreur de nettoyage du scanner:', error);
            }
        }

        this.html5QrCode = null;
        this.isScanning = false;
    }
}

// Instance globale du scanner
window.scannerManager = new ScannerManager();
