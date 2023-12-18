/* Send Premiere Embed */

import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import { GenerateEventPageSelection } from "../shared";
import PageSelection from "../../../utils/pagination";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premiere')
        .setDescription('Premiere commands')
        .addSubcommand(subcommand => subcommand
            .setName("embed")
            .setDescription("Sende das Premiere Embed.")),
    async execute(interaction: CommandInteraction) {
        const pageSelection: PageSelection = await GenerateEventPageSelection();
        await pageSelection.send(interaction);
    },
};