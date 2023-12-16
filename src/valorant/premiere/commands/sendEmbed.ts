/* Send Premiere Embed */

import { CommandInteraction } from "discord.js";
import { EMBED_COMMAND } from "../../../discord/shared";
import { GenerateEventPageSelection } from "../shared";
import PageSelection from "../../../utils/pagination";

module.exports = {
    data: EMBED_COMMAND.addSubcommand(subcommand => subcommand
        .setName('premiere')
        .setDescription('Sende das Premiere Embed')),
    async execute(interaction: CommandInteraction) {
        const pageSelection: PageSelection = await GenerateEventPageSelection();
        await pageSelection.send(interaction);
    },
};