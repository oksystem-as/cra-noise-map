export class BitUtils {
    static flagbit1: number = 1;    // 2^^0    000...00000001
    static flagbit2: number = 2;    // 2^^1    000...00000010
    static flagbit3: number = 4;    // 2^^2    000...00000100
    static flagbit4: number = 8;    // 2^^3    000...00001000
    static flagbit5: number = 16;   // 2^^4    000...00010000
    static flagbit6: number = 32;   // 2^^5    000...00100000
    static flagbit7: number = 64;   // 2^^6    000...01000000
    static flagbit8: number = 128;  // 2^^7    000...10000000

    static flagbits: number[] = [BitUtils.flagbit1, BitUtils.flagbit2, BitUtils.flagbit3, BitUtils.flagbit4, BitUtils.flagbit5, BitUtils.flagbit6, BitUtils.flagbit7, BitUtils.flagbit8];

    static isBitOn(vstup: number, position: number): boolean {
        // if(vstup > 256){
        //     throw new IllegalArgumentException("Vstup musi byt max 1byte - 8bite. Vstup="+vstup); 
        // }
        // if(position > 7){
        //     throw new IllegalArgumentException("Position musi byt 0 - 7. Position="+position); 
        // }

        let num = this.flagbits[position];
        return (vstup & num) === num;
    }
}