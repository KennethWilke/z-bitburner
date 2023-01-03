/** @param {NS} ns */
export async function main(ns) {
	ns.clearLog();
	ns.disableLog("disableLog");
	ns.disableLog("getServerMaxMoney");
	let localhost = ns.getHostname();
	let money_max = ns.getServerMaxMoney(localhost);
	
	while (true) {
		await ns.hack(localhost);
		await ns.grow(localhost);
		await ns.weaken(localhost);
		await ns.sleep(1000);
		ns.clearLog();
	}
}