import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes } from '../utils/list_helper.js'
const blogs = [
  { title: 'Small commits', author: 'Dina', url: 'https://example.com/commits', likes: 4 },
  { title: 'Readable tests', author: 'Bima', url: 'https://example.com/tests', likes: 9 },
  { title: 'Async review', author: 'Dina', url: 'https://example.com/async', likes: 7 },
]
test('dummy returns one for empty and nonempty lists', () => {
  assert.equal(dummy([]), 1)
  assert.equal(dummy(blogs), 1)
})
describe('total likes', () => {
  test('empty, one, and several blogs', () => {
    assert.equal(totalLikes([]), 0)
    assert.equal(totalLikes([blogs[0]]), 4)
    assert.equal(totalLikes(blogs), 20)
  })
})
describe('favorite blog', () => {
  test('largest individual likes, empty, and singleton', () => {
    assert.deepEqual(favoriteBlog(blogs), blogs[1])
    assert.equal(favoriteBlog([]), null)
    assert.deepEqual(favoriteBlog([blogs[0]]), blogs[0])
  })
  test('ties may return either leading blog', () => {
    const tied = [blogs[1], { ...blogs[0], likes: 9 }]
    assert(tied.includes(favoriteBlog(tied)))
  })
})
describe('author statistics', () => {
  test('most blogs counts authors rather than likes', () => {
    assert.deepEqual(mostBlogs(blogs), { author: 'Dina', blogs: 2 })
    assert.equal(mostBlogs([]), null)
    assert.deepEqual(mostBlogs([blogs[1]]), { author: 'Bima', blogs: 1 })
  })
  test('most likes aggregates blogs by author', () => {
    assert.deepEqual(mostLikes(blogs), { author: 'Dina', likes: 11 })
    assert.equal(mostLikes([]), null)
    assert.deepEqual(mostLikes([blogs[1]]), { author: 'Bima', likes: 9 })
  })
  test('ties return one valid author without mutating input', () => {
    const input = structuredClone(blogs.slice(0, 2))
    const before = structuredClone(input)
    assert(['Dina', 'Bima'].includes(mostBlogs(input).author))
    assert.deepEqual(input, before)
  })
})
