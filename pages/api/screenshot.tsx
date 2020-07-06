import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import stream from "stream";

interface queryTypes {
  [key: string]: string | string[] | undefined;
}

interface bodyTypes {
  [key: string]: string;
}

const screenshot = async (req: NextApiRequest, res: NextApiResponse) => {
  const { url, name }: bodyTypes = req.body;
  const { fullPage, width = "1024", height = "800" }: queryTypes = req.query;

  try {
    if (!url || !name) {
      return res.status(400).json({
        message: "fill all fields",
      });
    }

    const validUrl = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

    if (!validUrl.test(url))
      return res.status(400).json({ message: "Invalid Url" });

    const fileName = `${name}_${Date.now()}.jpeg`;

    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.setViewport({
      width: typeof width === "string" ? parseInt(width) : 1024,
      height: typeof height === "string" ? parseInt(height) : 800,
    });

    const img = await page.screenshot({
      type: "jpeg",
      fullPage: fullPage === "true",
      encoding: "binary",
    });

    const resImg = new stream.PassThrough();
    resImg.end(img);

    await page.close();
    await browser.close();

    res.setHeader("content-disposition", "attachment; filename=" + fileName);

    resImg.pipe(res);
  } catch (err) {
    res.status(500);
  }
};

export default screenshot;
