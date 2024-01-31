const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const userData = require('../../data/users.json')
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gift')
		.setDescription('Gift a user money')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('User to give money to')
            .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('amount')
            .setDescription('Amount to give')    
            .setRequired(true)
        ),
	async execute(interaction) {
        const target = await interaction.options.getUser('user')
        const gifterbal = userData.balances[interaction.user.id].bal
        const amount = await interaction.options.getNumber('amount')
        if(gifterbal - amount < 0) {
            await interaction.reply({content: 'You dont have the money for that!', ephemeral: true})
            return
        }
        if(userData.registered.includes(target.id) && userData.registered.includes(interaction.user.id)) {
            userData.balances[target.id].bal += amount
            userData.balances[interaction.user.id].bal -= amount
            fs.writeFileSync(path.resolve('./data/users.json'), JSON.stringify(userData))
            await interaction.reply(`Gave ${amount} to ${target.username}. Your balance is now ${gifterbal - amount}`);
        }
	},
};