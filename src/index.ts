/// <reference path="../client.d.ts" />

//Imported functions
import DiscordJS, { Intents, Collection, Client } from 'discord.js'
import mongoose, { CallbackError } from 'mongoose';
import fs from 'fs'

//Personal functions
import { assignRole, assignServerRoles, fullPermissions } from './functions/functions'
import { UserDocument, UserSchemaType } from './data/models/user'

require('dotenv').config();

//Client Intents
export const client: Client = new DiscordJS.Client({ intents: [Intents.FLAGS.GUILDS, 'GUILD_MESSAGES', 'GUILDS'] });

//Mongoose Connection
mongoose.connect(process.env.mongoURI!,
    { useNewUrlParser: true, useUnifiedTopology: true },
     (err) => (err)
     ? console.log('Failed to connect')
     : console.log('Connected to database'));

//Command initialization
client.commands = new Collection();
const functions = fs.readdirSync('./src/functions').filter((file: string) => file.endsWith('.ts'));
const eventFiles = fs.readdirSync('./src/events').filter((file: string) => file.endsWith('.ts'));
const commandFolders = fs.readdirSync('./src/commands');


client.on('ready', async () => {
	console.log('Ready!')
	for (const  file of functions) {
		if(file != "functions.ts" && file != "mail.ts"){
			require(`./functions/${file}`)(client);
		}
	}
	client.handleEvents(eventFiles, './src/events');
	client.handleCommands(commandFolders, './src/commands');
	//await client.guilds.cache.get(process.env.guild_id!)?.commands.permissions.set({ fullPermissions });
	console.log(await client.guilds.cache.get(process.env.guild_id!)?.commands.fetch())
	assignServerRoles(client)
});

client.on('guildMemberAdd', member => {
    //const welcome_channel = member.guild.channels.cache.get(process.env.welcome_channel!)! as TextChannel
	//welcome_channel.send('**' + member.user.username + '**, has joined the server!')
    member.roles.add(process.env.unverified_role!)
});

client.on('messageCreate', async (message) =>{

	const member = await client.guilds.cache.get(process.env.guild_id!)!.members.fetch(message.author.id)!;
	await UserDocument.findOne({"discord_id": message.author.id}, 
		function(err: CallbackError, user: UserSchemaType) {
			if(err) throw err 
			if(!user) {
				console.log("No user was found")
				return
			}
			assignRole(user, member)
		}).exec();	
})

client.login(process.env.TOKEN);
require ('./server')