const express = require('express');
const authRoutes = require('./routes/auth');
const availabilityRoutes = require('./routes/availability');
const appointmentRoutes = require('./routes/appointments');
const authenticate = require('./middleware/authenticate');
const { connectDB } = require('./db');

// Initiation
(async () => {
    try {
        // Establish the database connection
        await connectDB();
        console.log('Database connected successfully');

        const app = express();
        app.use(express.json());

        // Assign routes to various endpoints
        app.use('/auth', authRoutes);                                // Authentication route for registration and login of users
        app.use('/availability', authenticate, availabilityRoutes); // Availability route for adding availability slots(professors auth only) and getting all available slots
        app.use('/appointments', authenticate, appointmentRoutes);  // Appointment route for booking(student auth only) and cancelling(professor auth only) appointments

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port: http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to the database', err);
        process.exit(1); // Exit the application if the database connection fails
    }
})();
