import { Collection, Message, Interaction, ApplicationCommand, CommandInteraction } from "discord.js";
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
declare module "discord.js" {
        export interface Client {
            commands: Array<string, Command>,
            handleEvents(eventFiles: string[], path: string),
            handleCommands(eventFiles: string[], path: string),
            commandArray: {
                name: string;
                description?: string;
                type?: number;
                options?: APIApplicationCommandOption[];
              }[] = [];
        }

        export interface Command {
            data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
            run: (interaction: CommandInteraction) => Promise<void>;
          }
    }
    export {}