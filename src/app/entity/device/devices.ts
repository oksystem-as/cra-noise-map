import { Logger } from "angular2-logger/core";
import {DeviceDetail} from "./device-detail"

export class Devices {
    private _meta: Meta;
    private _records: DeviceRecord[]; 

	constructor(private log: Logger) {
        // this.log.error("constructor "  );
	}
    
    public get meta(): Meta {
        return this._meta;
    }

    public set meta(value: Meta) {
        this._meta = value;
    }

    public get records(): DeviceRecord[] {
        // this.log.error("get "  );
        console.log("get "  );
        return this._records;
    }

    public set records(value: DeviceRecord[]) {
        // this.log.error("set " + value );
        console.log("set " + value );
        this._records = value;
    }
}

export class DeviceRecord {
    private _devEUI: string;
    private _projectId: string;
    private _description: string;
    private _model: string;
    private _vendor: string;
    private _deviceDetail: DeviceDetail;

	public get deviceDetail(): DeviceDetail {
		return this._deviceDetail;
	}

	public set deviceDetail(value: DeviceDetail) {
		this._deviceDetail = value;
	}

    public get devEUI(): string {
        return "huhuhu "  + this._devEUI;
    }

    public set devEUI(value: string) {
        this._devEUI = value;
    }

    public get projectId(): string {
        return this._projectId;
    }

    public set projectId(value: string) {
        this._projectId = value;
    }

    public get description(): string {
        return this._description;
    }

    public set description(value: string) {
        this._description = value;
    }

    public get model(): string {
        return this._model;
    }

    public set model(value: string) {
        this._model = value;
    }

    public get vendor(): string {
        return this._vendor;
    }

    public set vendor(value: string) {
        this._vendor = value;
    }

}

export class Meta {
    private _status: string;
    private _count: Number;

    public get status(): string {
        return this._status;
    }

    public set status(value: string) {
        this._status = value;
    }

    public get count(): Number {
        return this._count;
    }

    public set count(value: Number) {
        this._count = value;
    }

}