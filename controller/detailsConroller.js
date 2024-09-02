const Info = require('../Models/DetailsModel.js')
const Apifeatures = require('../utils/apifeatures.js')
require('./errorController.js')
const  errorhandler=require('./../utils/errorhandler.js');
//middleware to chech if body  is not empty




//function get all names
module.exports.getallnames = errorhandler(async (req, res) => {

    const apiFeatures = new Apifeatures(Info.find(), req.query)
      .filter()
      .limitfields()
      .pagination()

    const data = await apiFeatures.query

    res.status(200).json({
      status: 'success',
      length: data.length,
      data
    })
  
}
);
// function to add new name
module.exports.postname = errorhandler(async (req, res) => {

    const detail = await Info.create(req.body)
    console.log('successfully added')
    res.status(200).json({
      status: 'success',
      data: {
        detail
      }
    })

});

// function to get a specific name by reg_no
module.exports.getbyid =errorhandler( async (req, res) => {

    const reg = req.params.id
    console.log(req.id)
    const det = await Info.findOne({ reg_no: reg })
    if (det) {
      console.log('Document found:', det)
      res.status(200).json({
        status: 'success',
        details: det
      })
    } else {
      console.log('Document not found in the database')
      res.status(404).json({
        status: 'failure',
        message: 'Document not found'
      })
    }

});

//function to update a specific name by id
module.exports.updatename =errorhandler( async (req, res) => {

    const item = await Info.findOne({ reg_no: req.params.id })
    if (!item) {
      console.log('Document not found in the database')
      return res.status(404).json({
        status: 'failure',
        message: 'Document not found'
      })
    }

    const item_id = item._id
    const det = await Info.updateOne({ _id: item_id }, req.body, {
      new: true,
      runValidators: true
    })

    console.log('Successfully updated:', det)
    res.status(200).json({
      status: 'success',
      message: `Successfully updated document with reg_no ${req.params.id}`,
      details: det
    })
  
}
);
//function to delete a specific name by id
module.exports.deletename =errorhandler( async (req, res) => {

    const reg = req.params.id
    const det = await Info.deleteOne({ reg_no: reg })
    console.log(' deleted' + reg + 'from database')
    res.status(200).json({
      status: 'successfully deleted' + reg + 'from database',
      det
    })
  
});
exports.Aggregation = errorhandler(async (req, res) => {
  
    const stats = await Info.aggregate([
        { $match: { cgpa: { $gte: 8.0 } } },
        {$group:{_id:'$section',
        averageCgpa:{$avg:'$cgpa'},
        minCgpa:{$min:'$cgpa'},
        maxCgpa:{$max:'$cgpa'},
        names :{$push:'$name'}
        }},{$addFields:{section:"$_id"}},
        {
            $sort:{averageCgpa:1}
         },
         {$project :{_id:0}} 
    ])
     
     
        res.status(200).json({
      status: 'successfully',
      stats
    })
  
}
);