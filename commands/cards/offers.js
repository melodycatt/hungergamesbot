const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
var market = require('./data/market.json')
const userData = require('../../data/users.json')
const fs = require('node:fs')
const path = require('node:path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moffers')
        .setDescription('See your offers'),
    async execute(interaction) {
        await interaction.reply('Loading market data...');
        market = market.map(obj => obj.owner == interaction.user.id? obj: null).filter(obj => obj)
        let embed = new EmbedBuilder()
            .setTitle(`Offers for ${interaction.user.username}`)
            .setDescription(`<t:${Math.round(Date.now() / 1000)}:t>`)
        for (let i of market) {
            for (let j of i.offers) {
                embed.addFields({ name: `${j.username}`, value: `Offer: ${j.offer}, Post: ${i.id}, Offer #: ${j.id}`})
            }
        }
        await interaction.editReply({embeds: [embed], content: ''})
    },
};