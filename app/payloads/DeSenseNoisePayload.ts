import { BitUtils } from '../utils/utils'
import { Payload, PayloadType } from './payload'

export class DeSenseNoisePayload implements Payload {
    noise: number;
    batter: number;
    rssi: number;
    snr: number;
    createdAt: Date;
    payloadType: PayloadType;
}