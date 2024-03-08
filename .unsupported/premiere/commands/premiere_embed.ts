/* Send Premiere Embed */

import {CommandInteraction, GuildMember, SlashCommandBuilder, SlashCommandSubcommandBuilder, User} from "discord.js";
import { GenerateEventPageSelection } from "../shared";
import PageSelection from "../../../utils/pagination";
import {IsSPEEDCUP} from "../../../discord/shared";

module.exports = {
    command: new SlashCommandBuilder()
        .setName('premiere')
        .setDescription('Premiere commands'),
    subCommand: new SlashCommandSubcommandBuilder()
            .setName("embed")
            .setDescription("Sende das Premiere Embed."),
    can_execute: (user: User | GuildMember) => {
        return IsSPEEDCUP(user);
    },
    async execute(interaction: CommandInteraction) {
        const pageSelection: PageSelection = await GenerateEventPageSelection();
        await pageSelection.send(interaction);
    },
};