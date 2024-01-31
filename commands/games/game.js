const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const data = require('./data/data.json')
const {Game, Player} = require('./data/util.js');
const fs = require('node:fs');
const path = require('node:path');
console.log(Game, "hd")

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
            .setDescription("settings of your game"))
        ,
	async execute(interaction) {
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
                    var game = JSON.parse(data[interaction.options.getUser("host").id])
                } catch {
                    if (game.host.username == interaction.user.id) {
                        await interaction.reply('You aren\'t hosting a game')
                        return
                    }
                    await interaction.reply('That person isnt hosting a game')
                    return
                }
                if (!game.checkExpired()) game.expired = true
                let players = ''
                for (let i of game.players) {
                    players = players + `${i.name} ${i.discord && i.name != i.discord.username ? `(${i.discord.username})`: ''}\n`
                }
                const attachment = new AttachmentBuilder(game.image, { name: 'map.png' });
                console.log(players ?? 'No players', players >= 1 ? players : 'No players')
                const embed = new EmbedBuilder()
                    .setTitle(game.name)
                    .setDescription(`Hosted by ${interaction.options.getUser("host").id} | ${game.started ? 'Started' : 'Not Started'}`)
                    .setThumbnail(`${interaction.options.getUser("host").avatarURL()}`)
                    .setImage('attachment://map.png')
                    .addFields({name: 'Players', value: players.length >= 1 ? players : 'No players'})
                interaction.reply({embeds: [embed]})
            } else {
                try {
                    var game = JSON.parse(data[interaction.user.id])
                } catch {
                    await interaction.reply('You aren\'t hosting a game')
                    return
                }
                if (!game.checkExpired()) game.expired = true
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
            var game = JSON.parse(data[interaction.options.getUser("host").id])
            if (!game.checkExpired()) game.expired = true
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
            var game = JSON.parse(data[interaction.user.id])
            const embed = new EmbedBuilder()
                .setTitle(`${game.name} - Settings`)
                .setDescription('Run this command with the setting you want to change and the value you want to set it to.\n\n\`map_size\` - change the size of the game\'s map\n\`map_height\` - average height of the map (lower value = higher map)\n\`map_height\` - average moistness of the map (lower value = moister map)\n\`map_heightfreq\` - how chaotic the height of the map is (lower value = spikier terrain)\n\`map_moistfreq\` - how chaotic the moistness of the map is (lower value = spikier moistness)\n')
            await interaction.reply({embeds: [embed]})
        }
	},
};

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

/*
const exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle('Some title')
	.setURL('https://discord.js.org/')
	.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
	.setDescription('Some description here')
	.setThumbnail('https://i.imgur.com/AfFp7pu.png')
	.addFields(
		{ name: 'Regular field title', value: 'Some value here' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
	)
	.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
	.setImage('https://i.imgur.com/AfFp7pu.png')
	.setTimestamp()
	.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

channel.send({ embeds: [exampleEmbed] });
*/