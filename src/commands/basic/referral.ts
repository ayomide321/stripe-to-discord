const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
import { ContextMenuInteraction } from 'discord.js';

const data = new SlashCommandBuilder()
	.setName('referral')
	.setDescription('Use another members referral code.')

module.exports = {
    data: data,
    async execute(interaction: ContextMenuInteraction) {
        await interaction.reply('You have been referred!')
    } 
}

export {}