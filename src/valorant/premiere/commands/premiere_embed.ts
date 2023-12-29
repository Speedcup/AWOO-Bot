/* Send Premiere Embed */

import {CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder} from "discord.js";
import { GenerateEventPageSelection } from "../shared";
import PageSelection from "../../../utils/pagination";

module.exports = {
    command: new SlashCommandBuilder()
        .setName('premiere')
        .setDescription('Premiere commands'),
    subCommand: new SlashCommandSubcommandBuilder()
            .setName("embed")
            .setDescription("Sende das Premiere Embed."),
    async execute(interaction: CommandInteraction) {
        const pageSelection: PageSelection = await GenerateEventPageSelection();
        await pageSelection.send(interaction);
    },
};