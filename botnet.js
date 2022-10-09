/** @param {NS} ns */
export async function main(ns) {
	let id = -1;
	let cnc_port = 22;

	async function writeCnC(operation, data={}) {
		ns.writePort(cnc_port, JSON.stringify({operation: operation, data: data}));
	}

	async function getCommand() {
		let data = ns.readPort(id);
		if (data != "NULL PORT DATA") {
			ns.print("do it!");
			ns.print(JSON.parse(data))
			ns.exit();
		} else {
			await ns.sleep(1000);
		}
	}

	ns.clearLog();
	ns.atExit(() => {
		writeCnC("unregister", {id: id})
	})
	if (ns.args.length == 0) {
		ns.print("Error: missing id");
		return;
	}
	id = ns.args[0];
	ns.clearPort(id);
	
	writeCnC("register", {id: id})
	while (true) {
		await getCommand();
	}
}
