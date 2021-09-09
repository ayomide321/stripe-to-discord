const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
import { ContextMenuInteraction } from 'discord.js';

const data = new SlashCommandBuilder()
	.setName('gif')
	.setDescription('Sends a random gif!')
	.addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
		option.setName('category')
			.setDescription('The gif category')
			.setRequired(true)
			.addChoice('Funny', 'gif_funny')
			.addChoice('Meme', 'gif_meme')
			.addChoice('Movie', 'gif_movie'));

module.exports = {
    data: data,
    async execute(interaction: ContextMenuInteraction) {
        await interaction.reply('Pong!')
    } 
}

export {}