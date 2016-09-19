export class RHF1S001Payload {
	status: Number;
	teplota: Number;
	vlhkost: Number;
	period: Number;
	rssi: Number;
	snr: Number;
	battery: Number;

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