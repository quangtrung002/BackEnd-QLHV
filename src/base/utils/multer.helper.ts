import { mergeRegex } from "./data-type";

export const UPLOAD_IMG_EXTNAME = /(jpg|jpeg|png|gif|bmp|tif|tiff|ico|svg)$/isu;
export const UPLOAD_PDF_EXTNAME = /(pdf|html|xml)$/isu;
export const UPLOAD_EXCEL_EXTNAME = /(excel|csv|sheet|xls)$/isu;
export const UPLOAD_MS_OFFICE_EXTNAME = /(excel|sheet|xls|powerpoint|presentation|word|document)$/isu;
export const UPLOAD_COMMON_EXTNAME = /(plain|rft|text|calendar)$/isu;
export const UPLOAD_ZIP_EXTNAME = /(gzip|rar|tar|7z)$/isu;
export const UPLOAD_MEDIA_EXTNAME = /(mp4|mpeg|video|mp2t|webm|wav|3gpp)$/isu;
export const UPLOAD_ALL_EXTNAME = mergeRegex(
  UPLOAD_IMG_EXTNAME,
  UPLOAD_PDF_EXTNAME,
  UPLOAD_EXCEL_EXTNAME,
  UPLOAD_MS_OFFICE_EXTNAME,
  UPLOAD_COMMON_EXTNAME,
  UPLOAD_ZIP_EXTNAME,
  UPLOAD_MEDIA_EXTNAME,
);