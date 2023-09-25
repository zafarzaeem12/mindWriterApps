const Logs = require('../../models/Logs');
const cron = require('node-cron');
const Notification = require('../../models/AppNotification')
const moment = require('moment');
var mongoose = require("mongoose");
const {push_notifications} = require('../../middleware/push_notification');
const Users = require('../../models/User');
const create_meeting_schedule = async (req,res,next) => {
  try {
      if(!req.body.category_id){
          return res.status(404).send({ message : "Category_Id is required" })
      }
      else if(!req.body.Created_User){
          return res.status(404).send({ message : "Created User is required" })
      }
       else if(!req.body.title){
          return res.status(404).send({ message : "Title is required" })
      }
      else if(!req.body.description){
          return res.status(404).send({ message : "Description is required" })
      }
      else if(!req.body.start_time ?? !req.body.end_time){
          return res.status(404).send({ message : "Start and end time is required" })
      }
      else if(!req.body.date){
          return res.status(404).send({ message : "Date is required" })
      }
      else if(!req.body.location){
          return res.status(404).send({ message : "Location is required" })
      }
       else if(!req.body.set_remainder){
          return res.status(404).send({ message : "set_remainder is required" })
      }
       else if(!req.file ?? !req.file.length > 0){
          return res.status(404).send({ message : "Recording is required" })
      }else{
        let Data = {
            category_id : req.body.category_id,
            Created_User : req.user.id,
            title : req.body.title,
            description : req.body.description,
            start_time : moment(req.body.start_time , "hh:mm A").format("hh:mm A"),
            end_time :  moment(req.body.end_time , "hh:mm A").format("hh:mm A"),
            date :  moment(req.body.date).format("YYYY-MM-DD"),
            location: req.body.location,
            set_remainder : JSON.parse(req.body.set_remainder),
            start_remainder_time: JSON.parse(req.body.set_remainder) === true ?  moment(req.body.start_remainder_time,"hh:mm A").format("hh:mm A") : null,
            end_remainder_time: JSON.parse(req.body.set_remainder) === true ?  moment(req.body.end_remainder_time , "hh:mm A").format("hh:mm A") : null,
            recording : req.file ? req.file.path.replace(/\\/g, "/") : req.body.recording,
        } 
  
        const User = await Users.findOne({ _id : Data.Created_User })
        
        const notification = {
          sender_id: User._id,
          sender_name: User.name,
          sender_user_image: User.user_image,
          title: Data.title,
          body: Data.description,
          notification_type: 'msg_notify'
        }
    
        if(User.is_notification === true){
          push_notifications(notification)
          await Notification.create(notification)
        }
      
        const create_meeting = await Logs.create(Data);
    
                return res
            .status(200)
            .send({ 
                message : "Meeting Created Successfully",
                status : 1,
                data : create_meeting
            })
          
      }
    
  } catch (err) {
    res.status(404).send({ status : 0, message : "No Logs created"})
  }
};

const get_all_logs = async (req, res, next) => {
  try {
    let pipeline = [];

    if (req.query.date) {
      const desiredDate = moment(req.query.date).format("YYYY-MM-DD");

      pipeline.push({
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  { $year: { $dateFromString: { dateString: "$date" } } },
                  parseInt(moment(desiredDate).format("YYYY"))
                ]
              },
              {
                $eq: [
                  { $month: { $dateFromString: { dateString: "$date" } } },
                  parseInt(moment(desiredDate).format("M"))
                ]
              },
              {
                $eq: [
                  { $dayOfMonth: { $dateFromString: { dateString: "$date" } } },
                  parseInt(moment(desiredDate).format("D"))
                ]
              }
            ]
          }
        }
      });
    }

    if (req.query.title) {
      pipeline.push({
        $match: {
          $expr: {
            $regexMatch: {
              input: "$title",
              regex: req.query.title,
              options: "i"
            }
          }
        }
      });
    }
    
     if (req.query.types) {
      pipeline.push({
        $match: {
          $expr: {
            $regexMatch: {
              input: "$types",
              regex: req.query.types,
              options: "i"
            }
          }
        }
      });
    }
    
     pipeline.push({
      $match: {
        Created_User: new mongoose.Types.ObjectId(req.user.id)
      }
    });
    
    pipeline.push({
      $lookup: {
          from: "categories",
           localField: "category_id",
           foreignField: "_id",
           as: "category"
      }
    });
     pipeline.push({
      $unwind:{
          path: "$category",
      }
    })
    
     pipeline.push({
      $unset:[
          "category.createdAt",
          "category.updatedAt",
          "category.status",
          "category.__v",
          "category_id",
          ]
    })

    pipeline.push({
      $sort: {
        createdAt: -1
      }
    });

    const alldata = await Logs.aggregate(pipeline);
    const totalLogs = await Logs.countDocuments({ Created_User : req.user.id });

    req.query.types ?
    res.status(200).send({
      filtertotal: alldata.length,
      total : totalLogs,
      percentage: ((alldata.length / totalLogs)*100).toFixed(2) ,
      message: "Your data fetched successfully",
      status : 1,
      data: alldata
    })
  : 
  res.status(200).send({
    total : alldata.length,
    message: "Your data fetched successfully",
    status : 1,
    data: alldata
  })
  } catch (err) {
    res.status(500).send({
        status : 0,
      message: "An error occurred while fetching data"
    });
  } 
};

