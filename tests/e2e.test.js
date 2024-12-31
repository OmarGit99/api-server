const axios = require('axios');

// URL with port number of server
const BASE_URL = 'http://localhost:3000';

describe('User Flow', () => {
    // Store user ids and tokens outside of local function blocks
    let studentToken, professorToken, studentId, professorId;

    // TEST 1: logs in as student, retrieves JWT token and user_id
    test('Login as Student A1', async () => {
        const response = await axios.post(`${BASE_URL}/auth/login`, { username: 'student_a1', password: 'pass123' });
        console.log('Student A1 response:', response.data);
        
        studentToken = response.data.token;
        studentId = response.data.user.user_id;

        expect(studentToken).toBeDefined();
        expect(studentId).toBeDefined();
    });

    // TEST 2: logs in as professor, retrieves JWT token and user_id
    test('Login as Professor P1', async () => {
        const response = await axios.post(`${BASE_URL}/auth/login`, { username: 'professor_p1', password: 'pass123' });
        console.log('Professor P1 Login Response:', response.data);

        professorToken = response.data.token;
        professorId = response.data.user.user_id;

        expect(professorToken).toBeDefined();
        expect(professorId).toBeDefined();
    });

    // TEST 3: Authenticated using the professor jwt token in authorization header of request, the professor adds an availability slot
    test('Add availability as Professor P1', async () => {
        const response = await axios.post(
            `${BASE_URL}/availability`,
            { professor_id: professorId, time_slots: ['2024-12-22T10:00'] },
            { headers: { Authorization: `Bearer ${professorToken}` } }
        );
        expect(response.status).toBe(200);
    });

    // TEST 4: Authorized student books an appointment and makes the professor unavailable for that slot
    test('Student A1 books an appointment', async () => {
        const response = await axios.post(
            `${BASE_URL}/appointments/book`,
            { professor_id: professorId, student_id: studentId, time_slot: '2024-12-22T10:00' },
            { headers: { Authorization: `Bearer ${studentToken}` } }
        );
        expect(response.status).toBe(200);
    });

    // TEST 5: Authorized professor cancels the appointment
    test('Professor P1 cancels the appointment', async () => {
        const response = await axios.post(
            `${BASE_URL}/appointments/cancel`,
            { professor_id: professorId, student_id: studentId, time_slot: '2024-12-22T10:00' },
            { headers: { Authorization: `Bearer ${professorToken}` } }
        );
        expect(response.status).toBe(200);
    });

    // TEST 6: Authorized student views their appointments but sees no appointments for them
    test('Student A1 checks their appointments', async () => {
        const response = await axios.get(
            `${BASE_URL}/appointments/mine`,
            { params: { student_id: studentId }, headers: { Authorization: `Bearer ${studentToken}` } }
        );
        console.log('Appointments:', response.data);
        expect(response.data.appointments).toBeDefined();
        expect(response.data.appointments.length).toBe(0);
    });
});
