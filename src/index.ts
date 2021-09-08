/// <reference path="../client.d.ts" />

import DiscordJS, { Intents, Collection, Client, RoleResolvable } from 'discord.js'
import fs from 'fs'
require('dotenv').config();

const User = require('./data/models/user');

export const client: Client = new DiscordJS.Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

const functions = fs.readdirSync('./src/functions').filter((file: string) => file.endsWith('.ts'));
const eventFiles = fs.readdirSync('./src/events').filter((file: string) => file.endsWith('.ts'));
const commandFolders = fs.readdirSync('./src/commands');




function assignRole(x: any, member: DiscordJS.GuildMember) {
	let roleMap = new Map<string, string>();
	roleMap.set(process.env.product_1!, process.env.role_1!)
	roleMap.set(process.env.product_2!, process.env.role_2!)
	roleMap.set(process.env.product_3!, process.env.role_3!)

	for(let i = 0; i < x.subscription.length; i++)
	{
		const tempDoc = x.subscription[i]
		if(!tempDoc.canceled || !tempDoc.activated){
			member.roles.add(roleMap.get(tempDoc.product!) as RoleResolvable)
		} else {
			member.roles.remove(roleMap.get(tempDoc.product!) as RoleResolvable)
		}

	}
}




client.on('ready',  () => {
	console.log('Ready!')
	for (const  file of functions) {
		require(`./functions/${file}`)(client);
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

