// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Kingdom of Cabo Norte',

  tagline: 'Labor et Mare',

  favicon: 'img/cabonorte/teixo-vazado.png',

  url: 'https://detaxus.github.io',

  baseUrl: '/cabo-norte-site/',

  organizationName: 'detaxus',

  projectName: 'cabo-norte-site',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
        },

        blog: false,

        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    image:
      'img/cabonorte/bandeira-oficial.png',

    navbar: {
      title: 'Cabo Norte',

      logo: {
        alt: 'Cabo Norte',
        src: 'img/cabonorte/teixo-vazado.png',
      },

      items: [
        {
          label: 'Início',
          to: '/',
          position: 'left',
        },

        {
          label: 'O Reino',
          to: '/o-reino',
          position: 'left',
        },

        {
          label: 'Instituições',
          to: '/instituicoes',
          position: 'left',
        },

        {
          label: 'Cidadania',
          to: '/cidadania',
          position: 'left',
        },

        {
          label: 'História',
          to: '/historia',
          position: 'left',
        },

        {
          label: 'Identidade',
          to: '/identidade',
          position: 'left',
        },

        {
          label: 'Diplomacia',
          to: '/diplomacia',
          position: 'left',
        },

        {
          label: 'Documentos',
          to: '/documentos',
          position: 'left',
        },

        {
          type: 'search',
          position: 'right',
        },
      ],
    },

    footer: {
      style: 'dark',

      links: [],

      copyright:
        '© 2026 Kingdom of Cabo Norte · Labor et Mare',
    },
  },
};

export default config;
