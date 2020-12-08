const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.js")
require('isomorphic-fetch');

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(config.TelegramToken, {polling: true});


async function apiReq(url, param1 = "GET", param2 = "") {
    return new Promise(resolve => {
        fetch(url, {
            headers: {"Content-Type": "application/json"},
            method: "GET"
        }).then(res => res.json())
            .then(
                (result) => {
                    resolve(result)
                },
                (error) => {
                    console.log(error)
                }
            )
    })
}

async function discordWeb(url, param2 = "") {
    return new Promise(resolve => {
        fetch(url, {
            headers: {"Content-Type": "application/json"},
            method: "POST",
            body: JSON.stringify(param2)

        }).then(res => res.json())
            .then(
                (result) => {
                    resolve(result)
                },
                (error) => {
                }
            )
    })
}

async function rpcReq(url, param1 = "GET", param2 = "") {
    return new Promise(resolve => {
        fetch(url, {
            headers: {"Content-Type": "application/json"},
            method: "POST",
            body: JSON.stringify({"jsonrpc": "2.0", "id": "0", "method": "getblockcount"})
        }).then(res => res.json())
            .then(
                (result) => {
                    resolve(result)
                },
                (error) => {
                    resolve(error)
                }
            )
    })
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

bot.on('message', (msg) => {
    let cmds = msg.text.split(" ")
    botSwitch(cmds, msg.chat.id, 'tele')
});

client.on('message', msg => {
    let cmds = msg.content.split(" ")
    botSwitch(cmds, msg, 'cord')
});

function botSwitch(cmds, id = '', t = '') {
    if (cmds[0].toLowerCase() === '!xeq') {
        for (let i = 0; i < cmds.length; i++) {
            cmds[i] = cmds[i].toLowerCase()
        }
        cmds.shift()
        commands(cmds).then(r => {
            if (t === 'tele') {
                if (typeof r === "string") {
                    bot.sendMessage(id, r);
                } else {
                    bot.sendMessage(id, r[0]);
                }
                return
            }
            if (!r[1])
                r[0] = "```" + r[0] + ["```"]
            id.channel.send(r[0])
        })
    } else if (cmds[0].toLowerCase() === '!to') {
        cmds.shift()
        tradeogre(cmds).then(r => {
            if (t === 'tele') {
                if (typeof r === "string") {
                    bot.sendMessage(id, r);
                } else {
                    bot.sendMessage(id, r[0]);
                }
                return
            }
            id.channel.send("```" + r + "```")
        })
    } else if (cmds[0].toLowerCase() === '!hb') {
        cmds.shift()
        hotbit(cmds).then(r => {
            if (t === 'tele') {
                if (typeof r === "string") {
                    bot.sendMessage(id, r);
                } else {
                    bot.sendMessage(id, r[0]);
                }
                return
            }
            id.channel.send("```" + r + "```")
        })
    }
}

async function commands(cmds) {

    if (cmds[0] === 'help') {

        return ["Documentation: https://github.com/EquilibriaCC/Equilibria/wiki/XEQ-Community-Bot-Command-Reference", true]
    }

    if (cmds[0] === 'progress_update' || cmds[0] === 'trello') {
        return ["Trello Board: https://trello.com/b/3TesxMAB/equilibria", true]
    }

    if (cmds[0] === 'api_hub' || cmds[0] === 'api_link' || cmds[0] === 'api') {
        return ["Link: https://api.ili.bet", true]
    }

    if (cmds[0] === 'exchanges') {
        return ["TradeOgre: https://tradeogre.com/exchange/BTC-XEQ\nHotbit BTC: https://www.hotbit.io/exchange?symbol=XEQ_BTC\nHotbit USDT: https://www.hotbit.io/exchange?symbol=XEQ_USDT", true]
    }

    if (cmds[0] === 'bounties' && cmds[1] === 'info') {
        let bounties = await apiReq("https://api.ili.bet/api/v1/bounties")
        bounties = bounties[0][0]
        return "Budget: " + bounties['budget'].toLocaleString() + " XEQ\nFunding Goal: " + bounties['fund_goal'].toLocaleString() + " XEQ\nAmount Spent: " + bounties['amount_spent'].toLocaleString() + " XEQ\nDonation Address: " + bounties['donation_add']
    } else if (cmds[0] === 'bounties') {
        let bounties = await apiReq("https://api.ili.bet/api/v1/bounties")
        bounties = bounties[1]
        let message = ''
        for (let i = 0; i < bounties.length; i++) {
            message += 'Bounty #' + (Number(i) + 1).toString() + "\nName: " + bounties[i]['title'] + "\nDescription: " + bounties[i]['description'] + "\nReward: " + bounties[i]['reward'] + "\nLimitations: " + bounties[i]['limitations'] + "\nDue Data: " + bounties[i]['due_data'] + "\n\n"
        }
        if (message !== "```")
            return ["No Current Bounties", false]
    }

    if (cmds[0] === 'bounty' && cmds[1] === 'help') {
        return ["Commands:\n- !xeq submit bounty\n- !xeq bounties\n\n When submitting a bounty, please make sure you included the following items:\n- Bounty name or description\n- Proof of the work you did. An explanation may be enough depending on your prior interactions with the team\nYour XEQ Address for payment.", true]

    }

    if (cmds[0] === 'submit' && cmds[1] === 'bounty') {
        let message = msg.author.username + "#" + msg.author.discriminator + "\n"
        cmds.splice(0, 2)
        for (let i = 0; i < cmds.length; i++) {
            message += cmds[i] + " "
        }
        if (msg.channel.id !== '785287383892754442')
            return "Bounty submissions must be sent through the bounty submissions channel in Equilibria's discord"
        await discordWeb(config.WebURL, {"content": message})
        return ["Bounty Sent! Please make sure you included the following items:\n- Bounty name or description\n- Proof of the work you did. An explanation may be enough depending on your prior interactions with the team\nYour XEQ Address for payment.", true]

    }

    if ((cmds[0] === 'market' && cmds[1] === 'info') || cmds[0] === 'market_info') {
        let marketInfo = await apiReq("https://api.coingecko.com/api/v3/coins/triton?tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false")
        let message = "Last Price USD: $" + marketInfo['market_data']['current_price']['usd'] + "\nLast Price BTC: $" + marketInfo['market_data']['current_price']['btc'].toFixed(8) +
            "\nMarket Cap: $" + marketInfo['market_data']['market_cap']['usd'].toLocaleString() + "\nVolume: " + marketInfo['market_data']['total_volume']['usd'].toLocaleString() +
            "\nRank: " + marketInfo['market_data']['market_cap_rank'] + "\n24 Hour High: $" + marketInfo['market_data']['high_24h']['usd'] + "\n24 Hour Low: $" + marketInfo['market_data']['low_24h']['usd'] +
            "%\n24 Hour Price Change: " + marketInfo['market_data']['price_change_percentage_24h'] + "%\n7 Day Price Change: " + marketInfo['market_data']['price_change_percentage_7d'] +
            "%\n30 Day Price Change: " + marketInfo['market_data']['price_change_percentage_30d'] + "%\n60 Day Price Change: " + marketInfo['market_data']['price_change_percentage_60d'] +
            "%\n200 Day Price Change: " + marketInfo['market_data']['price_change_percentage_200d'] + "%\n1 Year Price Change: " + marketInfo['market_data']['price_change_percentage_1y'] +
            "%\n24 Hour MCAP Change: " + marketInfo['market_data']['market_cap_change_24h'].toLocaleString() + "\n24 Hour MCAP % Change: " + marketInfo['market_data']['market_cap_change_percentage_24h'] +
            "%"
        return [message, false]
    }

    if (cmds[0] === 'remote' && cmds[1] === 'nodes') {
        let remoteNodes = ["sanfran.equilibria.network:9231", "newyork.equilibria.network:9231"]

        let waitNodes = []
        for (let i = 0; i < remoteNodes.length; i++) {
            waitNodes.push(rpcReq("http://" + remoteNodes[i] + "/json_rpc", "POST"))
        }
        let nodes = await Promise.all(waitNodes)
        let message = ''
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i]["id"]) {
                message += remoteNodes[i] + " | Online | Height " + nodes[i]["result"]["count"] + "\n"
            } else {
                message += remoteNodes[i] + " | Offline\n"
            }
        }
        return [message, false]
    }

    if (cmds[0] === 'quorum') {
        let nodes = await apiReq("https://api.ili.bet/api/v1/service_nodes")
        let message = ''
        for (let i = 0; i < nodes[2].length; i++) {
            message += nodes[2][i] + "\n"
        }
        return [message, false]
    }

    if (cmds[0] === 'supply') {
        let explorer = await apiReq("https://api.ili.bet/api/v1/explorer")
        return [explorer["emission"].toLocaleString(), false]
    }

    if (cmds[0] === 'node' && cmds[1] === 'info') {
        if (cmds.length < 3)
            return "Bad params"

        let nodes = await apiReq("https://api.ili.bet/api/v1/service_nodes")
        let message
        for (let i = 0; i < nodes[0].length; i++) {
            if (cmds[2] === nodes[0][i]["service_node_pubkey"].toLowerCase()) {
                message = "Oracle Node: " + nodes[0][i]["service_node_pubkey"] + "\nOperator Address: " + nodes[0][i]["operator_address"] +
                    "\nRegistration Height: Block " + nodes[0][i]["registration_height"].toLocaleString() + "\nTotal Staked: " + (Number(nodes[0][i]["total_contributed"]) / 10000).toLocaleString() +
                    "\nNumber of Contributors: " + nodes[0][i]["contributors"].length + "\nLast Reward: Block " + nodes[0][i]["last_reward_block_height"].toLocaleString()
                return [message, false]
            }
        }
        return "Invalid Oracle Node public key."
    }

    if (cmds[0] === 'wallet') {
        return ["Link: https://github.com/EquilibriaCC/Equilibria/releases", true]
    }

    if (cmds[0] === 'explorer') {
        return ["v1 Explorer: https://explorer.equilibria.network/\nBlock Explorer: https://equilibria.network/explorer/blockexplorer\nOracle Explorer: https://equilibria.network/explorer/oracleexplorer", true]
    }

    if (cmds[0] === 'docs' || cmds[0] === 'wiki' || cmds[0] === 'documentation') {
        return ["npm i node-telegram-bot-api\nhttps://wiki.equilibria.network\nhttps://github.com/EquilibriaCC/Equilibria/wiki", true]
    }

    if (cmds[0] === 'website') {
        return ["Link: https://equilibria.network", true]
    }

    if (cmds[0] === 'info' || cmds[0] === 'xi' || cmds[0] === 'i') {

        let networkInfo = apiReq('https://api.ili.bet/api/v1/explorer')
        let lastPrice = lastTOPrice('xeq')
        let data = await Promise.all([networkInfo, lastPrice])
        networkInfo = data[0]
        lastPrice = data[1]

        let message = 'Number of Service Nodes: ' + networkInfo["numberofservicenodes"] + '\nHashrate: ' + networkInfo["hashrate"] + '\nSupply: ' + networkInfo["supply"] + '\nStaking Requirements: ' + networkInfo["stakingreq"]
        message = message + '\nBlock Reward: ' + networkInfo["blockreward"] + '\nDaily Node Reward: ' + networkInfo["nodereward"] + '\nNode Days Until Breakeven: ' + networkInfo["breakeven"]
        message = message + '\nLast XEQ Price: ' + lastPrice.toLocaleString() + '\nMarket Cap: ' + networkInfo["marketcap"].toLocaleString() + '\nRank: ' + networkInfo["rank"]
        return [message, false]
    }

    if (cmds[0] === 'links') {
        return ['Website:   https://equilibria.network/\nWiki:      https://github.com/EquilibriaCC/Equilibria/wiki' +
        '\nWallet:    https://github.com/EquilibriaCC/Equilibria/releases\nExplorer:  http://explorer.equilibria.network/' +
        '\nCoinGecko: https://www.coingecko.com/en/coins/equilibria\nTradeOgre: https://tradeogre.com/exchange/BTC-XEQ' +
        '\nTwitter:   https://twitter.com/EquilibriaCC\nDiscord:   https://discord.gg/pDyfUTs\nGithub:    https://github.com/EquilibriaCC/Equilibria', false]
    }

    if (cmds[0] === 'marketcap' || cmds[0] === 'mcap' || cmds[0] === 'mc') {
        let networkInfo = await apiReq('https://api.ili.bet/api/v1/explorer')

        return ['Market Cap: ' + networkInfo['marketcap'].toLocaleString() + '\nRank: ' + networkInfo['rank'], false]
    }

    if (cmds[0] === 'hash' || cmds[0] === 'hashrate' || cmds[0] === 'diff' || cmds[0] === 'difficulty') {
        let networkInfo = await apiReq('https://api.ili.bet/api/v1/explorer')
        return ['Hashrate: ' + networkInfo['hashrate'].toLocaleString() + '\nDifficulty: ' + networkInfo['difficulty'].toLocaleString(), false]
    }

    if (cmds[0] === 'nodes' || cmds[0] === 'oracle_nodes') {
        let networkInfo = await apiReq('https://api.ili.bet/api/v1/explorer')

        let percentStaked = (Number(networkInfo['total_locked'])) / Math.round(Number(networkInfo['emission'])) * 100
        return ['Number of Oracle Nodes: ' + networkInfo["numberofservicenodes"] + '\nStaking Requirement: ' + networkInfo["stakingreq"].toLocaleString() + '\n' +
        'Daily Node Reward: ' + networkInfo["nodereward"] + '\nAnnual ROI: ' + networkInfo["annual_ROI"] + '\n' +
        'Days Until 100% ROI: ' + networkInfo["breakeven"] + '\nTotal Amount Staked: ' + networkInfo["total_locked"].toLocaleString() + '\nPercent Staked: ' + percentStaked.toFixed(2) + '%', false]

    }

    if (cmds[0] === 'team') {
        return ['Equilibria Team:\nHarrison Hesslink | Blockchain Development & Partner Management | https://twitter.com/HesslinkFX\n' +
        'Thomas Parker | Front-End, Pythia Development & Marketing | https://twitter.com/thomas_d_parker', false]
    }

}

