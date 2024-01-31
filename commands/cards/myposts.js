const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
var market = require('./data/market.json')
const userData = require('../../data/users.json')
const fs = require('node:fs')
const path = require('node:path')
const { Card, CardSet } = require('./data/cardClass.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('myposts')
        .setDescription('Look at your posts'),
    async execute(interaction) {
        await interaction.reply('Loading market data...');
        for (let i = 0; i < market.length; i++) {
            if (market[i].expiry <= time) {
                if(userData.balances[market[i].owner].cards.map(obj => obj.name).includes(market[i].card.name)) {
                    userData.balances[market[i].owner].cards[userData.balances[market[i].owner].cards.map(obj => obj.name).indexOf(market[i].card.name)].count += 1
                } else {
                    userData.balances[market[i].owner].cards.push(Card.Setify(market[i].card))
                }
                market.splice(i, 1);
                i--
            }
        }
        market = market.map(obj => obj.owner == interaction.user.id? obj: null).filter(obj => obj)
        const time = Date.now() / 1000;
        let embed = new EmbedBuilder()
            .setTitle(`Market results (1-10/${market.length})`)
            .setDescription(`<t:${Math.round(Date.now() / 1000)}:t>`)

        const right = new ButtonBuilder()
            .setCustomId('right')
            .setLabel('>')
            .setStyle(ButtonStyle.Primary)

        const left = new ButtonBuilder()
            .setCustomId('left')
            .setLabel('<')
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder()
            .addComponents(left)
            .addComponents(right)
        
        for (let i of market.slice(0, 10)) {
            embed.addFields({ name: `${i.title} | ID: ${i.id}`, value: `Expiry: <t:${Math.round(i.expiry)}:R>\nPrice: ${i.price}\nCard: ${i.card.count} of ${i.card.name}\n*${i.offers.length} offers*`})
        }
        fs.writeFileSync(path.resolve('./commands/cards/market.json'), JSON.stringify(market));
        var response = await interaction.editReply({embeds: [embed], content: '', components: [row]});
        const collectorFilter = i => i.user.id === interaction.user.id;
        let run = true
        let range = [0, 10, 10]
        try {
            while (run) {
				var confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 15000 });   
                if (confirmation.customId == 'left') {
                    if (range[0] - range[2] < 0) {
                        range[0] = market.length - (market.length % range[2])
                        range[1] = market.length
                    } else {
                        range[0] -= range[2]
                        range[1] = range[1] == market.length? market.length - (market.length % range[2]): range[1] - range[2]
                    }
                } 
                if (confirmation.customId == 'right') {
                    if (range[1] == market.length) {
                        range[0] = 0
                        range[1] = market.length < range[2]? market.length: range[2]
                    } else {
                        if (range[1] + range[2] > market.length) {
                            range[0] += range[2]
                            range[1] = market.length
                        } else {
                            range[0] += range[2]
                            range[1] += range[2]
                        }
                    }
                }
                let embed = new EmbedBuilder()
                    .setTitle(`Market results (${range[0]+1}-${range[1]}/${market.length})`)
                    .setDescription(`<t:${Math.round(Date.now() / 1000)}:t>`)
                for (let i of market.slice(range[0], range[1])) {
                    embed.addFields({ name: i.title, value: `Expiry: <t:${Math.round(i.expiry)}:R>\nPrice: ${i.price}\nCard: ${i.card.count} of ${i.card.name}`})
                }
                var response = await confirmation.update({embeds: [embed], content: '', components: [row]})
			}
        } catch (e) {
			run = false
            var response = await interaction.editReply({embeds: [embed], content: '', components: []})
		}
    },
};