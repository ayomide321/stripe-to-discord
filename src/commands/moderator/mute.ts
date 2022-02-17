const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
import { Command } from 'discord.js';

export const mute: Command = {
    data: new SlashCommandBuilder()
	.setName('mute')
	.setDescription('Mutes User')
    .setDefaultPermission(false)
    .addUserOption((option: typeof SlashCommandOptionsOnlyBuilder) => 
        option.setName('user')
            .setDescription('The user you want to mute')
            .setRequired(true))
            
    .addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
        option.setName('reason')
            .setDescription('Why is this user being muted?')),


    run: async (interaction) => {
        await interaction.reply({content: 'Pong!', ephemeral: true})
    } 
}

module.exports = mute