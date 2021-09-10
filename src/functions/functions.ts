import DiscordJS, { RoleResolvable, ContextMenuInteraction } from 'discord.js'
//import UserDocument from '../../data/models/user';
import  UserDocument  = require('../data/models/user');
const stripe = require('stripe')(process.env.stripeToken);
require('dotenv').config();


export function mapRole(){
    let roleMap = new Map<string, string>();
	roleMap.set(process.env.product_1!, process.env.role_1!)
	roleMap.set(process.env.product_2!, process.env.role_2!)
	roleMap.set(process.env.product_3!, process.env.role_3!)
    return roleMap
}

export function checkRole(x: string, member: any){
    if(!member) return false
    const memberRole = member.findOne({"subscriptions.product": x, "subscriptions.canceled": false, "subscriptions.activated": true})
    if(memberRole)
    {
        return true
    } else {
        return false
    }
}

export async function activateRole(x: string, code: string, interaction: ContextMenuInteraction){
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

export async function cancelRole(x: string, member: any, interaction: ContextMenuInteraction){
    if(checkRole(x, member)){
        const currentSub = await member.findOne({"subscriptions.product": x, "subscriptions.canceled": false, "subscriptions.activated": true}).exec()
        try{
            const subscription = stripe.subscriptions.retrieve(currentSub._id);
            if(subscription.cancel_at_period_end == true)
            {
                interaction.reply({content: "Your subscription is already cancelled.", ephemeral: true})
                return false;
            }
            subscription.save()
        } catch(err)
        {
            console.log(err)
            interaction.reply({content: "There was an error when trying to retreive your subscription, please try again or contact an admin.", ephemeral: true})
            return err;
        }

        
        
        await member.findOneAndUpdate({"subscriptions.product": x, "subscriptions.canceled": false, "subscriptions.activated": true}, {$set: {"subscriptions.canceled":true}}, { upsert: false, returnDocument: 'after',}).exec()
        interaction.editReply({})
        return true;
    } else {
        interaction.reply({content: "You don't have a subscription, please try again.", ephemeral: true})
        return false;
    }
}


export function assignRole(x: any, member: DiscordJS.GuildMember) {
	let roleMap = mapRole();

	for(let i = 0; i < x.subscriptions.length; i++)
	{
		const tempDoc = x.subscriptions[i]
		if(tempDoc.canceled || !tempDoc.activated){
			member.roles.remove(roleMap.get(tempDoc.product!) as RoleResolvable)
		} else {
			member.roles.add(roleMap.get(tempDoc.product!) as RoleResolvable)
		}

	}
}