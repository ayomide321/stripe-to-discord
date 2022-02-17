const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
import { Command } from 'discord.js';
import { getActivationCode } from '../../functions/functions';
import { UserDocument, UserSchemaType } from '../../data/models/user'
import { CallbackError } from 'mongoose';
const User = require('../../data/models/user');

const access: Command = {
    data: new SlashCommandBuilder()
	.setName('get-activation-code')
	.setDescription('Gets the activation code from an email')
    .setDefaultPermission(false)
    .addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
		option.setName('package')
			.setDescription('The gif category')
			.setRequired(true)
			.addChoice('trading', process.env.product_1)
			.addChoice('forex', process.env.product_2))
    .addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
        option.setName('email')
            .setDescription('Enter the email whose activation code you want to access')
            .setRequired(true)),

    run: async (interaction) => {
        const email = interaction.options.getString('email')!
        
        await UserDocument.findOne({"email": email},
        async function(err: CallbackError, user: UserSchemaType) {
			if(err)  return "Error"
            if(!user) {
                await interaction.reply({content: 'There is no user with this email!', ephemeral: true})
                return
            }
			getActivationCode(user, interaction.options.getString('package')!, interaction)
		}).exec(); 
    } 
}

module.exports = access