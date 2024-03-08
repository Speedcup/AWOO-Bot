/* Send Context Help Embed */

import {
    CommandInteraction, GuildMember,
    SlashCommandSubcommandBuilder, User
} from "discord.js";
import EmbedBuilder from '../../../utils/embed';
import {xp_command} from "../const";
import Experience from "../shared";
import {IsSPEEDCUP} from "../../shared";

module.exports = {
    command: xp_command,
    subCommand: new SlashCommandSubcommandBuilder()
        .setName("add")
        .setDescription("Fügt dir selbst XP hinzu."),
    can_execute: (user: User | GuildMember) => IsSPEEDCUP(user),
    async execute(interaction: CommandInteraction){
        const member = <GuildMember>interaction.member;
        if (!member) return;

        await Experience.add_experience(member, 10_000);
        return await interaction.reply({
            content: "Success",
            ephemeral: true
        })
    },
};