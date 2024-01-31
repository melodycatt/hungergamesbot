const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const market = require('./data/market.json')
const userData = require('../../data/users.json')
const fs = require('node:fs')
const path = require('node:path')
const { Card, CardSet } = require('./data/cardClass.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('maccept')
        .setDescription('Accept a post offer')
        .addStringOption(option =>
            option.setName('post_id')
            .setDescription('ID of your market post')
            .setRequired(true)
        )
        .addNumberOption(option => 
            option.setName('offer')
            .setDescription('Offer # to accept')
            .setRequired(true)
        ),
    async execute(interaction) {
        if(userData.registered.includes(interaction.user.id)) {
            if(market.map(obj => obj.id).includes(await interaction.options.getString('post_id'))) {
                const id = await interaction.options.getString('post_id')
                const offerNum = await interaction.options.getNumber('offer')
                const post = {...market[market.map(obj => obj.id).indexOf(id)]}
                var offer
                try {
                    offer = post.offers[offerNum - 1]
                } catch (e) {
                    await interaction.reply({content: 'That offer does not exist!', ephemeral: true});
                    return
                }
                if(userData.balances[offer.owner].cards.map(obj => obj.name).includes(post.card.name)) {
                    userData.balances[offer.owner].cards[userData.balances[offer.owner].cards.map(obj => obj.name).indexOf(post.card.name)].count += post.count
                } else {
                    userData.balances[offer.owner].cards.push(Card.Setify(post.card))
                }    
                userData.balances[offer.owner].bal -= offer.offer
                userData.balances[post.owner].bal += offer.offer
                market.splice(market.map(obj => obj.id).indexOf(id), 1);
                await interaction.reply({content: `Your offer was accepted! (<@${offer.owner}>)`});
            } else {
                await interaction.reply({content: 'That post does not exist!', ephemeral: true});
            }
        } else {
            await interaction.reply({content: 'You aren\'t registered!', ephemeral: true});
        }
    },
};