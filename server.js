
import express from 'express';
import cors from 'cors';
import sql from 'mssql';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json({ limit: '100mb' }));

// --- Super Max Core Infrastructure: Database Node Matrix ---
const dbConfigs = {
    '192.168.0.200': {
        user: 'sa', password: 'P@ssw0rd', server: '192.168.0.200', database: 'SenaAI_AssetsDB', port: 1433,
        options: { encrypt: false, trustServerCertificate: true, requestTimeout: 30000 },
        pool: { max: 30, min: 5, idleTimeoutMillis: 30000, acquireTimeoutMillis: 15000 }
    },
    '192.168.0.184': {
        user: 'sa', password: 'premier', server: '192.168.0.184', database: 'SenaAI_AssetsDB', port: 1433,
        options: { encrypt: false, trustServerCertificate: true, requestTimeout: 30000 },
        pool: { max: 20, min: 2, idleTimeoutMillis: 30000, acquireTimeoutMillis: 15000 }
    }
};

let currentPool = null;
let currentConfigKey = '192.168.0.200';
let nodeSwitchLock = false; // Global Atomic Lock

async function getPool() {
    if (nodeSwitchLock) {
        // Wait for unlock or timeout
        let attempts = 0;
        while (nodeSwitchLock && attempts < 10) {
            await new Promise(r => setTimeout(r, 200));
            attempts++;
        }
    }
    
    if (currentPool && currentPool.connected) return currentPool;
    
    try {
        const config = dbConfigs[currentConfigKey];
        if (currentPool) await currentPool.close().catch(() => {});
        currentPool = await new sql.ConnectionPool(config).connect();
        console.log(`✅ [SQL KERNEL] Node Bound: ${currentConfigKey}`);
        return currentPool;
    } catch (err) {
        console.error(`❌ [SQL FATAL] Connection Failed: ${currentConfigKey}`, err.message);
        currentPool = null;
        throw err;
    }
}

app.post('/api/config/switch-db', async (req, res) => {
    const { target } = req.body;
    if (!dbConfigs[target]) return res.status(400).json({ status: 'error', message: 'Target Node unrecognized' });
    
    nodeSwitchLock = true;
    try {
        if (currentPool) await currentPool.close().catch(() => {});
        currentPool = null;
        currentConfigKey = target;
        await getPool();
        res.json({ status: 'success', server: target, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    } finally {
        nodeSwitchLock = false;
    }
});

// --- Optimized Multi-Layered Menu Logic ---
app.get('/api/user-menus/:username', async (req, res) => {
    try {
        const p = await getPool();
        const userRes = await p.request()
            .input('login', sql.VarChar(50), req.params.username)
            .query("SELECT usrid, isadmin FROM xuser WHERE login = @login AND isactive = 'Y'");
        
        if (userRes.recordset.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const { usrid, isadmin } = userRes.recordset[0];
        // Standardized high-intensity query
        let query = `
            SELECT s.sid, s.name as sname, s.name_2 as sname_2, 
                   g.pgid, g.name as pgname, g.name_2 as pgname_2, 
                   p.pid, p.name as pname, p.name_2 as pname_2, p.sheet, p.param
            FROM xsystem s 
            INNER JOIN xpgroup g ON s.sid = g.sid 
            INNER JOIN xprogram p ON g.pgid = p.pgid 
        `;
        
        if (isadmin === 'Y') {
            query += " WHERE s.is_status = 'Y' AND p.active = 'Y' ORDER BY s.sequence, g.pgid, p.pid";
        } else {
            query += `
                INNER JOIN xgrant gr ON p.pid = gr.pid 
                WHERE gr.usrid = @usrid AND s.is_status = 'Y' AND p.active = 'Y' 
                ORDER BY s.sequence, g.pgid, p.pid
            `;
        }
        
        const result = await p.request().input('usrid', sql.VarChar(50), usrid).query(query);
        res.json(result.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Master Subtypes with Data Cleaning
app.get('/api/master/subtypes', async (req, res) => {
    const { group, type } = req.query;
    try {
        const p = await getPool();
        const result = await p.request()
            .input('g', sql.VarChar(20), group)
            .input('t', sql.VarChar(20), type)
            .query("SELECT * FROM ms_product_subtype WHERE product_group_code = @g AND product_type_code = @t ORDER BY product_subtype_code");
        res.json(result.recordset);
    } catch (e) { res.status(500).send(e.message); }
});

app.get('/api/health', async (req, res) => {
    try {
        const p = await getPool();
        const result = await p.request().query('SELECT DB_NAME() as db, @@SERVERNAME as server_node');
        res.json({ status: 'connected', server: currentConfigKey, database: result.recordset[0].db, node: result.recordset[0].server_node });
    } catch(e) { res.status(500).json({ status: 'error', message: e.message }); }
});

app.listen(port, () => console.log(`🚀 [Super Max Core] Operational on port ${port}`));
