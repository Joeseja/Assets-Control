
import express from 'express';
import cors from 'cors';
import sql from 'mssql';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const dbConfigs = {
    '192.168.0.200': {
        user: 'sa', password: 'P@ssw0rd', server: '192.168.0.200', database: 'SenaAI_AssetsDB',
        options: { encrypt: false, trustServerCertificate: true },
        pool: { max: 20, min: 0, idleTimeoutMillis: 30000 }
    },
    '192.168.0.184': {
        user: 'sa', password: 'premier', server: '192.168.0.184', database: 'SenaAI_AssetsDB',
        options: { encrypt: false, trustServerCertificate: true },
        pool: { max: 20, min: 0, idleTimeoutMillis: 30000 }
    }
};

let currentPool = null;
let currentConfigKey = '192.168.0.200';

async function getPool() {
    if (currentPool && currentPool.connected) return currentPool;
    try {
        const config = dbConfigs[currentConfigKey];
        currentPool = await new sql.ConnectionPool(config).connect();
        return currentPool;
    } catch (err) {
        currentPool = null;
        throw err;
    }
}

// ==========================================
// --- SYSTEM & AUTH ---
// ==========================================
app.get('/api/health', async (req, res) => {
    try {
        const p = await getPool();
        const dbName = await p.request().query("SELECT DB_NAME() as db");
        res.json({ status: 'connected', server: currentConfigKey, database: dbName.recordset[0].db });
    } catch (e) { res.status(500).json({ status: 'error', message: e.message }); }
});

app.post('/api/switch-db', async (req, res) => {
    const { target } = req.body;
    if (dbConfigs[target]) {
        try {
            if (currentPool) await currentPool.close();
            currentConfigKey = target;
            currentPool = null;
            res.json({ status: 'success', server: target });
        } catch (e) { res.status(500).json({ status: 'error', message: e.message }); }
    } else { res.status(400).json({ status: 'error', message: 'Invalid server' }); }
});

app.get('/api/user-menus/:username', async (req, res) => {
    try {
        const p = await getPool();
        const r = await p.request().query(`
            SELECT RTRIM(s.sid) as sid, s.name as sname, s.name_2 as sname_2,
            RTRIM(g.pgid) as pgid, g.name as pgname, g.name_2 as pgname_2,
            RTRIM(p.pid) as pid, p.name as pname, p.name_2 as pname_2, p.sheet 
            FROM xsystem s INNER JOIN xpgroup ON s.sid = xpgroup.sid 
            INNER JOIN xprogram ON xpgroup.pgid = xprogram.pgid ORDER BY s.sequence, xpgroup.pgid, xprogram.pid
        `);
        res.json(r.recordset);
    } catch (e) { res.json([]); }
});

app.get('/api/users/:login', async (req, res) => {
    try {
        const p = await getPool();
        const r = await p.request().input('l', sql.NVarChar, req.params.login).query("SELECT * FROM xuser WHERE login = @l");
        res.json(r.recordset[0]);
    } catch (e) { res.status(500).json(null); }
});

// ==========================================
// --- MASTER DATA ---
// ==========================================
app.get('/api/master/companies', async (req, res) => {
    try {
        const p = await getPool();
        const r = await p.request().query("SELECT * FROM ms_company ORDER BY comp_code");
        res.json(r.recordset);
    } catch (e) { res.status(500).json([]); }
});

// DEED UTILITY API
app.get('/api/master/deed-utility', async (req, res) => {
    try {
        const p = await getPool();
        const r = await p.request().query("SELECT * FROM ms_deed_utility ORDER BY utility_code");
        res.json(r.recordset);
    } catch (e) { res.status(500).json([]); }
});

