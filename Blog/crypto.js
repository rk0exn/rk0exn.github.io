export function decryptContent(encryptedData, password) {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedData, password);
        const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!plaintext) {
            throw new Error('復号化に失敗しました');
        }
        
        return plaintext;
    } catch (error) {
        throw new Error(`復号化エラー: ${error.message}`);
    }
}

export function encryptContent(plaintext, password) {
    return CryptoJS.AES.encrypt(plaintext, password).toString();
}
