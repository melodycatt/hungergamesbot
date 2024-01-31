const shop = require('./data/shop.json')
const userData = require('../../data/users.json')
const pages = Object.keys(shop)
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
console.log('hi')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sbuy')
		.setDescription('Buy a shop item')
        .addStringOption(option => 
            option.setName('item')
            .setDescription('The name of the item to buy. Usually all lowercase.')
            .setRequired(true)
        ),
	async execute(interaction) {
        if (userData.registered.includes(interaction.user.id)) {
            selection = await interaction.options.getString('item')
            console.log([].concat(Object.values(shop).map(x => x.items)).find(x => x[0] == selection), [].concat(Object.values(shop).map(x => x.items)), selection)
            selection = (Object.values(shop).map(x => x.items)).flat().find(x => x[0] == selection)
            userData.balances[interaction.user.id].bal -= selection[1]
            if(userData.balances[interaction.user.id].bal < 0) {
                userData.balances[interaction.user.id].bal += selection[1]
                await interaction.reply({content: "You dont have enough money", ephemeral: true})
                return
            }
            if(userData.balances[interaction.user.id].inv.map(x => x.name).includes(selection[0])) {
                userData.balances[interaction.user.id].inv[userData.balances[interaction.user.id].inv.map(x => x.name).indexOf(selection[0])].count += selection[3].count
            } else {
                userData.balances[interaction.user.id].inv.push(selection[3])
            }
            await interaction.reply({content: `Bought ${selection[0]} for ${selection[1]}`})
        } else {
            await interaction.reply({content: "You aren't registered!", ephemeral: true})
        }
	},
};