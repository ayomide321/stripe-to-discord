const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
import { ContextMenuInteraction } from 'discord.js';
import { getActivationCode } from '../../functions/functions';
const User = require('../../data/models/user');

const data = new SlashCommandBuilder()
	.setName('get-activation-code')
	.setDescription('Gets the activation code from an email')
    .addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
		option.setName('package')
			.setDescription('The gif category')
			.setRequired(true)
			.addChoice('trading', process.env.product_1)
			.addChoice('forex', process.env.product_2)
			.addChoice('sports', process.env.product_3))
    .addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
        option.setName('email')
            .setDescription('Enter the email whose activation code you want to access'));
    


module.exports = {
    data: data,
    async execute(interaction: ContextMenuInteraction) {

        const user =  await User.findOne({"email": interaction.options.getString('email')}).exec();
        getActivationCode(user, interaction.options.getString('package')!, interaction)
    } 
}

export {}