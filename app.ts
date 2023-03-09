import { Context, Telegraf, Telegram } from 'telegraf';
import { message } from 'telegraf/filters';
import * as dotenv from 'dotenv';
import { saveFile } from './src/js/fileHandler';
import { handleError } from './src/js/helper';
dotenv.config();
// import * as im from 'imagemagick';

const BOT_TOKEN: string | undefined = process.env.BOT_TOKEN;

export const SAVE_PATH: string | undefined = process.env.SAVE_PATH;

if (BOT_TOKEN === undefined) {
  throw new Error('BOT_TOKEN is not defined');
}

const bot = new Telegraf<Context>(BOT_TOKEN);
const telegram = new Telegram(BOT_TOKEN);

bot.on(message('text'), async (ctx) => {
  console.log(ctx.message.text);
});

bot.on(message('photo'), async (ctx) => {
  try {
    await saveFile(telegram, ctx);
  } catch (err) {
    handleError(err);
  }
});

bot.on(message('video'), async (ctx) => {
  try {
    await saveFile(telegram, ctx);
  } catch (err) {
    handleError(err);
  }
});

bot.on(message('document'), async (ctx) => {
  try {
    await saveFile(telegram, ctx);
  } catch (err) {
    handleError(err);
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
