const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
import { Command } from 'discord.js';
import { cancelRole } from '../../functions/functions'
import { UserDocument, UserSchemaType } from '../../data/models/user'
import { CallbackError } from 'mongoose';

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
		const discord_id = interaction.member!.user.id
		const packageName = interaction.options.getString('package')!
		await UserDocument.findOne({"discord_id": discord_id}, 

		async function(err: CallbackError, user: UserSchemaType) {
			console.log(user+"THIS IS CANCELLING USER")
			if(err)  return "Error"
            if(!user) {
                await interaction.reply({content: 'There is no user with this email!', ephemeral: true})
            }
			
			cancelRole(packageName, user, interaction);
		}).exec();


		

    } 
}

module.exports = cancel