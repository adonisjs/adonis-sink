/*
* @adonisjs/boilerplate-utils
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { join } from 'path'
import { Filesystem } from '@adonisjs/dev-utils'
import { TemplateFile } from '../src/formats/TemplateFile'

const fs = new Filesystem(join(__dirname, '__app'))

test.group('Template file', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  group.beforeEach(async () => {
    await fs.ensureRoot()
  })

  test('create template file', async (assert) => {
    await fs.add('template.txt', 'hello world')

    const file = new TemplateFile(fs.basePath, 'foo.txt', join(fs.basePath, 'template.txt'))
    file.apply().commit()

    const contents = await fs.get('foo.txt')
    assert.equal(contents.trim(), 'hello world')
  })

  test('do not modify template file when it already exists', async (assert) => {
    await fs.add('template.txt', 'hello world')
    await fs.add('foo.txt', 'hi world')

    const file = new TemplateFile(fs.basePath, 'foo.txt', join(fs.basePath, 'template.txt'))
    file.apply().commit()

    const contents = await fs.get('foo.txt')
    assert.equal(contents.trim(), 'hi world')
  })

  test('remove file on rollback', async (assert) => {
    await fs.add('template.txt', 'hello world')
    await fs.add('foo.txt', 'hi world')

    const file = new TemplateFile(fs.basePath, 'foo.txt', join(fs.basePath, 'template.txt'))
    file.apply().rollback()

    const hasFile = await fs.fsExtra.exists(join(fs.basePath, 'foo.txt'))
    assert.isFalse(hasFile)
  })

  test('do not remove file on rollback when removeOnRollback=false', async (assert) => {
    await fs.add('template.txt', 'hello world')
    await fs.add('foo.txt', 'hi world')

    const file = new TemplateFile(fs.basePath, 'foo.txt', join(fs.basePath, 'template.txt'))
    file.removeOnRollback = false
    file.apply().rollback()

    const hasFile = await fs.fsExtra.exists(join(fs.basePath, 'foo.txt'))
    assert.isTrue(hasFile)
  })
})