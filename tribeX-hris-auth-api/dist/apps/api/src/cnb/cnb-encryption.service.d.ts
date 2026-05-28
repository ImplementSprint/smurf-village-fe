export declare class CnbEncryptionService {
    private readonly logger;
    private readonly ALGORITHM;
    private readonly key;
    constructor();
    encrypt(plaintext: string): string;
    decrypt(ciphertext: string): string;
    encryptNumber(value: number): string;
    decryptToNumber(ciphertext: string): number;
}
