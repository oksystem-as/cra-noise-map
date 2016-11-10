import { Payload, PayloadType } from './payload'

export class RHF1S001Payload implements Payload {
	status: number;
	teplota: number;
	vlhkost: number;
	period: number;
	rssi: number;
	snr: number;
	battery: number;
	createdAt: Date;
	payloadType: PayloadType;

	public toConsole() {
		console.log("status " + this.status)
        console.log("teplota " + this.teplota);
        console.log("vlhkost " + this.vlhkost)
		console.log("period " + this.period)
		console.log("rssi " + this.rssi)
		console.log("snr " + this.snr)
		console.log("battery " + this.battery)
	}
}