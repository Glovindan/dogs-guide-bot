const { Markup, Composer, Scenes } = require('telegraf')
const db = require('../db')
const startStep = new Composer()

startStep.use(async(ctx) => {
  try {
    ctx.wizard.state.page = 0;
    await ctx.wizard.next()
    return ctx.wizard.steps[ctx.wizard.cursor].handler(ctx);
  }catch (e) {
    console.log(e)
  }
})

const breedSelectStep = new Composer()
breedSelectStep.use(async (ctx) => {
  try {
    const mode = ctx.wizard.state.mode;
    let breedsArr = [];
    //Всё что снизу - достать из бд
    let userId;
    if(ctx.message) {
      userId = ctx.message.from.id;
    } else {
      userId = ctx.callbackQuery.from.id;
    }
    switch (mode) {
      case "alphabet":
        breedsArr = await db.getBreedsList(ctx.wizard.state.page, ctx.wizard.state.letter);
        break;
      case "search":
        breedsArr = await db.searchBreeds(ctx.wizard.state.searchQuery, ctx.wizard.state.page)
        break;
      default:
        breedsArr = await db.getFavouriteList(userId, ctx.wizard.state.page)
        break;
    }
    await ctx.replyWithHTML(`<b>Выберите породу.</b> страница ${ctx.wizard.state.page + 1}`,
      Markup.inlineKeyboard(
        [...breedsArr.map(breed => [Markup.button.callback(breed.name, breed.id)]),
          [
            Markup.button.callback('Предыдущая страница', 'previousPage'),
            Markup.button.callback('Следующая страница', 'nextPage')
          ],
          [Markup.button.callback('Выйти в меню', 'back')]
        ]
      ))
    await ctx.wizard.next()
  } catch (e) {
    console.log(e)
  }
})

const backStep = new Composer()
backStep.action('nextPage', async (ctx) => {
  try {
    ctx.wizard.state.page += 1;
    await ctx.wizard.back();
    return ctx.wizard.steps[ctx.wizard.cursor].handler(ctx);
  } catch (e) {
    console.log(e)
  }
})
backStep.action('previousPage', async (ctx) => {
  try {
    if(ctx.wizard.state.page !== 0) {
      ctx.wizard.state.page -= 1
    }
    await ctx.answerCbQuery()
    await ctx.wizard.back();
    return ctx.wizard.steps[ctx.wizard.cursor].handler(ctx);
  } catch (e) {
    console.log(e)
  }
})

backStep.on("callback_query", async (ctx) => {
  try {
    return ctx.scene.enter("informDogWizard",{breedId: ctx.callbackQuery.data});
  } catch (e) {
    console.log(e)
  }
})

const breedsList = new Scenes.WizardScene('breedsListDogWizard', startStep, breedSelectStep, backStep)
breedsList.action("back", async(ctx) => {
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

module.exports = breedsList;