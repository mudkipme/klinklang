import Workflow from '../models/workflow'
import Action from '../models/action'
import { sequelize } from '../lib/database'
import { Actions } from '../actions/interfaces'

export async function setupUpdateAbilityWorkflow (): Promise<void> {
  const name = 'Update Ability term list'
  if (await Workflow.count({ where: { name } }) > 0) {
    return
  }

  const transaction = await sequelize.transaction()

  try {
    const workflow = await Workflow.create({
      name,
      isPrivate: false,
      enabled: true,
      triggers: [{
        type: 'TRIGGER_EVENTBUS',
        topic: 'mediawiki.revision-create',
        predicate: {
          op: 'test',
          path: '/page_title',
          value: '特性列表'
        }
      }]
    }, { transaction })

    const firstAction = await Action.create({
      actionType: 'GET_HTML',
      isHead: true,
      inputBuilder: {
        title: {
          mode: 'rawValue',
          value: '特性列表'
        },
        variants: {
          mode: 'rawValue',
          value: ['zh-hant', 'zh-hans']
        }
      }
    }, { transaction })

    const secondAction = await Action.create({
      actionType: 'PARSE_TERMINOLOGY_LIST',
      isHead: false,
      inputBuilder: {
        text: {
          mode: 'jsonPath',
          jsonPath: '$.prevOutput.text'
        },
        variants: {
          mode: 'jsonPath',
          jsonPath: '$.prevOutput.variants'
        },
        entrySelector: {
          mode: 'rawValue',
          value: '.eplist tr'
        },
        idSelector: {
          mode: 'rawValue',
          value: 'td:first-of-type'
        },
        langSelectorMap: {
          mode: 'rawValue',
          value: {
            zh: 'td:nth-child(2)',
            ja: 'td[lang="ja"]',
            en: 'td[lang="en"]'
          }
        }
      }
    }, { transaction })

    await firstAction.setNextAction(secondAction, { transaction })

    const thirdAction = await Action.create({
      actionType: 'UPDATE_TERMINOLOGY',
      isHead: false,
      inputBuilder: {
        category: {
          mode: 'rawValue',
          value: 'ability'
        },
        list: {
          mode: 'jsonPath',
          jsonPath: '$.prevOutput'
        }
      }
    }, { transaction })

    await secondAction.setNextAction(thirdAction, { transaction })

    await workflow.addActions([firstAction, secondAction, thirdAction], { transaction })

    await transaction.commit()
  } catch (e) {
    await transaction.rollback()
  }
}

export async function setupUpdatePokemonWorkflow (): Promise<void> {
  const name = 'Update Pokémon term list'
  if (await Workflow.count({ where: { name } }) > 0) {
    return
  }

  const transaction = await sequelize.transaction()

  try {
    const workflow = await Workflow.create({
      name,
      isPrivate: false,
      enabled: true,
      triggers: [{
        type: 'TRIGGER_EVENTBUS',
        topic: 'mediawiki.revision-create',
        predicate: {
          op: 'test',
          path: '/page_title',
          value: '宝可梦列表（按全国图鉴编号）/简单版'
        }
      }]
    }, { transaction })

    const firstAction = await Action.create({
      actionType: 'GET_HTML',
      isHead: true,
      inputBuilder: {
        title: {
          mode: 'rawValue',
          value: '宝可梦列表（按全国图鉴编号）/简单版'
        },
        variants: {
          mode: 'rawValue',
          value: ['zh-hant', 'zh-hans']
        }
      }
    }, { transaction })

    const secondAction = await Action.create({
      actionType: 'PARSE_TERMINOLOGY_LIST',
      isHead: false,
      inputBuilder: {
        text: {
          mode: 'jsonPath',
          jsonPath: '$.prevOutput.text'
        },
        variants: {
          mode: 'jsonPath',
          jsonPath: '$.prevOutput.variants'
        },
        entrySelector: {
          mode: 'rawValue',
          value: '.eplist tr:has(> td:nth-child(4))'
        },
        langSelectorMap: {
          mode: 'rawValue',
          value: {
            zh: 'td:nth-child(2)',
            ja: 'td:nth-child(3)',
            en: 'td:nth-child(4)'
          }
        }
      }
    }, { transaction })

    await firstAction.setNextAction(secondAction, { transaction })

    const thirdAction = await Action.create({
      actionType: 'UPDATE_TERMINOLOGY',
      isHead: false,
      inputBuilder: {
        category: {
          mode: 'rawValue',
          value: 'pokemon'
        },
        list: {
          mode: 'jsonPath',
          jsonPath: '$.prevOutput'
        }
      }
    }, { transaction })

    await secondAction.setNextAction(thirdAction, { transaction })

    await workflow.addActions([firstAction, secondAction, thirdAction], { transaction })

    await transaction.commit()
  } catch (e) {
    await transaction.rollback()
  }
}

