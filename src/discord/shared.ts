import {Colors, EmbedBuilder, GuildMember, User} from "discord.js";

export function IsSPEEDCUP(user: User | GuildMember): boolean {
    return user.id === "406420078549270539";
}

export const Embed_MissingPermissions = () => {
  return new EmbedBuilder()
      .setTitle("Command ➞ Fehlende Berechtigung")
      .setDescription("Du hast nicht die notwendigen Berechtigungen um diesen Command ausführen zu können.")
      .setColor(Colors.Red)
      .setTimestamp()
}