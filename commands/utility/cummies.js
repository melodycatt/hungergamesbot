
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cummies')
		.setDescription('gettin horny'),
//		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		console.log(interaction.user)
		await interaction.reply('<:cummies:1164043027468267561>');
	},
};