/** @param {NS} ns */
export async function main(ns) {
	let bots = {};
	let cnc_port = 22;
	let admin_port = 21;

	async function readInbound() {
		let data = ns.readPort(cnc_port);
		if (data == "NULL PORT DATA") {
			await ns.sleep(1000);
			return;	
		}
		
		let request = JSON.parse(data);
		if (request.operation == "register") {
			registerBot(request.data.id)
		} else if (request.operation == "unregister") {
			unregisterBot(request.data.id)
		} else {
			ns.print(request);
		}
	}

	function registerBot(id) {
		if (id in bots) {
			ns.print("Bot " + id + " re-registered");
		} else {
			ns.print("Bot " + id + " registered");
			bots[id] = {}
		}
	}

	function unregisterBot(id) {
		delete bots[id]
		ns.print("Bot " + id + " unregistered");
	}

	async function writeBot(id, operation, data={}) {
		ns.writePort(id, JSON.stringify({operation: operation, data: data}));
	}

	// Main
	ns.disableLog("sleep");
	ns.clearLog();

	while (true) {
		await readInbound();
	}
}
