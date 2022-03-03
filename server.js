const express=require('express');

const Mongoose=require('mongoose');

const expressGraphQL=require('express-graphql').graphqlHTTP;

const{

    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
}=require('graphql');

Mongoose.connect('mongodb://localhost:27017/Multiply1DB');

const app=express();


const authorschema={
    id:Number,
    name:String
};

const booksschema={
    id:Number,
    name:String,
    authorId:Number
};

const authors=Mongoose.model('authors',authorschema);

const books=Mongoose.model('books',booksschema);

books.insertMany([
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]);

authors.insertMany([
    { id: 1, name: 'J. K. Rowling' },
    	{ id: 2, name: 'J. R. R. Tolkien' },
    	{ id: 3, name: 'Brent Weeks' }

]);

const BookType = new GraphQLObjectType({
    name: 'Book',   
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: new  GraphQLNonNull(GraphQLString )},
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLString) },
        author: {
            type: AuthorType,
            resolve(book) {
                return authors.findById(book.authorId);
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',   
    description: 'This represents an author of the book',
    fields: () => ({
        id: { type: new  GraphQLNonNull(GraphQLString )},
        name: { type: new GraphQLNonNull(GraphQLString) },
        books:{type: new GraphQLList(BookType),
            resolve(author){
                return books.find({id:author.id})
            }
        }
    })
})



const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type:  BookType,
            description: 'Single Book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve (parent,args) {   
               return books.findById(args.id);
            }
        }, 
        books: {
            type: new GraphQLList(BookType),
            description: 'List of books',
            resolve() {
                return  books.find({});
            }    
        },
        authors:{
            type: new GraphQLList(AuthorType),
            description: 'List of authors',
            resolve() {
                return authors.find({});
            }
        },
        author:{
            type: AuthorType,
            description: 'Single author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve (parent,args) {
                return authors.findById(args.id);
            }
        }
    })
})


const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {  
            type: BookType,
            description: 'Add a new book',
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent,args) => {
                let book=new books({
                    id: books.count() + 1,
                    name: args.name,
                    authorId: args.authorId
                });
                return book.save();
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add a new author',
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent,args) => {
                let author=new authors({
                    id: authors.count() + 1,
                    name: args.name
                });
                return author.save();
            }
        }
    })
})

const schema=new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});





app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true,
  }));

app.listen(5000,()=>{console.log('Server running on port 5000')});