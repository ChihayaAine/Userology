// 支持的语言配置（与后端保持一致）
export const SUPPORTED_LANGUAGES = {
  'en-US': {
    name: 'English (US)',
    code: 'en-US',
    flag: '🇺🇸'
  },
  'zh-CN': {
    name: '中文 (简体)',
    code: 'zh-CN',
    flag: '🇨🇳'
  },
  'es-ES': {
    name: 'Español',
    code: 'es-ES',
    flag: '🇪🇸'
  },
  'fr-FR': {
    name: 'Français',
    code: 'fr-FR',
    flag: '🇫🇷'
  },
  'de-DE': {
    name: 'Deutsch',
    code: 'de-DE',
    flag: '🇩🇪'
  },
  'ja-JP': {
    name: '日本語',
    code: 'ja-JP',
    flag: '🇯🇵'
  }
};

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;


