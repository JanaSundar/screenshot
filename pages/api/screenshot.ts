import { NextApiRequest, NextApiResponse } from 'next';
import chrome from 'chrome-aws-lambda';
import { chromium as Playwright } from 'playwright-core';

export const config = {
  api: {
    bodyParser: true,
  },
};

interface Options {
  args: string[];
  executablePath: string;
  headless: boolean;
}

const exePath =
  process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'linux'
    ? '/usr/bin/google-chrome'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const screenshot = async (req: NextApiRequest, res: NextApiResponse) => {
  const { url, name } = req.body;
  const { fullPage, width = '1024', height = '800' } = req.query;

  try {
    if (!url || !name) {
      return res.status(400).json({
        message: 'fill all fields',
      });
    }

    const validUrl = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

    if (!validUrl.test(url)) return res.status(400).json({ message: 'Invalid Url' });

    const fileName = `${name}.jpeg`;

    const getOptions = async () => {
      let options: Options;
      if (process.env.NODE_ENV === 'development') {
        options = {
          args: [],
          executablePath: exePath,
          headless: true,
        };
      } else {
        options = {
          args: chrome.args,
          executablePath: await chrome.executablePath,
          headless: chrome.headless,
        };
      }

      return options;
    };

    const options = await getOptions();

    const browser = await Playwright.launch({
      ...options,
    });

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: {
        width: typeof width === 'string' ? parseInt(width) : 1024,
        height: typeof height === 'string' ? parseInt(height) : 720,
      },
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    const buffer = await page.screenshot({
      type: 'jpeg',
      fullPage: fullPage === 'true',
      quality: 100,
    });

    const base64 = buffer.toString('base64');

    await page.close();
    await browser.close();

    res.status(200).json({
      image: base64,
      fileName,
    });
  } catch (err) {
    console.log('here', err);
    res.status(400).json({ err });
  }
};

export default screenshot;
