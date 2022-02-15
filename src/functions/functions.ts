import DiscordJS, { ContextMenuInteraction } from 'discord.js'
import { CallbackError } from 'mongoose';
import { UserDocument, UserSchemaType } from '../data/models/user'

require('dotenv').config();


export const permissionsList = [
	{
		id: process.env.moderator_role_1,
		type: 'ROLE',
		permission: true,
	},
    {
		id: process.env.moderator_role_2,
		type: 'ROLE',
		permission: true,
	},
];


export function mapRole(){
    let roleMap = new Map<string, string>();
	roleMap.set(process.env.product_1!, process.env.role_1!)
	roleMap.set(process.env.product_2!, process.env.role_2!)
    return roleMap
}

export async function checkRole(x: string, member: UserSchemaType){
    if(!member) return false
    
    let found = await UserDocument.findOne({
        "email": member.email, "subscriptions.product": x}, 
        function(err: CallbackError, found: any){
            if(err) throw err;
            console.log(found)
        }).exec()

    return (found ? true : false);
}

export async function activateRole(x: string, code: string, interaction: ContextMenuInteraction ){
    try {
        const user = await UserDocument.findOneAndUpdate({"subscriptions.product": x, "subscriptions.activeToken": code, "subscriptions.activated": false}, {$set: {"subscriptions.$.activated": true, "subscriptions.$.activeToken": "", "discord_id": interaction.member!.user.id}}, { upsert: false, returnDocument: 'after', useFindAndModify: false }).exec()
        if(user){
            console.log(user)
            assignRole(user ,interaction.member as DiscordJS.GuildMember)
            interaction.reply({content: "Your subscription has been activated.", ephemeral: true})
            user.save()
            
        } else {
            interaction.reply({content: "There was no subscription found to activate.", ephemeral: true})
        }
    } catch(err) {
        console.log(err)
        interaction.reply({content: "There was an error.", ephemeral: true})
        return err;
    }
};

export async function cancelRole(product: string, member: any, interaction: ContextMenuInteraction ){
    var boolcheckRole = await checkRole(product, member)
    if(boolcheckRole){
        //const currentSub = await member.subscriptions.findOne({"product": product, "activated": true}).exec()
        const currentSub = await UserDocument.findOne({
            "email": member.email, "subscriptions.product": product, "subscriptions.activated": true}, 
            {_id: 0, "subscriptions.$": 1}).exec()
        
        if(!currentSub) interaction.reply({content: "You don't have an active subscription for this role.", ephemeral: true})
        try{
            const sub_id = currentSub!.get('subscriptions._id').toString()
            const stripe = require('stripe')(process.env.stripeToken);
            const subscription = await stripe.subscriptions.retrieve(sub_id);
            if(subscription.cancel_at_period_end == true)
            {
                interaction.reply({content: "Your subscription is already cancelled.", ephemeral: true})

            } else {
                await stripe.subscriptions.update(sub_id, { cancel_at_period_end: true });
                interaction.reply({content: "Your subscription is set to cancel by the end of the month.", ephemeral: true})
                //TODO SEND EMAIL FOR CANCELLATION

            }
            //subscription.save()
        } catch(err)
        {
            console.log(err)
            interaction.reply({content: "There was an error when trying to retreive your subscription, please try again or contact an admin.", ephemeral: true})
            return err;
        }
        
        
        await UserDocument.findOneAndUpdate({
            "email": member.email,
            "subscriptions.product": product,
             "subscriptions.canceled": false,
              "subscriptions.activated": true},
            {$set: {"subscriptions.$.canceled":true}}, { upsert: false, returnDocument: 'after',}).exec()
        return true;
    } else {
        interaction.reply({content: "You haven't purchased a subscription", ephemeral: true})
        return false;
    }
}

//TODO: MAKE ADMIN FUNCTION
export async function getActivationCode(x: any, product: string, interaction: ContextMenuInteraction ){
    let boolcheckRole = await checkRole(product, x)
    if(boolcheckRole){
        await UserDocument.findOne({"email": x.email, "subscriptions.product": product, "subscriptions.canceled": false, "subscriptions.activated": false},
            function(err: any, sub: any) {
                if(err) {
                    console.log(err)
                }
                else {
                    interaction.reply({content: `Activation Code ${sub.activeToken}`, ephemeral: true})
                }
            }
        ).exec() 
    } else {
        interaction.reply({content: "There is no pending subscription under this email.", ephemeral: true})
        return false;
    }
}

export function assignRole(x: any, member: DiscordJS.GuildMember) {
    if(!x) return;
	const roleMap = mapRole();
    const unverified_role = member.guild.roles.cache.get(process.env.unverified_role!)!
    let roleCount = 0;
	for(let i = 0; i < x.subscriptions.length; i++)
	{
        const tempDoc = x.subscriptions[i]
        const role = member.guild.roles.cache.get(roleMap.get(tempDoc.product)!)!
        if(!role) continue;
		if(!tempDoc.canceled && tempDoc.activated){
			member.roles.add(role)
            member.roles.remove(unverified_role)
            roleCount++;
		} else {
			member.roles.remove(role)
		}
	}
    if(roleCount == 0) {
        member.roles.add(unverified_role);
    }
}

export function assignServerRoles(client: DiscordJS.Client){
    
    const Guild = client.guilds.cache.get(process.env.guild_id!)!;
	Guild.members.cache.forEach(async (member: DiscordJS.GuildMember) => {
		const currentMember = await Guild.members.fetch(member.id)!;
		const currentUser = await UserDocument.findOne({"discord_id": member.id}).exec();
		try{
			assignRole(currentUser, currentMember)
		} catch(err) {
			console.log(err)
		}
	});
}
