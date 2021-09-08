const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

const data = new SlashCommandBuilder()
	.setName('cancel')
	.setDescription('Cancel your subscription!')
	.addStringOption((option: any) =>
		option.setName('package')
			.setDescription('The gif category')
			.setRequired(true)
			.addChoice('trading','t')
			.addChoice('forex','f')
			.addChoice('sports','s'))
        

module.exports = {
    data: data,
    async execute(interaction: any) {

        await interaction.deferReply({ ephemeral: true });
        await wait(10);
        await interaction.editReply('Canceled!')
    } 
}

export {}