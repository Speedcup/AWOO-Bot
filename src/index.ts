const fs = require('node:fs');
const path = require('node:path');

const { Client, Events, ActivityType, Routes, GatewayIntentBits } = require('discord.js');
const logger = require('./logger');

import {Cache} from "./utils/globalcache";
import { Collection } from "discord.js";
import dotenv from 'dotenv';

dotenv.config();

export default class DiscordBot {
    public readonly Client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildModeration,
            GatewayIntentBits.GuildBans,
            GatewayIntentBits.GuildEmojisAndStickers,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildWebhooks,
            GatewayIntentBits.GuildInvites,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMessageTyping,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.DirectMessageReactions,
            GatewayIntentBits.DirectMessageTyping,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildScheduledEvents,
            GatewayIntentBits.AutoModerationConfiguration,
            GatewayIntentBits.AutoModerationExecution,
        ],
        presence: {
            status: "dnd",
            activities: [{
                name: "Loading ...",
                type: ActivityType.Custom
            }]
        }
    })

    constructor() {
        this.Client.commands = new Collection();

        this.Client.on(Events.Debug, (m: string) => logger.debug(m));
        this.Client.on(Events.Warn, (m: string) => logger.warn(m));
        this.Client.on(Events.Error, (m: string) => logger.error(m));

        this.Client.on("ready", ((client: typeof this.Client) => {
            (async () => {
                const commands: JSON[] = [];
                this.Client.commands.map((command: any) => {
                    commands.push(command.data.toJSON());
                })

                await this.Client.rest.put(
                    Routes.applicationCommands(this.Client.application.id),
                    { body: commands },
                )
            })()

            this.Client.user.setPresence({
                status: 'online',
            });

            logger.info(`Ready! Logged in as ${client.user.tag}`);
        }))

        this.Client.on(Events.InteractionCreate, async (interaction: any) => {
            if (!interaction.isChatInputCommand()) return;

            const command = this.Client.commands.get(interaction.commandName);

            if (!command) {
                logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(`Error executing ${interaction.commandName}`);
                logger.error(error);
            }
        });
    }

    private loadCommands() {
        logger.debug("Loading Commands ...");

        try {
            const foldersPath = path.join(__dirname, 'commands');
            const commandFolders = fs.readdirSync(foldersPath);

            for (const folder of commandFolders) {
                const commandsPath = path.join(foldersPath, folder);
                const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const filePath = path.join(commandsPath, file);
                    const command = require(filePath);
                    // Set a new item in the Collection with the key as the command name and the value as the exported module
                    if ('data' in command && 'execute' in command) {
                        this.Client.commands.set(command.data.name, command);
                        logger.info(`Command ${command.data.name} has been loaded.`);
                    } else {
                        logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
                    }
                }
            }
        } catch (e) {
            logger.debug("No commands were found.");
        }

        logger.info("Loaded Commands!");
    }

    private loadEvents(): void {
        logger.debug("Loading Events ...");

        const foldersPath = path.join(__dirname, 'events');
        const eventFolders = fs.readdirSync(foldersPath);

        for (const folder of eventFolders) {
            const eventsPath = path.join(foldersPath, folder);
            const eventFiles = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith('.js'));
            for (const file of eventFiles) {
                const filePath = path.join(eventsPath, file);
                const event = require(filePath);

                if (event.once) {
                    this.Client.once(event.name, (...args: any) => event.execute(...args));
                } else {
                    this.Client.on(event.name, (...args: any) => event.execute(...args));
                }
                logger.debug(`Loaded event => ${event.name}`);
            }
        }

        logger.info("Loaded events!");
    }
    private async preStart() {
        this.loadEvents();
        this.loadCommands();
    }

    public async start() {
        await this.preStart();

        return this.Client.login(process.env.TOKEN)
    }
}

(async () => {
    const discord_bot = new DiscordBot();
    await discord_bot.start();
})()