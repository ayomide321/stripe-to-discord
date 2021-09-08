/// <reference path="../../client.d.ts" />

import { Client, Interaction } from 'discord.js'

module.exports = {
    name: 'interactionCreate',
    async execute(interaction: Interaction, client: Client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        try {
            await command!.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            })
        }
    }
}