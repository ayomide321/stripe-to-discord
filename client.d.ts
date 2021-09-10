import { Collection, Message, Interaction } from "discord.js";

declare module "discord.js" {
        export interface Client {
            commands: Collection<unknown, Command>,
            handleEvents(eventFiles: string[], path: string),
            handleCommands(eventFiles: string[], path: string),
            commandArray: Array<Function>
        }

        export interface Command {
            name: string,
            description: string,
            execute: (message: Message | Interaction, args?: string[]) => Promise<Command> // Can be `Promise<SomeType>` if using async
        }
    }
    export {}