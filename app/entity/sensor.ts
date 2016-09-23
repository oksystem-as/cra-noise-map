import { Payload, PayloadType } from '../payloads/payload'

export class Sensor {
    public devEUI: string;
    public payloads: Payload[] = []; 
    public payloadType: PayloadType; 
}
