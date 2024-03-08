import {
    ChannelType,
    GuildMember,
    PermissionsBitField,
    VoiceChannel
} from "discord.js";
import {discord_bot} from "../../index";
import EmbedBuilder from "../../utils/embed";

export default class ChannelManager {
    static async is_valid_request(interaction: any): Promise<{ success: boolean, error?: string }> {
        const member = await interaction.guild?.members.fetch(interaction.user.id);
        if (!member) return {success: false, error: "Invalid member."};

        let channel = member.voice.channel;
        if (!channel) return {success: false, error: "➥ Du bist derzeit in keinem Channel."};

        // Check if the user is performing actions that don't require ownership.
        if (interaction.isButton()) {
            if (interaction.customId == "channel_button_owner" || interaction.customId == "channel_button_claim")  return {success: true}
        }

        if (!await ChannelManager.is_owner(member, <VoiceChannel>channel)) return {
            success: false,
            error: "➥ Du bist nicht der Owner des Channels."
        };

        return {success: true}
    }

    static can_create_channel(member: GuildMember, base_channel: VoiceChannel): boolean {
        // Since I am way too lazy rn to program a modular, dynamic category & creation channel whitelist, I will Hardcode my single one.

        // Do not allow VANGUARD (the bot) to create channels. This should never be a possibility in the first place, but to be safe.
        if (member.id == "1071500194467819540") {
            return false;
        }

        return base_channel.id == "1184217594710995097";
    }

    // Returns whether a channel is deletable.
    //
    // A Channel is considered deletable when ...
    // ... the channel is empty.
    // ... the channel was created by the ChannelManager. (This means the channel was registered by a user who joined a creator channel.)
    static async is_channel_deletable(channel: VoiceChannel): Promise<boolean> {
        // Do not (try to) delete non-empty channels.
        if (channel.members.size > 0) {
            return false;
        }

        // If the channel is generally not deletable (for example if the bot does not have sufficient permissions) return false.
        if (!channel.deletable) {
            return false;
        }

        // We could check the local cache here, but if for some reason the bot does not have an up to date cache, checking the cache would fail.
        // Since the discord is not big enough to have reasonable concerns of performance, doing db checks here should be alright.

        const database = await discord_bot.Client.DB.connect();

        let results = await database.query(`SELECT channel_id FROM channels WHERE channel_id = '${channel.id}'`);
        database.release();

        // If we have a result (and it should be == 1) the channel is practically deletable.
        return (results.rowCount > 0);
    }

    // Creates a channel within the base channel category. If none is specified, it will not be created in a category.
    static async create_channel(member: GuildMember, base_channel: VoiceChannel) {
        if (!this.can_create_channel(member, base_channel)) {
            return
        }

        const database = await discord_bot.Client.DB.connect();

        await base_channel.guild.channels.create({
            name: `${member ? member.displayName : 'Unknown'}'s Channel`,
            type: ChannelType.GuildVoice,
            parent: base_channel.parentId
        }).then(async channel => {
            // If for some reason, the owner still exists, set it empty.
            await database.query(`UPDATE channels SET owner_id = '' WHERE owner_id = '${member.id}'`);
            await database.query(`INSERT INTO channels (channel_id, owner_id) VALUES ('${channel.id}', '${member.id}')`);

            // Move the user to their new channel
            await member.voice.setChannel(channel);
        });

        database.release();
    }

    static async delete_channel(channel: VoiceChannel) {
        // Check whether this channel is deletable.
        if (!await this.is_channel_deletable(channel)) {
            return false;
        }

        const database = await discord_bot.Client.DB.connect();

        await database.query(`DELETE FROM channels WHERE channel_id = '${channel.id}'`);
        database.release();

        await channel.delete()
            .catch(console.error);

        return true;
    }

    static async get_owner(channel: VoiceChannel) {
        const database = await discord_bot.Client.DB.connect();
        const result = await database.query(`SELECT * FROM channels WHERE channel_id = '${channel.id}'`);
        database.release();

        if (!result || result.rowCount <= 0) return null;

        let item = result.rows[0];
        if (!item) return null;
        if (item.owner_id == "") return null;

        return await discord_bot.Client.users.fetch(item.owner_id);
    }

    static async is_owner(member: GuildMember, channel: VoiceChannel) {
        let owner = await this.get_owner(channel);
        if (!owner || typeof owner == null) return false;

        return owner.id == member.id;
    }

    // Checks if the owner status should be removed from the user.
    // This is primarily used on leave to check whether the owner has left their own channel.
    static async check_owner(member: GuildMember) {
        const database = await discord_bot.Client.DB.connect();
        const results = await database.query(`SELECT * FROM channels WHERE owner_id = '${member.id}'`);

        if (results.rowCount > 0) {
            for (const result of results.rows) {
                if (member.voice && member.voice.channel && member.voice.channel.id != result.channel_id) {
                    await database.query(`UPDATE channels SET owner_id = '' WHERE channel_id = '${result.channel_id}'`);
                }
            }
        }

        database.release();
    }

