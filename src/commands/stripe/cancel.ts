const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
import { Command } from 'discord.js';
import { cancelRole } from '../../functions/functions'
import { UserDocument, UserSchemaType } from '../../data/models/user'

export const cancel: Command = {
	data: new SlashCommandBuilder()
	.setName('cancel')
	.setDescription('Cancel your subscription!')
	.addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
		option.setName('package')
			.setDescription('The product category')
			.setRequired(true)
			.addChoice('trading', process.env.product_1)
			.addChoice('forex', process.env.product_2)),
        

    run: async (interaction) => {
		const user =  await UserDocument.findOne({"discord_id": interaction.member!.user.id}).exec();
		

		const hasRole = await cancelRole(interaction.options.getString('package')!, user, interaction);

		if(hasRole) {
			await interaction.editReply("Has Role!")
		}
    } 
}

module.exports = cancel