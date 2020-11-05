import path from 'path'
import { promises as fs } from 'fs'
import plugin from '../index'

describe('snowpack-plugin-designspek', () => {
  it('should compile .svelte file', async () => {
    const filePath = path.join(__dirname, '__fixtures__/Component.svelte')
    const pluginSPD = plugin({}, {})
    const result = await pluginSPD.load({ filePath })
    expect(result['.js']).toMatchSnapshot('.js')
  })
})
