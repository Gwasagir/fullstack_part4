const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let post of helper.initialPosts) {
    let blogObject = new Blog(post)
    await blogObject.save()
  }
})

test('blog posts are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('all posts are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialPosts.length)
})

test('posts identifier property is named id', async () => {
  const response = await helper.postsInDb()
  const contentIds = response.map(post => post.id)
  expect(contentIds).toBeDefined()
}, 100000)

afterAll(async () => {
  await mongoose.connection.close()
})