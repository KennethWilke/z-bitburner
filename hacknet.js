/* 

Hacknet Script

This script performs some basic automation of the hacknet stuff

*/

var message_buffer = [];
var message_buffer_length = 5;

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("disableLog");
	ns.disableLog("sleep");
	ns.print("Hacknet manager running...");

	while (true) {
		ns.clearLog();
		var player = ns.getPlayer();
		var money = player.money;
		var upgrade = nextUpgrade(ns);
		ns.printf("Next upgrade: Node %d %s", upgrade.node, upgrade.type);
		var money_needed = upgrade.cost - money;
		var percent_to_purchase = (money / upgrade.cost * 100);
		if (money_needed < 0) {
			money_needed = 0;
			percent_to_purchase = 100;
		}
		ns.printf("%% to next upgrade: %.1f%%", percent_to_purchase);
		ns.printf("$ to next upgrade: $%.2f", money_needed);

		
		if (money > upgrade.cost) {
			if (upgrade.type == "node") {
				ns.hacknet.purchaseNode();
				println("Purchased node " + upgrade.node + "!");
			} else if (upgrade.type == "level") {
				ns.hacknet.upgradeLevel(upgrade.node, 1);
				println("Purchased node " + upgrade.node + " level!");
			} else {
				ns.printf("Unknown upgrade type %s", upgrade.type);
			}
		}

		ns.print("---------------------------------------------------")
		printLines(ns);
		ns.print("---------------------------------------------------")
		await ns.sleep(1000);
	}
}

function println(line) {
	if (message_buffer.length + 1 > message_buffer_length) {
		message_buffer.shift()
	}
	message_buffer.push(line);
}

/** @param {NS} ns */
async function printLines(ns) {
	for (var i in message_buffer) {
		ns.print(message_buffer[i]);
	}
}

/** @param {NS} ns */
function nextUpgrade(ns) {
	var nodes = ns.hacknet.numNodes();

	var upgrade = "node";
	var cost = ns.hacknet.getPurchaseNodeCost();
	var gain = 1.5;
	var rate = gain / cost;
	var node_id = nodes;

	for (var i = 0; i < nodes; i++) {
		var node = ns.hacknet.getNodeStats(i);
		ns.printf("Node %d: %d/%d/%d", i, node.level, node.ram, node.cores);
		//ns.printf(" Cores: %d", node.cores);
		//ns.printf(" Production: %.2f", node.production);
		var level_cost = ns.hacknet.getLevelUpgradeCost(i, 1);
		var level_rate = 1.5 / level_cost;
		if (level_rate > rate) {
			upgrade = "level" 
			cost = level_cost;
			gain = 1.5;
			rate = level_rate;
			node_id = i;
		}
	}
	return {
		"type": upgrade,
		"cost": cost,
		"node": node_id
	};
}