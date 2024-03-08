"use strict";
/* Reload premiere embed */
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
module.exports = {
    command: new discord_js_1.SlashCommandBuilder()
        .setName('premiere')
        .setDescription('Premiere commands'),
    subCommand: new discord_js_1.SlashCommandSubcommandBuilder()
        .setName("reload")
        .setDescription("Lädt das Premiere Embed neu."),
    can_execute: (user) => {
        return [
            "406420078549270539", // SPEEDCUP
            "660816130721579021", // GILGAMESH
            "205077419139399682", // ILLUMIC
            "303958067249414156", // PHIL
            "861992984441782343", // SELINA
            "202243988806303744", // WANTED
            "353211541178548226" // NICKLAS
        ].includes(user.id);
    },
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, shared_1.UpdatePremiereEmbed)();
            yield interaction.reply({
                content: "Done!",
                ephemeral: true
            });
        });
    },
};
