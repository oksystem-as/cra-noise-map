import { BitUtils } from '../utils/bit-utils'

export enum Hemisphere {
    N, S, E, W
}

export class ARF8084BAPayload {
    status: Status;
    temp: number;
    latitudeText: String;
    latitude: number;
    latitudeHemisphere: Hemisphere;
    longtitudeText: String;
    longtitude: number;
    longtitudeHemisphere: Hemisphere;
    uplinkFrameCounter: number;
    downlinkFrameCounter: number;
    batteryMSB: number;
    batteryLSB: number;
    rssi: number;
    snr: number;
}

export class Status {
    tempInfoIsPresent: boolean;
    accelerometerWasTriggered: boolean;
    BTN1WasTriggered: boolean;
    GPSInfoIsPresent: boolean;
    upCounterIsPresent: boolean;
    downCounterIsPresent: boolean;
    batteryVoltageInformationIsPresent: boolean;
    RSSI_SNRInformationIsPresent: boolean;

    constructor(status: number) {
        this.tempInfoIsPresent = BitUtils.isBitOn(status, 7);
        this.accelerometerWasTriggered = BitUtils.isBitOn(status, 6);
        this.BTN1WasTriggered = BitUtils.isBitOn(status, 5);
        this.GPSInfoIsPresent = BitUtils.isBitOn(status, 4);
        this.upCounterIsPresent = BitUtils.isBitOn(status, 3);
        this.downCounterIsPresent = BitUtils.isBitOn(status, 2);
        this.batteryVoltageInformationIsPresent = BitUtils.isBitOn(status, 1);
        this.RSSI_SNRInformationIsPresent = BitUtils.isBitOn(status, 0);
    }
}