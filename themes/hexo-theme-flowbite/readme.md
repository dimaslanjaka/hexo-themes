## Configuration

### Syntax highlighter

```yaml
# https://github.com/hexojs/hexo-util
# https://hexo.io/docs/syntax-highlight.html
syntax_highlighter: highlight.js
highlight:
  enable: true
  line_number: false
  auto_detect: false
  tab_replace: '  ' # replace tabs with 2 spaces
  wrap: false
  hljs: true
prismjs:
  enable: false
  preprocess: true
  line_number: true
  tab_replace: '  ' # replace tabs with 2 spaces
```

### Disqus comment

```yaml
disqus_shortname: YOUR_DISQUS_USERNAME
```

### Code injection

| File Path | Description |
| :--- | :--- |
| `source/_data/hexo-theme-flowbite/head.html` | inject html codes before `</head>` |
| `source/_data/hexo-theme-flowbite/body.html` | inject html codes before `</body>` |
| `source/_data/hexo-theme-flowbite/before-post.html` | inject html before post |
| `source/_data/hexo-theme-flowbite/after-post.html` | inject html after post |
