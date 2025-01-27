const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

let server;

// User and Artist Details
const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YWM5ZjYyZjIzZDkyZGE4ZDA2MWE1OSIsImlhdCI6MTcyMzM2NDk3OH0.mz1zxSKhdHE5wBVnDegIeuDn79O88YLsV8K3TS249F0';
const adminToken = 'validAdminJwtTokenHere'; // Replace with a valid Admin JWT token
const userId = '66ac9f62f23d92da8d061a59';
const artistId = '66b877028eadba6ef49bab2c';

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_CLOUD, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    server = app.listen(5001); // Use a different port for testing to avoid conflicts
});

afterAll(async () => {
    await mongoose.connection.close();
    await server.close();
});

describe('User API Tests', () => {

    it('POST /api/user/create | Should create a new user', async () => {
        const response = await request(app).post('/api/user/create').send({
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com",
            "password": "John@@123",
            "phone": "1234567890"
        });

        if (!response.body.success) {
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toEqual('User already exists!');
        } else {
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toEqual('User Created Successfully!');
        }
    });

    it('POST /api/user/login | Should login a user', async () => {
        const response = await request(app).post('/api/user/login').send({
            'email': 'john.doe@example.com',
            'password': 'John@@123'
        });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toEqual('User logged in successfully!');
        expect(response.body.token).toBeDefined();
    });

   

    it('POST /api/user/forgot_password | Should send OTP for password reset', async () => {
        const response = await request(app).post('/api/user/forgot_password').send({
            'phone': '1234567890'
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toEqual('OTP sent to your phone number');
    });

    it('POST /api/user/verify_otp | Should verify OTP and set new password', async () => {
        const response = await request(app).post('/api/user/verify_otp').send({
            'phone': '1234567890',
            'otp': 'validOtpHere', // Replace with a valid OTP
            'newPassword': 'NewPass@@123'
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toEqual('OTP verified and password updated!');
    });

    // it('POST /api/user/token | Should generate and return a JWT token', async () => {
    //     const response = await request(app).post('/api/user/token').send({
    //         'id': userId
    //     });

    //     expect(response.statusCode).toBe(200);
    //     expect(response.body.success).toBe(true);
    //     expect(response.body).toHaveProperty('token');
    // });

    it('POST /api/user/login | Should fail with incorrect password', async () => {
        const response = await request(app).post('/api/user/login').send({
            'email': 'john.doe@example.com',
            'password': 'wrongpassword'
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toEqual('Password not matched!');
    });

    // it('POST /api/user/create | Should fail with missing fields', async () => {
    //     const response = await request(app).post('/api/user/create').send({
    //         "firstName": "John",
    //         "email": "john.doe@example.com"
    //     });

    //     expect(response.statusCode).toBe(400);
    //     expect(response.body.success).toBe(false);
    //     expect(response.body.message).toEqual('Please enter all fields!');
    // });

    // it('GET /api/user/profile | Should fail with invalid token', async () => {
    //     const response = await request(app).get('/api/user/profile')
    //         .set('Authorization', `Bearer invalidToken`);

    //     expect(response.statusCode).toBe(400);
    //     expect(response.body.success).toBe(false);
    //     expect(response.body.message).toEqual('Not authenticated!');
    // });
});

describe('Artist API Tests', () => {

    // it('POST /api/artist/create | Should create a new artist', async () => {
    //     const response = await request(app)
    //         .post('/api/artist/create')
    //         .set('Authorization', `Bearer ${adminToken}`)
    //         .field('artistName', 'Sabita')
    //         .field('artistGenre', 'Party')
    //         .field('artistRate', 150000)
    //         .field('artistDescription', 'Best in town')
    //         .attach('artistImage', 'path/to/your_image.jpg'); // Use a valid image path

    //     if (!response.body.success) {
    //         expect(response.statusCode).toBe(400);
    //         expect(response.body.message).toEqual('Please enter all fields');
    //     } else {
    //         expect(response.statusCode).toBe(201);
    //         expect(response.body.message).toEqual('Artist Created Successfully');
    //         expect(response.body.data).toHaveProperty('_id');
    //     }
    // });

    it('GET /api/artist/get_all_artists | Should fetch all artists', async () => {
        const response = await request(app).get('/api/artist/get_all_artists');

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.artists)).toBe(true);
    });

    it('GET /api/artist/get_single_artist/:id | Should fetch a single artist by ID', async () => {
        const response = await request(app).get(`/api/artist/get_single_artist/${artistId}`);

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.artist).toBeDefined();
    });

    it('DELETE /api/artist/delete_artist/:id | Should delete an artist by ID', async () => {
        const response = await request(app)
            .delete(`/api/artist/delete_artist/${artistId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toEqual('Artist deleted successfully');
    });

    // it('PUT /api/artist/update_artist/:id | Should update an artist by ID', async () => {
    //     const response = await request(app)
    //         .put(`/api/artist/update_artist/${artistId}`)
    //         .set('Authorization', `Bearer ${adminToken}`)
    //         .field('artistName', 'Updated Artist')
    //         .attach('artistImage', 'path/to/updated_image.jpg'); // Use a valid image path

    //     expect(response.statusCode).toBe(201);
    //     expect(response.body.success).toBe(true);
    //     expect(response.body.message).toEqual('Artist Updated');
    // });

    it('GET /api/artist/pagination?page=1&limit=2 | Should fetch paginated artists', async () => {
        const response = await request(app).get('/api/artist/pagination?page=1&limit=2');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.artists)).toBe(true);
    });

    it('GET /api/artist/get_artists_count | Should return the count of artists', async () => {
        const response = await request(app).get('/api/artist/get_artists_count');

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('artistCount');
    });

    it('POST /api/artist/create | Should fail with missing fields', async () => {
        const response = await request(app)
            .post('/api/artist/create')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('artistName', 'Sabita');

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toEqual('Please enter all fields');
    });

    it('POST /api/artist/create | Should fail with missing image', async () => {
        const response = await request(app)
            .post('/api/artist/create')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('artistName', 'Sabita')
            .field('artistGenre', 'Party')
            .field('artistRate', 150000)
            .field('artistDescription', 'Best in town');

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toEqual('Image not found');
    });

    it('GET /api/artist/pagination?page=1000&limit=2 | Should return no artists', async () => {
        const response = await request(app).get('/api/artist/pagination?page=1000&limit=2');

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toEqual('No artists found');
    });

    it('GET /api/artist/get_single_artist/:id | Should fail with invalid artist ID', async () => {
        const response = await request(app).get('/api/artist/get_single_artist/invalidArtistId');

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toEqual('Internal server error');
    });

    it('DELETE /api/artist/delete_artist/:id | Should fail with invalid artist ID', async () => {
        const response = await request(app)
            .delete(`/api/artist/delete_artist/invalidArtistId`) 
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toEqual('Internal server error');
    });
});
