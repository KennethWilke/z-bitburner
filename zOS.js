/** {NS} ns */
let ns;
let debug = false;
let self_host;


/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	await init(ns);
	let running = true;
	while (running) {
		running = await loop();
	}
	ns.print("Goodbye!");
}

/** @param {NS} ns */
async function init(netscript) {
	ns = netscript;
	ns.tail();
	disableLogs();
	ns.clearLog();
	ns.print("Starting zOS...");
	await sleep(1);
	windowTop();
	self_host = ns.getHostname();
	ns.atExit(() => {
		ns.moveTail(800, 11);
		ns.resizeTail(250, 33);
	})
	
	await sleep(1);
}

/** @param {NS} ns */
async function windowTop() {
	ns.moveTail(0, 0);
	ns.resizeTail(1480, 605);
}

/** @param {NS} ns */
async function windowLeft() {
	ns.moveTail(0, 0);
	ns.resizeTail(686, 1336);
}

/** @param {NS} ns */
async function loop() {
	let actions = ["Assess", "Assess (aggro)", "Run Application", "Quit"];
	let selection = await ns.prompt("Select action", {type: "select", choices: actions});
	if (selection == "Assess") {
		await assess(false);
		return true;
	} else if (selection == "Assess (aggro)") {
		await assess(true);
		return true;
	} else if (selection == "Run Application") {
		await application();
		return true;
	}
	return false;
}

async function sleep(seconds) {
	await ns.sleep(seconds * 1000);
}

function formatMoney(value) {
	return ns.nFormat(value, "$0,000.00")
}

function disableLogs() {
	if (!debug) {
		ns.disableLog("sleep");
		ns.disableLog("scan");
		ns.disableLog("getServerNumPortsRequired");
		ns.disableLog("getServerMaxMoney");
		ns.disableLog("getServerMoneyAvailable");
		ns.disableLog("getServerGrowth");
	}
}

async function assess(aggro) {
	ns.clearLog();
	let servers = ns.scan(self_host);
	for (let i in servers) {
		let server = servers[i];
		await assess_server(server, aggro);
	}
}

async function assess_server(server, aggro) {
	ns.print("[" + server + "]");
	let rooted = await assess_server_rooted(server, aggro);
	
	if (rooted) {
		await assess_server_money(server);
	}

	await sleep(1);
	ns.print(" ");
}

async function assess_server_rooted(server, aggro=false) {
	if (ns.hasRootAccess(server)) {
		ns.print("Rooted: Yes");
		return true;
	} else {
		let ports_required = ns.getServerNumPortsRequired(server);
		if (ports_required == 0) {
			if (aggro) {
				await ns.nuke(server);
				ns.print("Rooted: Yes - It is now ;)");
				return true;
			} else {
				ns.print("Rooted: No - Can be nuked though!");
				return false;
			}
		} else {
			ns.print("Rooted: No - " + ports_required + " ports required");
			return false;
		}
	}
}

async function assess_server_money(server) {
	let money_max = ns.getServerMaxMoney(server);
	let money_current = ns.getServerMoneyAvailable(server);
	let money = money_current;
	let percent = (money_current / money_max) * 100;
	ns.print("Money: " + formatMoney(money) + " (" + percent + "%)");
	let growth = ns.getServerGrowth(server);
	let grow_time = ns.nFormat(ns.getGrowTime(server) / 1000, "0.00");
	ns.print("Growth: " + growth + " @ " + grow_time + " seconds");
}

async function application() {
	let actions = ["Grower", "<BACK>"];
	let selection = await ns.prompt("Select application", {type: "select", choices: actions});
	if (selection == "Grower") {
		await grower();
	}
}

async function grower() {
	windowTop();
	ns.clearLog();
	let server = await select_server(true);
	if (!server) {
		ns.print("No valid targets for Grower");
		await sleep(3);
		return;
	}

	let money_max = ns.getServerMaxMoney(server);
	let money_current = ns.getServerMoneyAvailable(server);
	let growth = ns.getServerGrowth(server);
	let grow_time = ns.nFormat(ns.getGrowTime(server) / 1000, "0.0");
	let money_delta = 0;

	while (money_current < money_max) {
		ns.print("Growing " + server);
		ns.print("Growth: " + growth);
		ns.print("Time: " + grow_time + " seconds");
		let growth_percent = ns.nFormat((await ns.grow(server) - 1) * 100, "0.0");
		let money_now = ns.getServerMoneyAvailable(server);
		money_delta = money_now - money_current;
		money_current = money_now;
		growth = ns.getServerGrowth(server);
		grow_time = ns.nFormat(ns.getGrowTime(server) / 1000, "0.0");
		delta_formatted = ns.nF
		ns.print("Grew by " + growth_percent + "% to " + money_current);
		ns.print(" ");
	}
	ns.print("Server money capped out!");

	await sleep(3);
}

async function select_server(rooted_only=false) {
	let servers = ns.scan();
	if (rooted_only) {
		let rooted = [];
		for (let i in servers) {
			let server = servers[i];
			if (ns.hasRootAccess(server)) {
				rooted.push(server);
			}
		}
		if (rooted.length > 0) {
			return await ns.prompt("Select target", {type: "select", choices: rooted});
		} else {
			return null
		}
	} else {
		return await ns.prompt("Select target", {type: "select", choices: servers});
	}
}