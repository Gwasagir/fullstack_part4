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

test('adding new and valid blog post works', async () => {
  const newPost = {
    title: 'Add valid blog post',
    author: 'Blog author test',
    url: 'http://test//blog',
    likes: 9000,
  }

  await api
    .post('/api/blogs')
    .send(newPost)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const PostsAtEnd = await helper.postsInDb()
  expect(PostsAtEnd).toHaveLength(helper.initialPosts.length + 1)

  const contents = PostsAtEnd.map(posts => posts.title)
  expect(contents).toContain(
    'Add valid blog post'
  )
})

test('adding post without likes defaults to 0', async () => {
  const newPost = {
    title: 'unliked post :(',
    author: 'sandman',
    url: 'http://test//blog_secret'
  }

  await api
    .post('/api/blogs')
    .send(newPost)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const contents = await helper.postsInDb()
  const contentLikes = contents.map(posts => posts.likes)
  const lastPostLike = contentLikes[contentLikes.length-1]
  expect(lastPostLike).toBe(0)
})

test('adding post without name or url responds with 400 bad request', async () => {
  const newPostTitless = {
    author: 'sandman',
    url: 'http://test//blog_secret',
    likes: 1
  }
  await api
    .post('/api/blogs')
    .send(newPostTitless)
    .expect(400)

  const newPostURLless = {
    title: 'we got no url',
    author: 'sandman',
    likes: 1
  }
  await api
    .post('/api/blogs')
    .send(newPostURLless)
    .expect(400)
})

afterAll(async () => {
  await mongoose.connection.close()
})