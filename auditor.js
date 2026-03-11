const { Client } = require('@hiveio/dhive');
const blessed = require('blessed');

const client = new Client(["https://api.hive.blog", "https://anyx.io"]);

const screen = blessed.screen({
    smartCSR: true,
    title: 'Hive Resource Auditor v0.0.1',
    fullUnicode: true
});

// --- UI LAYOUT ---

const header = blessed.box({
    parent: screen,
    top: 0, left: 0, width: '100%', height: 3,
    border: { type: 'line', fg: 'cyan' },
    tags: true,
    content: '{center}{bold}HIVE RESOURCE AUDITOR v0.0.1{/bold}{/center}'
});

const hpBox = blessed.box({
    parent: screen,
    top: 3, left: 0, width: '50%', height: 5,
    label: ' Hive Power (HP) ',
    border: { type: 'line', fg: 'green' },
    tags: true,
    content: ' Total: {white-fg}0.00 HP{/}\n Sent:  {yellow-fg}0.00 HP{/}\n Avail: {bold}{green-fg}0.00 HP{/}'
});

const rcBox = blessed.box({
    parent: screen,
    top: 3, left: '50%', width: '50%', height: 5,
    label: ' Resource Credits ',
    border: { type: 'line', fg: 'cyan' },
    tags: true,
    content: ' Total: {white-fg}0.00 HP{/}\n Sent:  {yellow-fg}0.00 HP{/}\n Avail: {bold}{cyan-fg}0.00 HP{/}'
});

const hpBar = blessed.progressbar({
    parent: screen,
    top: 7, left: 0, width: '50%', height: 3,
    label: ' HP %: 0% ', 
    border: { type: 'line', fg: 'green' },
    style: { bar: { bg: 'red' } },
    filled: 0
});

const rcBar = blessed.progressbar({
    parent: screen,
    top: 7, left: '50%', width: '50%', height: 3,
    label: ' RC %: 0% ',
    border: { type: 'line', fg: 'cyan' },
    style: { bar: { bg: 'red' } },
    filled: 0
});

const footer = blessed.box({
    parent: screen,
    top: 10, left: 0, width: '100%', height: 6,
    label: ' Navigation ',
    border: { type: 'line', fg: 'yellow' },
    tags: true,
    content: '{center}{yellow-fg}[N]{/} New Audit | {yellow-fg}[Q]{/} Quit{/center}'
});

const prompt = blessed.textbox({
    parent: screen, top: 'center', left: 'center', height: 3, width: 40,
    label: ' (Enter for Default) ',
    border: { type: 'line', fg: 'yellow' },
    style: { bg: 'blue', fg: 'white' },
    inputOnFocus: true
});

const detailsTable = blessed.listtable({
    parent: screen, top: '10%', left: '5%', width: '90%', height: '80%',
    border: { type: 'line', fg: 'white' },
    hidden: true, keys: true, interactive: true,
    tags: true,
    label: ' {yellow-fg}[B]{/} Back ',
    style: { header: { fg: 'cyan', bold: true }, cell: { selected: { bg: 'blue' } } }
});

// --- LOGIC ---

function updateBar(bar, p, labelPrefix) {
    let color = 'green';
    if (p < 30) color = 'red';
    else if (p < 80) color = 'yellow';
    bar.style.bar.bg = color;
    bar.setProgress(p);
    bar.setLabel(` ${labelPrefix}: ${p}% `);
}

async function fetchData(username) {
    const target = (username || 'stayoutoftherz').trim().toLowerCase();
    header.setContent(`{center}{bold}AUDITING: @${target.toUpperCase()}{/bold}{/center}`);
    footer.setContent(`{center}Fetching...{/center}`);
    screen.render();
    
    try {
        const props = await client.database.getDynamicGlobalProperties();
        const ratio = parseFloat(props.total_vesting_fund_hive) / parseFloat(props.total_vesting_shares);
        const [account] = await client.database.getAccounts([target]);
        if (!account) throw new Error('User not found');
        
        const rcData = await client.rc.findRCAccounts([target]);
        const hpDels = await client.database.call('get_vesting_delegations', [target, '', 1000]);

        const totalHP = (parseFloat(account.vesting_shares) + parseFloat(account.received_vesting_shares)) * ratio;
        const sentHP = parseFloat(account.delegated_vesting_shares) * ratio;
        const availHP = totalHP - sentHP;
        const hpP = Math.round((availHP / totalHP) * 100);

        const maxRC = parseInt(rcData[0].max_rc);
        const currRC = parseInt(rcData[0].rc_manabar.current_mana);
        const sentRC_raw = parseInt(rcData[0].delegated_rc);
        const rcP = Math.round((currRC / maxRC) * 100);

        hpBox.setContent(` Total: {white-fg}${totalHP.toFixed(2)} HP{/}\n Sent:  {yellow-fg}${sentHP.toFixed(2)} HP{/}\n Avail: {bold}{green-fg}${availHP.toFixed(2)} HP{/}`);
        rcBox.setContent(` Total: {white-fg}${(maxRC * ratio / 1000000).toFixed(2)} HP{/}\n Sent:  {yellow-fg}${(sentRC_raw * ratio / 1000000).toFixed(2)} HP{/}\n Avail: {bold}{cyan-fg}${(currRC * ratio / 1000000).toFixed(2)} HP{/}`);

        updateBar(hpBar, hpP, 'HP %');
        updateBar(rcBar, rcP, 'RC %');

        // PAIRED NAVIGATION LOGIC
        let options = [];
        if (hpDels.length > 0) {
            options.push('{yellow-fg}[H]{/} HP List');
            screen.data.hpList = [['Recipient', 'Amount (HP)'], ...hpDels.map(d => [`@${d.delegatee}`, (parseFloat(d.vesting_shares) * ratio).toFixed(2)])];
        } else { screen.data.hpList = null; }

        if (sentRC_raw > 0) {
            options.push('{yellow-fg}[R]{/} RC List');
            screen.data.rcSent = true;
        } else { screen.data.rcSent = false; }

        options.push('{yellow-fg}[N]{/} New Audit');
        options.push('{yellow-fg}[Q]{/} Quit');
        
        // Group into lines of 2 for clean layout
        let navContent = '';
        for (let i = 0; i < options.length; i += 2) {
            let line = options.slice(i, i + 2).join('  |  ');
            navContent += `\n{center}${line}{/center}`;
        }
        
        footer.setContent(navContent);
        screen.render();
    } catch (err) {
        footer.setContent(`{center}{red-fg}Error: ${err.message}{/center}`);
        screen.render();
    }
}

// --- KEYS ---

screen.key(['n'], () => { prompt.show(); prompt.focus(); prompt.setValue(''); screen.render(); });
screen.key(['h'], () => { if (screen.data.hpList) { detailsTable.setData(screen.data.hpList); detailsTable.show(); detailsTable.focus(); screen.render(); } });
screen.key(['r'], () => { if (screen.data.rcSent) { detailsTable.setData([['RC Slot', 'Info'], ['RC Delegation List', 'Coming in next update']]); detailsTable.show(); detailsTable.focus(); screen.render(); } });
detailsTable.key(['b', 'escape'], () => { detailsTable.hide(); screen.render(); });
prompt.on('submit', (val) => { prompt.hide(); fetchData(val); });
screen.key(['q', 'C-c'], () => process.exit(0));

screen.render();
prompt.focus();
