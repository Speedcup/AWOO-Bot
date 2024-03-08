/* Send Context Help Embed */

import {
    CommandInteraction, GuildMember,
    SlashCommandSubcommandBuilder, User
} from "discord.js";
import EmbedBuilder from '../../../utils/embed';
import {channel_command} from "../const";
import {IsSPEEDCUP} from "../../shared";

module.exports = {
    command: channel_command,
    subCommand: new SlashCommandSubcommandBuilder()
        .setName("help")
        .setDescription("Sende das Help Embed."),
    can_execute: (user: User | GuildMember) => IsSPEEDCUP(user),
    async execute(interaction: CommandInteraction){
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Channel")
                    .setSubTitle("Context Menü")
                    .setDescription(
                        `➥ Hier findest du ein kleines Know-How zum Thema Context-Menüs.\n\n` +
                        `↬ Wenn du einen User kicken, bannen oder entbannen möchtest, ist diese Option angenehmer und schneller als das herkömmliche Auswählen aus dem Dropdown.\n\n` +
                        `↬ Klicke einen User mit **Rechtsklick** an und wähle den Punkt **Apps**. Hier hast du alle möglichen Optionen, wähle einfach deine gewünschte aus.\n\n` +
                        `↬ Bitte beachte, es kommt keine Bestätigungsabfrage, einmal gedrückt und die Aktion wird unwiderruflich ausgeführt.`
                    )
                    .setImage("https://media.discordapp.net/attachments/1215699798670315630/1215701446134210620/image.png?ex=65fdb533&is=65eb4033&hm=e6511af7714dabef40e987c7a191994a262687ab33b4160f51f057403cdf603a&=&format=webp&quality=lossless&width=900&height=679")
            ]
        })
    },
};