    static async claim_channel(member: GuildMember, channel: VoiceChannel): Promise<{
        success: boolean,
        error?: string
    }> {
        if (member.voice.channel?.id != channel.id) {
            return {success: false, error: `Du befindest dich nicht in dem Channel welchen du versuchst zu claimen.`}
        }

        let owner = await this.get_owner(channel);
        if (owner) {
            if (owner.id == member.id) {
                return {success: false, error: "Dir gehört der Channel bereits."}
            }

            return {success: false, error: `Du kannst den Channel nicht claimen da dieser im Besitz von ${owner} ist.`}
        }

        const database = await discord_bot.Client.DB.connect();
        const result = await database.query(`SELECT * FROM channels WHERE channel_id = '${channel.id}'`);
        if (!result || result.rowCount <= 0) {
            database.release();
            return {success: false, error: `Der Channel ist nicht claimbar.`}
        }

        await database.query(`UPDATE channels SET owner_id = '${member.id}' WHERE channel_id = '${channel.id}'`);
        database.release();

        return {success: true}
    }

    static async switch_owner(old_owner: GuildMember, new_owner: GuildMember, channel: VoiceChannel): Promise<{
        success: boolean,
        error?: string
    }> {
        if (old_owner.voice.channel?.id != new_owner.voice.channel?.id) {
            return {success: false, error: `Du und ${new_owner} müssen sich im selben Channel befinden.`}
        }

        let owner = await this.get_owner(channel);
        if (!owner) {
            return {success: false, error: "Der Channel hat keinen Owner. Bitte nutze die Claim-Funktion."}
        }

        if (owner) {
            if (owner.id != old_owner.id) {
                return {success: false, error: "Dir gehört der Channel nicht."}
            }

            if (owner.id == new_owner.id) {
                return {success: false, error: "Dir gehört der Channel bereits."}
            }

            if (old_owner.id == new_owner.id) {
                return {success: false, error: "Dir gehört der Channel bereits."}
            }
        }

        const database = await discord_bot.Client.DB.connect();
        const result = await database.query(`SELECT * FROM channels WHERE channel_id = '${channel.id}'`);
        if (!result || result.rowCount <= 0) {
            database.release();
            return {success: false, error: `Der Channel ist nicht claimbar.`}
        }

        await database.query(`UPDATE channels SET owner_id = '${new_owner.id}' WHERE channel_id = '${channel.id}'`);
        database.release();

        return {success: true}
    }

