const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialPosts = [
  {
    'title': 'Blog title test',
    'author': 'Blog author test',
    'url': 'http://test//blog',
    'likes': 666,
  },
  {
    'title': 'Blog title test 2',
    'author': 'Blog author test',
    'url': 'http://test//blog',
    'likes': 1,
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let noteObject = new Blog(initialPosts[0])
  await noteObject.save()
  noteObject = new Blog(initialPosts[1])
  await noteObject.save()
})

test('blog posts are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('all posts are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(initialPosts.length)
})

afterAll(async () => {
  await mongoose.connection.close()
})