const GetPieChartRecord = async (req,res,next) => {
try{
  // const dailyRecord = await Logs.find(  { $and : [{ Created_User : req.user.id  } , {types : "Daily"}] } )
  // const weeklyRecord = await Logs.find(  { $and : [{ Created_User : req.user.id  } , {types : "Weekly"}] } )
  // const monthlyRecord = await Logs.find(  { $and : [{ Created_User : req.user.id  } , {types : "Monthly"}] } )
  // const totalLogs = await Logs.countDocuments({ Created_User : req.user.id });
  // const daily =  (dailyRecord.length / totalLogs) * 100;
  // const weekly = (weeklyRecord.length / totalLogs) * 100;
  // const monthly = (monthlyRecord.length / totalLogs) * 100;
  
  // res.status(200).send({ 
  //   message : "Data fetched" , 
  //   status:1,
  //   data : {
  //     "dailyPercentage" :  daily.toFixed(2) ,
  //     "weeklyPercentage" : weekly.toFixed(2)  ,
  //     "monthlyPercentage" :  monthly.toFixed(2) ,
  //     "dailyRecord"  :  dailyRecord, 
  //     "weeklyRecord" : weeklyRecord , 
  //     "monthlyRecord" : monthlyRecord
  //   }})

 const data = [
    {
      '$match': {
        'Created_User': new mongoose.Types.ObjectId(req.user.id),
        'types': {
          '$in': [
            'Daily', 'Weekly', 'Monthly'
          ]
        }
      }
    }, {
      '$group': {
        '_id': '$types', 
        'count': {
          '$sum': 1
        }, 
        'data': {
          '$push': {
            '_id': '$_id', 
            'category_id': '$category_id', 
            'title': '$title', 
            'description': '$description', 
            'start_time': '$start_time', 
            'end_time': '$end_time', 
            'date': '$date', 
            'location': '$location', 
            'set_remainder': '$set_remainder', 
            'recording': '$recording', 
            'Created_User': '$Created_User', 
            'status': '$status', 
            'types': '$types', 
            'createdAt': '$createdAt', 
            'updatedAt': '$updatedAt'
          }
        }
      }
    }, {
      '$project': {
        '_id': 0, 
        'type': '$_id', 
        'count': 1, 
        'data': 1, 
        'dataLength': {
          '$size': '$data'
        }
      }
    }, {
      '$group': {
        '_id': null, 
        'total': {
          '$sum': '$count'
        }, 
        'results': {
          '$push': '$$ROOT'
        }
      }
    }, {
      '$unwind': '$results'
    }, {
      '$project': {
        'type': '$results.type', 
        'count': '$results.count', 
        'data': '$results.data', 
        'dataLength': '$results.dataLength', 
        'percentage': {
          '$concat': [
                 { '$toString': {
                   '$multiply': [
                     { '$divide': ["$results.dataLength", "$total"] },
                     100
                   ]
                 }}
               ]
         },
      }
    }, {
      '$unset': [
        '_id', 'count', 'dataLength'
      ]
    }
  ]

  const RecordData = await Logs.aggregate(data)
  res.status(200).send({ message : "Data Fetched Successfully" , status : 1 ,data: RecordData })
}catch(err){
res.status(500).send({ status : 0, message : "Data not fetched"})
}
}




const getSpecficLogs = async (req,res,next) => {
  const logsid = req.params.id;
  try {
    const logs_result = await Logs.findById(logsid);
    res
    .status(200)
    .send({ 
      message : "Meeting fetched Successfully" ,
      status : 1,
       data : logs_result
      })
  } catch (err) {
    res.status(404).send({
        status : 0,
      message : "no logs found"
    })
  }
};

