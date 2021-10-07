const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
import { ContextMenuInteraction } from 'discord.js';
import { cancelRole } from '../../functions/functions'
const User = require('../../data/models/user');

const data = new SlashCommandBuilder()
	.setName('cancel')
	.setDescription('Cancel your subscription!')
	.addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
		option.setName('package')
			.setDescription('The product category')
			.setRequired(true)
			.addChoice('trading', process.env.product_1)
			.addChoice('forex', process.env.product_2)
			.addChoice('sports', process.env.product_3));
        

module.exports = {
    data: data,
    async execute(interaction: ContextMenuInteraction) {
		const user =  await User.findOne({"discord_id": interaction.member!.user.id}).exec();
		

		const hasRole = await cancelRole(interaction.options.getString('package')!, user, interaction);

		if(hasRole) {
			await interaction.editReply("Has Role!")
		}




    } 
}

export {}