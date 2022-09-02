const { Markup, Composer, Scenes } = require('telegraf')

const alphabetStep = new Composer()
alphabetStep.use(async (ctx) => {
  try {
    const lettersArr = [
      ['А', 'Б', 'В', 'Г', 'Д', 'Е'],
      ['Ё', 'Ж', 'З', 'И', 'Й', 'К'],
      ['Л', 'М', 'Н', 'О', 'П', 'Р'],
      ['С', 'Т', 'У', 'Ф', 'Х', 'Ц'],
      ['Ч', 'Ш', 'Щ', 'Э', 'Ю', 'Я']
    ];
    await ctx.replyWithHTML("На какую букву показать породы?",
      Markup.inlineKeyboard(
          [...lettersArr.map(letter =>
              letter.map(l =>
                  Markup.button.callback(l, l)
              )
            ),
            [Markup.button.callback("Вернуться в меню", "back")]
          ]
      ))
    return ctx.wizard.next()
  } catch (e) {
    console.log(e)
  }
})

const nextSceneStep = new Composer()
nextSceneStep.use(async(ctx) => {
  return ctx.scene.enter("breedsListDogWizard",{mode:"alphabet", letter:ctx.callbackQuery.data});
})


const alphabetScene = new Scenes.WizardScene('alphabetDogWizard', alphabetStep, nextSceneStep)
alphabetScene.action("back", async(ctx) => {
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
module.exports = alphabetScene