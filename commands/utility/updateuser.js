const { SlashCommandBuilder } = require('discord.js');
const userData = require('../../data/users.json')
const cards = require('../cards/data/cards.json')
const fs = require('node:fs');
const path = require('node:path');

const dataKeys = [['bal', 0], ['cards', []]]

module.exports = {
    data: new SlashCommandBuilder()
    .setName('updateuser')
    .setDescription('Update your userdata'),
	async execute(interaction) {
        if(userData.registered.includes(interaction.user.id)) {
            var updated = false
            for(let i = 0; i < dataKeys.length; i++) {
                if(!userData.balances[interaction.user.id][dataKeys[i][0]]) {
                    updated = true
                    userData.balances[interaction.user.id][dataKeys[i][0]] = dataKeys[i][1]
                }
            }
            for(let i = 0; i < userData.balances[interaction.user.id].cards.length; i++) {
                const card = cards[cards.map(obj => obj.name).indexOf(userData.balances[interaction.user.id].cards[i].name)]
                for(let j = 0; j < Object.keys(card).length; j++) {
                    if (!userData.balances[interaction.user.id].cards[i][Object.keys(card)[j]]) userData.balances[interaction.user.id].cards[i][Object.keys(card)[j]] = card[Object.keys(card)[j]]
                }
            }
            fs.writeFileSync(path.resolve('./data/users.json'), JSON.stringify(userData));
            if(updated) {
                await interaction.reply('Updated your data!')
            } else {
                await interaction.reply('Already up to date!')
            }
        } else {
            await interaction.reply({content: 'You aren\'t registered!', ephemeral: true});            
        }
	},
};

