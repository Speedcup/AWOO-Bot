"use strict";
/* Send Premiere Embed */
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
const shared_1 = require("../shared");
const index_1 = require("../../../index");
const shared_2 = require("../../../discord/shared");
// TODO, add member remove option.
module.exports = {
    command: new discord_js_1.SlashCommandBuilder()
        .setName('premiere')
        .setDescription('Premiere commands'),
    subCommandGroup: new discord_js_1.SlashCommandSubcommandGroupBuilder()
        .setName('member')
        .setDescription('Manage the current Premiere Roaster.'),
    subCommand: new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription('Add a member to the Roaster.')
        .addUserOption(option => option
        .setName('user')
        .setDescription('The member to be added.')
        .setRequired(true))
        .addBooleanOption(option => option
        .setName('bench')
        .setDescription('Is the player a Bench Player?')),
    can_execute: (user) => {
        return (0, shared_2.IsSPEEDCUP)(user);
    },
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!shared_1.WHITELIST.includes(interaction.user.id))
                return;
            const client = yield index_1.discord_bot.Client.DB.connect();
            const result = yield client.query(`SELECT discord_id FROM members WHERE discord_id = '${(_a = interaction.options.getUser('user')) === null || _a === void 0 ? void 0 : _a.id}'`);
            console.log(interaction.options.get("bench"));
            if (result.rowCount == 0) {
                yield client.query(`INSERT INTO members (discord_id, valorant_uuid, valpaw_uuid) VALUES ('${(_b = interaction.options.getUser('user')) === null || _b === void 0 ? void 0 : _b.id}', null, null)`);
                yield interaction.reply({
                    content: `${interaction.options.getUser('user')} erfolgreich dem Team hinzugefügt!`,
                    ephemeral: true
                });
            }
            else {
                yield interaction.reply({
                    content: `${interaction.options.getUser('user')} ist bereits Mitglied des Teams.`,
                    ephemeral: true
                });
            }
            client.release();
        });
    },
};
