import  { DeSenseNoisePayload } from './DeSenseNoisePayload'

export class DeSenseNoisePayloadResolver {

    public resolve(payload: String): DeSenseNoisePayload {
        let deSenseNoisePayload = new DeSenseNoisePayload();
        let charArrPayload = payload.split('');
        
        let sensorType =  parseInt(charArrPayload[0]+charArrPayload[1] , 16);
        if(sensorType !== 10){
            throw new Error("Nepodporovany typ sensoru. sensorType:" + sensorType);
        }
        
        let rssi = parseInt(charArrPayload[2]+charArrPayload[3], 16);
        deSenseNoisePayload.rssi = rssi;

        let snr = parseInt(charArrPayload[4]+charArrPayload[5], 16);
        deSenseNoisePayload.snr = snr - 128;

        let batt = parseInt(charArrPayload[6]+charArrPayload[7]+charArrPayload[8]+charArrPayload[9], 16);
        deSenseNoisePayload.battery = batt * 0.001;

        let noise = parseInt(charArrPayload[10]+charArrPayload[11]+charArrPayload[12]+charArrPayload[13], 16);
        deSenseNoisePayload.noise = noise * 0.01;
        
        return deSenseNoisePayload; 
    }
}