async function lastTOPrice(ticker) {
    ticker = 'btc-' + ticker
    let response = await apiReq('https://tradeogre.com/api/v1/ticker/' + ticker)
    return new Promise(resolve => {
        resolve(response['price'])
    })

}

async function lastBTCPrice() {
    let response = await apiReq("https://api.coindesk.com/v1/bpi/currentprice.json")
    return new Promise(resolve => {
        resolve(response['bpi']['USD']['rate'])
    })
}

async function tradeogre(cmds) {
    if (cmds[0] === 'lp' || cmds[0] === 'last_price') {
        let ticker = 'xeq'
        if (cmds.length > 1) {
            ticker = cmds[1]
        }
        let response = await apiReq('https://tradeogre.com/api/v1/ticker/btc-' + ticker)
        return 'Last ' + ticker.toUpperCase() + ' price: ' + response['price']
    }

    if ((cmds[0] === 'av' || cmds[0] === 'all_volume') || cmds[0] === 'v') {
        if (cmds[0] === 'v') {
            if (cmds.length === 1) {
                return 'Missing ticker name'
            }
            cmds.push(cmds[1])
            cmds[1] = 0.000001
        } else if (cmds.length < 2 && cmds[0] === 'av') {
            cmds[1] = 0.001
        }

        let minVolume = cmds[1]

        let data = await apiReq('https://tradeogre.com/api/v1/markets')
        let tickers = [], volumes = [], changes = [], prices = []
        let longest_ticker_name = 0
        let longest_change_name = 0

        for (let i = 0; i < data.length; i++) {
            let key = Object.keys(data[i])[0]
            if (key.length >= longest_ticker_name) {
                longest_ticker_name = key.length
            }
            if (Number(data[i][key]['volume']) > minVolume && key.includes('BTC')) {
                let initPrice = Number(data[i][key]['initialprice'])
                let lp = Number(data[i][key]['price'])
                let change = (lp / initPrice * 100 - 100).toFixed(2).toString()

                tickers.push(key)
                volumes.push(Number(data[i][key]['volume']))
                changes.push(change)
                prices.push(data[i][key]['price'])

                if (change.length >= longest_change_name) {
                    longest_change_name = change.length
                }
            }
        }
        let orderedTickers = []
        for (let i = 0; i < tickers.length; i++) {
            for (let x = 0; x < tickers.length; x++) {
                if (volumes[x] === Math.max(...volumes)) {
                    orderedTickers.push({
                        "ticker": tickers[x],
                        "volume": volumes[x],
                        "changes": changes[x],
                        "price": prices[x]
                    })
                    changes.splice(x, 1)
                    tickers.splice(x, 1)
                    volumes.splice(x, 1)
                    prices.splice(x, 1)
                }
            }
        }
        tickers = orderedTickers
        let message = '\nTicker' + " ".repeat((longest_ticker_name - 6)) + '  | Volume\n'
        if (cmds[0] === 'av' || cmds[0] === 'all_volume') {
            for (let i = 0; i < tickers.length; i++) {
                message = message + tickers[i]['ticker'] + (" ".repeat(longest_ticker_name - tickers[i]['ticker'].length)) + "  | " + tickers[i]["volume"] + "\n"
            }
        } else {
            for (let i = 0; i < tickers.length; i++) {
                if (tickers[i]['ticker'].toLowerCase().includes(cmds[2]))
                    message = message + tickers[i]['ticker'] + (" ".repeat(longest_ticker_name - tickers[i]['ticker'].length)) + "  | " + tickers[i]["volume"] + "\n"

            }
        }
        return message
    }

    if (cmds[0] === 'bb' || cmds[0] === 'buy_breakeven' || cmds[0] === 'sb' || cmds[0] === 'sell_breakeven') {

        if (cmds[0] === 'sell_breakeven')
            cmds[0] = 'sb'
        if (cmds[0] === 'buy_breakeven')
            cmds[0] = 'bb'

        if (cmds.length < 2) {
            return "Need ticker and target price"
        }

        let ticker = cmds[1]
        let target = cmds[2]

        target = Number('0.' + '0'.repeat(8 - target.toString().length) + target.toString())
        let ogTicker = ticker
        ticker = 'btc-' + ticker

        let price = await apiReq('https://tradeogre.com/api/v1/ticker/' + ticker)
        price = price['price']

        let to = await apiReq('https://tradeogre.com/api/v1/orders/' + ticker)

        let sell = to['sell']
        if (cmds[0] === 'sb')
            sell = to['buy']

        let totalTickerValue = 0
        let totalCost = 0

        let keys = Object.keys(sell)
        if (cmds[0] === 'sb')
            keys.reverse()

        for (let i = 0; i < keys.length; i++) {
            let sp = Number(keys[i])
            if (Number(sell[keys[i]])) {
                if (keys[i] >= target && cmds[0] === 'sb') {
                    let tickerAmount = Number(sell[keys[i]])
                    totalTickerValue += sp * tickerAmount
                    totalCost += sp * tickerAmount
                    totalTickerValue += tickerAmount
                }
                if ((sp <= target && cmds[0] === 'bb')) {
                    let tickerAmount = Number(sell[keys[i]])
                    totalTickerValue += sp * tickerAmount
                    totalTickerValue += tickerAmount
                    totalCost += sp * tickerAmount
                }
            }
        }

        let sellValue = totalCost / totalTickerValue
        let btcPrice = await lastBTCPrice()
        if (cmds[0] === 'sb') {
            return 'Last BTC Price: $' + btcPrice + "\n" +
            'Last ' + ogTicker.toUpperCase() + ' Price: ' + price + "\n" +
            ogTicker.toUpperCase() + ' Buy Target Price: ' + target.toFixed(8) + "\n" +
            'Total BTC Gained: ' + totalCost.toFixed(8) + ' BTC' + "\n" +
            'Total ' + ogTicker.toUpperCase() + ' Sold: ' + totalTickerValue.toFixed(2) + "\n" +
            'Average Price: ' + sellValue.toFixed(8)
        } else if (cmds[0] === 'bb') {
            return 'Last BTC Price: $' + btcPrice + "\n" +
                'Last ' + ogTicker.toUpperCase() + ' Price: ' + price + "\n" +
                ogTicker.toUpperCase() + ' Buy Target Price: ' + target.toFixed(8) + "\n" +
                'Total Cost: ' + totalCost.toFixed(8) + ' BTC' + "\n" +
                'Total Amount of ' + ogTicker.toUpperCase() + ': ' + totalTickerValue.toFixed(2) + "\n" +
                'Average Price: ' + sellValue.toFixed(8)
        }
    }

    if (cmds[0] === 'sw' || cmds[0] === 'sell_walls' || cmds[0] === 'bw' || cmds[0] === 'buy_walls') {

        if (cmds[0] === 'sell_walls')
            cmds[0] = 'sw'
        if (cmds[0] === 'buy_walls')
            cmds[0] = 'bw'
        let _type = cmds[0]

        cmds.shift()
        if (cmds.length < 2)
            return 'invalid params'
        if (cmds.length < 3)
            cmds[2] = 'both'
        if (cmds.length < 4)
            cmds[3] = 1

        let ticker = cmds[0]
        let target = cmds[1]
        let whichWalls = cmds[2].toLowerCase()
        let amount = cmds[3]

        let ogTicker = ticker
        ticker = 'btc-' + ticker

        let p = await apiReq('https://tradeogre.com/api/v1/ticker/' + ticker)
        p = Math.round((Number(p['price']) * 100000000))

        target = Number('0.' + '0'.repeat(8 - target.toString().length) + target.toString())
        let t = target * 100000000

        let to = await apiReq('https://tradeogre.com/api/v1/orders/' + ticker)
        let orders
        if (_type === 'bw') {
            orders = to['buy']
            if (t > p)
                return 'invalid target'
        }
        if (_type === 'sw') {
            orders = to['sell']
            if (t < p)
                return 'invalid target'
        }

        let keys = Object.keys(orders)
        let pricesUnderTarget = []
        for (let i = 0; i < keys.length; i++) {
            let orderPrice = Number(keys[i])
            let tickerAmount = Number(orders[keys[i]])
            let btcAmount = orderPrice * tickerAmount
            if ((_type === 'sw' && orderPrice <= target) || (orderPrice >= target && _type === 'bw')) {
                pricesUnderTarget.push({
                    "price": orderPrice,
                    "ticker_amount": tickerAmount,
                    "btc_amount": btcAmount
                })
            }
        }

        let largestWalls = []

        function wall(pricesUnderTarget, x) {
            let largestTickerWall = {"largest_ticker_wall": 0, "price": 0}
            let largestBTCWall = {"largest_btc_wall": 0, "price": 0}
            for (let j = 0; j < pricesUnderTarget.length; j++) {
                if (!pricesUnderTarget[j])
                    continue
                if (pricesUnderTarget[j]['ticker_amount'] > largestTickerWall['largest_ticker_wall']) {
                    largestTickerWall = {
                        'largest_ticker_wall': pricesUnderTarget[j]['ticker_amount'],
                        'price': pricesUnderTarget[j]['price']
                    }
                }
                if (pricesUnderTarget[j]['btc_amount'] > largestBTCWall['largest_btc_wall']) {
                    largestBTCWall = {
                        'largest_btc_wall': pricesUnderTarget[j]['btc_amount'],
                        'price': pricesUnderTarget[j]['price']
                    }
                }
            }
            largestWalls.push({'Rank': x + 1, 'Ticker Wall': largestTickerWall, 'BTC Wall': largestBTCWall})
            return [largestBTCWall, largestTickerWall]

        }

        for (let x = 0; x < amount; x++) {
            let lastWall = wall(pricesUnderTarget, x)
            for (let y = 0; y < pricesUnderTarget.length; y++) {
                if (!pricesUnderTarget[y])
                    continue
                if (lastWall[0]['price'] === pricesUnderTarget[y]['price'] || lastWall[1]['price'] === pricesUnderTarget[y]['price']) {
                    delete pricesUnderTarget[y]
                }
            }
        }

        for (let j = 0; j < largestWalls.length; j++) {
            largestWalls[j]['Ticker Wall']['price'] = largestWalls[j]['Ticker Wall']['price'].toFixed(8)
            largestWalls[j]['BTC Wall']['price'] = largestWalls[j]['BTC Wall']['price'].toFixed(8)
        }

        function tickerMsg(x) {
            let sellPrice = Math.round(Number(largestWalls[x]["Ticker Wall"]["price"]) * 100000000)
            return 'Rank ' + largestWalls[x]['Rank'] + ' ' + ogTicker.toUpperCase() + ' Wall: ' + largestWalls[x]["Ticker Wall"]["largest_ticker_wall"].toLocaleString() + ' at ' + Math.round(sellPrice).toString() + ' sats\n'
        }

        function BTCMsg(x) {
            let sellPrice = Math.round(Number(largestWalls[x]["BTC Wall"]["price"]) * 100000000)
            return 'Rank ' + largestWalls[x]['Rank'] + ' BTC Wall: ' + largestWalls[x]["BTC Wall"]["largest_btc_wall"].toFixed(4) + ' at ' + sellPrice.toString() + ' sats\n'
        }

        let returnMessage = ''
        for (let x = 0; x < largestWalls.length; x++) {
            let btcMSG = BTCMsg(x)
            let tickerMSG = tickerMsg(x)
            if (whichWalls === 'both') {
                returnMessage += tickerMSG
                returnMessage += btcMSG
            } else if (whichWalls === 'btc') {
                returnMessage += btcMSG
            } else if (whichWalls === ogTicker.toLowerCase()) {
                returnMessage += tickerMSG
            }
        }

        return returnMessage
    }
}

async function hotbit(msg, cmds) {

}


client.login(config.TOKEN);
