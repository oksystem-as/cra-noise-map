import { Payload, PayloadType } from '../payloads/payload'

export class Sensor {
    public devEUI: string;
    public name: string;
    public payloadType: PayloadType;
    public payloads: Payload[] = [];
    // kdo zapricinil nacteni - napr pro reload jen pro konkretni graf
    public publisher: string;
    // vybran v menu
    public isSelected: boolean;
    public showData: boolean;
}
