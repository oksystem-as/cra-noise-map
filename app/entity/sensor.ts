import { Payload, PayloadType } from '../payloads/payload'

export class Sensor {
    public devEUI: string;
    public payloadType: PayloadType; 
    public payloads: Payload[] = []; 
}
