const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
import { ContextMenuInteraction } from 'discord.js';
import { activateRole } from '../../functions/functions'
const User = require('../../data/models/user');

const data = new SlashCommandBuilder()
	.setName('activate')
	.setDescription('Cancel your subscription!')
	.addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
		option.setName('package')
			.setDescription('The gif category')
			.setRequired(true)
			.addChoice('trading', process.env.product_1)
			.addChoice('forex', process.env.product_2)
			.addChoice('sports', process.env.product_3))
	.addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
		option.setName('activation')
			.setDescription('Activation code for package')
			.setRequired(true));
	
        

module.exports = {
    data: data,
    async execute(interaction: ContextMenuInteraction) {
		

		activateRole(interaction.options.getString('package')!, interaction.options.getString('activation')!, interaction)




    } 
}

export {}