const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails if username or password is missing or is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: '',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Username is too short!')

    const newUser2 = {
      username: 'maatti',
      name: 'Matti Luukkainen',
      password: 'sa',
    }

    const result2 = await api
      .post('/api/users')
      .send(newUser2)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result2.body.error).toContain('Password is too short!')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let post of helper.initialPosts) {
    let blogObject = new Blog(post)
    await blogObject.save()
  }
})

describe('Getting/receiving blog posts', () => {
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
})


describe('Adding of blog post or posts', () => {
  test('adding new and valid blog post works', async () => {
    const userDB = await helper.usersInDb()
    const userIds = userDB.map(user => user.id)

    const newPost = {
      title: 'Add valid blog post',
      author: 'Blog author test',
      url: 'http://test//blog',
      likes: 9000,
      userId: userIds[0]
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
    const userDB = await helper.usersInDb()
    const userIds = userDB.map(user => user.id)

    const newPost = {
      title: 'unliked post :(',
      author: 'sandman',
      url: 'http://test//blog_secret',
      userId: userIds[0]
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
    const userDB = await helper.usersInDb()
    const userIds = userDB.map(user => user.id)

    const newPostTitless = {
      author: 'sandman',
      url: 'http://test//blog_secret',
      likes: 1,
      userId: userIds[0]
    }
    await api
      .post('/api/blogs')
      .send(newPostTitless)
      .expect(400)

    const newPostURLless = {
      title: 'we got no url',
      author: 'sandman',
      likes: 1,
      userId: userIds[0]
    }
    await api
      .post('/api/blogs')
      .send(newPostURLless)
      .expect(400)
  })
})

describe('Deleting or modifying blog posts', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const postsAtStart = await helper.postsInDb()
    const postToDelete = postsAtStart[0]
    await api
      .delete(`/api/blogs/${postToDelete.id}`)
      .expect(204)

    const postsAtEnd = await helper.postsInDb()

    expect(postsAtEnd).toHaveLength(
      helper.initialPosts.length - 1
    )
    const postTitles = postsAtEnd.map(r => r.title)
    expect(postTitles).not.toContain(postToDelete.title)
  })

  test('updating post with status code 204 and new information', async () => {
    const userDB = await helper.usersInDb()
    const userIds = userDB.map(user => user.id)

    const updatedPost = {
      title: 'Updated post title',
      author: 'Blog author test',
      url: 'http://test//blog',
      likes: 9000,
      userId: userIds[0]
    }
    const postsAtStart = await helper.postsInDb()
    const postToUpdate = postsAtStart[0]
    await api
      .put(`/api/blogs/${postToUpdate.id}`)
      .send(updatedPost)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const PostsAtEnd = await helper.postsInDb()
    const contents = PostsAtEnd[0].title
    expect(contents).toContain(
      'Updated post title'
    )
  })
})


afterAll(async () => {
  await mongoose.connection.close()
})