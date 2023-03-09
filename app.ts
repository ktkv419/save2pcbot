import { Telegraf, Context, Telegram } from 'telegraf';
// import * as filters from 'telegraf/filters';
import { message } from 'telegraf/filters';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import fetch from 'node-fetch';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
dotenv.config();
// import * as im from 'imagemagick';

const SAVE_PATH: string | undefined = process.env.SAVE_PATH;

const TIMEZONE: string | undefined = process.env.TIMEZONE;

const BOT_TOKEN: string | undefined = process.env.BOT_TOKEN;

if (BOT_TOKEN === undefined) {
  throw new Error('BOT_TOKEN is not defined');
}

const bot = new Telegraf(BOT_TOKEN);
const telegram = new Telegram(BOT_TOKEN);

const getFileName = function (href: string): string {
  const date = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    // timeZone: TIMEZONE,
  }).format(new Date());

  let filename;
  if (href.split('/').at(-2) === 'documents') {
    filename = href.split('/').at(-1);
  } else {
    filename = date;
  }

  return `${SAVE_PATH}/${catFromExt(href.split('.').pop())}/${filename}`;
};

const catFromExt = function (ext: string | undefined): string {
  let cat = '';
  switch (ext) {
    case 'png':
    case 'jpg':
    case 'jpeg':
      cat += 'Images';
      break;

    case 'mp4':
    case 'mkv':
    case 'webm':
    case 'mov':
    case 'avi':
    case 'flv':
    case 'wmv':
    case 'mpg':
    case 'mpeg':
      cat += 'Videos';
      break;
    case 'm4v':
    case 'mp3':
    case 'ogg':
    case 'wav':
      cat += 'Audio';

    case 'doc':
    case 'docx':
    case 'xls':
    case 'xlsx':
    case 'ppt':
    case 'pptx':
    case 'pdf':
      cat += 'Documents';
      break;

    default:
      cat += 'Other';
      break;
  }
  return cat;
};

const saveFile = async function (href: string) {
  try {
    const res = await fetch(href);

    const filename = getFileName(href);

    const streamPipeline = promisify(pipeline);
    const photo = await streamPipeline(
      res.body,
      fs.createWriteStream(filename)
    );
  } catch (err) {
    throw err;
  }
};

const handleError = function (err: unknown) {
  if (err instanceof Error) console.error(err.message);
};

bot.on(message('photo'), async (ctx) => {
  try {
    const newFile: URL = await telegram.getFileLink(
      ctx.update.message.photo.at(-1)!.file_id
    );
    console.log(ctx.update.message);

    saveFile(newFile.href);
  } catch (err) {
    console.error(err);
  }
});

bot.on(message('video'), async (ctx) => {
  try {
    const newFile: URL = await telegram.getFileLink(
      ctx.update.message.video.file_id
    );

    saveFile(newFile.href);
  } catch (err) {
    console.error(err);
  }
});

bot.on(message('document'), async (ctx) => {
  try {
    const newFile: URL = await telegram.getFileLink(
      ctx.update.message.document.file_id
    );
    console.log(ctx.update.message.document);

    saveFile(newFile.href);
  } catch (err) {
    handleError(err);
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
