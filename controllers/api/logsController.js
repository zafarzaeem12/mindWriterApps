const Logs = require('../../models/Logs');
const moment = require('moment');

const create_meeting_schedule = async (req,res,next) => {
  try {
    let Data = {
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

const get_all_logs = async (req,res,next) => {
  try {
  } catch (err) {}
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

module.exports = {
  create_meeting_schedule,
  get_all_logs,
  getSpecficLogs,
  UpdateLogs,
  DeleteLogs,
};
