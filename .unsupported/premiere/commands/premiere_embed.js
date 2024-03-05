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
const shared_2 = require("../../../discord/shared");
module.exports = {
    command: new discord_js_1.SlashCommandBuilder()
        .setName('premiere')
        .setDescription('Premiere commands'),
    subCommand: new discord_js_1.SlashCommandSubcommandBuilder()
        .setName("embed")
        .setDescription("Sende das Premiere Embed."),
    can_execute: (user) => {
        return (0, shared_2.IsSPEEDCUP)(user);
    },
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageSelection = yield (0, shared_1.GenerateEventPageSelection)();
            yield pageSelection.send(interaction);
        });
    },
};
