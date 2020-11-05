/* inspired from: https://github.com/pngwn/MDsveX/blob/master/packages/mdsvex/src/parsers/html_block.ts */
import { pipe } from 'fp-ts/lib/function'

import { execStyled } from './exec'

const tab = '\t'
const space = ' '
const lineFeed = '\n'
const lessThan = '<'

const rawOpenScript = /^<(script)(?=(\s|>|$))/i
const rawCloseScript = /<\/(script)>/i
const openStyled = /(styled)(\s*)(\()/i
const openParen = /(\()/i
const closeParen = /(\))/i
const closeStyled = closeParen

// utility functions
export const splitExprEqual = (expr: string): string[] => expr.split('=')

export const splitExprSpace = (expr: string): string[] => expr.split(' ')

export const trimArray = (arr: string[]): string[] => arr.map((x) => x.trim())

const REMOVE_BREAKS = /[\f\n\r\t\v]/g
export const trimBreaks = (s: string): string => s.replace(REMOVE_BREAKS, '')

const MULTISPACE_To_SINGLE = /\s+/g
export const trimMultiSpaces = (s: string): string =>
  s.replace(MULTISPACE_To_SINGLE, ' ')

export const execToString = (arr: string[]): string =>
  `${arr[0]} ${arr[1]} = '${arr[2]}'\n`

export const objToString = (obj: string[]): string =>
  obj.reduce((str, concat) => `${str} ${concat}`)

// higher-order functions
// assuming `const a = styled({},{})` separate to [['const a'],['styled(\n'+'{   },{}\n'+')']]
export const separateExpressions = (code: string): string[] =>
  pipe(code, splitExprEqual, trimArray)

// trim and relink to [['const'],['a'],['styled({ },{})']]
export const linkExpressions = (codeArr: string[]): string[] => {
  const exprVar = codeArr.shift()
  const splitExprVar = exprVar !== undefined ? splitExprSpace(exprVar) : []
  const trimStyled = pipe(codeArr[0], trimBreaks, trimMultiSpaces)
  return [...splitExprVar, trimStyled]
}

/**
 * MAIN FUNCTIONS
 * */
// extract styled function from `<script>` tags
export const extractStyled = (code: string): string[] => {
  const length = code.length
  let index = 0
  let styledIndex = 0
  let indexGroup = []
  let allIndexes: any[] = []
  let next
  let prev = 0
  let styledCloseIndex = 0
  let lastStyled = 0
  let line
  let offset
  let character
  let sequence
  let styled = false
  let subParen = -1
  const sequences: Array<[RegExp, RegExp, boolean]> = [
    [rawOpenScript, rawCloseScript, false],
  ]

  // skip opening white space
  while (index < length) {
    character = code.charAt(index)

    if (character !== tab && character !== space) {
      break
    }

    index++
  }

  if (code.charAt(index) !== lessThan) {
    return []
  }

  next = code.indexOf(lineFeed, index + 1)
  next = next === -1 ? length : next
  line = code.slice(index, next)
  offset = -1
  const count = sequences.length

  while (++offset < count) {
    if (sequences[offset][0].test(line)) {
      sequence = sequences[offset]
      break
    }
  }

  if (!sequence) {
    return []
  }

  // stop when </script> found
  if (!sequence[1].test(line)) {
    while (index < length) {
      next = code.indexOf(lineFeed, index + 1)
      next = next === -1 ? length : next
      line = code.slice(index + 1, next)

      // if in styled expression, but no inner paren
      if (styled && !subParen) {
        if (line) {
          if (closeParen.test(line)) {
            // close styled paren
            index = next
          } else if (openParen.test(line)) {
            // found inner paren
            subParen++
            index = next
          }
        }
      }
      // if in styled expression and has inner paren
      if (styled && subParen) {
        if (line) {
          if (closeParen.test(line)) {
            // close inner paren
            index = next
            styledCloseIndex = index + 1
            indexGroup.push(index)
            indexGroup.push(true)
            allIndexes.push(indexGroup)
            lastStyled = index + 1
            indexGroup = []
            subParen--
          } else if (openParen.test(line)) {
            // handle nested inner paren
            subParen++
            index = next
          }
        }
      }
      // reached end of styled
      if (styled && closeStyled.test(line)) {
        styled = false
      }
      // start index when styled function found
      if (!styled && openStyled.test(line)) {
        if (line) {
          allIndexes.push([styledCloseIndex, prev])
          prev++ // remove white space before styled function
          styledIndex = prev // need prev index which is start of styled function
          indexGroup.push(prev)
          index = next
          styled = true
        }
      }
      index = next
      prev = next
    }
  }
  if (lastStyled < length) allIndexes.push([lastStyled, length])
  // console.log('allIndexes', allIndexes, index, next)
  const parsedCode = allIndexes.map((ind) => {
    if (ind.length === 3) {
      const string = code.slice(ind[0], ind[1])
      return pipe(string, parseStyled, execStyled, execToString)
    } else {
      return code.slice(ind[0], ind[1])
    }
  })

  return parsedCode
}

export const parseStyled = (code: string): string[] =>
  pipe(code, separateExpressions, linkExpressions)

export const parse = (code: string): string =>
  pipe(code, extractStyled, objToString)
