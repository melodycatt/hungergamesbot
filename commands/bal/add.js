const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const userData = require('../../data/users.json')
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Give a user money')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('User to give money to')
            .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('amount')
            .setDescription('Amount to give')    
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
        const target = await interaction.options.getUser('user')
        const amount = await interaction.options.getNumber('amount')
        if(userData.registered.includes(target.id)) {
            userData.balances[target.id].bal += amount
            fs.writeFileSync(path.resolve('./data/users.json'), JSON.stringify(userData))
            await interaction.reply({content: `Gave ${amount} to ${target.username}`});
        }
	},
};