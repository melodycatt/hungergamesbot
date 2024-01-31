const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const userData = require('../../data/users.json')
weight = function(arr) {
    return [].concat(...arr.map((obj) => Array(Math.ceil(obj.rarity * 100)).fill(obj))); 
}
var cards = weight(require('./data/cards.json'));
const packs = [...new Set(cards.map(x => x.pack))]
const path = require('node:path');
const fs = require('node:fs');
const sleep = (ms) => {return new Promise(resolve => setTimeout(resolve, ms))};
const { Card, CardSet } = require('./data/cardClass.js') 
console.log(packs)
module.exports = {
	data: new SlashCommandBuilder()
		.setName('boosterpack')
		.setDescription('Open a booster pack')
        .addStringOption(option => {
            option.setName('pack')
            .setDescription('What pack to open')
            .setRequired(true);
            for (let i = 0; i < packs.length; i++) {
                option.addChoices({name: packs[i], value: packs[i]})
            }
            return option;
        }),    
	async execute(interaction) {
        if(userData.registered.includes(interaction.user.id)) {
            var cardsGained = []
            const userPacks = userData.balances[interaction.user.id].inv.filter(obj => obj.type == "pack")
            const pack = interaction.options.getString('pack')
            if(!userPacks.map(x => x.name).includes(pack)) {
                await interaction.reply({content: 'You don\'t have any of that pack', ephemeral: true})
                return
            }
            userData.balances[interaction.user.id].inv[userData.balances[interaction.user.id].inv.map(x => x.name).indexOf(pack)].count -= 1
            if(!userData.balances[interaction.user.id].inv[userData.balances[interaction.user.id].inv.map(x => x.name).indexOf(pack)].count) userData.balances[interaction.user.id].inv.splice(userData.balances[interaction.user.id].inv.map(x => x.name).indexOf(pack), 1)
            await interaction.reply(`Opening a(n) ${pack} booster pack...`);
            await sleep(1000)
            playerCards = userData.balances[interaction.user.id].cards.map(card => CardSet.Setify(card))
            cards = cards.map(obj => Card.Cardify(obj)).map(obj => pack == 'all'? obj: obj.pack == pack? obj: null).filter(obj => obj)
            console.log([...new Set(cards)])
            for(let i = 0; i < 5; i++) {
                var TempCard = cards[Math.round(Math.random() * (cards.length - 1))]
                if(cardsGained.includes(TempCard)) {
                    cardsGained[cardsGained.indexOf(TempCard)].count ++
                    if(playerCards.map(card => card.name).includes(TempCard.name)) {
                        playerCards[playerCards.map(card => card.name).indexOf(TempCard.name)].add(TempCard)
                    } else {
                        playerCards.push(Card.Setify(TempCard))
                    }
                } else {
                    cardsGained.push(TempCard)
                    if(playerCards.map(card => card.name).includes(TempCard.name)) {
                        playerCards[playerCards.map(card => card.name).indexOf(TempCard.name)].add(TempCard)
                    } else {
                        playerCards.push(Card.Setify(TempCard))
                    }
                }
                await interaction.channel.send(`You gained a(n) ${TempCard.name} with a quality of ${TempCard.quality}`);
                await sleep(500)
            }
            userData.balances[interaction.user.id].cards = playerCards
            console.log(cardsGained)
            fs.writeFileSync(path.resolve('./data/users.json'), JSON.stringify(userData))
        }
	},
};
