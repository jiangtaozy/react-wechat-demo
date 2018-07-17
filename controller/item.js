/*
 * Created by jemo on 2018-6-14.
 * 商品controller
 */

const { Item } = require('../models/db');

exports.list = async function(req, res, next) {
    const query=req.query;
    let page = parseInt(query.page) || 1;
    let pageSize = parseInt(query.pageSize) || 10;

    page <= 0 ? page = 1 : false;
    pageSize <= 0 ? pageSize = 10 : false;

    const where={
        status:3,
        del:false
    }

    if (query.category) {
        where.category = {
            [db.Op.like]: '%' + query.category + '%'
        };
    }
    if (query.classes) {
        where.classes = {
            [db.Op.like]: '%' + query.classes + '%'
        };
    }
    if (query.item_name) {
        where.name = {
            [db.Op.like]: '%' + query.item_name + '%'
        };
    }

    try {
        const result = await Item.findAndCountAll({
            order: [['sort','DESC'],['id', 'DESC']],
            attributes: ['id', 'title', 'main_images', 'old_price', 'current_price'],
            raw: true,
            where:where,
            offset: (page - 1) * pageSize,
            limit: pageSize
        });
        const maxPage = Math.ceil(result.count / pageSize);
        result.page = page;
        result.pageSize = pageSize;
        result.maxPage = maxPage;
        res.json({result: 'ok', data: result});
    } catch (err) {
        next(err);
    }
}

exports.detail = async function(req, res, next) {
    const { id } = req.params;
    try {
        const item = await Item.findOne({
            attributes: [ 'id', 'title', 'old_price', 'current_price', 'main_images', 'details'],
            where: {
                id,
                del: false,
                status: 3,
            },
            raw: true,
        });
        res.json({
            result: 'ok',
            data: item,
        });
    }
    catch(error) {
        next(error);
    }
}
