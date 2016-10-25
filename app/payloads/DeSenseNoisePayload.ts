import { BitUtils } from '../utils/utils'
import { Payload, PayloadType } from './payload'

export class DeSenseNoisePayload implements Payload {
    noise: number;
    battery: number;
    rssi: number;
    snr: number;
    createdAt: Date;
    payloadType: PayloadType;
}