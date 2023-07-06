import { NextApiRequest, NextApiResponse } from 'next';
import chrome from 'chrome-aws-lambda';
import { chromium as Playwright } from 'playwright';
import { NextRequest, NextResponse } from 'next/server';

interface Options {
    args: string[];
    executablePath: string;
    headless: boolean;
}

/**
 * 
 * Chrome browser exec url -> '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
 */

const exePath =
    process.platform === 'win32'
        ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'linux'
            ? '/usr/bin/google-chrome'
            : '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';

export async function POST(req: NextRequest) {
    const { url, name, isFullPage, width, height } = await req.json();

    if (!url) return NextResponse.json({ message: "Url field is empty" }, { status: 400 });

    const validUrl = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

    if (!validUrl.test(url)) return NextResponse.json({ message: 'Invalid Url' }, { status: 400 });

    const fileName = `${name}.jpeg`;

    try {

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
            ...options
        });

        const context = await browser.newContext({
            ignoreHTTPSErrors: true,
            viewport: {
                width: width ?? 1024,
                height: height ?? 720,
            },
        });

        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'networkidle' });

        const buffer = await page.screenshot({
            type: 'jpeg',
            fullPage: isFullPage,
            quality: 100,
        });

        const base64 = buffer.toString('base64');

        await page.close();
        await browser.close();


        return NextResponse.json({
            image: base64,
            fileName
        }, {
            status: 200
        })
    } catch (err) {
        return NextResponse.json({
            message: "Error occured"
        }, {
            status: 400
        })
    }
}