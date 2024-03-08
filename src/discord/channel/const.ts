import { SlashCommandBuilder } from "discord.js";

const channel_command = new SlashCommandBuilder()
    .setName('channels')
    .setDescription('Channels Commands')

export { channel_command };