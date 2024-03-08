/* Send Context Help Embed */

import {
    CommandInteraction, GuildMember,
    SlashCommandSubcommandBuilder, User
} from "discord.js";
import EmbedBuilder from '../../../utils/embed';
import {xp_command} from "../const";
import Experience from "../shared";

module.exports = {
    command: xp_command,
    subCommand: new SlashCommandSubcommandBuilder()
        .setName("show")
        .setDescription("Zeigt dir dein derzeitiges Level an."),
    can_execute: (user: User | GuildMember) => true,
    async execute(interaction: CommandInteraction){
        const member = <GuildMember>interaction.member;
        if (!member) return;

        const level = await Experience.get_level(member)
        const exp = await Experience.get_experience(member);
        const needed_exp = await Experience.get_needed_xp(level + 1);

        /*
        let size = 14
        let percentage: number;

        try {
            percentage = Number((exp / needed_exp).toFixed(1));
            console.log(percentage);
        } catch (error) {
            return "⬛".repeat(size);
        }

        console.log(size);
        let progressBar = "🟩".repeat(Math.floor(size * percentage));
        if (progressBar.length !== size) {
            progressBar += "🟥".repeat(size - progressBar.length);
        }
        */

        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Experience")
                    .setSubTitle(member.user.username)
                    .setDescription(
                        `➥ Deine Level-Übersicht\n` +
                        `↬ **Level** › ${level}\n` +
                        `↬ **EXP** › ${exp} / ${needed_exp}`
                        // `${progressBar}`
                    )
                    .setThumbnail(member.displayAvatarURL())
            ]
        })
    },
};