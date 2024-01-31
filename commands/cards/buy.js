const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const market = require('./data/market.json')
const userData = require('../../data/users.json')
const fs = require('node:fs')
const path = require('node:path')
const { Card, CardSet } = require('./data/cardClass.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mbuy')
        .setDescription('Make an offer for a market post')
        .addStringOption(option =>
            option.setName('id')
            .setDescription('ID of the market post')
            .setRequired(true)
        )
        .addNumberOption(option => 
            option.setName('offer')
            .setDescription('How much money to offer')
            .setRequired(true)
        ),
    async execute(interaction) {
        if(userData.registered.includes(interaction.user.id)) {
            if(market.map(obj => obj.id).includes(await interaction.options.getString('id'))) {
                const id = await interaction.options.getString('id')
                const price = await interaction.options.getNumber('offer')
                const post = {...market[market.map(obj => obj.id).indexOf(id)]}
                if (userData.balances[interaction.user.id].bal < price) {
                    await interaction.reply({content: 'You don\'t have enough money!', ephemeral: true});
                    return
                }
                if (price < post.price) {
                    await interaction.reply({content: 'Offer too small!', ephemeral: true});
                    return
                }
                if (post.autoaccept) {
                    if(userData.balances[interaction.user.id].cards.map(obj => obj.name).includes(post.card.name)) {
                        userData.balances[interaction.user.id].cards[userData.balances[interaction.user.id].cards.map(obj => obj.name).indexOf(post.card.name)].count += post.count
                    } else {
                        userData.balances[interaction.user.id].cards.push(Card.Setify(post.card))
                    }    
                    userData.balances[interaction.user.id].bal -= price
                    userData.balances[post.owner].bal += price
                    market.splice(market.map(obj => obj.id).indexOf(id), 1);
                    await interaction.reply({content: `Your offer was autoaccepted! (<@${post.owner}>)`})
                } else {
                    post.offers.push({
                        owner: interaction.user.id,
                        offer: price,
                        id: post.offers.length + 1,
                        username: interaction.user.username
                    })
                    await interaction.reply({content: `<@${post.owner}>, someone made a offer on your post! (<@${interaction.user.id}>)`})
                }
            } else {
                await interaction.reply({content: 'That post does not exist!', ephemeral: true});
            }
        } else {
            await interaction.reply({content: 'You aren\'t registered!', ephemeral: true});
        }
    },
};