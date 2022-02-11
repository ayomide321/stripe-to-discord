const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
import { ContextMenuInteraction, Command } from 'discord.js';

export const Gif: Command = {
	data: new SlashCommandBuilder()
	.setName('gif')
	.setDescription('Sends a random gif!')
	.addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
		option.setName('category')
			.setDescription('The gif category')
			.setRequired(true)
			.addChoice('Funny', 'gif_funny')
			.addChoice('Meme', 'gif_meme')
			.addChoice('Movie', 'gif_movie')),

    run: async (interaction) => {
        await interaction.reply('Pong!')
    },
};

module.exports = {
    Gif
}