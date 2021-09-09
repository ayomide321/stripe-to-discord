/// <reference path="../client.d.ts" />

import DiscordJS, { Intents, Collection, Client, RoleResolvable } from 'discord.js'
import fs from 'fs'
import { assignRole } from './functions/functions'
require('dotenv').config();

const User = require('./data/models/user.ts');

export const client: Client = new DiscordJS.Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

const functions = fs.readdirSync('./src/functions').filter((file: string) => file.endsWith('.ts'));
const eventFiles = fs.readdirSync('./src/events').filter((file: string) => file.endsWith('.ts'));
const commandFolders = fs.readdirSync('./src/commands');









client.on('ready',  () => {
	console.log('Ready!')
	for (const  file of functions) {
		if(file != "functions.ts"){
			require(`./functions/${file}`)(client);
		}
	}
	client.handleEvents(eventFiles, './src/events');
	client.handleCommands(commandFolders, './src/commands');
	
});

client.on('message', async (message) =>{

	const member = await client.guilds.cache.get(process.env.guild_id!)!.members.fetch(message.author.id)!;
	const user =  await User.findOne({"discord_id": message.author.id}).exec();

	
	try{
		assignRole(user, member)
	} catch(err) {
		console.log(err)
	}
	
})

client.login(process.env.TOKEN);

