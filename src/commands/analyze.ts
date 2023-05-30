import {
    CommandInteractionOptionResolver,
    CommandInteraction,
} from "discord.js";
import axios from "axios";
import { Prisma, ReplayTracker, funcs } from "../utils/index.js";
import { writeFileSync } from "fs";

export default {
    name: "analyze",
    description: "Analyzes Pokemon Showdown replays.",
    aliases: ["analyse"],
    usage: "[replay link]",
    options: [
        {
            name: "link",
            description: "PS replay link",
            required: true,
            type: 3,
        },
    ],
    async execute(
        interaction: CommandInteraction,
        options: CommandInteractionOptionResolver
    ) {
        const replayLink = options.getString("link") as string;
        console.log(replayLink);
        const urlRegex = /(https?:\/\/[^ ]*)/;
        const links = replayLink.match(urlRegex);

        // Discord interaction message limit is 2000, so if it errors, it has to error properly
        if (replayLink.length >= 1950) {
            return await interaction.reply({
                content: `:x: Your replay length is too long.`,
                ephemeral: true,
            });
        }

        if (!(replayLink.includes("replay") && links)) {
            return await interaction.reply({
                content: `:x: ${replayLink} is not a replay.`,
                ephemeral: true,
            });
        }
        await interaction.deferReply();

        let link = replayLink + ".log";
        let response = await axios
            .get(link, {
                headers: { "User-Agent": "PorygonTheBot" },
            })
            .catch(async (e) => {
                await interaction.editReply(
                    ":x: Something went wrong. Please check your replay link."
                );
                return;
            });
        if (!response)
            return await interaction.editReply(
                ":x: Something went wrong. Please check your replay link."
            );
        let data = response.data;

        //Getting the rules
        let rules = await Prisma.getRules(interaction.channel?.id as string);
        let date = interaction.createdAt;
        let replayer = new ReplayTracker(replayLink, rules);
        const matchJson = await replayer.track(data);
        const csvResponse = funcs.formatToCSV(matchJson, date);
        writeFileSync("output.csv", csvResponse);
        await interaction.editReply(
            `${matchJson.playerNames[0]} vs ${matchJson.playerNames[1]}`
        );

        if (matchJson.error) {
            console.log(`error: ${matchJson.error}`);
            return await interaction.editReply(matchJson.error);
        }
        console.log(`${link} has been analyzed!`);
        return await interaction.channel?.send({
            files: ["output.csv"],
        });
    },
};
