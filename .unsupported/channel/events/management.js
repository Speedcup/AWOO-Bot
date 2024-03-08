"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const globalcache_1 = require("../../../utils/globalcache");
module.exports = {
    name: discord_js_1.Events.InteractionCreate,
    execute(interaction) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.isStringSelectMenu() || interaction.isButton() || interaction.isModalSubmit() && globalcache_1.channel_cache.get(interaction.user.id)) {
                if (["autochannel_user", "channel_name", "modal_channel_name"].includes(interaction.customId)) {
                    const member = yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(interaction.user.id));
                    if (member && globalcache_1.channel_cache.get(interaction.user.id) === member.voice.channelId) {
                        switch (interaction.customId) {
                            case "autochannel_user":
                                const user_count = interaction.values[0];
                                yield ((_b = member.voice.channel) === null || _b === void 0 ? void 0 : _b.edit({
                                    userLimit: Number(user_count)
                                }));
                                yield interaction.reply({
                                    content: `Du hast die User-Anzahl erfolgreich auf ${user_count} geändert!`,
                                    ephemeral: true
                                });
                                break;
                            case "channel_name":
                                const modal = new discord_js_1.ModalBuilder()
                                    .setCustomId('modal_channel_name')
                                    .setTitle('Kanalname bearbeiten')
                                    .addComponents(new discord_js_1.ActionRowBuilder({
                                    components: [
                                        new discord_js_1.TextInputBuilder()
                                            .setCustomId("modal_channel_name_entry")
                                            .setLabel("Neuer Kanalname")
                                            .setPlaceholder(member.voice.channel.name)
                                            .setStyle(discord_js_1.TextInputStyle.Short)
                                            .setMinLength(3)
                                            .setMaxLength(20)
                                            .setRequired(true)
                                    ]
                                }));
                                yield interaction.showModal(modal);
                                break;
                            case "modal_channel_name":
                                const new_name = interaction.fields.getTextInputValue('modal_channel_name_entry');
                                yield ((_c = member.voice.channel) === null || _c === void 0 ? void 0 : _c.edit({
                                    name: new_name
                                }));
                                yield interaction.reply({
                                    content: `Du hast den Channel erfolgreich zu ${new_name} geändert!`,
                                    ephemeral: true
                                });
                                break;
                            default:
                                yield interaction.reply({
                                    content: "Du bist derzeit in keinem Channel oder der Channel in welchem du dich befindest gehört nicht dir..",
                                    ephemeral: true
                                });
                                break;
                        }
                    }
                    else {
                        yield interaction.reply({
                            content: "Du bist derzeit in keinem Channel oder der Channel in welchem du dich befindest gehört nicht dir..",
                            ephemeral: true
                        });
                    }
                }
            }
        });
    },
};
