const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const {Game, Player} = require('./data/util.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('game')
		.setDescription('Manage hunger games lobbies')
        .addSubcommand(subcommand =>
            subcommand
            .setName('create')
            .setDescription('Create a lobby')
            .addStringOption(option => option.setName('name').setDescription('Lobby name')))
        .addSubcommand(subcommand =>
            subcommand
            .setName('view')
            .setDescription('View a game')
            .addUserOption(option =>
                option.setName("host")
                    .setDescription("The host of the game to view")))
        .addSubcommand(subcommand =>
            subcommand
            .setName('join')
            .setDescription('Join a game')
            .addUserOption(option =>
                option.setName("host")
                    .setDescription("The host of the game")
                    .setRequired(true))
            .addStringOption(option =>
                option.setName("customname")
                    .setDescription("Custom name to join the game as")))
        .addSubcommand(subcommand =>
            subcommand
            .setName("settings")
            .setDescription("settings of your game")
            .addStringOption(option =>
                option.setName("setting")
                .setDescription('Setting to change')
                .addChoices(
                    { name: 'map_size', value: 'map_size' },
                    { name: 'map_height', value: 'map_height' },
                    { name: 'map_moisture', value: 'map_moisture' },
                    { name: 'map_heightfreq', value: 'map_heightfreq' },
                    { name: 'map_moistfreq', value: 'map_moistfreq' },
                ))
            .addNumberOption(option =>
                option.setName("value")
                .setDescription("Value to set")))
        .addSubcommand(subcommand =>
            subcommand
            .setName('round')
            .setDescription('poo'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('delete')
            .setDescription('Delete your game'))

        ,
	async execute(interaction) {
        const data = require('./data/data.json')
        console.log(data, typeof data, "hd")    
        if (interaction.options.getSubcommand() === "create") {
            const game = new Game(interaction.user, interaction.options.getString('name'))
            await game.genMap()
            const attachment = new AttachmentBuilder(game.image, { name: 'map.png' });
            console.log(interaction.user, game.image, attachment)
            console.log(JSON.stringify(game), "LSOOSOPOSIWIODJ")
            data[game.owner.id] = JSON.stringify(game)
            fs.writeFileSync(path.join(__dirname, 'data/data.json'), JSON.stringify(data));
            await interaction.reply({content: `${game.owner.username}`, files: [attachment]});
        } else if (interaction.options.getSubcommand() === "view") {
            if (interaction.options.getUser('host')) {
                try {
                    var game = Game.toGame(JSON.parse(data[interaction.options.getUser("host").id]))
                } catch {
                    if (game.host.username == interaction.user.id) {
                        await interaction.reply('You aren\'t hosting a game')
                        return
                    }
                    await interaction.reply('That person isnt hosting a game')
                    return
                }
                let players = ''
                for (let i of game.players) {
                    players = players + `${i.name} ${i.discord && i.name != i.discord.username ? `(${i.discord.username})`: ''}\n`
                }
                const attachment = new AttachmentBuilder(game.image, { name: 'map.png' });
                console.log(players ?? 'No players', players >= 1 ? players : 'No players')
                const embed = new EmbedBuilder()
                    .setTitle(game.name)
                    .setDescription(`Hosted by ${interaction.options.getUser("host").username} | ${game.started ? 'Started' : 'Not Started'}`)
                    .setThumbnail(`${interaction.options.getUser("host").avatarURL()}`)
                    .setImage('attachment://map.png')
                    .addFields({name: 'Players', value: players.length >= 1 ? players : 'No players'})
                interaction.reply({embeds: [embed]})
            } else {
                try {
                    var game = Game.toGame(JSON.parse(data[interaction.user.id]))
                    console.log(game)
                } catch {
                    await interaction.reply('You aren\'t hosting a game')
                    return
                }
                let players = ''
                for (let i of game.players) {
                    players = players + `${i.name} ${i.discord && i.name != i.discord.username ? `(${i.discord.username})`: ''}\n`
                }
                const attachment = new AttachmentBuilder(game.image, { name: 'map.png' });
                console.log(players ?? 'No players', players >= 1 ? players : 'No players')
                const embed = new EmbedBuilder()
                    .setTitle(game.name)
                    .setDescription(`Hosted by ${interaction.user.username} | ${game.started ? 'Started' : 'Not Started'}`)
                    .setThumbnail(`${interaction.user.avatarURL()}`)
                    .setImage('attachment://map.png')
                    .addFields({name: 'Players', value: players.length >= 1 ? players : 'No players'})
                interaction.reply({embeds: [embed]})
            }
        } else if (interaction.options.getSubcommand() === "join") {
            var game = Game.toGame(JSON.parse(data[interaction.options.getUser("host").id]))
            if (game.players.map(x => x.discord.id).includes(interaction.user.id)) {
                await interaction.reply('go away ur already in the game')
                return
            }
            game.players.push(new Player(interaction.options.getString("customname") ?? interaction.user.username, interaction.user.avatarURL, game.owner.id, interaction.user))
            data[interaction.options.getUser("host").id] = JSON.stringify(game)
            fs.writeFileSync(path.join(__dirname, 'data/data.json'), JSON.stringify(data));
            await interaction.reply('yeah its done or whatever')
            await sleep(500)
            await interaction.followUp('go away')
        } else if (interaction.options.getSubcommand() === "settings") {
            option = interaction.options.getString("setting")
            value = interaction.options.getNumber("value")
            var game = Game.toGame(JSON.parse(data[interaction.user.id]))
            if(option) {
                if (option == "map_size") {
                    if (value < 16 || value > 256 || Math.round(value) != value ) {
                        await interaction.reply({content: `Please input an integer in between 16 and 256`, ephemeral: true})
                    }
                    game.settings.map.size = value;
                    await interaction.reply(`Changed the \`map_size\` to ${value}`)
                }
                else if (option == "map_height") {
                    if (value < 0.1 || value > 3) {
                        await interaction.reply({content: `Please input a value in between 0.1 and 3`, ephemeral: true})
                    }
                    game.settings.map.height = value;
                    await interaction.reply(`Changed the \`map_height\` to ${value}`)
                }
                else if (option == "map_moisture") {
                    if (value < 0.1 || value > 3) {
                        await interaction.reply({content: `Please input a value in between 0.1 and 3`, ephemeral: true})
                    }
                    game.settings.map.moist = value;
                    await interaction.reply(`Changed the \`map_moisture\` to ${value}`)
                }
                else if (option == "map_heightfreq") {
                    if (value < 0.1 || value > 2) {
                        await interaction.reply({content: `Please input a value in between 0.1 and 2`, ephemeral: true})
                    }
                    game.settings.map.heightf = value;
                    await interaction.reply(`Changed the \`map_heightfreq\` to ${value}`)
                }
                else if (option == "map_moistfreq") {
                    if (value < 0.1 || value > 2) {
                        await interaction.reply({content: `Please input a value in between 0.1 and 2`, ephemeral: true})
                    }
                    game.settings.map.moistf = value;
                    await interaction.reply(`Changed the \`map_moistfreq\` to ${value}`)
                }
                game.genMap()
                data[interaction.user.id] = JSON.stringify(game)
                fs.writeFileSync(path.join(__dirname, 'data/data.json'), JSON.stringify(data));            
            } else {
                const embed = new EmbedBuilder()
                    .setTitle(`${game.name} - Settings`)
                    .setDescription('Run this command again with the setting you want to change and the value you want to set it to.\n\n\`map_size\` - change the size of the game\'s map\n\`map_height\` - average height of the map (lower value = higher map)\n\`map_moisture\` - average moistness of the map (lower value = moister map)\n\`map_heightfreq\` - how chaotic the height of the map is (lower value = spikier terrain)\n\`map_moistfreq\` - how chaotic the moistness of the map is (lower value = spikier moistness)\n')
                await interaction.reply({embeds: [embed]})
            }
        } else if (interaction.options.getSubcommand() === "round") {
            console.log(JSON.parse(data[interaction.user.id]))
            var game = Game.toGame(JSON.parse(data[interaction.user.id]))
            console.log(game)
            let t = game.nextround()
            let playerI = 0
            const prev = new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
            const next = new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
            const crow = new ActionRowBuilder().addComponents(prev, next)
            const showdead = new ButtonBuilder()
                .setCustomId('dead')
                .setLabel('Show Dead?')
                .setStyle(ButtonStyle.Danger)
            console.log(t[1])
            if(t[1].length == 0) {
                showdead.setDisabled(true)
            }
            const sdrow = new ActionRowBuilder().addComponents(showdead)
            const player = game.players[game.players.map(x => x.discord.username).indexOf(t[0][playerI][4])]
            const embed = new EmbedBuilder()
                .setTitle(t[2])
                .setDescription(player.name)
            for(let i of player.roundActions) {
                embed.addFields({name: i.text, value: ' '})
            }
            let active = true
            const collectorFilter = i => i.user.id === interaction.user.id;
            try {
                let response = await interaction.reply({embeds: [embed], components: [crow, sdrow]})
                while (active) {
                    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 90_000 });
                    if (confirmation.customId === "prev") playerI -= 1
                    if (confirmation.customId === "next") playerI += 1
                    const prev = new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Secondary)
                    if(playerI == 0) {
                        prev.setDisabled(true)
                    }
                    const next = new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                    if(playerI == game.players.length - 1) {
                        next.setDisabled(true)
                    }
                    const crow = new ActionRowBuilder().addComponents(prev, next)
                    const showdead = new ButtonBuilder()
                        .setCustomId('dead')
                        .setLabel('Show Dead?')
                        .setStyle(ButtonStyle.Danger)
                    if(t[1].length == 0) {
                        showdead.setDisabled(true)
                    }
            
                    const sdrow = new ActionRowBuilder().addComponents(showdead)
                    const player = game.players[playerI]
                    const embed = new EmbedBuilder()
                        .setTitle(t[2])
                        .setDescription(player.name)
                    for(let i of player.roundActions) {
                        embed.addFields({name: i.text, value: ' '})
                    }
                    response = await confirmation.update({embeds: [embed], components: [crow, sdrow]})
                }
            } catch (e) {
                console.log(e)
            }
        } else if (interaction.options.getSubcommand() === "delete") {
            if( data[interaction.user.id] ) {
                delete data[interaction.user.id]
                fs.writeFileSync(path.join(__dirname, 'data/data.json'), JSON.stringify(data));            
                await interaction.reply('Deleted!') 
                return
            } else {
                await interaction.reply('You have no open game!')   
            }
        } 
	},
};

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

