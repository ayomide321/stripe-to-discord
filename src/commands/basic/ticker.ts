const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
import { ContextMenuInteraction } from 'discord.js';
import { getTicker } from '../../functions/functions';

const data = new SlashCommandBuilder()
	.setName('stock')
	.setDescription('Displays ticker information!')
    .addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
        option.setName('ticker')
            .setRequired(true)
            .setDescription('Enter the name of the ticker you want to access.'));

module.exports = {
    data: data,
    async execute(interaction: ContextMenuInteraction) {

        getTicker(interaction.options.getString('ticker')!, interaction)
        
    } 
}

export {}