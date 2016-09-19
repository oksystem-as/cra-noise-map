export class Devices {
    meta: Meta;
    records:Record[];  
}

export class Record {
    devEUI: string;
    projectId: string;
    description: string;
    model: string;
    vendor: string;
}

export class Meta {
    private status: string;
    private count: Number;
}