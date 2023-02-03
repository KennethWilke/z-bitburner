var money = 0;
const SLEEP_TIME = 333;

/** @param {NS} ns */
export async function main(ns) {
	await setup(ns);
	ns.print("HackNet script started");

	while (true) {
		ns.clearLog();
		money = ns.getPlayer().money;
		var next = await get_next_purchase(ns);
		
		if (money > next.cost) {
			switch (next.type) {
				case "level":
					ns.hacknet.upgradeLevel(next.id, 1);
					ns.printf("Leveled up node %s", next.id);
					break;
				case "ram":
					ns.hacknet.upgradeRam(next.id, 1);
					ns.printf("Upgrade RAM on node %s", next.id);
					break;
				case "cpu":
					ns.hacknet.upgradeCore(next.id, 1);
					ns.printf("Upgraded cores for node %s", next.id);
					break;
				case "node":
					ns.hacknet.purchaseNode();
					ns.printf("Purchased node",);
					break;
				default:
					ns.alert("grapefruit");
			}
		} else {
			switch (next.type) {
				case "level":
					ns.printf("Next leveling up node %d", next.id);
					break;
				case "ram":
					ns.printf("Next upgrading RAM for node %d", next.id);
					break;
				case "cpu":
					ns.printf("Next upgrading cores on %d", next.id);
					break;
				case "node":
					ns.printf("Next buying new node", next.id);
					break;
				default:
					ns.alert("banana");
					ns.print("ehhhhh?");
			};
			ns.printf("Needed: $%.2f", next.cost);
			ns.printf("$%.2f to go", next.cost - money);
			await ns.sleep(SLEEP_TIME);
		}
	}
}

/** @param {NS} ns */
async function setup(ns) {
	ns.clearLog();
	ns.disableLog("disableLog");
	ns.disableLog("sleep")
}

/** @param {NS} ns */
async function get_next_purchase(ns) {
	var node_cost = ns.hacknet.getPurchaseNodeCost();
	var first_level_cost = 520;
	var increase = 1.5;
	var next = {
		type: "node",
		cost: node_cost,
		id: 0,
		increase: increase,
		rate: ( increase * 2 ) / ( node_cost + first_level_cost )
	};
	var numNodes = ns.hacknet.numNodes();
	if (numNodes < 1) {
		return next;
	}

	for (var i = 0; i < numNodes; i++) {
		var node = ns.hacknet.getNodeStats(i);
		var level_cost = ns.hacknet.getLevelUpgradeCost(i, 1);
		var level_increase = 1.5;
		var level_rate = level_increase / level_cost;
		if (level_rate > next.rate) {
			next = {
				type: "level",
				cost: level_cost,
				id: i,
				increase: level_increase,
				rate: level_rate
			};
		};

		var ram_cost = ns.hacknet.getRamUpgradeCost(i, 1);
		var ram_increase = 0.0525 * node.level;
		var ram_rate = ram_increase / ram_cost;
		if (ram_rate > next.rate) {
			next = {
				type: "ram",
				cost: ram_cost,
				id: i,
				increase: ram_increase,
				rate: ram_rate
			};
		};
		
		var cpu_cost = ns.hacknet.getCoreUpgradeCost(i, 1);
		var cpu_increase = .25 * node.level;
		var cpu_rate = cpu_increase / cpu_cost;
		if (cpu_rate > next.rate) {
			next = {
				type: "cpu",
				cost: cpu_cost,
				id: i,
				increase: cpu_increase,
				rate: cpu_rate
			};
		};
	}
	return next
}
