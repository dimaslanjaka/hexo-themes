# hexo-themes
My HexoJS Theme Collections

| package | description
| :--- | :--- |
| [hexo-theme-flowbite](./themes/hexo-theme-flowbite/) | Hexo theme build using **tailwind** and **flowbite** |

## Features

- Responsive
- Auto SEO
- Custom HTML Injection

### How to install

- download `tgz` file from [Relase Folder](./releases/)
- extract `<tgz>/package/<all files here>` file to `<hexo project>/themes/hexo-theme-name/<here>`
- install dependencies eg: `npm install hexo-theme-flowbite` or `yarn add hexo-theme-flowbite` (change theme name)

> for enable dynamic build on-fly like **hexo-theme-flowbite** add as **dev dependencies** (`yarn add -D hexo-theme-flowbite`)

#### How to update markdown-it to latest for Hexo

- install customized `markdown-it` [see why](https://github.com/dimaslanjaka/hexo-renderers/tree/esm#requirements)

```bash
yarn add markdown-it@https://github.com/dimaslanjaka/markdown-it/raw/2000d25dec653f6e62a545b30f6d58fad20e6d1f/release/markdown-it.tgz
```

#### How to enable auto SEO

- install `hexo-seo`

```bash
yarn add hexo-seo
```

[Read how to configure hexo-seo](https://github.com/dimaslanjaka/hexo-seo#readme)

#### How to update

To update theme, just call `npx hexo-theme-name` on cwd hexo project. Sample:

![image](https://github.com/user-attachments/assets/b62da4d0-8db1-4dc8-ae3d-b0b5e2640ad1)

### Features

> [more detailed config here](./themes/hexo-theme-flowbite/_config.yml)

#### Search data

All post metadata on `{{ config.root }}/hexo-search.json` with contents

```jsonc
[
  {
    "url": "url relative post",
    "title": "post title",
    "description": "post excerpt or description"
  }
]
```

### Contribute

Step to contribute

#### Setup

```bash
git submodule update -i -r
touch yarn.lock
yarn install
yarn build
```

#### Live testing

```bash
yarn run start
```

#### Bundle

```bash
yarn run build
yarn run pack
```
