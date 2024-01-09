import {agent_cache, AgentClass} from "./valorant/content";

const fs = require('node:fs');
const path = require('node:path');

const { Client, Events, ActivityType, Routes, GatewayIntentBits } = require('discord.js');
import logger from './logger';

import dotenv from 'dotenv';
import { Pool } from 'pg';
import {
    Collection,
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder
} from "discord.js";
import { MapClass, map_cache } from "./valorant/content/map";
import {Embed_MissingPermissions, IsSPEEDCUP} from "./discord/shared";

export { DiscordBot, discord_bot };

require('events').EventEmitter.defaultMaxListeners = 100;

dotenv.config();

class DiscordBot {
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
            status: 'dnd',
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
            // Initialize Commands.
            (async () => {
                // await this.Client.rest.put(
                //     Routes.applicationCommands(this.Client.application.id),
                //     { body: [] },
                // )

                // Load and post commands to discord.
                const commands: JSON[] = [];
                this.Client.commands.map((command: any) => {
                    commands.push(command.toJSON());
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

        this.Client.on(Events.InteractionCreate, async (interaction: CommandInteraction) => {
            if (!interaction.isChatInputCommand()) return;

            const send_error = async () => {
                logger.warn("Unknown command got executed.");

                await interaction.reply({
                    content: "No command has been found.",
                    ephemeral: true
                });
            };

            const command = this.Client.commands.get(interaction.commandName);
            if (!command) { return await send_error(); }

            const options = interaction.options as CommandInteractionOptionResolver;
            if (options.getSubcommand(false)) {
                if (options.getSubcommandGroup()) {
                    const subCommandGroup = command.options.find((subCommandGroup: SlashCommandSubcommandGroupBuilder) => subCommandGroup.name === options.getSubcommandGroup());
                    if (!subCommandGroup) { return await send_error(); }

                    const subCommand = subCommandGroup.options.find((subCommand: SlashCommandSubcommandBuilder) => subCommand.name === options.getSubcommand());
                    if (!subCommand) { return await send_error(); }

                    if (subCommand.can_execute === true || subCommand.can_execute(interaction.user)) {
                        await subCommand.execute(interaction);
                    } else {
                        await interaction.reply({
                            embeds: [ Embed_MissingPermissions() ],
                            ephemeral: true
                        })
                    }
                } else {
                    const subCommand = command.options.find((subCommand: SlashCommandSubcommandBuilder) => subCommand.name === options.getSubcommand());
                    if (!subCommand) { return await send_error(); }

                    if (subCommand.can_execute === true || subCommand.can_execute(interaction.user)) {
                        await subCommand.execute(interaction);
                    } else {
                        await interaction.reply({
                            embeds: [ Embed_MissingPermissions() ],
                            ephemeral: true
                        })
                    }
                }
            } else {
                if (command.can_execute === true || command.can_execute(interaction.user)) {
                    await command.execute(interaction);
                } else {
                    await interaction.reply({
                        embeds: [ Embed_MissingPermissions() ],
                        ephemeral: true
                    })
                }
            }
        });
    }

    private async loadCommand(commandPath: string, file: string) {
        const filePath = path.join(commandPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module

        if (command.enabled === false) {
            // logger.warn(`Disabled command => ${file}/${command.command.name}.`);

            return
        }

        if (!command.command) {
            logger.warn(`Failed to load command => ${file}. (No command was provided.)`);

            return
        }

        if (!command.execute) {
            logger.warn(`Failed to load command => ${file}/${command.command.name}. (No execute was provided.)`);

            return
        }

        let commandInteraction: SlashCommandBuilder = command.command;
        // if (command.command) {
        //     commandInteraction = command.command;
        // }

        const old_command = this.Client.commands.get(command.command.name);
        if (old_command) {
            commandInteraction = old_command;
        }

        if (command.subCommand) {
            command.subCommand.execute = command.execute;
            command.subCommand.can_execute = command.can_execute;

            if (command.subCommandGroup) {
                command.subCommandGroup.addSubcommand(command.subCommand);
                commandInteraction.addSubcommandGroup(command.subCommandGroup)
            } else {
                commandInteraction.addSubcommand(command.subCommand)
            }
        } else {
            // @ts-ignore
            commandInteraction.execute = command.execute;
            // @ts-ignore
            commandInteraction.can_execute = command.can_execute;
        }

        // Analyse the command type.
        this.Client.commands.set(command.command.name, commandInteraction);
        logger.info(`Loaded Command => ${file}/${command.command.name}.`);
    }

    private async loadCommands(dir: string = "discord"): Promise<void> {
        // logger.debug("Loading Commands ...");

        const modulePath = path.join(__dirname, dir);
        const moduleFolders = fs.readdirSync(modulePath);
        for (const moduleFolder of moduleFolders) {
            const commandPath = path.join(modulePath, moduleFolder + "/commands");

            if (fs.existsSync(commandPath)) {
                const commandFiles = fs.readdirSync(commandPath);
                for (const command of commandFiles) {
                    await this.loadCommand(commandPath, command);
                }
            }
        }

        // logger.info(`Loaded ${dir} Commands.`);
    }

    private async loadEvents(dir: string = "discord"): Promise<void> {
        // logger.debug("Loading Events ...");

        const modulePath = path.join(__dirname, dir);
        const moduleFolders = fs.readdirSync(modulePath);

        for (const moduleFolder of moduleFolders) {
            const eventPath = path.join(modulePath, moduleFolder + "/events");

            if (fs.existsSync(eventPath)) {
                const eventFiles = fs.readdirSync(eventPath);
                for (const eventFile of eventFiles) {
                    const filePath = path.join(eventPath, eventFile);
                    const event = require(filePath);

                    if (event.enabled === false) {
                        logger.warn(`Disabled event => ${eventFile}/${event.name}`);
                        continue
                    }

                    if ('name' in event && 'execute' in event) {
                        if (event.once) {
                            this.Client.once(event.name, async (...args: any) => await event.execute(...args));
                        } else {
                            this.Client.on(event.name, async (...args: any) => await event.execute(...args));
                        }

                        logger.info(`Loaded event => ${eventFile}/${event.name}`);
                    } else {
                        logger.warn(`Could not load event => ${eventFile}/${event.name} | (missing data structures)`);
                    }
                }
            }
        }

        // logger.info("Loaded events!");
    }

    private async initialize_caches(): Promise<void> {
        await AgentClass.fetchAgents().then((agents) => {
            agent_cache.update(agents);
        })

        await MapClass.fetchMaps().then((maps) => {
            map_cache.update(maps);
        })
    }

    private async initialiseDatabase(): Promise<void> {
        logger.debug("Initializing Database ...");

        this.Client.DB = new Pool({
            user: process.env.DATABASE_USER,
            host: process.env.DATABASE_HOST,
            database: process.env.DATABASE_DB,
            password: process.env.DATABASE_PASSWORD,
            port: 5432, // Standard-PostgreSQL-Port
            max: 20,    // Maximale Anzahl der Verbindungen im Pool
            idleTimeoutMillis: 30000, // Timeout für inaktive Verbindungen
        });

        logger.debug("Database initialized.")
    }

    private async preStart(): Promise<void> {
        // Initialize the database at second, because some commands rely on our database.
        await this.initialiseDatabase();

        // Initialize caches before we are loading commands and such, because some commands rely on our caches.
        await this.initialize_caches();

        // Initialize our events after all has loaded. Events could rely on db and cache entries as well./
        await this.loadEvents();
        await this.loadEvents("valorant");

        // Initialize our commands at last.
        await this.loadCommands();
        await this.loadCommands("valorant");
    }

    public async start() {
        await this.preStart();

        return this.Client.login(process.env.TOKEN)
    }
}

const discord_bot = new DiscordBot();

(async () => {
    await discord_bot.start();
})()