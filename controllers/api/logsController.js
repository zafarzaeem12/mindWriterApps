const Logs = require('../../models/Logs');
const moment = require('moment')
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
  try {
  } catch (err) {}
};

const UpdateLogs = async (req,res,next) => {
  try {
  } catch (err) {}
};

const DeleteLogs = async (req,res,next) => {
  try {
  } catch (err) {}
};

module.exports = {
  create_meeting_schedule,
  get_all_logs,
  getSpecficLogs,
  UpdateLogs,
  DeleteLogs,
};
