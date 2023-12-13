import {SlashCommandBuilder} from "discord.js";
export { EMBED_COMMAND };

const EMBED_COMMAND = new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Sende spezifische Embeds!');