    static async kick_user(interaction: any) {
        const {success, error} = await ChannelManager.is_valid_request(interaction);
        if (!success) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Channel")
                    .setSubTitle("Fehler")
                    .setDescription(error ? error : "➥ Unbekannter Fehler.")
            ],
            ephemeral: true
        })

        const member = await interaction.guild?.members.fetch(interaction.user.id);
        let channel = member.voice.channel;

        let target: GuildMember | null = null;

        // Safety Check.
        if (interaction.isUserSelectMenu()) {
            target = await interaction.guild?.members.fetch(interaction.values[0])
                .catch(console.error);
        } else if (interaction.isUserContextMenuCommand()) {
            target = <GuildMember>interaction.targetMember;
        }

        if (target) {
            if (target.id == member.id) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Channel")
                            .setSubTitle("Fehler")
                            .setDescription(
                                `➥ User konnte nicht gekickt werden.\n` +
                                `↬ Du kannst dich nicht selbst aus deinem Channel kicken.\n` +
                                `↬ Bitte nutze die Discord eigene Leave Funktion um den Channel zu verlassen.`
                            )
                    ],
                    ephemeral: true
                });
            }

            if (!target.voice || !target.voice.channel || target.voice.channel.id != channel.id) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Channel")
                            .setSubTitle("Fehler")
                            .setDescription(
                                `➥ User konnte nicht gekickt werden.\n` +
                                `↬ ${target} befindet sich nicht in deinem Channel.\n` +
                                `↬ Solltest du präziser einen User kicken wollen, befolge bitte dieses Tutorial.`,      // TODO: Implement Tutorial Link.
                            )
                    ],
                    ephemeral: true
                });
            }

            if (target.permissions.has(PermissionsBitField.Flags.Administrator | PermissionsBitField.Flags.ManageGuild)) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Channel")
                            .setSubTitle("Fehler")
                            .setDescription(
                                `➥ User konnte nicht gekickt werden.\n` +
                                `↬ ${target} konnte nicht vom Channel gekickt werden.\n` +
                                `↬ ${target} ist immun gegen Kicks.`,
                            )
                    ],
                    ephemeral: true
                });
            }

            await target.voice.disconnect()
                .then(async (_: GuildMember) => {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Channel")
                                .setSubTitle("User Gekickt")
                                .setDescription(
                                    `➥ User erfolgreich gekickt.\n` +
                                    `↬ ${target} wurde erfolgreich vom Channel gekickt.\n` +
                                    `↬ Wenn du möchtest, dass ${target} deinen Channel weiterhin nicht mehr betreten kann, kannst du dafür die Ban-Funktion nutzen.`
                                )
                        ],
                        ephemeral: true
                    });
                })
                .catch(async (reason: any) => {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Channel")
                                .setSubTitle("Fehler")
                                .setDescription(
                                    `➥ User konnte nicht gekickt werden.\n` +
                                    `↬ Folgende Möglichkeiten könnten das Problem verursacht haben:\n` +
                                    `- Der Bot hat nicht genügend Rechte, was bedeutet, dass ${target} über dem Bot steht.\n` +
                                    `- Ein Unbekannter Fehler ist aufgetreten.`
                                )
                        ],
                        ephemeral: true
                    });
                })
        } else {
            await interaction.reply({
                content: "Der Nutzer konnte nicht gefunden werden.",
                ephemeral: true
            })
        }
    }

    static async ban_user(interaction: any) {
        const {success, error} = await ChannelManager.is_valid_request(interaction);
        if (!success) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Channel")
                    .setSubTitle("Fehler")
                    .setDescription(error ? error : "➥ Unbekannter Fehler.")
            ],
            ephemeral: true
        })

        const member = await interaction.guild?.members.fetch(interaction.user.id);
        let channel = member.voice.channel;

        let target: GuildMember | null = null;

        // Safety Check.
        if (interaction.isUserSelectMenu()) {
            target = await interaction.guild?.members.fetch(interaction.values[0])
                .catch(console.error);
        } else if (interaction.isUserContextMenuCommand()) {
            target = <GuildMember>interaction.targetMember;
        }

        if (target) {
            if (target.id == member.id) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Channel")
                            .setSubTitle("Fehler")
                            .setDescription(
                                `➥ User konnte nicht gebannt werden.\n` +
                                `↬ Du kannst dich nicht selbst aus deinem Channel bannen.\n` +
                                `↬ Bitte nutze die Discord eigene Leave Funktion um den Channel zu verlassen.`
                            )
                    ],
                    ephemeral: true
                });
            }

            if (target.permissions.has(PermissionsBitField.Flags.Administrator | PermissionsBitField.Flags.ManageGuild)) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Channel")
                            .setSubTitle("Fehler")
                            .setDescription(
                                `➥ User konnte nicht gebannt werden.\n` +
                                `↬ ${target} konnte nicht vom Channel gebannt werden.\n` +
                                `↬ ${target} ist immun gegen Banns.`
                            )
                    ],
                    ephemeral: true
                });
            }

            await channel.permissionOverwrites.edit(target.id, {Connect: false});

            // Kick user if currently present in the channel.
            if (target.voice && target.voice.channel && target.voice.channel.id == channel.id) {
                await target.voice.disconnect();
            }

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Channel")
                        .setSubTitle("User Gebannt")
                        .setDescription(
                            `➥ User erfolgreich gebannt.\n` +
                            `↬ ${target} wurde erfolgreich vom Channel gebannt.\n` +
                            `↬ Wenn du möchtest, dass ${target} wieder deinen Channel betreten kann, kannst du die Unban-Funktion nutzen.`
                        )
                ],
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: "Der Nutzer konnte nicht gefunden werden.",
                ephemeral: true
            })
        }
    }

    static async unban_user(interaction: any) {
        const {success, error} = await ChannelManager.is_valid_request(interaction);
        if (!success) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Channel")
                    .setSubTitle("Fehler")
                    .setDescription(error ? error : "➥ Unbekannter Fehler.")
            ],
            ephemeral: true
        })

        const member = await interaction.guild?.members.fetch(interaction.user.id);
        let channel = member.voice.channel;

        let target: GuildMember | null = null;

        // Safety Check.
        if (interaction.isUserSelectMenu()) {
            target = await interaction.guild?.members.fetch(interaction.values[0])
                .catch(console.error);
        } else if (interaction.isUserContextMenuCommand()) {
            target = <GuildMember>interaction.targetMember;
        }

        if (target) {
            await channel.permissionOverwrites.edit(target.id, {Connect: true})
                .then(async (_: GuildMember) => {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Channel")
                                .setSubTitle("User Entbannt")
                                .setDescription(
                                    `➥ User erfolgreich entbannt.\n` +
                                    `↬ ${target} wurde erfolgreich vom Channel entbannt.\n` +
                                    `↬ Der User kann dem Channel nun wieder beitreten.`
                                )
                        ],
                        ephemeral: true
                    });
                })
                .catch(async (_: any) => {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Channel")
                                .setSubTitle("Fehler")
                                .setDescription(
                                    `➥ Der Owner konnte nicht weitergegeben werden.\n` +
                                    `↬ Du bist bereits Owner.\n` +
                                    `↬ Du kannst dir nicht erneut selbst Owner geben.`
                                )
                        ],
                        ephemeral: true
                    });
                });
        } else {
            await interaction.reply({
                content: "Der Nutzer konnte nicht gefunden werden.",
                ephemeral: true
            })
        }
    }

}