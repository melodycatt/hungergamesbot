const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const {Game, Player} = require('./data/util.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('player')
		.setDescription('Manage a player')
        .addSubcommand(subcommand =>
            subcommand
            .setName('actions')
            .setDescription('View the players actions for this round')
            .addUserOption(option =>
                option.setName("host")
                    .setDescription('The host of the game the player is in'))
            .addStringOption(option =>
                option.setName("player_name")
                    .setDescription(".")))
        .addSubcommand(subcommand =>
            subcommand
            .setName('view')
            .setDescription('View all info about the player')
            .addUserOption(option =>
                option.setName("host")
                    .setDescription('The host of the game the player is in'))
            .addStringOption(option =>
                option.setName("player_name")
                    .setDescription(".")))
        .addSubcommand(subcommand =>
            subcommand
            .setName('inventory')
            .setDescription('View the players inventory')
            .addUserOption(option =>
                option.setName("host")
                    .setDescription('The host of the game the player is in'))
            .addStringOption(option =>
                option.setName("player_name")
                    .setDescription(".")))
        .addSubcommand(subcommand =>
            subcommand
            .setName('delete')
            .setDescription('Delete your player from the game')
            .addUserOption(option =>
                option.setName("host")
                    .setDescription('The host of the game the player is in'))
            .addStringOption(option =>
                option.setName("player_name")
                    .setDescription("."))),
	async execute(interaction) {
        const data = require('./data/data.json')
        const game = Game.toGame(JSON.parse(data[interaction.options.getUser("host").id]))
        const player = game.players[game.players.map(obj => obj.discord.username).indexOf(interaction.options.getString('player_name'))]
        if(interaction.options.getSubcommand() === "view") {
            const embed = new EmbedBuilder()
                .setTitle(player.discord.username)
                .setDescription(`Game: ${game.name} (Host: ${game.owner.username})\n\nStatus:\n**Health:** ${player.status.health}/100\n**Hunger:** ${player.status.hunger}\n**Thirst:** ${player.status.thirst}`)
                .setThumbnail(player.image)
        } else {
            await interaction.reply(`mew ${interaction.options.getUser("host").username}, ${interaction.options.getString('player_name')}`)
        }
	},
};

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

