import {ApolloServer, gql} from "apollo-server";
import fetch from 'node-fetch'

let tweets = [
    {
        id:'1',
        text:'first one',
        userId:"2"
    },
    {
        id:'2',
        text:'second one',
        userId:"1"
    }
]

let users = [
    {
        id:'1',
        firstName:'first1',
        lastName:'last1'
    },
    {
        id:'2',
        firstName:'first2',
        lastName:'last2'
    }
]

const typeDefs = gql`
    type User {
        id :ID
        firstName : String
        lastName: String
        fullName : String!
    }
    """
    description Test
    """
    type Tweet {
        """
        id description Test
        """
        id: ID
        text : String
        author : User
    }
    type Query {
        allMovies: [Movie!]!
        allTweets : [Tweet!]!
        allUsers : [User!]!
        tweet(id :ID!) : Tweet
        ping : String
        movie(id: String): Movie!
    }
    
    type Mutation {
        postTweet(text:String, userId:ID) : Tweet
        deleteTweet(id:ID):Boolean
    }

    type Movie {
        id: Int!
        url: String!
        imdb_code: String!
        title: String!
        title_english: String!
        title_long: String!
        slug: String!
        year: Int!
        rating: Float!
        runtime: Float!
        genres: [String]!
        summary: String
        description_full: String!
        synopsis: String
        yt_trailer_code: String!
        language: String!
        background_image: String!
        background_image_original: String!
        small_cover_image: String!
        medium_cover_image: String!
        large_cover_image: String!
    }
`

const resolvers = {
    Tweet : {
      author({userId}){
          return users.find(element => element.id === userId)
      }
    },
    User: {
        fullName({firstName, lastName}){
            return `${firstName} ${lastName}`
        }
    },
    Query : {
        allMovies() {
          return fetch('https://yts.mx/api/v2/list_movies.json').then(res => res.json()).then(json=> json.data.movies)
        },
        movie(_,{id}){
            return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`).then(res => res.json()).then(json=> json.data.movie)
        },
        allTweets() {
            return tweets
        },
        allUsers(){
            return users
        },
        tweet(root, {id}) {
            return tweets.find(element => element.id === id)
        }
    },
    Mutation : {
        postTweet(_, {text,userId}){
            const newTweet = {
                id:tweets.length+1,
                text,
                userId
            }
            tweets.push(newTweet)
            return newTweet
        },
        deleteTweet(_,{id}){
            const tweet = tweets.find(element => element.id === id)
            if(!tweet) return false
            tweets = tweets.filter(element => element.id !== id)
            return true
        }
    }
}

const server = new ApolloServer({typeDefs, resolvers})

server.listen().then(({url}) => {
    console.log(`Running on ${url}`)
})