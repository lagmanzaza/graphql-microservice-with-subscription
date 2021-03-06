const { ApolloServer, gql, PubSub } = require("apollo-server");
const pubsub = new PubSub();
// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
let books = [
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling"
  },
  {
    title: "Jurassic Park",
    author: "Michael Crichton"
  }
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  type Subscription {
    bookAdded: Book
  }

  type Book {
    title: String
    author: String
  }

  type Mutation {
    addBook(author: String, title: String): Book
  }

  type Query {
    books: [Book]
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Subscription: {
    bookAdded: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator(["book"])
    }
  },
  Query: {
    books: () => books
  },
  Mutation: {
    addBook: (_, { author, title }) => {
      books.push({
        author,
        title
      });
      console.log(author, title);
      pubsub.publish("book", {
        bookAdded: {
          author,
          title
        }
      });
      return books[books.length - 1];
    }
  }
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`🚀  Server ready at ${url}`);
  console.log(subscriptionsUrl);
});
