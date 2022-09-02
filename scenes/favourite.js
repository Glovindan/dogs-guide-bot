const { Composer, Scenes } = require('telegraf')

const startStep = new Composer()
startStep.use(async (ctx) => {
    try {
        await ctx.reply("Сохраненные статьи")
        return ctx.scene.enter("breedsListDogWizard",{mode:"favourite"});
    } catch (e) {
        console.log(e)
    }
})

const favouriteScene = new Scenes.WizardScene('favouriteDogWizard', startStep)
module.exports = favouriteScene