import {ButtonInteraction, ButtonStyle, Events, GuildMember, StringSelectMenuInteraction} from 'discord.js';
import RoleSystem from "../shared";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: ButtonInteraction) {
        if (interaction.isButton() && interaction.customId.includes("role_selection")) {
            if (interaction.member && interaction.guild) {
                // await interaction.deferReply(
                //     {ephemeral: true}
                // );

                const member: GuildMember | undefined = interaction.guild.members.cache.get(interaction.member.user.id);

                if (member) {
                    const role_id = interaction.customId.split("role_selection_")[1]
                    const role = interaction.guild.roles.cache.get(role_id);

                    if (role) {
                        const has_role: boolean = member.roles.cache.has(role.id)

                        if (has_role) {
                            await member.roles.remove(role.id)
                        } else {
                            await member.roles.add(role.id)
                        }
                    }

                    try {
                        const data = await RoleSystem.generate_selection(member);
                        await interaction.editReply({
                            embeds: [data.embed],
                            components: data.components
                        })
                    } catch (e) {}
                }
            }
        }
    },
};