const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const data = require('./data/data.json')
const {Game, Player} = require('./data/util.js');
const fs = require('node:fs');
const path = require('node:path');
console.log(Game, "hd")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('game')
		.setDescription('Provides information about the user.')
        /*.addSubcommand(subcommand =>
            subcommand
            .setName('user')
            .setDescription('Info about a user')
            .addUserOption(option => option.setName('target').setDescription('The user')))
        .addSubcommand(subcommand =>
            subcommand
            .setName('server')
            .setDescription('Info about the server')
            .addStringOption(option =>
                option.setName("message")
                    .setDescription("The message to echo.")))*/
        ,
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
        const game = new Game(interaction.user)
        await game.genMap()
        const attachment = new AttachmentBuilder(game.image, { name: 'map.png' });
        console.log(interaction.user, game.image, attachment)
        console.log(JSON.stringify(game), "LSOOSOPOSIWIODJ")
        data[game.owner.id] = JSON.stringify(game)
        fs.writeFileSync(path.join(__dirname, 'data/data.json'), JSON.stringify(data));
	    await interaction.reply({content: `${game.owner.username}`, files: [attachment]});
	},
};