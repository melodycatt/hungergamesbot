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
    .setName('cards')
    .setDescription('Get a user\'s cards')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('User to get the cards of')
    ),
	async execute(interaction) {
        console.log(userData.registered);
        console.log(await interaction.options.getUser('user'))

        if(interaction.options.getUser('user')) {
            const target = await interaction.options.getUser('user')
            console.log(target)
            console.log('DICK1')

            if(userData.registered.includes(target.id)) {
                console.log('DICK2')
                var embed;
                try {
                    embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`${userData.balances[target.id].cards[0].name}`)
                        .setDescription(`Count: ${userData.balances[target.id].cards[0].count}, Rarity: ${userData.balances[target.id].cards[0].rarity}`)
                        .setImage(userData.balances[target.id].cards[0].img)
                    }    
                catch (e) {
                    await interaction.reply('User ' + target.id + 'doesn\'t have any cards!')
                    return
                }
                for (let i in userData.balances[target.id].cards[0].qualities) {
                    embed.addFields({name: `Card ID: 0${i}`, value: `Quality: ${userData.balances[target.id].cards[0].qualities[i]}, Value: ${Math.round((25 / userData.balances[target.id].cards[0].rarity) * (userData.balances[target.id].cards[0].qualities[i]) * 1.25)}`})
                }    
                const left = new ButtonBuilder()
                    .setCustomId('left')
                    .setLabel('Left')
                    .setStyle(ButtonStyle.Primary)

                const right = new ButtonBuilder()
                    .setCustomId('right')
                    .setLabel('Right')
                    .setStyle(ButtonStyle.Primary)

                const row = new ActionRowBuilder()
                    .addComponents(left)
                    .addComponents(right)

                var response = await interaction.reply({embeds: [embed], components: [row]})
                var i = 0
                const collectorFilter = i => i.user.id === interaction.user.id;
                try {
                    var run = true
                    while(run) {
                        var confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 15000 });
                        if (confirmation.customId === 'left') i = (i - 1) < 0? userData.balances[target.id].cards.length - 1: i - 1; 
                        if (confirmation.customId === 'right') i = (i + 1) % userData.balances[target.id].cards.length? 0: i + 1; 
                        const embed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle(`${userData.balances[target.id].cards[i].name}`)
                            .setDescription(`Count: ${userData.balances[target.id].cards[i].count}, Rarity: ${userData.balances[target.id].cards[i].rarity}`) 
                            for (let j in userData.balances[target.id].cards[i].qualities) {
                                embed.addFields({name: `Card ID: ${i}${j}`, value: `Quality: ${userData.balances[target.id].cards[i].qualities[j]}, Value: ${Math.round((25 / userData.balances[target.id].cards[i].rarity) * (userData.balances[target.id].cards[i].qualities[j]) * 1.25)}`})
                            }
                        response = await confirmation.update({embeds: [embed], components: [row]})                  
                    }
                } catch (e) {
                    console.log('DICK5', e)
                    run = false
                    await interaction.editReply({ embeds: [embed], components: []});
                }
                
            } else {
                await interaction.reply({content: 'That user isnt registered!', ephemeral: true});            
            }
        } else {
            if(userData.registered.includes(interaction.user.id)) {
                target = interaction.user
                console.log('DICK2')
                var embed;
                try {
                    embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`${userData.balances[target.id].cards[0].name}`)
                        .setDescription(`Count: ${userData.balances[target.id].cards[0].count}, Rarity: ${userData.balances[target.id].cards[0].rarity}`)
                }
                catch (e) {
                    await interaction.reply('You dont have any cards!')
                    return
                }
                for (let i in userData.balances[target.id].cards[0].qualities) {
                    embed.addFields({name: `Card ID: 0${i}`, value: `Quality: ${userData.balances[target.id].cards[0].qualities[i]}, Value: ${Math.round((25 / userData.balances[target.id].cards[0].rarity) * (userData.balances[target.id].cards[0].qualities[i]) * 1.25)}`})
                }
                const left = new ButtonBuilder()
                    .setCustomId('left')
                    .setLabel('Left')
                    .setStyle(ButtonStyle.Primary)
    
                const right = new ButtonBuilder()
                    .setCustomId('right')
                    .setLabel('Right')
                    .setStyle(ButtonStyle.Primary)
    
                const row = new ActionRowBuilder()
                    .addComponents(left)
                    .addComponents(right)
    
                var response = await interaction.reply({embeds: [embed], components: [row]})
                var i = 0
                const collectorFilter = i => i.user.id === interaction.user.id;
                try {
                    var run = true
                    while(run) {
                        console.log(i)
                        var confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 15000 });
                        if (confirmation.customId === 'left') i = (i - 1) < 0? userData.balances[target.id].cards.length - 1: i - 1; 
                        if (confirmation.customId === 'right') i = (i + 1) % userData.balances[target.id].cards.length? i + 1: 0; 
                        console.log(i)
                        const embed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle(`${userData.balances[target.id].cards[i].name}`)
                            .setDescription(`Count: ${userData.balances[target.id].cards[i].count}, Rarity: ${userData.balances[target.id].cards[i].rarity}`) 
                            for (let j in userData.balances[target.id].cards[i].qualities) {
                                embed.addFields({name: `Card ID: ${i}${j}`, value: `Quality: ${userData.balances[target.id].cards[i].qualities[j]}, Value: ${Math.round((25 / userData.balances[target.id].cards[i].rarity) * (userData.balances[target.id].cards[i].qualities[j]) * 1.25)}`})
                            }            
                        response = await confirmation.update({embeds: [embed], components: [row]})                  
                    }
                } catch (e) {
                    console.log('DICK5', e)
                    run = false
                    await interaction.editReply({ embeds: [embed], components: []});
                }
            } else {
                await interaction.reply({content: 'You aren\'t registered!', ephemeral: true});            
            }
        }
	},
};

