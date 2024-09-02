const ex = require('express')
const router = ex.Router()
const functions=require('../controller/detailsConroller')
const authcontroller=require('../controller/authController')
//router.param('id',functions.id_checker); commented this as i changed to database instead normal json file
router.route('/students-stats').get(functions.Aggregation);
router.route('/')
    .get(authcontroller.protect,functions.getallnames)
    .post(authcontroller.protect,functions.postname)
router.route('/:id')
    .get(authcontroller.protect,functions.getbyid)
    .patch(authcontroller.protect,functions.updatename)
    .delete(authcontroller.protect,authcontroller.restrict,functions.deletename)
module.exports = router;
