const listHelper = require('../utils/list_helper')
const blogs_for_test = require('../misc/blogs_for_test')

describe('dummy returns', () => {
  test('one from empty array', () => {
    const blogs = []
    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
  })

  test('one from string', () => {
    const result = listHelper.dummy('test string')
    expect(result).toBe(1)
  })

  test('one from number', () => {
    const result = listHelper.dummy(10)
    expect(result).toBe(1)
  })

  test('one from empty', () => {
    const result = listHelper.dummy()
    expect(result).toBe(1)
  })
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    }
  ]

  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    expect(result).toBe(0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(listWithOneBlog[0].likes)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(blogs_for_test.blogs)
    expect(result).toBe(36)
  })
})