const express = require('express')
require('dotenv').config()
const { IgApiClient } = require('instagram-private-api')
const app = express()
const Posts = require('./posts')
const posts = new Posts()
const ig = new IgApiClient();
let arrPosts = []
ig.state.generateDevice(process.env.IG_USERNAME);

setInterval(()=>{
(async () => {
  await ig.simulate.preLoginFlow();
  const loggedInUser = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  process.nextTick(async () => await ig.simulate.postLoginFlow());
  const targetUser = await ig.user.searchExact('ossetianews'); // getting exact user by login
  const userFeed = ig.feed.user(targetUser.pk);
  const myPostsFirstPage = await userFeed.items();
  let comments = await ig.feed.mediaComments(myPostsFirstPage[5].id).items()
  // console.log('comment', comments);
  const p = [...myPostsFirstPage]
  p.forEach(p => {
    arrPosts.push({
      id: p.id,
      pk: p.pk,
      code: p.code,
      user: p.user,
      like_count: p.like_count,
      caption: p.caption,
    })
  });
})();

posts.addPosts(arrPosts)
console.log('storyItems[1]', posts.posts.length);
console.log('storyItems', posts.posts);
},60000)




app.use(express.json())
const PORT = process.env.PORT || '5000'
function startServer(){
  try {
    app.listen(PORT, ()=>{console.log(`Сервер запущен на порту ${PORT}...`);})
  } catch (error) {d
    
  }
}
startServer()