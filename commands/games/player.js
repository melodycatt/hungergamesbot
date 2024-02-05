const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
        const embed = new EmbedBuilder()
            .setTitle(player.discord.username)
            .setDescription(`Game: ${game.name} (Host: ${game.owner.username})\n\n__**Status:**__\n**Health:** ${player.status.health}/100\n**Hunger:** ${player.status.hunger}\n**Thirst:** ${player.status.thirst}`)
            .setThumbnail(player.image)

        const inventory = new ButtonBuilder()
            .setCustomId('inventory')
            .setLabel('Inventory')
            .setStyle(ButtonStyle.Primary);
        const actions = new ButtonBuilder()
            .setCustomId('actions')
            .setLabel('Actions')
            .setStyle(ButtonStyle.Primary)
        const status = new ButtonBuilder()
            .setCustomId('status')
            .setLabel('Status')
            .setStyle(ButtonStyle.Primary)
        const srow = new ActionRowBuilder().addComponents(inventory, actions)
        const irow = new ActionRowBuilder().addComponents(status, actions)
        const arow = new ActionRowBuilder().addComponents(status, inventory)

        if(interaction.options.getSubcommand() === "view") {
            var response = await interaction.reply({
                embeds: [embed],
                components: [srow],
            });
            
            const collectorFilter = i => i.user.id === interaction.user.id;
            let active = true

            try {
                while(active) {
                    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
                    if (confirmation.customId === 'inventory') {
                        response = await interaction.reply({
                            embeds: [embed],
                            components: [irow],
                        });
                    } else if (confirmation.customId === 'actions') {
                        response = await confirmation.update({
                            embeds: [embed],
                            components: [arow],
                        });
                    }
                }
            } catch (e) {
                active = false
                await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
            }
        } else {
            await interaction.reply(`mew ${interaction.options.getUser("host").username}, ${interaction.options.getString('player_name')}`)
        }
	},
};

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

