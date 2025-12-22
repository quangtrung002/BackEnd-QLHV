import sharp, {
  AvailableFormatInfo,
  AvifOptions,
  FormatEnum,
  GifOptions,
  HeifOptions,
  Jp2Options,
  JpegOptions,
  JxlOptions,
  OutputOptions,
  PngOptions,
  ResizeOptions,
  TiffOptions,
  WebpOptions,
} from 'sharp';

export const isValidFileExt = (mimetype: string, regExp: RegExp) => {
  return mimetype.match(regExp);
};

export type InputResize =
  | Buffer
  | ArrayBuffer
  | Uint8Array
  | Uint8ClampedArray
  | Int8Array
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | Float32Array
  | Float64Array
  | string;

export type FormatOptionsResize =
  | OutputOptions
  | JpegOptions
  | PngOptions
  | WebpOptions
  | AvifOptions
  | HeifOptions
  | JxlOptions
  | GifOptions
  | Jp2Options
  | TiffOptions;

export type FormatResize = keyof FormatEnum | AvailableFormatInfo;

export type WidthOrOptionsResize = number | ResizeOptions;

export type OptionsResize = {
  format?: FormatResize;
  formatOptions?: FormatOptionsResize;
  widthOrOptions?: WidthOrOptionsResize;
};

export async function resizeFileImage(input: InputResize, options?: OptionsResize) {
  const transformer = sharp(input);
  const metadata = await transformer.metadata();
  transformer.toFormat(options.format || metadata.format, options.formatOptions);
  transformer.resize(options.widthOrOptions);
  return transformer.toBuffer();
}