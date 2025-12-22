import {
  ArgumentMetadata,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { NJRS_REQUEST } from 'nj-request-scope';
import { Request } from 'express';
import { isValidFileExt, resizeFileImage } from '../utils/file.util';
import { UPLOAD_IMG_EXTNAME } from '../utils/multer.helper';

const resize = async (file: Express.Multer.File, quality: number) => {
  if (isValidFileExt(file.mimetype, UPLOAD_IMG_EXTNAME)) {
    const buffer = await resizeFileImage(file.buffer, {
      formatOptions: {
        quality,
      },
    });
    return {
      ...file,
      buffer,
      resized: true,
      size: buffer.length,
    };
  } else return file;
};

@Injectable()
export class ShapePipe
  implements
    PipeTransform<
      Express.Multer.File | Express.Multer.File[],
      Promise<Express.Multer.File | Express.Multer.File[]>
    >
{
  constructor(
    @Inject(NJRS_REQUEST)
    private request: Request,
  ) {}

  async transform(
    value: Express.Multer.File | Express.Multer.File[],
  ): Promise<Express.Multer.File | Express.Multer.File[]> {
    const quality = parseInt(this.request.body?.quality, 10) ?? 100;
    if ((Array.isArray(value) && !value.length) || !value) return value;
    if (Array.isArray(value)) {
      return Promise.all(value.map(async (item) => resize(item, quality)));
    } else return resize(value, quality);
  }
}
