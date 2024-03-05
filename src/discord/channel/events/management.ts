import {
    ActionRowBuilder,
    Events, ModalBuilder, PermissionsBitField, TextInputBuilder, TextInputStyle
} from 'discord.js';
import {channel_cache} from "../../../utils/globalcache";
import ChannelManager from "../shared";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: any) {
        if (interaction.isButton() && interaction.customId.startsWith("channel_")) {
            const member = await interaction.guild?.members.fetch(interaction.user.id);
            if (!member) return;

            if (!member.voice.channel) {
                await interaction.reply({
                    content: "Du bist derzeit in keinem Channel.",
                    ephemeral: true
                });

                return;
            }

            if (!await ChannelManager.is_owner(member, member.voice.channel)) {
                await interaction.reply({
                    content: "Du bist nicht der Owner des Channels.",
                    ephemeral: true
                });

                return;
            }

            let event = interaction.customId.split("channel_")[1]
            switch (event) {
                case "unlock":
                    await member.channel.permissionOverwrites.set([
                        {
                            id: interaction.guild.id,
                            allow: [PermissionsBitField.Flags.Connect],
                        }
                    ]);

                    break;
                case "lock":
                    await member.channel.permissionOverwrites.set([
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.Connect],
                        }
                    ]);

                    break;
                case "edit":
                    break;
                case "kick":
                    break;
                case "ban":
                    break;
                case "unban":
                    break;
                case "owner":
                    break;
                case "claim":
                    break;
                case "switch":
                    break;
                default:
                    break;
            }
        }
    },
};