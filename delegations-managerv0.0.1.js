const { Client } = require('@hiveio/dhive');
const client = new Client(["https://api.hive.blog", "https://anyx.io"]);
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function runDashboard(username) {
    const target = username.trim() === '' ? 'stayoutoftherz' : username.trim().toLowerCase();
    
    process.stdout.write('\x1Bc'); 
    console.log(`\n+-------------------------------------------+`);
    console.log(`| 🚀 RC MANAGER v0.1 | @${target.padEnd(17)} |`);
    console.log(`+-------------------------------------------+`);

    try {
        const props = await client.database.getDynamicGlobalProperties();
        const ratio = parseFloat(props.total_vesting_fund_hive) / parseFloat(props.total_vesting_shares);

        const [account] = await client.database.getAccounts([target]);
        const rcData = await client.rc.findRCAccounts([target]);

        // 1. HP Resources
        const ownedHP = (parseFloat(account.vesting_shares) * ratio);
        const receivedHP = (parseFloat(account.received_vesting_shares) * ratio);
        const delegatedHP = (parseFloat(account.delegated_vesting_shares) * ratio);
        const totalHP = (ownedHP + receivedHP);
        const availHP = totalHP - delegatedHP;

        // 2. RC Resources
        const currentRC = parseInt(rcData[0].rc_manabar.current_mana);
        const maxRC = parseInt(rcData[0].max_rc);
        const sentRC = parseInt(rcData[0].delegated_rc); // Total RC sent out
        
        const rcPercent = ((currentRC / maxRC) * 100).toFixed(2);
        const sentRCinHP = (sentRC * ratio / 1000000).toFixed(2);
        const availRCinHP = (currentRC * ratio / 1000000).toFixed(2);

        // --- Card: Resource Overview ---
        console.log(`\n [ 📊 RESOURCE OVERVIEW ]`);
        console.log(` +-----------------------------------------+`);
        console.log(` | Total HP    : ${totalHP.toFixed(2).padStart(15)} HP |`);
        console.log(` | Available HP: ${availHP.toFixed(2).padStart(15)} HP |`);
        console.log(` | Sent RC (hp): ${sentRCinHP.padStart(15)} HP |`);
        console.log(` | Avail RC(hp): ${availRCinHP.padStart(15)} HP |`);
        console.log(` | RC Status   : ${rcPercent.padStart(15)} %  |`);
        console.log(` +-----------------------------------------+`);

        // --- Card: HP Delegations (Detailed List) ---
        const hpDelegations = await client.database.call('get_vesting_delegations', [target, '', 50]);
        console.log(`\n [ 💳 HP DELEGATIONS SENT ]`);
        console.log(` +-----------------------------------------+`);
        if (hpDelegations.length === 0) {
            console.log(` | No outgoing HP found.                   |`);
        } else {
            hpDelegations.forEach(d => {
                const val = (parseFloat(d.vesting_shares) * ratio).toFixed(2);
                console.log(` | @${d.delegatee.padEnd(12)} -> ${val.padStart(10)} HP |`);
            });
        }
        console.log(` +-----------------------------------------+`);

        console.log(`\n [⚙️  MENU ]`);
        console.log(` > 'X' to Close | [Enter] to Audit Another`);
        process.stdout.write(`\n 👤 Input Account: `);

    } catch (err) {
        console.log(` [!] Error: ${err.message}`);
        showPrompt();
    }
}

function showPrompt() {
    process.stdout.write('\x1Bc');
    console.log(`\n HIVE TERMINAL v0.1`);
    console.log(` -----------------`);
    process.stdout.write(` 👤 Target (Default: stayoutoftherz): `);
}

rl.on('line', (input) => {
    if (input.toLowerCase() === 'x') {
        console.log('\n [👋] Session Closed.\n');
        process.exit();
    } else {
        runDashboard(input);
    }
});

showPrompt();
