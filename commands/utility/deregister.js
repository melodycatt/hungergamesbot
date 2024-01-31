const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const userData = require('../../data/users.json');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deregister')
		.setDescription('Deregister someone')
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
                userData.registered.splice(userData.registered.indexOf(target.id), 1)
                delete userData.balances[target.id]
                fs.writeFileSync(path.resolve('./data/users.json'), JSON.stringify(userData))
                await interaction.reply({content: `Deregistered ${target.username} (${target.id})`});
            } else {
                await interaction.reply("Bro that person isnt registered")
            }
        } else {
            await interaction.reply({content: "This is a bot owner only command!", ephemeral: true});
        }
	},
};