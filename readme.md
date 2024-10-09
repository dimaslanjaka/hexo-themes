# hexo-themes
My HexoJS Theme Collections

| package | description
| :--- | :--- |
| [hexo-theme-flowbite](./themes/hexo-theme-flowbite/) | Hexo theme build using **tailwind** and **flowbite** |

### How to install

#### Manual

- download `tgz` file from [Relase Folder](./releases/)
- extract `<tgz>/package/<all files here>` file to `<hexo project>/themes/hexo-theme-name/<here>`
- install dependencies eg: `npm install hexo-theme-flowbite` or `yarn add hexo-theme-flowbite` (change theme name)

##### How to update

To update theme, just call `npx hexo-theme-name` on cwd hexo project. Sample:

![image](https://github.com/user-attachments/assets/b62da4d0-8db1-4dc8-ae3d-b0b5e2640ad1)

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
