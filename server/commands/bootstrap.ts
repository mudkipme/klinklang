import Workflow from '../models/workflow'
import Action from '../models/action'
import { sequelize } from '../lib/database'

export async function setupUpdateAbilityWorkflow (): Promise<void> {
  const name = 'Update Ability term list'
  if (await Workflow.count({ where: { name } }) > 0) {
    return
  }

  const transaction = await sequelize.transaction()

  try {
    const workflow = await Workflow.create({
      name: 'Update Ability term list',
      isPrivate: false,
      enabled: true,
      triggers: []
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
      name: 'Update Pokémon term list',
      isPrivate: false,
      enabled: true,
      triggers: []
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

export default async function bootstrap (): Promise<void> {
  await setupUpdateAbilityWorkflow()
  await setupUpdatePokemonWorkflow()
}
