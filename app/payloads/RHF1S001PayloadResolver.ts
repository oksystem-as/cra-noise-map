import  { RHF1S001Payload } from './RHF1S001Payload'
import  { BitUtils } from '../utils/utils'

export class RHF1S001PayloadResolver{
    public resolve(payload: String): RHF1S001Payload {
        let rHF1S001Payload = new RHF1S001Payload();
        let charArrPayload = payload.split('');

        let status = parseInt(charArrPayload[0] + charArrPayload[1], 16);
        rHF1S001Payload.status = status;
                    
        let temp = parseInt(charArrPayload[4]+charArrPayload[5] + charArrPayload[2]+charArrPayload[3], 16);
        rHF1S001Payload.teplota = ((175.72 * temp) / Math.pow(2, 16)) - 46.85;
        
        let hum = parseInt(charArrPayload[6]+charArrPayload[7] , 16);
        rHF1S001Payload.vlhkost = ((125* hum) / Math.pow(2, 8)) - 6;

        let period = parseInt(charArrPayload[10]+charArrPayload[11] + charArrPayload[8]+charArrPayload[9], 16);
        rHF1S001Payload.period = period*2;
        
        let rssi = parseInt(charArrPayload[12]+charArrPayload[13], 16);
        rHF1S001Payload.rssi = rssi - 180;

        let snr = parseInt(charArrPayload[14]+charArrPayload[15], 16);
        rHF1S001Payload.snr = snr / 4;

        let batt = parseInt(charArrPayload[16]+charArrPayload[17], 16);
        rHF1S001Payload.battery =(batt + 150) * 0.01;
        
        return rHF1S001Payload; 
    }

    public test() {

        // parseInt("a", 16); // returns 10
        // (10).toString(16) // returns "a"
        // parseInt("10110101", 2).toString(16)
        // parseInt("8", 16) & parseInt("1000", 2)

        let payload = "016c689d39309029C8";
        let charArrPayload = payload.split('');

        let status = parseInt(charArrPayload[0] + charArrPayload[1], 16);
        console.log(status.toString(16) + " " + status.toString(2) + " " + BitUtils.isBitOn(status, 0));            

        let temp = parseInt(charArrPayload[4]+charArrPayload[5] + charArrPayload[2]+charArrPayload[3], 16);
        temp = ((175.72 * temp) / Math.pow(2, 16)) - 46.85;

        let hum = parseInt(charArrPayload[6]+charArrPayload[7] , 16);
        hum = ((125* hum) / Math.pow(2, 8)) - 6;

        let period = parseInt(charArrPayload[10]+charArrPayload[11] + charArrPayload[8]+charArrPayload[9], 16);
        period = period*2;
        
        let rssi = parseInt(charArrPayload[12]+charArrPayload[13], 16);
        rssi = rssi - 180;

        let snr = parseInt(charArrPayload[14]+charArrPayload[15], 16);
        snr = snr / 4;

        let batt = parseInt(charArrPayload[16]+charArrPayload[17], 16);
        batt =(batt + 150) * 0.01;

        console.log("temp " + temp.toString(16) + " " + temp.toString(2) + " " + temp.toString(10))
        console.log("hum " + hum.toString(16) + " " + hum.toString(2)+ " " + hum.toString(10))
        console.log("period " + period.toString(16) + " " + period.toString(2)+ " " + period.toString(10))
        console.log("rssi " + rssi.toString(16) + " " + rssi.toString(2)+ " " + rssi.toString(10))
        console.log("snr " + snr.toString(16) + " " + snr.toString(2)+ " " + snr.toString(10))
        console.log("batt " + batt.toString(16) + " " + batt.toString(2)+ " " + batt.toString(10))

        // console.log(BitUtils.isBitOn(8, 3));    
        // console.log(BitUtils.isBitOn(8, 2));    
        // console.log(BitUtils.isBitOn(16, 4));    
        console.log("----------");  
    }
}
