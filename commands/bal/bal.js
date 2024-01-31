const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const userData = require('../../data/users.json')

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
*/


module.exports = {
    data: new SlashCommandBuilder()
    .setName('bal')
    .setDescription('Get a user\'s balance')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('User to get the balance of')
    ),
	async execute(interaction) {
        console.log(userData.registered);
        console.log(await interaction.options.getUser('user'))

        if(interaction.options.getUser('user')) {
            const target = await interaction.options.getUser('user')
            console.log(target)

            if(userData.registered.includes(target.id)) {
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`${target.username}'s balance`)
                    .setDescription(`${userData.balances[target.id].bal}\n${userData.balances[target.id].cards.map(card => card.name)}`)
                
                await interaction.reply({embeds: [embed]})
            } else {
                await interaction.reply({content: 'That user isnt registered!', ephemeral: true});            
            }
        } else{
            console.log(interaction.user.id)
            if(userData.registered.includes(interaction.user.id)) {
                console.log(userData.balances, userData.balances[interaction.user.id])
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`${interaction.user.username}'s balance`)
                    .setDescription(`${userData.balances[interaction.user.id].bal}\n${userData.balances[interaction.user.id].inv.map(card => card.name)}`)
                console.log(userData.balances[interaction.user.id].cards.map(card => card.name), userData.balances[interaction.user.id].cards)
                interaction.reply({embeds: [embed]})
            } else {
                await interaction.reply({content: 'You aren\'t registered!', ephemeral: true})
            }
        }
	},
};

