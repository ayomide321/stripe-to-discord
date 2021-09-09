    declare module "discord.js" {
        export interface Client {
            commands: import('discord.js').Collection<unknown, Command>,
            handleEvents(eventFiles: string[], path: string),
            handleCommands(eventFiles: string[], path: string),
            commandArray: Array<Function>
        }

        export interface Command {
            name: string,
            description: string,
            execute: (message: import('discord.js').Message | import('discord.js').Interaction, args?: string[]) => Promise<Command> // Can be `Promise<SomeType>` if using async
        }
    }
    export {}