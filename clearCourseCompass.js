const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://tbrown12354:SGoku1932@coursecompass.lespq.mongodb.net/?retryWrites=true&w=majority&appName=CourseCompass";
const client = new MongoClient(uri);

async function clearMessagesCollection() {
    try {
        await client.connect();
        const db = client.db("CourseCompass");
        const messagesCollection = db.collection("messages");

        const result = await messagesCollection.deleteMany({});
        console.log(`✅ Cleared ${result.deletedCount} documents from 'messages' collection.`);
    } catch (err) {
        console.error("❌ Error clearing messages collection:", err);
    } finally {
        await client.close();
    }
}

clearMessagesCollection();
