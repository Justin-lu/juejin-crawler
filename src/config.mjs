export default [
  {
    label: 'juejin',
    url: 'https://juejin.cn/frontend',
    selector: {
      detail: '.entry-list .title-row a',
      title: 'h1.article-title',
      author: '.author-info-box .author-name a span',
      modifiedDate: '.author-info-box .meta-box time',
      hit: '.author-info-box .meta-box .views-count',
      readTime: '.author-info-box .meta-box .read-time',
      description: '.article-header p',
      content: '.article-viewer',
    },
  }
]