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
        const player = Player.toPlayer(game.players[game.players.map(obj => obj.discord.username).indexOf(interaction.options.getString('player_name'))])
        console.log(player, player.roundActions)
        var embed = new EmbedBuilder()
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
        const next = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('>')
            .setStyle(ButtonStyle.Primary)
        const prev = new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('<')
            .setStyle(ButtonStyle.Primary)
        const srow = new ActionRowBuilder().addComponents(inventory, actions)
        const irow = new ActionRowBuilder().addComponents(status, actions)
        const arow = new ActionRowBuilder().addComponents(status, inventory)
        const crow = new ActionRowBuilder().addComponents(prev, next)

        if(interaction.options.getSubcommand() === "view") {
            var response = await interaction.reply({
                embeds: [embed],
                components: [srow],
            });
            
            const collectorFilter = i => i.user.id === interaction.user.id;
            let active = true
            let actionI = 0
            try {
                while(active) {
                    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
                    console.log(actionI)
                    if (confirmation.customId === 'inventory') {
                        response = await confirmation.update({
                            embeds: [embed],
                            components: [irow],
                        });
                    } else if (confirmation.customId === 'actions') {
                        let action = player.roundActions[actionI]
                        console.log(action.damage, action.damage? true: false)
                        embed = new EmbedBuilder()
                            .setTitle(`${player.discord.username}`)
                            .setDescription(`Action ${actionI + 1}/${player.roundActions.length}`)
                            .setThumbnail(player.image)
                            .addFields({'name': player.roundActions[actionI].text, 'value': `${action.status.hunger ? `${action.status.hunger > 0 ? '+' : ''}${action.status.hunger} Hunger\n`: ''}${action.status.thirst ? `${action.status.thirst > 0 ? '+' : ''}${action.status.thirst} Thirst\n`: ''}${action.damage ? `${action.damage / -1 > 0 ? '+' : '-'}${Math.abs(action.damage)} Health\n`: ''}${action.items.gained.length ? `+ ${action.items.gained.map(obj => `${obj.count} ${obj.name}(s)`).toString()}\n`: ''}${action.items.lost.length ? ` | - ${action.items.lost.map(obj => `${obj.count} ${obj.name}(s)`).toString()}\n`: ''}`})
                        response = await confirmation.update({
                            embeds: [embed],
                            components: [arow, crow],
                        });
                    } else if (confirmation.customId === 'status') {
                        var embed = new EmbedBuilder()
                            .setTitle(player.discord.username)
                            .setDescription(`Game: ${game.name} (Host: ${game.owner.username})\n\n__**Status:**__\n**Health:** ${player.status.health}/100\n**Hunger:** ${player.status.hunger}\n**Thirst:** ${player.status.thirst}`)
                            .setThumbnail(player.image)            
                        response = await confirmation.update({
                            embeds: [embed],
                            components: [srow],
                        });
                    } else if (confirmation.customId === 'next') {
                        console.log("pre add", player.roundActions.length, actionI + 1, (actionI + 1) % player.roundActions.length)
                        actionI = (actionI + 1) % player.roundActions.length ? actionI + 1 : 0
                        let action = player.roundActions[actionI]
                        console.log(action.damage, action.damage? true: false)
                        embed = new EmbedBuilder()
                            .setTitle(`${player.discord.username}`)
                            .setDescription(`Action ${actionI + 1}/${player.roundActions.length}`)
                            .setThumbnail(player.image)
                            .addFields({'name': player.roundActions[actionI].text, 'value': `${action.status.hunger ? `${action.status.hunger > 0 ? '+' : ''}${action.status.hunger} Hunger\n`: ''}${action.status.thirst ? `${action.status.thirst > 0 ? '+' : ''}${action.status.thirst} Thirst\n`: ''}${action.damage ? `${action.damage / -1 > 0 ? '+' : '-'}${Math.abs(action.damage)} Health\n`: ''}${action.items.gained.length ? `+ ${action.items.gained.map(obj => `${obj.count} ${obj.name}(s)`).toString()}\n`: ''}${action.items.lost.length ? ` | - ${action.items.lost.map(obj => `${obj.count} ${obj.name}(s)`).toString()}\n`: ''}`})
                        response = await confirmation.update({
                            embeds: [embed],
                            components: [arow, crow],
                        });
                    } else if (confirmation.customId === 'prev') {
                        actionI = actionI - 1 >= 0 ? actionI - 1 : (player.roundActions.length - 1)
                        let action = player.roundActions[actionI]
                        console.log(action.damage, action.damage? true: false)
                        embed = new EmbedBuilder()
                            .setTitle(`${player.discord.username}`)
                            .setDescription(`Action ${actionI + 1}/${player.roundActions.length}`)
                            .setThumbnail(player.image)
                            .addFields({'name': player.roundActions[actionI].text, 'value': `${action.status.hunger ? `${action.status.hunger > 0 ? '+' : ''}${action.status.hunger} Hunger\n`: ''}${action.status.thirst ? `${action.status.thirst > 0 ? '+' : ''}${action.status.thirst} Thirst\n`: ''}${action.damage ? `${action.damage / -1 > 0 ? '+' : '-'}${Math.abs(action.damage)} Health\n`: ''}${action.items.gained.length ? `+ ${action.items.gained.map(obj => `${obj.count} ${obj.name}(s)`).toString()}\n`: ''}${action.items.lost.length ? ` | - ${action.items.lost.map(obj => `${obj.count} ${obj.name}(s)`).toString()}\n`: ''}`})
                        response = await confirmation.update({
                            embeds: [embed],
                            components: [arow, crow],
                        });
                    }
                }
            } catch (e) {
                console.log(e)
                active = false
                await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
            }
        } else {
            await interaction.reply(`mew ${interaction.options.getUser("host").username}, ${interaction.options.getString('player_name')}`)
        }
	},
};

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