app.post('/api/master/deed-utility', async (req, res) => {
    const { utility_code, description, level_no, is_status, update_id } = req.body;
    try {
        const p = await getPool();
        const check = await p.request().input('c', sql.Char, utility_code).query("SELECT 1 FROM ms_deed_utility WHERE utility_code = @c");
        
        const q = check.recordset.length > 0 
            ? `UPDATE ms_deed_utility SET description=@d, level_no=@l, is_status=@s, update_id=@u, update_date=GETDATE() WHERE utility_code=@c`
            : `INSERT INTO ms_deed_utility (utility_code, description, level_no, is_status, record_id, record_date) VALUES (@c, @d, @l, @s, 1, GETDATE())`;
        
        await p.request()
            .input('c', sql.Char, utility_code)
            .input('d', sql.VarChar, description)
            .input('l', sql.Int, level_no)
            .input('s', sql.Char, is_status)
            .input('u', sql.VarChar, update_id || 'ADMIN')
            .query(q);
        
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/master/deed-utility/:code', async (req, res) => {
    try {
        const p = await getPool();
        await p.request().input('c', sql.Char, req.params.code).query("DELETE FROM ms_deed_utility WHERE utility_code = @c");
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DEED PAYMENT API
app.get('/api/master/deed-payment', async (req, res) => {
    const { year_no, utility_code } = req.query;
    try {
        const p = await getPool();
        let q = `SELECT p.*, u.description as utility_description 
                 FROM ms_deed_payment p 
                 LEFT JOIN ms_deed_utility u ON p.utility_code = u.utility_code 
                 WHERE 1=1`;
        
        const request = p.request();
        if (year_no) {
            q += " AND p.year_no = @y";
            request.input('y', sql.Int, year_no);
        }
        if (utility_code) {
            q += " AND p.utility_code = @u";
            request.input('u', sql.Char, utility_code);
        }
        
        const r = await request.query(q + " ORDER BY p.year_no DESC, p.utility_code, p.seq");
        res.json(r.recordset);
    } catch (e) { res.status(500).json([]); }
});

// SALE LAND TAX ( DEED BOOK YEAR ) API
app.get('/api/master/deed-book-year', async (req, res) => {
    const { year_no, project_code } = req.query;
    try {
        const p = await getPool();
        let q = `SELECT dy.*, pr.description as project_name, u.description as utility_description 
                 FROM deed_book_year dy
                 LEFT JOIN ms_project pr ON dy.project_code = pr.project_code
                 LEFT JOIN ms_deed_utility u ON dy.utility_code = u.utility_code
                 WHERE 1=1`;
        
        const request = p.request();
        if (year_no) {
            q += " AND dy.year_no = @y";
            request.input('y', sql.Int, year_no);
        }
        if (project_code) {
            q += " AND dy.project_code = @p";
            request.input('p', sql.NVarChar, project_code);
        }
        
        const r = await request.query(q + " ORDER BY dy.project_code, dy.home_no");
        res.json(r.recordset);
    } catch (e) { res.status(500).json([]); }
});

app.post('/api/master/deed-book-year', async (req, res) => {
    const data = req.body;
    try {
        const p = await getPool();
        const check = await p.request()
            .input('y', sql.Int, data.year_no)
            .input('b', sql.VarChar, data.book_code)
            .query("SELECT 1 FROM deed_book_year WHERE year_no = @y AND book_code = @b");
        
        let q = "";
        const request = p.request();
        
        if (check.recordset.length > 0) {
            q = `UPDATE deed_book_year SET 
                 project_code=@pc, deed_id=@di, tower_no=@tn, floor_no=@fn, plan_no=@pn, home_no=@hn, 
                 land_no=@ln, explore_no=@en, deed_code=@dc, sales_status_code=@sc, allocate_no=@an, 
                 deed_sales_qty=@dsq, deed_qty=@dq, balcony_qty=@bq, building_qty=@buq, appraisal_land=@al, 
                 appraisal_building=@ab, appraisal_balcony=@abc, depreciation_percent=@dp, utility_code=@uc, 
                 tax_rate_percent=@tr, is_status=@st, update_id=1, update_date=GETDATE()
                 WHERE year_no=@y AND book_code=@b`;
        } else {
            q = `INSERT INTO deed_book_year (
                 year_no, book_code, project_code, deed_id, tower_no, floor_no, plan_no, home_no, 
                 land_no, explore_no, deed_code, sales_status_code, allocate_no, 
                 deed_sales_qty, deed_qty, balcony_qty, building_qty, appraisal_land, 
                 appraisal_building, appraisal_balcony, depreciation_percent, utility_code, 
                 tax_rate_percent, is_status, record_id, record_date
                ) VALUES (
                 @y, @b, @pc, @di, @tn, @fn, @pn, @hn, @ln, @en, @dc, @sc, @an, 
                 @dsq, @dq, @bq, @buq, @al, @ab, @abc, @dp, @uc, @tr, @st, 1, GETDATE())`;
        }

        request.input('y', sql.Int, data.year_no);
        request.input('b', sql.VarChar, data.book_code);
        request.input('pc', sql.VarChar, data.project_code);
        request.input('di', sql.VarChar, data.deed_id);
        request.input('tn', sql.VarChar, data.tower_no);
        request.input('fn', sql.VarChar, data.floor_no);
        request.input('pn', sql.VarChar, data.plan_no);
        request.input('hn', sql.VarChar, data.home_no);
        request.input('ln', sql.VarChar, data.land_no);
        request.input('en', sql.VarChar, data.explore_no);
        request.input('dc', sql.Char, data.deed_code);
        request.input('sc', sql.Char, data.sales_status_code);
        request.input('an', sql.VarChar, data.allocate_no);
        request.input('dsq', sql.Numeric(8,2), data.deed_sales_qty);
        request.input('dq', sql.Numeric(8,2), data.deed_qty);
        request.input('bq', sql.Numeric(12,2), data.balcony_qty);
        request.input('buq', sql.Numeric(12,2), data.building_qty);
        request.input('al', sql.Numeric(12,2), data.appraisal_land);
        request.input('ab', sql.Numeric(12,2), data.appraisal_building);
        request.input('abc', sql.Numeric(12,2), data.appraisal_balcony);
        request.input('dp', sql.Numeric(5,2), data.depreciation_percent);
        request.input('uc', sql.Char, data.utility_code);
        request.input('tr', sql.Numeric(5,2), data.tax_rate_percent);
        request.input('st', sql.Char, data.is_status);

        await request.query(q);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/master/staff', async (req, res) => {
    try {
        const p = await getPool();
        const r = await p.request().query("SELECT staff_code, staff_name, dept_name FROM ms_staff ORDER BY staff_code");
        res.json(r.recordset);
    } catch (e) { res.json([]); }
});

app.get('/api/master/locations', async (req, res) => {
    try {
        const p = await getPool();
        const r = await p.request().query("SELECT location_code, description FROM ms_location ORDER BY location_code");
        res.json(r.recordset);
    } catch (e) { res.json([]); }
});

app.get('/api/master/stocks', async (req, res) => {
    try {
        const p = await getPool();
        let q = "SELECT stock_code, description, location_code FROM ms_stock";
        if (req.query.location_code) q += ` WHERE location_code = '${req.query.location_code}'`;
        const r = await p.request().query(q);
        res.json(r.recordset);
    } catch (e) { res.json([]); }
});

app.get('/api/master/projects', async (req, res) => {
    try {
        const p = await getPool();
        const r = await p.request().query("SELECT * FROM ms_project ORDER BY project_code");
        res.json(r.recordset);
    } catch (e) { res.json([]); }
});

app.get('/api/master/projects/list/:compCode', async (req, res) => {
    try {
        const p = await getPool();
        const r = await p.request().input('c', sql.NVarChar, req.params.compCode).query("SELECT project_code, description, comp_code FROM ms_project WHERE comp_code = @c ORDER BY project_code");
        res.json(r.recordset);
    } catch (e) { res.json([]); }
});

app.listen(port, () => console.log(`🚀 SENA Assets API Hub running on http://localhost:${port}`));
