import { PuppeteerCrawler, ProxyConfiguration, log } from 'crawlee';
import { router } from './routes.mjs';
import config from './config.mjs';

log.setLevel(log.LEVELS.DEBUG);

log.debug('Setting up crawler.');
// const proxyConfiguration = new ProxyConfiguration({
//   proxyUrls: [],
// });

// 创建 PuppeteerCrawler 实例
const crawler = new PuppeteerCrawler({
  // 是否使用会话池，启用后爬虫会重用会话和 Cookie
  // useSessionPool: true,

  // 是否为每个会话持久化 Cookie，启用后每个会话会有自己的 Cookie 存储
  // persistCookiesPerSession: true,

  // 代理配置，用于通过代理服务器发送请求，可以用于绕过 IP 限制或地理位置限制
  // proxyConfiguration,

  // 最大并发请求数，控制同时进行的请求数量
  maxConcurrency: 10,

  // 每分钟最大请求数，控制每分钟发送的请求数量
  maxRequestsPerMinute: 20,

  // 启动上下文配置
  launchContext: {
    launchOptions: {
      // 是否以无头模式启动浏览器（无头模式：没有图形界面），设置为 false 表示有图形界面
      headless: false,
    },
  },

  // 爬虫运行时的最大请求数量，当达到这个数量时，爬虫会停止
  maxRequestsPerCrawl: 1000,

  // requestHandler 定义了爬虫在访问每个页面时要做的操作
  // 可以在这里提取数据、处理数据、保存数据、调用 API 等
  requestHandler: router,

  // 处理请求失败的情况，记录失败的请求并输出错误日志
  failedRequestHandler({ request, log }) {
    log.error(`Request ${request.url} failed too many times.`);
  },
});

// 添加要爬取的请求，config 是一个包含 URL 和标签的数组
// 这里将每个 item 的 url 和 label 添加到爬虫的请求队列中
await crawler.addRequests(config.map(item => { return { url: item.url, label: item.label } }));

// 启动爬虫
await crawler.run();
