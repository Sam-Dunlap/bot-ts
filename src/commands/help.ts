import { EmbedBuilder, CommandInteraction, CommandInteractionOptionResolver } from "discord.js";
import { commandsArr } from "./index.js";

export default {
    name: "help",
    description: "List all of my commands or info about a specific command.",
    aliases: ["commands"],
    usage: "[command name]",
    cooldown: 5,
    async execute(interaction: CommandInteraction, options: CommandInteractionOptionResolver) {
        const prefix = "porygon, use ";

        const helpEmbed = new EmbedBuilder()
            .setColor("#fc03d7")
            .setTitle("Porygon Help")
            .setURL("https://discord.gg/ZPTMZ8f")
            .setDescription(
                'Porygon is a bot that automatically joins and tracks the stats of a Pokemon Showdown battle. Click on "Porygon FAQ" in this message for a tutorial.'
            )
            .setThumbnail(
                "https://images.discordapp.net/avatars/692091256477581423/634148e2b64c4cd5e555d9677188e1e2.png"
            );
        //Adding each command
        for (let command of commandsArr) {
            helpEmbed.addFields([
                {
                    name: command.name,
                    value: `${prefix}${command.name} ${command.usage || ""}\n${
                        command.description
                    }\nAliases: ${
                        command.aliases ? command.aliases.join(", ") : "None"
                    }`,
                },
            ]);
        }

        return await interaction.reply({ embeds: [helpEmbed] }).catch(async (e) => {
            await interaction.reply({
                content: ":x: You need to enable embeds in this channel to use this command.",
                ephemeral: true
            }
            );
        });
    },
};
