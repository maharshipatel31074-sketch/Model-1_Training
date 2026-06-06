const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const PORT = 5000;
const MONGO_URI = "mongodb://MaharshiMedicalPlatform:MaharshiMedicalPlatform@ac-6lze2pw-shard-00-00.w8i12lc.mongodb.net:27017,ac-6lze2pw-shard-00-01.w8i12lc.mongodb.net:27017,ac-6lze2pw-shard-00-02.w8i12lc.mongodb.net:27017/?ssl=true&replicaSet=atlas-xig65o-shard-0&authSource=admin&appName=MaharshiMedical";

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error', err));

const medicineSchema = new mongoose.Schema({
    name: String,
    category: String, 
    price: Number,
    stock: Number
});

const Medicine = mongoose.model('Medicine', medicineSchema);

app.get('/api/analytics/categories', async (req, res) => {
    try {
        const stats = await Medicine.aggregate([
            { 
                $match: { stock: { $gt: 0 } } 
            },
            
            {
                $group: {
                    _id: "$category",          
                    totalProducts: { $sum: 1 },          
                    averagePrice: { $avg: "$price" },    
                    totalStock: { $sum: "$stock" }   
                }
            },
            
            {
                $sort: { totalProducts: -1 }
            }
        ]);

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/seed', async (req, res) => {
    try {
        await Medicine.deleteMany({});
        await Medicine.insertMany([
            { name: "Amoxicillin", category: "Antibiotic", price: 15, stock: 120 },
            { name: "Paracetamol", category: "Painkiller", price: 5, stock: 500 },
            { name: "Ibuprofen", category: "Painkiller", price: 8, stock: 250 },
            { name: "Azithromycin", category: "Antibiotic", price: 22, stock: 0 }, 
            { name: "Metformin", category: "Diabetes", price: 12, stock: 300 }
        ]);
        res.send("🌱 Database seeded successfully!");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));