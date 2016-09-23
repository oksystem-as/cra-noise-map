import { Payload, PayloadType } from '../../payloads/payload';

export class DeviceDetail {
    meta: Meta;
    records:Record[];  
    payloadType: PayloadType;
    devEUI: string;
}

export class Lrrs {
    LrrESP: string
    LrrRSSI: string
    LrrSNR: string
    Lrrid: string
}

export class Meta {
    private status: string;
    private count: Number;
}

export class Record {
    aDRbit: string
    channel: string
    createdAt: string
    devEUI: string
    devLrrCnt: string
    fCntDn: string
    fCntUp: string
    fPort: string
    lrrLAT: string
    lrrLON: string
    lrrRSSI: string
    lrrSNR: string
    lrrid: string
    micHex: string
    payloadHex: string
    spFact: string
    subBand: string
    lrrs:Lrrs[];
}