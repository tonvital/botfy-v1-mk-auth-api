export const TranslatePharses = {
  user_not_found: {
    pt: 'Oops! Usuário não encontrado.',
    en: 'Oops! User not found.'
  },
  user_password_error: {
    pt: 'Oops! Nome de usuário ou senha incorreta.',
    en: 'Oops! Username or password invalid.'
  },
  something_is_wrong: {
    pt: 'Oops! Algo deu errado com sua requisição.',
    en: 'Oops! Something went wrong with your request.'
  },
  missing_parameters: {
    pt: 'Oops! Falta parametros.',
    en: 'Oops! Missing parameters.'
  }
}

type TranslatePharsesNames =
  | 'user_not_found'
  | 'user_password_error'
  | 'something_is_wrong'
  | 'missing_parameters'

type TranslateLenguages = 'pt' | 'en'

export default class Translate {
  protected static lenguage: TranslateLenguages = 'pt'

  public static get(type: TranslatePharsesNames) {
    const pharseObject = TranslatePharses[type]

    return pharseObject[Translate.lenguage]
  }

  private static pt(type: TranslatePharsesNames) {
    return TranslatePharses[type]?.pt ?? undefined
  }

  private static en(type: TranslatePharsesNames) {
    return TranslatePharses[type]?.en ?? undefined
  }
}
