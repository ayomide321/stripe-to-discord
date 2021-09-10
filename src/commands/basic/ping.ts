const { SlashCommandBuilder } = require('@discordjs/builders');
import { ContextMenuInteraction } from 'discord.js';

const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Displays pong!')

module.exports = {
    data: data,
    async execute(interaction: ContextMenuInteraction) {
        await interaction.reply({content: 'Pong!', ephemeral: true})
    } 
}

export {}