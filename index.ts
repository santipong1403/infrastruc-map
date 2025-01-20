import { Elysia } from 'elysia';
import { Pool } from 'pg';
import { cors } from '@elysiajs/cors';
import 'dotenv/config';

const app = new Elysia();

// ใช้งาน CORS
app.use(cors({
    origin: '*' // สามารถกำหนดเฉพาะโดเมนที่ต้องการอนุญาตได้
}));

// ตั้งค่าการเชื่อมต่อ PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
});

// ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
pool.connect()
    .then(() => console.log('Database connected successfully'))
    .catch((error) => {
        console.error('Failed to connect to the database:', error);
        process.exit(1); // หยุดแอ
        // ปหากการเชื่อมต่อล้มเหลว
    });

// Route: ดึงข้อมูลของ 'ประตูระบายน้ำ'
app.get('/infrastruc', async () => {
    try {
        const result = await pool.query(
            'SELECT * FROM infrastruc WHERE infrastruc_type = $1',
            ['ประตูระบายน้ำ']
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching infrastruc data:', error);
        return { error: 'Failed to fetch infrastruc data from the database' };
    }
});

// Route: ดึงข้อมูลน้ำฝน
app.get('/waterlevel_province', async () => {
    try {
        const result = await pool.query('SELECT * FROM waterlevel_province');
        return result.rows;
    } catch (error) {
        console.error('Error fetching waterlevel data:', error);
        return { error: 'Failed to fetch waterlevel data from the database' };
    }
});

// Route: ดึงข้อมูล 'ฝาย'
app.get('/weir', async () => {
    try {
        const result = await pool.query(
            'SELECT * FROM infrastruc WHERE infrastruc_type = $1',
            ['ฝาย']
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching weir data:', error);
        return { error: 'Failed to fetch weir data from the database' };
    }
});

// Route: ดึงข้อมูล 'สถานีสูบน้ำ'
app.get('/pumpstation', async () => {
    try {
        const result = await pool.query(
            'SELECT * FROM infrastruc WHERE infrastruc_type = $1',
            ['สถานีสูบน้ำ']
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching pumpstation data:', error);
        return { error: 'Failed to fetch pumpstation data from the database' };
    }
});

// Route: ดึงจำนวนสถานีของแต่ละประเภท
app.get('/station_count', async () => {
    try {
        const resultInfrastruc = await pool.query(
            'SELECT COUNT(*) FROM infrastruc WHERE infrastruc_type = $1',
            ['ประตูระบายน้ำ']
        );
        const resultWeir = await pool.query(
            'SELECT COUNT(*) FROM infrastruc WHERE infrastruc_type = $1',
            ['ฝาย']
        );
        const resultPumpstation = await pool.query(
            'SELECT COUNT(*) FROM infrastruc WHERE infrastruc_type = $1',
            ['สถานีสูบน้ำ']
        );

        return {
            infrastruc: resultInfrastruc.rows[0].count,
            weir: resultWeir.rows[0].count,
            pumpstation: resultPumpstation.rows[0].count,
        };
    } catch (error) {
        console.error('Error fetching station count:', error);
        return { error: 'Failed to fetch station count from the database' };
    }
});

// Route: ดึงข้อมูลสถานีที่อยู่ในช่วงพิกัดที่กำหนด
app.get('/latitude', async () => {
    try {
        const result = await pool.query(
            'SELECT * FROM infrastruc WHERE coordinates_lat BETWEEN $1 AND $2 AND coordinates_long BETWEEN $3 AND $4',
            [5.61, 20.46, 97.35, 105.65]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching latitude data:', error);
        return { error: 'Failed to fetch latitude data from the database' };
    }
});
app.get('/rainfall_daily', async (req) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return { error: 'Please provide startDate and endDate' };
        }

        const result = await pool.query(
            `
            SELECT 
                rainfall_value AS value, 
                rainfall_datetime AS date, 
                station_id
            FROM rainfall_daily
            WHERE rainfall_datetime BETWEEN $1 AND $2
            ORDER BY rainfall_datetime ASC
            `,
            [startDate, endDate]
        );

        return result.rows;
    } catch (error) {
        console.error('Error fetching rainfall_daily data:', error);
        return { error: 'Failed to fetch rainfall data from the database' };
    }
});


// เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API is running at http://localhost:${PORT}`));
