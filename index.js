const { Telegraf, Markup, session, Scenes } = require('telegraf')
require('dotenv').config();
const db = require('./db')

const informScene = require("./scenes/inform.js")
const favouriteScene = require("./scenes/favourite.js")
const alphabetScene = require("./scenes/alphabet.js")
const breedsList = require("./scenes/breedsList");
const searchScene = require("./scenes/search");

const bot = new Telegraf(process.env.TGTOKEN)

const stage = new Scenes.Stage([informScene, breedsList, favouriteScene, alphabetScene, searchScene])
bot.use(session())
bot.use(stage.middleware())

bot.hears("Информацию об определенной породе", ctx => {
    ctx.scene.enter("searchDogWizard")
})
bot.hears("Избранное", ctx => ctx.scene.enter("favouriteDogWizard",))
bot.hears("Список пород по алфавиту", ctx => ctx.scene.enter("alphabetDogWizard"))

bot.start(async (ctx) => {
    try {
        await db.createUser(ctx.message.from.id);
        await ctx.reply ("Хочу посмотреть",
          Markup.keyboard([
            ["Информацию об определенной породе"],
            ["Избранное" , "Список пород по алфавиту"]
        ]).oneTime().resize())
    } catch(e) {
        console.log(e)
    }
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))