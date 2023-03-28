import { Telegram } from 'telegraf';
import * as fs from 'node:fs';
import { catFromExt, getFileName } from './helper';
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

    const { href: fileLink } = await telegramInstance.getFileLink(fileId);

    const fileExt = fileLink.split('.').at(-1)?.toLowerCase();

    const res = await fetch(fileLink);
    if (!res.ok) throw new Error('URL is invalid');

    const fileContent = await res.body?.getReader().read();

    if (typeof fileName === 'undefined')
      fileName = getFileName(fileLink) + '.' + fileExt;

    const folder = catFromExt(fileExt);

    if (!fileContent) return;

    const writtenFile: string = await new Promise((res, rej) => {
      fs.createWriteStream(`${SAVE_PATH}/${folder}/${fileName}`).write(
        fileContent.value,
        (err) => (err ? rej(err) : res(fileName as string))
      );
    });

    console.log(`File ${writtenFile} saved`);
  } catch (err) {
    throw new Error('Problem downloading the file\n' + err);
  }
};
