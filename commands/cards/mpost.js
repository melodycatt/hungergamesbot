const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const market = require('./data/market.json')
const userData = require('../../data/users.json')
const fs = require('node:fs');
const path = require('node:path');
const { Card, CardSet} = require('./data/cardClass.js')

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mpost')
        .setDescription('Create a market post.')
        .addStringOption(option => 
            option.setName('title')
            .setDescription('title')
            .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('card')
            .setDescription('The inventory number of your card that you are selling')
            .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('price')
            .setDescription('Minimum price for your card(s)')
            .setRequired(true)
            )
        .addNumberOption(option =>
            option.setName('length')
            .setDescription('How long do you want your post to be up for? (in minutes)')
            .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('autoaccept')
            .setDescription('Automatically accept the first offer to your post')
        ),
    async execute(interaction) {
        if (userData.registered.includes(interaction.user.id)) {
            const title = await interaction.options.getString('title');
            const cardNum = Math.round(await interaction.options.getNumber('card'));
            const price = Math.round(await interaction.options.getNumber('price'));
            const length = await interaction.options.getNumber('length');
            const expiry = Date.now() / 1000 + (Math.round(length) * 60);
            const autoaccept = await interaction.options.getBoolean('autoaccept') ?? false;
            try {
                var card = CardSet.Cardify({...userData.balances[interaction.user.id].cards[Math.round(cardNum / 10)]}, cardNum % 10)
            } catch (e) {
                await interaction.reply({content: 'That card does not exist!', ephemeral: true})
                return
            }
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
            var id = makeid(4)
            while (market.map(obj => obj.id).includes(id)) {
                id = makeid(4)
            }
            market.push({title: title, expiry: expiry, price: price, card: card, owner: interaction.user.id, autoaccept: autoaccept, id: id, offers: []})
            console.log(card.count, count, card)
            fs.writeFileSync(path.resolve('./commands/cards/market.json'), JSON.stringify(market));
            fs.writeFileSync(path.resolve('./data/users.json'), JSON.stringify(userData));
            await interaction.reply(`Posted ${title}`);
        } else {
            await interaction.reply({content: 'You aren\'t registered!', ephemeral: true})
        }
    },
};