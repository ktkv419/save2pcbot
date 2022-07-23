const token = 'insert:token'
const telegramBot = require('node-telegram-bot-api')
const bot = new telegramBot(token, {polling: true})
const fs = require('fs')
const telegramFolder = 'download-directory'

// status is true/false with premade answers, also can pass status as string to just print it as a response
function feedbackMessage(chatID, status) {
    if (status == true) {bot.sendMessage(chatID, 'Успешно', {disable_notification: true}); console.log('Success')}
    if (status == false) {bot.sendMessage(chatID, 'Произошла ошибка'); console.log('Error')}
    if (typeof(status) == 'string') {bot.sendMessage(chatID, status); console.log(status)}
}

bot.on('message', async (msg) => {
    var today = new Date();
    var path = telegramFolder + today.getFullYear() + '-' + today.getMonth() + '-' + today.getDay() + '/'
    fs.mkdirSync(path, { recursive: true });

    if ('video' in msg == true) {
        if (msg.video.file_size < 20000000) {
            bot.downloadFile(msg.video.file_id, path).then(() => {
                feedbackMessage(msg.chat.id, true)
            });
        } 
        else {
            feedbackMessage(msg.chat.id, 'Размер файла слишком большой')
        }
    }

    if ('photo' in msg == true) {bot.downloadFile(msg.photo[(msg.photo.length-1)].file_id, path).then(() => {
        feedbackMessage(msg.chat.id, true)
    })}
    if ('document' in msg == true) {bot.downloadFile(msg.document.file_id, path).then(() => {
        feedbackMessage(msg.chat.id, true)
    })};
    if ('video_note' in msg == true) {bot.downloadFile(msg.video_note.file_id, path).then(() => {
        feedbackMessage(msg.chat.id, true)
    })};

})
