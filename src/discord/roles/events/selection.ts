import {ButtonInteraction, ButtonStyle, Events, GuildMember, StringSelectMenuInteraction} from 'discord.js';
import RoleSystem from "../shared";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: StringSelectMenuInteraction | ButtonInteraction) {
        if (interaction.customId && interaction.customId.includes("role_selection")) {
            if (interaction.member && interaction.guild) {
                const member: GuildMember | undefined = interaction.guild.members.cache.get(interaction.member.user.id);

                if (member) {
                    let name: string = "";

                    switch (interaction.customId) {
                        case "role_selection":
                            const role_id = interaction.isStringSelectMenu() ? interaction.values[0] : ""
                            const role = interaction.guild.roles.cache.get(role_id);

                            if (role) {
                                const has_role: boolean = member.roles.cache.has(role.id)
                                name = has_role ? `${role} wurde dir erfolgreich entfernt.` : `${role} wurde dir erfolgreich hinzugefügt.`;

                                if (has_role) {
                                    await member.roles.remove(role.id)
                                } else {
                                    await member.roles.add(["1184242513708589066", role.id])
                                }
                            }
                            break;
                        case "role_selection_all":
                            name = `Dir wurden erfolgreich alle verfügbaren Rollen hinzugefügt.`;
                            await member.roles.add(["1184242513708589066", ...RoleSystem.get_cache().get_keys()]);

                            break;
                        case "role_selection_reset":
                            name = `Dir wurden erfolgreich alle verfügbaren Rollen entfernt.`;
                            await member.roles.remove(RoleSystem.get_cache().get_keys());

                            break;
                        default:
                            name = `Es ist ein unbekannter Fehler aufgetreten.`
                            break
                    }

                    return await interaction.reply({
                        content: name,
                        ephemeral: true
                    })
                }
            }
        }
    },
};