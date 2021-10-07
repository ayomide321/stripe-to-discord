const { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } = require('@discordjs/builders');
import { ContextMenuInteraction } from 'discord.js';

const data = new SlashCommandBuilder()
	.setName('send-signal')
	.setDescription('Creates a message to send a trading signal')
    .setDefaultPermission(false)
    .addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
        option.setName('ticker')
            .setRequired(true)
            .setDescription('Enter the name of the ticker you want to access.'))
    .addNumberOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
        option.setName('strike')
            .setRequired(true)
            .setDescription('Enter the strike price.'))
    .addStringOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
        option.setName('call/put')
            .setDescription('Is it a call or a put?')
            .addChoice('Call')
			.addChoice('Put'))
    .addNumberOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
        option.setName('fill-price')
            .setRequired(true)
            .setDescription('Enter the fill price.'))
    .addIntegerOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
        option.setName('expiration-month')
            .setRequired(true)
            .setDescription('Enter the expiration month.'))
    .addIntegerOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
        option.setName('expiration-day')
            .setRequired(true)
            .setDescription('Enter the expiration day.'))
    .addIntegerOption((option: typeof SlashCommandOptionsOnlyBuilder) =>
        option.setName('expiration-year')
                .setDescription('Enter the expiration year.'))


function sendticker(ticker, strike, optionType, fillPrice, expirationDate, interaction){
    try {
        const data = `Ticker: ${ticker}\nStrike: ${strike}\n${optionType}\nFilled At: ${fillPrice}\nExpiration: ${expirationDate}`
        interaction.reply({content: data})
    } catch(err) {
        console.log(err)
        interaction.reply({content: "There was an error, please try again.", ephemeral: true})
    }
}


module.exports = {
    data: data,
    async execute(interaction: ContextMenuInteraction) {
        const ticker = interaction.options.getString('ticker')!
        const strike = interaction.options.getString('strike')!
        const optionType = interaction.options.getString('call/put')!
        const fillPrice = interaction.options.getString('fill-price')!
        const expirationDay = interaction.options.getString('expiration-day')!
        const expirationMonth = interaction.options.getString('expiration-day')!
        const expirationYear = interaction.options.getString('expiration-year')
        //const expirationDate = `${expirationMonth}/${expirationDay}`
        //Create date based no whether year exists or not
        const expirationDate = [expirationMonth, expirationDay, expirationYear].filter(Boolean).join('/')
        sendticker(ticker, strike, optionType, fillPrice, expirationDate, interaction)
    } 
}

export {}