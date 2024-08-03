import { createPuppeteerRouter, Dataset } from 'crawlee';

// import { Article } from './db.mjs';
export const router = createPuppeteerRouter();

import config from './config.mjs';

config.map(async item => {
  const dataset = await Dataset.open(item.label);
  // 打开列表页操作
  router.addHandler(`${item.label}`, async ({ request, page, enqueueLinks, log }) => {
    page.setDefaultTimeout(5000);
    log.debug(`Enqueueing pagination: ${request.url}`)

    // 由于掘金是滚动加载，这里通过模拟滚动到底部，实现页面切换
    const scrollToBottom = async (page, scrollDelay = 5000) => {
      let previousHeight;
      let newHeight;
      let reachedEnd = false;
      let count = 0;

      // 这里只滚动2次，如果还没有到底部，可以根据实际情况调整
      while (!reachedEnd && count < 2) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate(`window.scrollBy(0, ${previousHeight})`);
        await new Promise(resolve => setTimeout(resolve, scrollDelay));
        newHeight = await page.evaluate('document.body.scrollHeight');

        count++;

        if (previousHeight === newHeight) {
          reachedEnd = true;
        }
      }
    };

    // 模拟滚动加载
    await scrollToBottom(page);

    // 等待页面加载完成，这里只为演示，在这个例子中，不需要等待
    await page.waitForSelector(item.selector.detail);

    // 把列表页的详情页链接加入到爬虫队列中
    await enqueueLinks({
      selector: item.selector.detail,
      label: `${item.label}-DETAIL`,
    });

    await page.close();
  });

  // 打开详情页操作
  router.addHandler(`${item.label}-DETAIL`, async ({ request, page, log }) => {
    page.setDefaultTimeout(5000);

    log.debug(`Extracting data: ${request.url}`)

    const urlParts = request.url.split('/').slice(-2);
    const url = request.url;

    await page.waitForSelector(item.selector.content);

    const details = await page.evaluate((url, urlParts, item) => {
      return {
        url,
        uniqueIdentifier: urlParts.join('/'),
        type: urlParts[0],
        title: document.querySelector(item.selector.title).innerText,
        author: document.querySelector(item.selector.author).innerText,
        modifiedDate: document.querySelector(item.selector.modifiedDate).innerText,
        hit: document.querySelector(item.selector.hit).innerText,
        readTime: document.querySelector(item.selector.readTime).innerText,
        content: document.querySelector(item.selector.content).innerText,
        contentHTML: document.querySelector(item.selector.content).innerHTML,
      };
    }, url, urlParts, item);

    log.debug(`Saving data: ${request.url}`)
    // await Article.create(details);
    await dataset.pushData(details);
    await page.close();
  });

});
router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
  log.error(`Unhandled request: ${request.url}`);
});