// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Kraptor\'un CloudStream Wikisi',
  tagline: 'Buradan CloudStream Hakkında Yardım Alabilirsiniz.',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://Kraptor123.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/kraptor-wiki/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'kraptor123', // Usually your GitHub org/user name.
  projectName: 'kraptor-wiki', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'tr',
    locales: ['tr'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/Kraptor123/kraptor-wiki/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/website-card.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Kraptor Wiki',
        logo: {
          alt: 'Kraptor Logo',
          src: 'img/kraptorlogo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Viki',
          },
          // {to: '/blog', label: 'Blog', position: 'left'},
          {
            to: '/commits',
            label: '📝 Commitler',
            position: 'left', // veya 'right'
          },
          {
            href: 'https://github.com/Kraptor123',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Dökümanlar',
            items: [
              {
                label: 'CloudStream Yardım',
                to: '/docs/category/cloudstream-yardım',
              },
            ],
          },
          {
            title: 'Topluluğumuz',
            items: [
              {
                label: 'Telegram Duyuru',
                href: 'https://t.me/kraptorcs',
              },
              {
                label: 'Telegram Grubu',
                href: 'https://t.me/+y2ALI0k6659mNDE8',
              }
            ],
          },
          {
            title: 'Geliştiriciler',
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'Kraptor',
                href: 'https://github.com/Kraptor123',
              },
              {
                label: 'ByAyzen',
                href: 'https://github.com/ByAyzen',
              },
              {
                label: 'KerimKirac',
                href: 'https://github.com/kerimmkirac',
              },
              {
                label: 'Eagle',
                href: 'https://github.com/trup40',
              }
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Kraptor`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
  themes: [
    // ... Your other themes.
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,

        // For Docs using Chinese, it is recomended to set:
        // language: ["en", "zh"],

        // Customize the keyboard shortcut to focus search bar (default is "mod+k"):
        // searchBarShortcutKeymap: "s", // Use 'S' key
        // searchBarShortcutKeymap: "ctrl+shift+f", // Use Ctrl+Shift+F

        // If you're using `noIndex: true`, set `forceIgnoreNoIndex` to enable local index:
        // forceIgnoreNoIndex: true,
      }),
    ],
  ],
};

export default config;
