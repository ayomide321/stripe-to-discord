const { SlashCommandBuilder } = require('@discordjs/builders');
import { Command } from 'discord.js';


export const ping: Command = {
    data: new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Displays pong!'),

    run: async (interaction) => {
        await interaction.reply({content: 'Pong!', ephemeral: true})
    } 
    
}

module.exports = ping