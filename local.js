var host = null;
var money_max = null;
var security_min = null;
var money_available = 0;
var security_level = 0;

var money_percent_min = 1/2;
var money_percent_max = 12/13;

/** @param {NS} ns */
export async function main(ns) {
	setup(ns);
	
	while (true) {
		update(ns);
		ns.clearLog();
		display(ns);
		if (security_level >= security_min * 2) {
			await ns.weaken(host);
		} else if (money_available < money_max * money_percent_min) {
			await ns.grow(host);
		} else {
			var result = await ns.hack(host);
			if (result == 0 && security_level > security_min) {
				await ns.weaken(host);
			} else {
				money_available -= result;
				if (money_available < money_max * money_percent_max) {
					await ns.grow(host);
				}
			}
		}
	}
}

/** @param {NS} ns */
function setup(ns) {
	ns.disableLog("disableLog");
	ns.disableLog("getServerMaxMoney");
	ns.disableLog("getServerMoneyAvailable");
	ns.disableLog("getServerMinSecurityLevel");
	ns.disableLog("getServerSecurityLevel");
	host = ns.getHostname();
	money_max = ns.getServerMaxMoney(host);
	security_min = ns.getServerMinSecurityLevel(host);
}

/** @param {NS} ns */
function update(ns) {
	money_available = ns.getServerMoneyAvailable(host);
	security_level = ns.getServerSecurityLevel(host);
}

/** @param {NS} ns */
function display(ns) {
	ns.printf("[Local hack - %s]", host);

	ns.printf("Money: $%.0f/%.0f (%.1f%%)", money_available, money_max, (money_available/money_max) * 100);
	ns.printf("Security: %.3f/%.3f", security_level, security_min);
	ns.printf("");
}
