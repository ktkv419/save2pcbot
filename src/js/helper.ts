export const getFileName = function (href: string): string {
  return href.includes('documents')
    ? href.split('/').at(-1)!.split('.').at(-2)!
    : new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date());
};

export const catFromExt = function (ext: string | undefined): string {
  switch (ext) {
    case 'png':
    case 'jpg':
    case 'jpeg':
      return 'Images';

    case 'mp4':
    case 'mkv':
    case 'webm':
    case 'mov':
    case 'avi':
    case 'flv':
    case 'wmv':
    case 'mpg':
    case 'mpeg':
      return 'Videos';

    case 'm4v':
    case 'mp3':
    case 'ogg':
    case 'wav':
      return 'Audio';

    case 'doc':
    case 'docx':
    case 'xls':
    case 'xlsx':
    case 'ppt':
    case 'pptx':
    case 'pdf':
      return 'Documents';

    default:
      return 'Other';
  }
};

export const handleError = function (err: unknown): void {
  if (err instanceof Error) console.error(err.message);
};
