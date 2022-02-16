/// <reference path="../../client.d.ts" />

import { Command, Client } from 'discord.js'
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { permissionsList } = require('./functions.ts')
const fs = require('fs');
require('dotenv').config();



module.exports = (client: Client) => {
    client.handleCommands = async (commandFolders: string[], path: string) => {
        //initalize commandArray
        client.commandArray = []
        
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${path}/${folder}`).filter((file: string) => file.endsWith('.ts'));

            for (const file of commandFiles) {
                //Initialize Command
                let command: Command = require(`../commands/${folder}/${file}`);

                //Initialize command permissions 
                client.commands.set(command.data.name, command)
                client.commandArray.push(command.data.toJSON());
                
            }
        }

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        (async () => {
            try {
                console.log('Started refreshing application (/) commands.');

                await rest.put(
                    Routes.applicationGuildCommands(process.env.client_id, process.env.guild_id),
                    { body: client.commandArray },
                );

                console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.error(error);
            }
        })();
    }
}

export {}