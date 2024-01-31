console.log('hi')

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const userData = require('../../data/users.json')
const fs = require('node:fs');
const path = require('node:path');
console.log('hi')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balreset')
		.setDescription('Reset a users\'s balance')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('Who are you resetting')
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
        if (interaction.user.id == "879881902381748314") {
            const target = await interaction.options.getUser('user')
            if(userData.registered.includes(target.id)) {
                userData.balances[target.id].bal = 0
                fs.writeFileSync(path.resolve('./data/users.json'), JSON.stringify(userData))
                await interaction.reply({content: `Reset ${target.username}'s bal (${target.id})`});
            } else {
                await interaction.reply("Bro that person isnt registered")
            }
        } else {
            await interaction.reply({content: "This is a bot owner only command!", ephemeral: true});
        }
	},
};