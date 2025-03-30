const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://tbrown12354:SGoku1932@coursecompass.lespq.mongodb.net/?retryWrites=true&w=majority&appName=CourseCompass";
const client = new MongoClient(uri);

async function clearAllCollections() {
    try {
        await client.connect();
        const db = client.db("CourseCompass");
        const collections = await db.collections();

        for (const collection of collections) {
            console.log(`Clearing: ${collection.collectionName}`);
            await collection.deleteMany({});
        }

        console.log("✅ All collections cleared!");
    } catch (err) {
        console.error("❌ Error clearing collections:", err);
    } finally {
        await client.close();
    }
}

clearAllCollections();
