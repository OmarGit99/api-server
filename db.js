const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.DOCUMENTDB_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to DocumentDB');
        db = client.db('appointments');
    } catch (err) {
        console.error('Failed to connect to DocumentDB', err);
        process.exit(1);
    }
}

function getDB() {
    if (!db) {
        throw new Error('Error')
    }
    return db;
}

module.exports = { connectDB, getDB };
