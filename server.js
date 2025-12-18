
// --- Master Data: Product Subtype (ms_product_subtype) ---
app.get('/api/master/subtypes', async (req, res) => {
    const { group, type } = req.query;
    try {
        const p = await getPool();
        let query = 'SELECT * FROM ms_product_subtype';
        const request = p.request();
        
        const conditions = [];
        if (group) { conditions.push('product_group_code = @group'); request.input('group', group); }
        if (type) { conditions.push('product_type_code = @type'); request.input('type', type); }
        
        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY product_subtype_code';
        
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (e) { res.status(500).send(e.message); }
});

app.post('/api/master/subtypes', async (req, res) => {
    const data = req.body;
    try {
        const p = await getPool();
        // Check using triple PK fields
        const check = await p.request()
            .input('gcode', data.product_group_code)
            .input('tcode', data.product_type_code)
            .input('scode', data.product_subtype_code)
            .query(`SELECT product_subtype_code FROM ms_product_subtype 
                    WHERE product_group_code = @gcode AND product_type_code = @tcode AND product_subtype_code = @scode`);
        
        const request = p.request();
        request.input('gcode', data.product_group_code);
        request.input('tcode', data.product_type_code);
        request.input('scode', data.product_subtype_code);
        request.input('desc', data.description);
        request.input('idp', data.idp_code || null);
        request.input('uid', data.update_id || 'SYSTEM');
        request.input('status', data.is_status);
        request.input('deng', data.desc_eng || null);
        request.input('now', new Date());

        if (check.recordset.length > 0) {
            await request.query(`
                UPDATE ms_product_subtype 
                SET description = @desc, idp_code = @idp, update_id = @uid, 
                    update_date = @now, is_status = @status, desc_eng = @deng
                WHERE product_group_code = @gcode AND product_type_code = @tcode AND product_subtype_code = @scode
            `);
        } else {
            await request.query(`
                INSERT INTO ms_product_subtype (
                    product_group_code, product_type_code, product_subtype_code, description, 
                    idp_code, update_id, update_date, is_status, desc_eng
                ) VALUES (
                    @gcode, @tcode, @scode, @desc, @idp, @uid, @now, @status, @deng
                )
            `);
        }
        res.json({ status: 'success' });
    } catch (e) { res.status(500).send(e.message); }
});

app.delete('/api/master/subtypes/:group/:type/:code', async (req, res) => {
    try {
        const p = await getPool();
        await p.request()
            .input('group', req.params.group)
            .input('type', req.params.type)
            .input('code', req.params.code)
            .query(`DELETE FROM ms_product_subtype 
                    WHERE product_group_code = @group AND product_type_code = @type AND product_subtype_code = @code`);
        res.json({ status: 'success' });
    } catch (e) { res.status(500).send(e.message); }
});
