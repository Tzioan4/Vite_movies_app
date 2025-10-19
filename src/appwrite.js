import { Client, Databases, ID, Query } from "appwrite";

// Load environment variables for Appwrite project, database, and collection
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Appwrite API endpoint
    .setProject(PROJECT_ID); // Set project ID

// Initialize the database service
const database = new Databases(client);

// Function to update search count or create a new record if it doesn't exist
export const updateSearchCount = async (searchTerm, movie) => {
    try {
        // Check if a document with the search term already exists
        const result = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal('searchTerm', searchTerm)]
        );

        if (result.documents.length > 0) {
            // Document exists, increment the count
            const doc = result.documents[0];

            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                doc.$id,
                {
                    count: doc.count + 1, // Increase search count
                }
            );
        } else {
            // Document doesn't exist, create a new one
            await database.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(), // Generate a unique ID for the document
                {
                    searchTerm, // Store the search term
                    count: 1, // Initial count
                    movie_id: movie.id, // Store the movie ID
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`, // Movie poster URL
                }
            );
        }
    } catch (error) {
        console.log(error); // Log any errors
    }
};

// Function to get top trending movies based on search count
export const getTrendingMovies = async () => {
    try {
        // Fetch documents, limit to 5, sorted by descending count
        const result = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.limit(5),
                Query.orderDesc("count")
            ]
        );
        
        return result.documents; // Return the documents array
    } catch (error) {
        console.error(error); // Log errors if fetching fails
    }
};
