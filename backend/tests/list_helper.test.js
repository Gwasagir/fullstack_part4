const listHelper = require('../utils/list_helper')

test('dummy returns one empty array', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

test('dummy returns one string', () => {
  const result = listHelper.dummy('test string')
  expect(result).toBe(1)
})

test('dummy returns one number', () => {
  const result = listHelper.dummy(10)
  expect(result).toBe(1)
})

test('dummy returns one empty', () => {
  const result = listHelper.dummy()
  expect(result).toBe(1)
})