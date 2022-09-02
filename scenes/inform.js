const { Markup, Composer, Scenes } = require('telegraf')

const db = require('../db')

const startStep = new Composer()
startStep.use(async (ctx) => {
    try {
        const dogData = await db.getDogFullData(ctx.wizard.state.breedId);
        const title = dogData.breedName;
        const generalInfo = dogData.breedInfo;
        const colorInfo = dogData.breedColor;

        await ctx.replyWithHTML(`<b>${title}</b>\n\n${generalInfo}\n\n${colorInfo}`,
          Markup.inlineKeyboard([
              [Markup.button.callback('Добавить в избранное', 'addFavourite')],
              [Markup.button.callback('Вернуться в меню', 'back')]
          ]));
        return ctx.wizard.next()
    } catch (e) {
        console.log(e)
    }
})

const clickButtonStep = new Composer()
clickButtonStep.action("addFavourite", async (ctx) => {
    try {
        const status = await db.addFavourite(ctx.update.callback_query.from.id, ctx.wizard.state.breedId)
        if (status) {
            await ctx.replyWithHTML("Статья добавлена в избранное.")
        } else {
            await ctx.replyWithHTML("Статья уже в избранном.")
        }
        await ctx.wizard.back()
        return ctx.wizard.steps[ctx.wizard.cursor].handler(ctx);
    } catch (e) {
        console.log(e)
    }
})

const informScene = new Scenes.WizardScene('informDogWizard', startStep, clickButtonStep)
informScene.action("back", async(ctx) => {
    try {
        await ctx.answerCbQuery()
        await ctx.reply ("Хочу посмотреть",
          Markup.keyboard([
              ["Информацию об определенной породе"],
              ["Избранное" , "Список пород по алфавиту"]
          ]).oneTime().resize())
        await ctx.scene.leave();
    } catch (e) {
        console.log(e)
    }
})
module.exports = informScene