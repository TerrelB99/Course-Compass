const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://tbrown12354:SGoku1932@coursecompass.lespq.mongodb.net/?retryWrites=true&w=majority&appName=CourseCompass";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function setupMessagesCollection() {
    try {
        await client.connect();
        const database = client.db("CourseCompass");
        const messagesCollection = database.collection("messages");

        // ✅ Create an Index to Optimize Queries (Index senderId & receiverId for Fast Lookups)
        await messagesCollection.createIndex({ senderId: 1, receiverId: 1, timestamp: -1 });

        console.log("✅ 'messages' collection initialized and indexed successfully!");
    } catch (error) {
        console.error("❌ Error initializing messages collection:", error);
    } finally {
        await client.close();
    }
}

setupMessagesCollection();
