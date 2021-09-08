const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName('gif')
	.setDescription('Sends a random gif!')
	.addStringOption((option: any) =>
		option.setName('category')
			.setDescription('The gif category')
			.setRequired(true)
			.addChoice('Funny', 'gif_funny')
			.addChoice('Meme', 'gif_meme')
			.addChoice('Movie', 'gif_movie'));

module.exports = {
    data: data,
    async execute(interaction: any) {
        await interaction.reply('Pong!')
    } 
}

export {}