import {
    MessageComponentInteraction,
    ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction, EmbedBuilder, StringSelectMenuBuilder
} from 'discord.js';

class PageSelection {
    private readonly pages: EmbedBuilder[];
    private readonly customComponents: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[];
    private readonly time: number;
    private currentPage: number;
    private currentInteraction: CommandInteraction | null;

    public show_previous_button: boolean;
    public show_next_button: boolean;

    constructor(
        pages: EmbedBuilder[],
        customComponents: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [],
        time: number = 30000,
        showPreviousButton: boolean = true,
        showNextButton: boolean = true)
    {
        this.pages = pages;

        this.customComponents = customComponents;
        this.time = time;

        this.currentPage = 0;
        this.currentInteraction = null;

        this.show_previous_button = showPreviousButton;
        this.show_next_button = showNextButton;
    }

    async create_components(): Promise<ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[]> {
        const buttons = new ActionRowBuilder<ButtonBuilder>();

        // Check if we should show the previous button.
        if (this.show_previous_button) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId('previous_page')
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(this.currentPage <= 0)
            )
        }

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId('current_page')
                .setLabel(`Page ${this.currentPage + 1} / ${this.pages.length}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        )

        if (this.show_next_button) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setEmoji('➡️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled((this.currentPage + 1) >= this.pages.length)
            )
        }

        return [...this.customComponents, buttons];
    }

    async send(interaction: CommandInteraction) {
        if (!interaction) {
            throw new Error('Invalid Interaction to respond to.');
        }

        const currentPage = this.pages[this.currentPage];
        const buttons = await this.create_components();

        const response = await interaction.reply(
            { embeds: [currentPage], components: buttons }
        );
        this.currentInteraction = interaction;

        const filter = (interaction: MessageComponentInteraction) =>
            interaction.customId === 'previous_page' || interaction.customId === 'next_page';

        const collector = response.createMessageComponentCollector({ filter, time: this.time });

        collector.on('collect', async (interaction: ButtonInteraction) => {
            await interaction.deferUpdate();
            if (interaction.customId === 'previous_page') {
                this.previousPage();
            } else if (interaction.customId === 'next_page') {
                this.nextPage();
            }
            await this.updateEmbed();
        });

        collector.on('end', () => {
            if (this.currentInteraction) {
                this.currentInteraction.editReply({ components: [] }).catch(console.error);
            }
        });
    }

    private nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.currentPage++;
        }
    }

    private previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
        }
    }

    private async updateEmbed() {
        if (this.currentInteraction) {
            const currentPage = this.pages[this.currentPage];
            const components = await this.create_components();

            await this.currentInteraction.editReply({ embeds: [currentPage], components: components });
        }
    }

    /*
    // => Something I just copy n pasted from the old solution where I was trying to recreate pageselections based of their interaction message.
    static async from_message(uuid: string, interaction: ButtonInteraction): Promise<PageSelection> {
        // Create new actionRows from scratch.
        const message: Message = interaction.message;

         // Find a way to calculate the current page based of embed ids
            // for (let i = 0; i >= message.embeds.length; i++) {
            //     if (message.embeds[i].toJSON() === interaction.message.embeds[0].toJSON()) {}
            // }

        const embeds: EmbedBuilder[] = [];
        for (const embed of message.embeds) {
            embeds.push(
                new EmbedBuilder({
                    ...embed.data
                })
            )
        }

        const action_rows: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];
        for (const action_row of message.components.slice(0, -1)) {
            const builder = new ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>();

            action_row.components.forEach((component: any) => {
                if (component instanceof ButtonComponent) {
                    builder.addComponents(
                        new ButtonBuilder({
                            ...component.data
                        })
                    );
                }
                else if (component instanceof StringSelectMenuComponent)
                {
                    builder.addComponents(
                        new StringSelectMenuBuilder({
                            ...component.data
                        })
                    );
                }
            });

            action_rows.push(builder);
        }

        let pageSelection = new this(embeds, action_rows);
        pageSelection.uuid = uuid;
        pageSelection.currentInteraction = interaction

        return pageSelection;
    }
    */
}

export default PageSelection;