const shop = require('./data/shop.json')
const pages = Object.keys(shop)
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
console.log('hi')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('See the shop menu'),
	async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Shop | Main Page')
            .setDescription('Use the select menu below to see a shop page')        
        const pageSelect = new StringSelectMenuBuilder()
            .setCustomId("page")
            .setPlaceholder("Select Page...")
        for (let i in pages) {
            embed.addFields({name: pages[i], value: shop[pages[i]].description})
            pageSelect.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(pages[i])
                    .setValue(pages[i].toLowerCase())
            )
        }    
        const row = new ActionRowBuilder()
            .addComponents(pageSelect)

		var response = await interaction.reply({embeds: [embed], components: [row]});
        const collectorFilter = i => i.user.id === interaction.user.id;
        var run = true
        try {
            while(run) {
                var confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 30000 });
                if(confirmation.customId == "page") {
                    /*const buy = new ButtonBuilder()
                    .setLabel("Buy")
                    .setCustomId("buy")
                    .setStyle(ButtonStyle.Primary)
                    
                    const buySelect = new StringSelectMenuBuilder()
                    .setCustomId('buyselect')
                    .setPlaceholder('Select an item to buy')*/
                    
                    const back = new ButtonBuilder()
                        .setLabel("Back")
                        .setCustomId("back")
                        .setStyle(ButtonStyle.Danger)
                    const buttons = new ActionRowBuilder()
                        .addComponents(back)    
                    for(let i of pages) {
                        if(confirmation.values[0] == i.toLowerCase()) { 
                            const embed = new EmbedBuilder()
                                .setTitle(`Shop | ${i}`)
                                .setDescription(`${shop[i].description}`)
                            for(let j of shop[i].items) {
                                embed.addFields({name: `Name: \`${j[0]}\``, value: `${j[2]}\nPrice: \`${j[1]}\``})
                                /*buySelect.addOptions(
                                    new StringSelectMenuOptionBuilder()
                                        .setValue(j[0])
                                        .setLabel(j[0])
                                )*/
                            }
                            /*const select = new ActionRowBuilder()
                                .addComponents(buySelect)*/    
                            response = await confirmation.update({embeds: [embed], components: [buttons/*, select*/]})  
                            break
                        }
                    }
                    /*const collector = await response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
                    var selection;
                    collector.on('collect', async i => {
                        if(i.componentType == ComponentType.Button) {
                            if(!selection) {
                                await i.followUp({content:"You need to make a selection first!", ephemeral: true})
                            }
                            selection = [].concat(shop.map(x => x.items)).find(x => x[0] == selection)
                            userData.balances[i.user.id].bal -= selection[1]
                            if(userData.balances[i.user.id].bal < 0) {
                                userData.balances[i.user.id].bal += selection[1]
                                await i.followUp({content: "You dont have enough money", ephemeral: true})
                                return
                            }
                            if(userData.balances[i.user.id].inv.map(x => x.name).includes(selection[0])) {
                                userData.balances[i.user.id].inv[userData.balances[i.user.id].inv.map(x => x.name).indexOf(selection[0])].count += selection[3].count
                            } else {
                                userData.balances[i.user.id].inv.push(selection[3])
                            }
                            await i.followUp({content: `Bought ${selection[0]} for ${selection[1]}`, ephemeral: true})
                        } else {
                            selection = i.values[0];
                            i.update()
                        }
                    });*/
                } else if (confirmation.customId == "back"){
                    const embed = new EmbedBuilder()
                        .setTitle('Shop | Main Page')
                        .setDescription('Use the select menu below to see a shop page')        
                    const pageSelect = new StringSelectMenuBuilder()
                        .setCustomId("page")
                        .setPlaceholder("Select Page...")
                    for (let i in pages) {
                        embed.addFields({name: pages[i], value: shop[pages[i]].description})
                        pageSelect.addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(pages[i])
                                .setValue(pages[i].toLowerCase())
                        )
                    }    
                    const row = new ActionRowBuilder()
                        .addComponents(pageSelect)
            
                    response = await confirmation.update({embeds: [embed], components: [row]});
                } else {                    
                    run = false 
                    await confirmation.update({embeds: [], components: [], content:'An unknown error occured.'})          
                }
            }
        } catch (e) {
            run = false
            console.log(e)
        }
	},
};