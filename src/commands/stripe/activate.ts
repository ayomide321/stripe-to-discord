/// <reference path="../../../client.d.ts" />

const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
import { Command } from 'discord.js';
import { activateRole } from '../../functions/functions'



export const activate: Command = {
	data: new SlashCommandBuilder()
	.setName('activate')
	.setDescription('Cancel your subscription!')
	.addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
		option.setName('package')
			.setDescription('The gif category')
			.setRequired(true)
			.addChoice('trading', 'trading')
			.addChoice('sports', process.env.product_2))
	.addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
		option.setName('activation')
			.setDescription('Activation code for package')
			.setRequired(true)),
	

    run: async (interaction) => {

		var result: string[] = interaction.options.getString('package')! == process.env.product_2 ? [process.env.product_2!] : [process.env.product_1_0!, process.env.product_1_1!] 
		activateRole(result, interaction.options.getString('activation')!, interaction)
    } 
}

module.exports = activate