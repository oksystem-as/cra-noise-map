import { ARF8084BAPayload, Status, Hemisphere } from './ARF8084BAPayload'
import { BitUtils } from '../utils/utils'

export class ARF8084BAPayloadResolver {
    public resolve(payload: String): ARF8084BAPayload {
        let aRF8084BAPayload = new ARF8084BAPayload();
        let charArrPayload = payload.split('');
        let status = new Status(parseInt(charArrPayload[0] + charArrPayload[1], 16));
        aRF8084BAPayload.status = status;

        let index = 1;

        if (status.tempInfoIsPresent) {
            aRF8084BAPayload.temp = parseInt(charArrPayload[++index] + charArrPayload[++index], 16);
        }

        if (status.GPSInfoIsPresent) {
            let latDeg = parseInt(charArrPayload[++index] + charArrPayload[++index], 10)
            let latMin = parseInt(charArrPayload[++index] + charArrPayload[++index], 10)
            let latSec = parseFloat(parseInt(charArrPayload[++index] + charArrPayload[++index], 10) + "." + parseInt(charArrPayload[++index], 10));

            let northSouth = parseInt(charArrPayload[++index], 16)
            aRF8084BAPayload.latitudeHemisphere = Hemisphere.N;
            if (BitUtils.isBitOn(northSouth, 0)) {
                aRF8084BAPayload.latitudeHemisphere = Hemisphere.S;
            }

            let longDeg = parseInt(charArrPayload[++index] + charArrPayload[++index] + charArrPayload[++index], 10)
            let longMin = parseInt(charArrPayload[++index] + charArrPayload[++index], 10)
            let longSec = parseInt(charArrPayload[++index] + charArrPayload[++index], 10)

            let eastWest = parseInt(charArrPayload[++index], 16)

            aRF8084BAPayload.longtitudeHemisphere = Hemisphere.E;
            if (BitUtils.isBitOn(eastWest, 0)) {
                aRF8084BAPayload.longtitudeHemisphere = Hemisphere.W;
            }

            aRF8084BAPayload.latitudeText = latDeg + "°" + latMin + "'" + latSec + "''";
            let latitude = ((((latMin * 60)) + latSec) / 3600) + latDeg;
            aRF8084BAPayload.latitude = Math.round(latitude * 10000000) / 10000000;

            aRF8084BAPayload.longtitudeText = longDeg + "°" + longMin + "'" + longSec + "''";
            let longtitude = ((((longMin * 60)) + longSec) / 3600) + longDeg;
            aRF8084BAPayload.longtitude = Math.round(longtitude * 10000000) / 10000000;
        }

        if(status.upCounterIsPresent){
			aRF8084BAPayload.uplinkFrameCounter = parseInt(charArrPayload[++index] + charArrPayload[++index], 16);
		}
		
		if(status.downCounterIsPresent){
			aRF8084BAPayload.downlinkFrameCounter = parseInt(charArrPayload[++index] + charArrPayload[++index], 16)
		}
	
		if(status.batteryVoltageInformationIsPresent){
			aRF8084BAPayload.batteryMSB = parseInt(charArrPayload[++index] + charArrPayload[++index], 16)
			aRF8084BAPayload.batteryLSB = parseInt(charArrPayload[++index] + charArrPayload[++index], 16)
		}
		
		if(status.RSSI_SNRInformationIsPresent){
			aRF8084BAPayload.rssi = parseInt(charArrPayload[++index] + charArrPayload[++index], 16)
			aRF8084BAPayload.snr = parseInt(charArrPayload[++index] + charArrPayload[++index], 16)
		}

        return aRF8084BAPayload;
    }
}