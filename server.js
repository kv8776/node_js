const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' }) //always should be on top of app and always read once for all
//uncaught exception occurred
process.on('uncaughtException',(err)=>{
  console.log(err.name,err.message);
  console.log("uncaught exception occurred ! shutting down");
  process.exit(1);
  
 
})
const app = require('./app');

//console.log(process.env)
dotenv.config({ path: './congig.env' })
console.log(app.get('env'))
//connecting mongodb
mongoose
  .connect(process.env.CONN_STR)
  .then(conn => {
    //console.log(conn);
    console.log('successfully connected to database')
  })
  //skipped this catch as i used global unhandled promise handler below
//  .catch(err => {
//    console.log('error occured during connection to db')
//  })
const PORT = process.env.PORT // read port from env file

const server=app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
//global unhandled promise handler
process.on('unhandledRejection',(err)=>{
  console.log(err.name,err.message);
  console.log("uncaught error occurred ! shutting down");
  server.close(()=>{
    process.exit(1);
  })
 
})
