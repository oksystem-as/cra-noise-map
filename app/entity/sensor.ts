import { Payload, PayloadType } from '../payloads/payload'

export class Sensor {
    devEUI: string;
    payload: Payload; 
    payloadType: PayloadType; 
}
