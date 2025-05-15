const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URL
const uri = "mongodb://localhost:27017/eventManagement";

// Create a new MongoClient
const client = new MongoClient(uri);

// Database connection function
async function connectDB() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB successfully");
        
        // Return the database instance
        return client.db("eventManagement");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

// Function to get events collection
async function getEventsCollection() {
    const db = await connectDB();
    return db.collection('events');
}

// Function to create a new event
async function createEvent(eventData) {
    try {
        const eventsCollection = await getEventsCollection();
        const result = await eventsCollection.insertOne(eventData);
        return result;
    } catch (error) {
        console.error("Error creating event:", error);
        throw error;
    }
}

// Function to get all events
async function getAllEvents() {
    try {
        const eventsCollection = await getEventsCollection();
        const events = await eventsCollection.find().toArray();
        return events;
    } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
    }
}

// Function to get event by ID
async function getEventById(eventId) {
    try {
        const eventsCollection = await getEventsCollection();
        const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
        return event;
    } catch (error) {
        console.error("Error fetching event:", error);
        throw error;
    }
}

// Function to delete an event
async function deleteEvent(id) {
    const db = await connectDB();
    const collection = db.collection('events');
    return await collection.deleteOne({ _id: new ObjectId(id) });
}

// Function to update an event
async function updateEvent(id, eventData) {
    try {
        const eventsCollection = await getEventsCollection();
        const result = await eventsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: eventData }
        );
        return result;
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
}

// Function to get events by type
async function getEventsByType(type) {
    try {
        const eventsCollection = await getEventsCollection();
        const events = await eventsCollection.find({ type: type }).toArray();
        return events;
    } catch (error) {
        console.error("Error fetching events by type:", error);
        throw error;
    }
}

// Function to search events
async function searchEvents(query) {
    try {
        const eventsCollection = await getEventsCollection();
        const events = await eventsCollection.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } }
            ]
        }).toArray();
        return events;
    } catch (error) {
        console.error("Error searching events:", error);
        throw error;
    }
}

// Function to close the database connection
async function closeConnection() {
    try {
        await client.close();
        console.log("MongoDB connection closed");
    } catch (error) {
        console.error("Error closing MongoDB connection:", error);
        throw error;
    }
}

module.exports = {
    connectDB,
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventsByType,
    searchEvents,
    closeConnection
}; 