export async function setupCSSWorkflow (): Promise<void> {
  const name = 'Update Site CSS'
  if (await Workflow.count({ where: { name } }) > 0) {
    return
  }

  const transaction = await sequelize.transaction()

  const workflow = await Workflow.create({
    name,
    isPrivate: false,
    enabled: true,
    triggers: [{
      type: 'TRIGGER_EVENTBUS',
      topic: 'mediawiki.revision-create',
      predicate: {
        op: 'test',
        path: '/page_title',
        value: '神奇宝贝百科:层叠样式表'
      }
    }]
  }, { transaction })

  const actions: Array<Action<Actions>> = []

  actions.push(await Action.create({
    actionType: 'GET_TEXT',
    isHead: true,
    inputBuilder: {
      title: {
        mode: 'rawValue',
        value: '神奇宝贝百科:层叠样式表'
      }
    }
  }, { transaction }))

  actions.push(await Action.create({
    actionType: 'REGEXP_MATCH',
    isHead: false,
    inputBuilder: {
      pattern: {
        mode: 'rawValue',
        value: '<pre>([\\s\\S]*)<\\/pre>'
      },
      text: {
        mode: 'jsonPath',
        jsonPath: '$.prevOutput.text'
      }
    },
    outputContext: 'scss'
  }, { transaction }))

  actions.push(await Action.create({
    actionType: 'SCSS_COMPILE',
    isHead: false,
    inputBuilder: {
      scss: {
        mode: 'jsonPath',
        jsonPath: '$.scss.matches[1]'
      },
      variables: {
        mode: 'rawValue',
        value: {
          pageName: 'Common.css'
        }
      }
    }
  }, { transaction }))

  actions.push(await Action.create({
    actionType: 'EDIT_WIKI',
    isHead: false,
    inputBuilder: {
      title: {
        mode: 'rawValue',
        value: 'MediaWiki:Common.css'
      },
      text: {
        mode: 'jsonPath',
        jsonPath: '$.prevOutput.css'
      }
    }
  }, { transaction }))

  actions.push(await Action.create({
    actionType: 'SCSS_COMPILE',
    isHead: false,
    inputBuilder: {
      scss: {
        mode: 'jsonPath',
        jsonPath: '$.scss.matches[1]'
      },
      variables: {
        mode: 'rawValue',
        value: {
          pageName: 'Mobile.css'
        }
      }
    }
  }, { transaction }))

  actions.push(await Action.create({
    actionType: 'EDIT_WIKI',
    isHead: false,
    inputBuilder: {
      title: {
        mode: 'rawValue',
        value: 'MediaWiki:Mobile.css'
      },
      text: {
        mode: 'jsonPath',
        jsonPath: '$.prevOutput.css'
      }
    }
  }, { transaction }))

  for (let index = 0; index < actions.length - 1; index++) {
    await actions[index].setNextAction(actions[index + 1], { transaction })
  }

  await workflow.addActions(actions, { transaction })

  try {
    await transaction.commit()
  } catch (e) {
    await transaction.rollback()
  }
}

export default async function bootstrap (): Promise<void> {
  await setupUpdateAbilityWorkflow()
  await setupUpdatePokemonWorkflow()
  await setupCSSWorkflow()
}
