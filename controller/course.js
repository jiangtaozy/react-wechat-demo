/*
 * Created by jemo on 2018-6-19.
 * 课程controller
 */

const { Course, CourseChapter, Op } = require('../models/db');

// 课程列表
exports.list = async function(req, res, next) {
    const query = req.query;
    let page = parseInt(query.page) || 1;
    let pageSize = parseInt(query.pageSize) || 10;

    const where = {
        del: false,
    };

    if(query.classes) {
        where.classes = {
            [Op.or]: [
                {[Op.like]: `${query.classes},%`},
                {[Op.like]: `%,${query.classes},%`},
                {[Op.like]: `%,${query.classes}`},
            ],
        };
    }
    if (query.course_title) {
        where.title = {
            [Op.like]: `%${query.course_title}%`,
        };
    }
    try {
        const result = await Course.findAndCountAll({
            order: [['id', 'DESC']],
            attributes: ['id', 'title', 'img','old_price','current_price','total_chapter_number','updated_chapter_number','supplier_id'],
            raw: true,
            where: where,
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
        const course = await Course.findOne({
            attributes: ['id', 'title', 'img', 'old_price', 'current_price', 'details', 'total_chapter_number', 'updated_chapter_number', 'speaker_name', 'speaker_position', ],
            include: [{
                model: CourseChapter,
                attributes: ['id', 'course_id', 'title', 'start_time', 'study_number'],
                as: 'course_chapter',
                where: {
                    del: false,
                },
                required: false,
            }],
            where: {
                id,
                del: false,
            }
        });
        res.json({
            result: 'ok',
            data: course,
        });
    }
    catch(error) {
        next(error);
    }
}
