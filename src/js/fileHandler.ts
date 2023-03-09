import { pipeline } from 'node:stream';
import { Telegraf, Context, Telegram, deunionize } from 'telegraf';
import { promisify } from 'node:util';
import * as fs from 'node:fs';
import fetch from 'node-fetch';
import { catFromExt, getFileName } from './helper';
import { WizardContext } from 'telegraf/typings/scenes';
import { SAVE_PATH } from '../../app';

export const saveFile = async function (
  telegramInstance: Telegram,
  ctx: any // Should be only Context<Update>, but it somehow doesn't have 'message' property?
) {
  try {
    let fileId: string;
    let fileName: string | undefined;
    if (ctx.update.message.photo) fileId = ctx.update.message.photo[0].file_id;
    else if (ctx.update.message.video) {
      fileName = ctx.update.message.video.file_name;
      fileId = ctx.update.message.video.file_id;
    } else if (ctx.update.message.document) {
      fileId = ctx.update.message.document.file_id;
      fileName = ctx.update.message.document.file_name;
    } else throw new Error('Unexpected download scenario');

    console.log(ctx.update.message);
    const { href: fileLink } = await telegramInstance.getFileLink(fileId);

    console.log(fileLink);
    const fileExt = fileLink.split('.').at(-1)?.toLowerCase();

    const res = await fetch(fileLink);

    if (!fileName) fileName = getFileName(fileLink) + '.' + fileExt;

    !fileName ? (fileName = getFileName(fileLink) + '.' + fileExt) : '';
    // const filename = getFileName(fileLink) + '.' + fileExt;
    const folder = catFromExt(fileExt);
    console.log(SAVE_PATH, folder, fileName);

    const streamPipeline = promisify(pipeline);
    await streamPipeline(
      res.body,
      fs.createWriteStream(`${SAVE_PATH}/${folder}/${fileName}`)
    );
  } catch (err) {
    throw new Error('Problem downloading the file' + err);
  }
};
