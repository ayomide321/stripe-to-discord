import DiscordJS, { RoleResolvable, BaseCommandInteraction } from 'discord.js'
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
    const memberRole = member.findOne({"subscription.product": x, "subscription.canceled": false, "subscription.activated": true})
    if(memberRole)
    {
        return true
    } else {
        return false
    }
}

export function cancelRole(x: string, member: any, interaction: BaseCommandInteraction){
    if(checkRole(x, member)){
        const currentSub =  member.findOne({"subscription.product": x, "subscription.canceled": false, "subscription.activated": true})

        try{
            const subscription = stripe.subscriptions.retrieve(currentSub._id);
            if(subscription.cancel_at_period_end == true)
            {
                interaction.reply({content: "Your subscription is already cancelled.", ephemeral: true})
                return false;
            }
        } catch(err)
        {
            console.log(err)
            interaction.reply({content: "There was an error when trying to retreive your subscription, please try again or contact an admin.", ephemeral: true})
            return err;
        }

        
        
        member.findOneAndUpdate({"subscription.product": x, "subscription.canceled": false, "subscription.activated": true}, {$set: {"subscription.canceled":true}}, { upsert: false, returnDocument: 'after',})
        interaction.editReply({})
        return true;
    } else {
        return false;
    }
}


export function assignRole(x: any, member: DiscordJS.GuildMember) {
	let roleMap = mapRole();

	for(let i = 0; i < x.subscription.length; i++)
	{
		const tempDoc = x.subscription[i]
		if(tempDoc.canceled || !tempDoc.activated){
			member.roles.remove(roleMap.get(tempDoc.product!) as RoleResolvable)
		} else {
			member.roles.add(roleMap.get(tempDoc.product!) as RoleResolvable)
		}

	}
}