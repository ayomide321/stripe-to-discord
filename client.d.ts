import { Collection, Message, ContextMenuInteraction, ApplicationCommandPermissionData  } from "discord.js";
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";

declare module 'stripe' {
    namespace Stripe {
      interface TypedEventData<T> extends Stripe.Event.Data {
        object: T;
        previous_attributes?: Partial<T>;
      }
  
      interface TypedEvent<T = any> extends Stripe.Event {
        data: TypedEventData<T>;
        type: Exclude<Stripe.WebhookEndpointCreateParams.EnabledEvent, '*'>;
      }
    }
  }
  
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
            run: (interaction: ContextMenuInteraction ) => Promise<void>;
          }
    }
    export {}