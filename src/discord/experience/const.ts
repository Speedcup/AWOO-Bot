import { SlashCommandBuilder } from "discord.js";

const xp_command = new SlashCommandBuilder()
    .setName('experience')
    .setDescription('Experience Commands')

export { xp_command };