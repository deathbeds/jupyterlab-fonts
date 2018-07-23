import {FONT_FORMATS, FontFormat} from '.';

/* below from https://gist.github.com/viljamis/c4016ff88745a0846b94 */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function base64Encode(str: string): string {
  let out = '';
  let i = 0;
  let len = str.length;
  let c1: number;
  let c2: number;
  let c3: number;

  // tslint:disable
  while (i < len) {
    c1 = str.charCodeAt(i++) & 0xff;
    if (i === len) {
      out += CHARS.charAt(c1 >> 2);
      out += CHARS.charAt((c1 & 0x3) << 4);
      out += '==';
      break;
    }
    c2 = str.charCodeAt(i++);
    if (i === len) {
      out += CHARS.charAt(c1 >> 2);
      out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
      out += CHARS.charAt((c2 & 0xf) << 2);
      out += '=';
      break;
    }
    c3 = str.charCodeAt(i++);
    out += CHARS.charAt(c1 >> 2);
    out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
    out += CHARS.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
    out += CHARS.charAt(c3 & 0x3f);
  }
  // tslint:enable
  return out;
}

export async function dataURISrc(url: string, format = FontFormat.woff2) {
  const pre = `data:${FONT_FORMATS[format]};charset=utf-8;base64`;
  const base64Font = base64Encode(await getBinary(url));
  const post = `format('${format}')`;
  const src = `url('${pre},${base64Font}') ${post}`;
  return src;
}

export function getBinary(url: string) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        resolve(xhr.responseText);
      }
    };
    xhr.send();
  });
}
