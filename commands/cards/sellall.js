const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const market = require('./data/market.json')
const userData = require('../../data/users.json')
const fs = require('node:fs')
const path = require('node:path')
const { Card, CardSet } = require('./data/cardClass.js')
console.log('hi')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('sellall')
        .setDescription('Immediately sell all of a card for a generally lower price')
        .addStringOption(option =>
            option.setName('id')
            .setDescription('ID of the card to sell')
            .setRequired(true)
        ),
    async execute(interaction) {
        if(userData.registered.includes(interaction.user.id)) {
            const cardNum = await interaction.options.getString('id')
            const card = CardSet.Setify(userData.balances[interaction.user.id].cards[Math.round(cardNum)])
            var total = 0
            for (let i in card.qualities) {
                userData.balances[interaction.user.id].bal += Math.round((25 / card.rarity) * card.qualities[i] * 1.5)
                total += Math.round((25 / card.rarity) * card.qualities[i] * 1.25)
            }
            try {
                userData.balances[interaction.user.id].cards.splice(Math.round(cardNum / 10), 1)
            } catch (e) {
                await interaction.reply({content: 'You don\'t have enough of that card!', ephemeral: true})
                return
            }    
            fs.writeFileSync(path.resolve('./data/users.json'), JSON.stringify(userData))
            await interaction.reply({content: `Sold all of ${card.name} for ${total}`})
        } else {
            await interaction.reply({content: 'You aren\'t registered!', ephemeral: true});
        }
    },
};