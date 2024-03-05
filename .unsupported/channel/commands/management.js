"use strict";
/* Send Channel Management Embed */
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
const shared_1 = require("../../shared");
module.exports = {
    command: new discord_js_1.SlashCommandBuilder()
        .setName('channel')
        .setDescription('Channel Commands'),
    subCommand: new discord_js_1.SlashCommandSubcommandBuilder()
        .setName("embed")
        .setDescription("Sende das Kanalverwaltungsembed."),
    can_execute: (user) => {
        return (0, shared_1.IsSPEEDCUP)(user);
    },
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let select_options = [];
            for (let i = 0; i < 21; i++) {
                select_options.push(new discord_js_1.StringSelectMenuOptionBuilder()
                    .setLabel(String(i))
                    .setValue(String(i)));
            }
            const autochannel_user_select = new discord_js_1.StringSelectMenuBuilder()
                .setCustomId("autochannel_user")
                .setPlaceholder("Maximale Nutzer (0 = Unendlich) ...")
                .addOptions(select_options);
            const message = yield interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setTitle("Kanaleinstellungen")
                        .setColor(0x3498DB)
                        .setDescription(`Hier kannst du Kanaleinstellungen vornehmen, derzeit kannst du folgendes modifizieren:\n
                        - Maximale Nutzeranzahl, wähle hierzu unten einfach aus dem Dropdown eine gewünschte Anzahl aus.\n
                        - Kanalnamen ändern, du kannst den derzeitigen Kanalnamen beliebig ändern.`)
                        .setTimestamp()
                ],
                components: [
                    new discord_js_1.ActionRowBuilder({
                        components: [autochannel_user_select]
                    }),
                    new discord_js_1.ActionRowBuilder({
                        components: [
                            new discord_js_1.ButtonBuilder()
                                .setCustomId("channel_name")
                                .setLabel("Kanal-Namen bearbeiten")
                                .setStyle(discord_js_1.ButtonStyle.Primary)
                        ]
                    })
                ]
            });
        });
    },
};
