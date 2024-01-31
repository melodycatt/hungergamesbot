const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const market = require('./data/market.json')
const userData = require('../../data/users.json')
const fs = require('node:fs')
const path = require('node:path')
const { Card, CardSet } = require('./data/cardClass.js')
console.log('hio'
)
module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Immediately sell a card for a generally lower price')
        .addStringOption(option =>
            option.setName('id')
            .setDescription('ID of the card to sell')
            .setRequired(true)
        ),
    async execute(interaction) {
        if(userData.registered.includes(interaction.user.id)) {
            const cardNum = await interaction.options.getString('id')
            const card = CardSet.Cardify(userData.balances[interaction.user.id].cards[Math.round(cardNum / 10)], cardNum % 10)
            try {
                userData.balances[interaction.user.id].cards[Math.round(cardNum / 10)].count -= 1
                userData.balances[interaction.user.id].cards[Math.round(cardNum / 10)].qualities.splice(cardNum % 10, 1)
                if (userData.balances[interaction.user.id].cards[Math.round(cardNum / 10)].count < 0) throw new Error()
                if (userData.balances[interaction.user.id].cards[Math.round(cardNum / 10)].count == 0) userData.balances[interaction.user.id].cards.splice(Math.round(cardNum / 10), 1)
            } catch (e) {
                await interaction.reply({content: 'You don\'t have enough of that card!', ephemeral: true})
                userData.balances[interaction.user.id].cards[Math.round(cardNum / 10)].count += 1
                return
            }    
            userData.balances[interaction.user.id].bal += Math.round((25 / card.rarity) * card.quality * 1.25)
            fs.writeFileSync(path.resolve('./data/users.json'), JSON.stringify(userData))
            await interaction.reply({content: `Sold ${card.name} for ${Math.round((25 / card.rarity) * (card.quality) * 1.25)}`})
        } else {
            await interaction.reply({content: 'You aren\'t registered!', ephemeral: true});
        }
    },
};