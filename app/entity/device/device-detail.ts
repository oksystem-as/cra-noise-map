export class DeviceDetail {
    meta: Meta;
    records:Record[];  
}

export class Lrrs {
    LrrESP: String
    LrrRSSI: String
    LrrSNR: String
    Lrrid: String
}

export class Meta {
    private status: String;
    private count: Number;
}

export class Record {
    aDRbit: String
    channel: String
    createdAt: String
    devEUI: String
    devLrrCnt: String
    fCntDn: String
    fCntUp: String
    fPort: String
    lrrLAT: String
    lrrLON: String
    lrrRSSI: String
    lrrSNR: String
    lrrid: String
    micHex: String
    payloadHex: String
    spFact: String
    subBand: String
    lrrs:Lrrs[];
}