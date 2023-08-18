const mongoose = require("mongoose");

const logsSchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    start_time: {
      type: String,
      default: "",
    },
    end_time: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point", "Polygon"],
      },
      coordinates: [Number],
    },
    set_remainder: {
      type: Boolean,
      default : false
    },
    start_remainder_time: {
      type: String,
      default: "",
    },
    end_remainder_time: {
      type: String,
      default: "",
    },
    recording: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// // Here generate Auth Token for social login
// userSchema.methods.generateAuthToken = async function () {
//   const user = this;
//   const token = jwt.sign(
//     {
//       email: user.email,
//       userId: user._id,
//     },
//     process.env.JWT_KEY
//   );
//   user.user_authentication = token;
//   await user.save();
//   //console.log("tokeeen--->", token);
//   return token;
// };

// userSchema.index({ location: '2dsphere' })

const Logs = mongoose.model("Logs", logsSchema);
module.exports = Logs;
