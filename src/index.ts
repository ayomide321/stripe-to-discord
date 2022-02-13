/// <reference path="../client.d.ts" />

import DiscordJS, { Intents, Collection, Client, TextChannel } from 'discord.js'
import fs from 'fs'
import mongoose from 'mongoose';
import { assignRole, assignServerRoles } from './functions/functions'
require('dotenv').config();
import { UserDocument, UserSchemaType } from './data/models/user'

export const client: Client = new DiscordJS.Client({ intents: [Intents.FLAGS.GUILDS] });

mongoose.connect(process.env.mongoURI!,
    { useNewUrlParser: true, useUnifiedTopology: true },
     (err) => (err)
     ? console.log('Failed to connect')
     : console.log('Connected to database'));


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
	assignServerRoles(client)
});

client.on('guildMemberAdd', member => {
    const welcome_channel = member.guild.channels.cache.get(process.env.welcome_channel!)! as TextChannel
	welcome_channel.send('**' + member.user.username + '**, has joined the server!')
    member.roles.add(process.env.unverified_role!)
});

client.on('message', async (message) =>{

	const member = await client.guilds.cache.get(process.env.guild_id!)!.members.fetch(message.author.id)!;
	const user =  await UserDocument.findOne({"discord_id": message.author.id}).exec();

	
	try{
		assignRole(user, member)
	} catch(err) {
		console.log(err)
	}
	
})



client.login(process.env.TOKEN);
require ('./server')