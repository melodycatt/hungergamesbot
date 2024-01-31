const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Provides information about the user.')
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The message to echo.")
        )
        ,
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
        const string = interaction.option.getString('message')
		await interaction.reply(`${string}`);
	},
};