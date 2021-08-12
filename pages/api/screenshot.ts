import { NextApiRequest, NextApiResponse } from 'next';
import chrome from 'chrome-aws-lambda';
import { chromium as playwright } from 'playwright-core';

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

const exePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

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

    const browser = await playwright.launch({
      headless: true,
      channel: 'chrome',
      ...getOptions(),
    });

    // const context = await browser.newContext();

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    await page.setViewportSize({
      width: typeof width === 'string' ? parseInt(width) : 1024,
      height: typeof height === 'string' ? parseInt(height) : 800,
    });

    const buffer = await page.screenshot({
      type: 'jpeg',
      fullPage: fullPage === 'true',
      quality: 100,
    });

    const resImg = buffer.toString('base64');

    await page.close();
    await browser.close();

    res.status(200).json({
      image: resImg,
      fileName,
    });
  } catch (err) {
    console.log('here', err);
    res.status(400).json({ err });
  }
};

export default screenshot;
