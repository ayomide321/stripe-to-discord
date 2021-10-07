const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
import { ContextMenuInteraction } from 'discord.js';

const data = new SlashCommandBuilder()
	.setName('mute')
	.setDescription('Mutes User')
    .addUserOption((option: typeof SlashCommandOptionsOnlyBuilder) => 
        option.setName('user')
            .setDescription('The user you want to mute')
            .setRequired(true))
            
    .addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
        option.setName('reason')
            .setDescription('Why is this user being muted?'));


module.exports = {
    data: data,
    async execute(interaction: ContextMenuInteraction) {
        await interaction.reply({content: 'Pong!', ephemeral: true})
    } 
}

export {}