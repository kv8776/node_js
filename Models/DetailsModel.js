const mongoose=require('mongoose');
const fs=require('fs');

//creating schema for db(just structure of each document)
const detailsSchema = new mongoose.Schema({
    name: {
      type: String,
      required:[true,'Name is required'],
      trim:true // trims unwanted spaces from beginning and ending
    },
    reg_no: {
      type: String,
      // below are validators
      required: [true,'reg_no is required'],
      // unique is not validator
      unique:true,
      trim:true
    },
    section: {
      type: String,
      required: [true,'Section is required'],
      enum:{ values:['L1','L2'],
    message :'section doesnt exist'},
      trim:true
    },
    cgpa: {
      type:Number,
      default:0,
      required: [true,'cgpa is required'],
       // below are validators
       //  min:[1,"Rating must be greater than 1"],
      //max:[10,'Rating should be less than or equal to 10.0'],
      //creating custom validator for cgpa
      validate:{validator:function(val){
        return val>=1 && val<=10;
      },
    message:'cgpa is not correct'},
      trim:true
    }
    ,createdAt:{
      type: Date,
      default:Date.now()
    },
    studenImage:{
      type:String,
      require:[true,'student Image is mandatory']
    },
    createdBy:{
      type:String

    }
  });
// creating model from schema
//here using info we can query and update and do all in db
// and INFO is collection created on db


//simislar to node js mongo db also has middleware functions .they are also called as pre or post hooks they can called be called before and after event like save ,delete,update etc...
//save cannot happen for functions  like findandupdate or insertmany or deletemany
detailsSchema.pre('save',function(next){
  console.log(this);
  //here this points to document thst is being created
  this.createdBy='Ganesh k';
 // console.log("done broo");
  next();
})
//similarly post
detailsSchema.post('save',function(doc,next){
  const content =`A new document with name ${doc.name} has been added by ${doc.createdBy}\n`
  //flag : a means append;
  fs.writeFileSync('./Log/log.txt',content,{flag:'a'},(err)=>{
    console.log('cant add to log book');
  })

  next();
});
//Query middleware-used to make somethng on query(find()) i.e it is runned before find
detailsSchema.pre('find',function(next){
  //here this points to query

  next();

})
const Info = mongoose.model('Info', detailsSchema);
module.exports=Info;
