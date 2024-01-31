const { SlashCommandBuilder } = require('discord.js');
const userData = require('../../data/users.json')
const fs = require('node:fs');
const path = require('node:path');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register to balance'),
	async execute(interaction) {
        console.log(userData.registered);
        if(!userData.registered.includes(interaction.user.id)) {
            userData.registered.push(interaction.user.id);
            userData.balances[interaction.user.id] = {bal: 100, cards: [], inv: [{type: "pack", name: "all", count: 1}]}
            fs.writeFileSync(path.resolve('./data/users.json'), JSON.stringify(userData));
            await interaction.reply({content: `Registered user ${interaction.user.username}! (ID: ${interaction.user.id})`});            
        } else {
            await interaction.reply({content: 'You are already registered!', ephemeral: true});            
        }
	},
};