const UpdateLogs = async (req,res,next) => {
  const logsid = req.params.id;
  try {

    const Data = {
      category_id : req.body.category_id,
      title : req.body.title,
      description : req.body.description,
      start_time : moment(req.body.start_time , "hh:mm A").format("hh:mm A"),
      end_time :  moment(req.body.end_time , "hh:mm A").format("hh:mm A"),
      date :  moment(req.body.date).format("YYYY-MM-DD"),
      location : req.body.location,
      set_remainder : JSON.parse(req.body.set_remainder),
      start_remainder_time: JSON.parse(req.body.set_remainder) === true ? moment(req.body.start_remainder_time , "hh:mm A").format("hh:mm A") : null,
      end_remainder_time: JSON.parse(req.body.set_remainder) === true ?  moment(req.body.end_remainder_time , "hh:mm A").format("hh:mm A") : null,
      recording : req.file ? req.file.path.replace(/\\/g, "/") : req.body.recording,
  } 
  
    const updatedLogs = await Logs.findByIdAndUpdate(
      { _id : logsid },
      { $set : Data},
      { new : true }
    )

    res.status(200).send({ status : 1, message : "Meeting Updated Successfully" , data : updatedLogs})
  } catch (err) {
    res.status(404).send({ status : 0, message : "Meeting not Updated"})
  }
};

const DeleteLogs = async (req,res,next) => {
  const logs_id = req.params.id;
  try {
    
    const checked = await Logs.find({ _id : logs_id });
    
    if(Number(checked.length) == 0) {
      next();
      return res.status(404).send({ message : "no logs"})
    }
     
    const deletedLogs = await Logs.deleteOne({ _id : logs_id });
    res.status(200).send({ status : 1, message : "Logs Deleted Successfully"})

    
    

  } catch (err) {
    res.status(500).send({ status : 0, message : "Logs Not Deleted"})
  }
};

const Task_Tracking_Logs = async (req,res,next) => {
try{
  const lookedUp = await Logs.find().populate({path : 'Created_User' , select : "_id name user_image title description is_notification"});

lookedUp.filter(async(data) => {
  const currentDate = moment();
  const Datee = moment(data.date);

  const daysDiff = currentDate.diff(Datee, 'days');

  if (daysDiff === 0) {
    console.log('====== Daily =======' , Datee.format('YYYY-MM-DD'));
    let notification = {
      sender_id: data.Created_User._id,
      sender_name: data.Created_User.name,
      sender_image: data.Created_User.user_image,
      title: data.title,
      body: data.description,
      notification_type: 'msg_notify',
      vibrate: 1,
      sound: 1,
    }
    await Logs.updateOne ({ _id : data._id } , {$set : { types : "Daily"} } , { new : true  })
    await Notification.create(notification)
    return data.Created_User.is_notification === true ? push_notifications(notification) : null;
  }
  else if (daysDiff <= 7 && daysDiff >= -7) {
    console.log('====== Weekly =======' , Datee.format('YYYY-MM-DD'));
    let notification = {
      sender_id: data.Created_User._id,
      sender_name: data.Created_User.name,
      sender_image: data.Created_User.user_image,
      title: data.title,
      body: data.description,
      notification_type: 'msg_notify',
      vibrate: 1,
      sound: 1,
    }
    await Logs.updateOne ({ _id : data._id } , {$set : { types : "Weekly"} } , { new : true  })
    await Notification.create(notification)
    return data.Created_User.is_notification === true ? push_notifications(notification) : null;
  }
  else if (currentDate.month() < Datee.month() || currentDate.month() >= Datee.month() ) {
    console.log('====== Monthly ======', Datee.format('YYYY-MM-DD'));
    let notification = {
      sender_id: data.Created_User._id,
      sender_name: data.Created_User.name,
      sender_image: data.Created_User.user_image,
      title: data.title,
      body: data.description,
      notification_type: 'msg_notify',
      vibrate: 1,
      sound: 1,
    }
    await Logs.updateOne ({ _id : data._id } , {$set : { types : "Monthly"} } , { new : true  })
    await Notification.create(notification)
    return data.Created_User.is_notification === true ? push_notifications(notification) : null;
  }
 
 
});

}catch(err){
  console.log(err)
}
}


const task = cron.schedule("0 0 * * *",( async() => {
  await Task_Tracking_Logs()
  
    console.log("Task_Tracking_Logs()" ) 
 }) ,  {
    scheduled: false, // This will prevent the immediate execution of the task
 });
 task.start();

module.exports = {
  create_meeting_schedule,
  get_all_logs,
  getSpecficLogs,
  UpdateLogs,
  DeleteLogs,
  GetPieChartRecord
};
