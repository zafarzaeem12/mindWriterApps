const Logs = require('../../models/Logs');
const cron = require('node-cron');
const Notification = require('../../models/AppNotification')
const moment = require('moment');
const {push_notifications} = require('../../middleware/push_notification');
const User = require('../../models/User');
const mongoose = require("mongoose");
const create_meeting_schedule = async (req,res,next) => {
  try {
    let Data = {
        category_id : req.body.category_id,
        Created_User : req.user.id,
        title : req.body.title,
        description : req.body.description,
        start_time : moment(req.body.start_time).format("YYYY-MM-DDThh:mm A"),
        end_time :  moment(req.body.end_time).format("YYYY-MM-DDThh:mm A"),
        date :  moment(req.body.date).format("YYYY-MM-DD"),
        location: req.body.location,
        set_remainder : JSON.parse(req.body.set_remainder),
        start_remainder_time: JSON.parse(req.body.set_remainder) === true ? moment(req.body.start_remainder_time).format("YYYY-MM-DDThh:mm A") : null,
        end_remainder_time: JSON.parse(req.body.set_remainder) === true ?  moment(req.body.end_remainder_time).format("YYYY-MM-DDThh:mm A") : null,
        recording : req.file ? req.file.path.replace(/\\/g, "/") : req.body.recording,
    } 

    const User = await Logs.findOne().populate({path: 'Created_User' , select:" _id name user_image title description is_notification"})

    const notification = {
      sender_id: User.Created_User._id,
      sender_name: User.Created_User.name,
      sender_user_image: User.Created_User.user_image,
      title: Data.title,
      body: Data.description,
      notification_type: 'msg_notify',
    }

    if(User.Created_User.is_notification === true){
      push_notifications(notification)
      await Notification.create(notification)
    }
   
    const create_meeting = await Logs.create(Data);

    return res
.status(200)
.send({ 
    message : "Meeting Created Successfully",
    data : create_meeting
})
    
   
    
  } catch (err) {
    res.status(404).send({ message : "No Logs created"})
  }
};

const get_all_logs = async (req, res, next) => {
  const Id = new mongoose.Types.ObjectId(req.user.id);
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
        Created_User: Id
      },
      $sort: {
        createdAt: -1
      }
    });

    const alldata = await Logs.aggregate(pipeline);

    res.status(200).send({
      total: alldata.length,
      message: "Your data fetched successfully",
      data: alldata
    });
  } catch (err) {
    res.status(500).send({
      message: "An error occurred while fetching data"
    });
  }
};


const getSpecficLogs = async (req,res,next) => {
  const logsid = req.params.id;
  try {
    const logs_result = await Logs.findById(logsid);
    res
    .status(200)
    .send({ 
      message : "Meeting fetched Successfully" ,
       data : logs_result
      })
  } catch (err) {
    res.status(404).send({
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
      start_time : moment(req.body.start_time).format("YYYY-MM-DDThh:mm A"),
      end_time :  moment(req.body.end_time).format("YYYY-MM-DDThh:mm A"),
      date :  moment(req.body.date).format("YYYY-MM-DD"),
      location : req.body.location,
      set_remainder : JSON.parse(req.body.set_remainder),
      start_remainder_time: JSON.parse(req.body.set_remainder) === true ? moment(req.body.start_remainder_time).format("YYYY-MM-DDThh:mm A") : null,
      end_remainder_time: JSON.parse(req.body.set_remainder) === true ?  moment(req.body.end_remainder_time).format("YYYY-MM-DDThh:mm A") : null,
      recording : req.file ? req.file.path.replace(/\\/g, "/") : req.body.recording,
  } 
  
    const updatedLogs = await Logs.findByIdAndUpdate(
      { _id : logsid },
      { $set : Data},
      { new : true }
    )

    res.status(200).send({ message : "Meeting Updated Successfully" , data : updatedLogs})
  } catch (err) {
    res.status(404).send({ message : "Meeting not Updated"})
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
    res.status(200).send({ message : "Logs Deleted Successfully"})

    
    

  } catch (err) {
    res.status(500).send({ message : "Logs Not Deleted"})
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
      sound: 1
    }
    await Logs.updateOne ({ _id : data._id } , {$set : { types : "Daily"} } , { new : true  })
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
      sound: 1
    }
    await Logs.updateOne ({ _id : data._id } , {$set : { types : "Weekly"} } , { new : true  })
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
      sound: 1
    }
    await Logs.updateOne ({ _id : data._id } , {$set : { types : "Monthly"} } , { new : true  })
    return data.Created_User.is_notification === true ? push_notifications(notification) : null;
  }
 
 
});

}catch(err){
  console.log(err)
}
}


const task = cron.schedule("* * * * *",( async() => {
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
};
