const { Composer, Scenes } = require('telegraf')

const startStep = new Composer()
startStep.use(async (ctx) => {
  try {
    await ctx.replyWithHTML("Про какую породу хотите узнать?")
    return ctx.wizard.next()
  } catch (e) {
    console.log(e)
  }
})

const inputStep = new Composer()
inputStep.on("text", async(ctx) => {
  return ctx.scene.enter("breedsListDogWizard",{mode:"search", searchQuery:ctx.message.text});
})

const searchScene = new Scenes.WizardScene('searchDogWizard', startStep, inputStep)
module.exports = searchScene