const DEFAULT_BG_IMAGE = '/pict/senja.gif';
const BG_IMAGE_STORAGE_KEY = 'editorql_bg_image';

export const getBackgroundImage = (): string => {
    const storedImage = localStorage.getItem(BG_IMAGE_STORAGE_KEY);

    // Jika gambar dimulai dengan data:image/, itu adalah base64
    // Jika dimulai dengan /, itu adalah path preset
    // Jika tidak ada yang tersimpan, gunakan default
    return storedImage || DEFAULT_BG_IMAGE;
};

export const saveBackgroundImage = async (fileOrPath: File | string): Promise<string> => {
    // Jika input adalah string (path preset), simpan langsung
    if (typeof fileOrPath === 'string') {
        localStorage.setItem(BG_IMAGE_STORAGE_KEY, fileOrPath);
        return fileOrPath;
    }

    // Jika input adalah File, kompresi dan konversi ke base64
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = () => {
            img.src = reader.result as string;
            img.onload = () => {
                try {
                    // Buat canvas untuk kompresi
                    const canvas = document.createElement('canvas');

                    // Hitung ukuran yang dikompresi (maksimal 1200px)
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 1200;

                    if (width > height && width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Gambar ke canvas
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        throw new Error('Failed to get canvas context');
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Tentukan format output berdasarkan tipe file
                    if (fileOrPath.type === 'image/gif') {
                        // Untuk GIF, gunakan data original agar animasi tetap ada
                        const originalData = reader.result as string;
                        localStorage.setItem(BG_IMAGE_STORAGE_KEY, originalData);
                        resolve(originalData);
                        return;
                    }

                    // Untuk JPEG dan PNG, lakukan kompresi
                    const outputFormat = fileOrPath.type === 'image/png' ? 'image/png' : 'image/jpeg';
                    const compressedBase64 = canvas.toDataURL(outputFormat, 0.7);
                    
                    // Debug: log ukuran
                    console.log('Original size:', reader.result?.toString().length);
                    console.log('Compressed size:', compressedBase64.length);

                    localStorage.setItem(BG_IMAGE_STORAGE_KEY, compressedBase64);
                    resolve(compressedBase64);

                    localStorage.setItem(BG_IMAGE_STORAGE_KEY, compressedBase64);
                    resolve(compressedBase64);

                } catch (error) {
                    console.error('Error compressing image:', error);
                    reject(new Error('Failed to compress image'));
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image for compression'));
            };
        };

        reader.onerror = () => {
            console.error('Error reading file:', reader.error);
            reject(new Error('Failed to read image file'));
        };

        reader.readAsDataURL(fileOrPath);
    });
};

export const resetBackgroundImage = (): void => {
    localStorage.removeItem(BG_IMAGE_STORAGE_KEY);
};

export const isValidImageFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return validTypes.includes(file.type);
};
