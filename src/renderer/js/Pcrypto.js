const crypto = window.electron.crypto

function hide_key(apiKey, password) {
    // Derive a 32-byte key from the password
    const key = crypto.scryptSync(password, 'PhantomJoker15', 32);

    // Generate a random IV (16 bytes for AES)
    const iv = crypto.randomFillSync(new Uint8Array(16));

    // Create the cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    // Encrypt the API key
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return the IV and encrypted data as a single object
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
}


export function get_key(encryptedObject, password) {
    // Destructure IV and encrypted data
    const { iv, encryptedData } = encryptedObject;

    // Check if the IV exists
    if (!iv) {
        throw new Error("IV is missing or undefined");
    }

    // Convert the comma-separated string to a buffer
    return window.electron.getBufferFromIV(iv).then(ivBuffer => {
        // Derive the same key from the password
        const key = window.electron.scryptSync(password, 'PhantomJoker15', 32);

        // Create the decipher
        const decipher = window.electron.createDecipheriv('aes-256-cbc', key, ivBuffer);

        // Decrypt the data
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }).catch(error => {
        console.error("Error in get_key:", error);
        throw error;
    });
}
