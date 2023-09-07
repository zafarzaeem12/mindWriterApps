const router = require("express").Router();

const { verifyToken } = require("../middleware/authenticate");
const { authorizeRoles } = require('../middleware/authorizeRoles');
const {
    register,
    login,
    adminlogin,
    Blocked_By_Admin,
    verifyUser,
    resendCode,
    forgotPassword,
    resetPassword,
    changePassword,
    logOut,
    socialLogin,
    completeProfile,
} = require("../controllers/api/authController");
const {
    updateProfile,
    userProfile,
    deleteUserProfile,
    isNotify,
    allUsers
} = require("../controllers/api/userController");
const {
    create_Category,
    getCategory,
    SpecficCategory,
    UpdateCategory,
    DeleteCategory
} = require("../controllers/api/categoryController")
const {
    create_meeting_schedule,
    get_all_logs,
    getSpecficLogs,
    UpdateLogs,
    DeleteLogs
} = require("../controllers/api/logsController")
const { getContent } = require("../controllers/api/commonController");

//** Multer **//
const { upload } = require("../middleware/utils");

const { 
    getInAppNotification, 
    userNotifications 
} = require("../controllers/api/notificationController");


/** Auth */
router.post("/login", login);
router.post("/admin-login", adminlogin);
router.post("/register", register);
router.post("/verifyOtp", verifyUser);
router.post("/resend-code", resendCode);
router.post("/forgetpassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.post("/change-password", verifyToken, changePassword);
router.post("/socialLogin", socialLogin);
router.post('/complete-profile', upload.single('user_image'), completeProfile);
router.post("/logout", verifyToken, logOut);
router.get("/profile-details", verifyToken, userProfile);
router.get("/delete-profile/:id", verifyToken, deleteUserProfile);
router.post('/update-profile', upload.single('user_image'), verifyToken, updateProfile);
router.put('/is_notify', verifyToken, isNotify )
router.get('/getallusers' , verifyToken , allUsers )
router.post("/is_blocked/:id" , verifyToken , Blocked_By_Admin );


/** Content */
router.get("/content/:type", getContent);





/** Notification **/
router.post("/notification", verifyToken, userNotifications);
router.get('/app-notification', verifyToken, getInAppNotification);



/** Category  */
router.post("/createCategory" ,verifyToken ,create_Category )
router.get("/getallcategory" ,verifyToken , getCategory )
router.get("/get/:id" ,verifyToken ,SpecficCategory )
router.put("/updateCategory/:id" ,verifyToken ,UpdateCategory )
router.delete("/deleteCategory/:id" ,verifyToken ,DeleteCategory )

/** Logs  */
router.post("/createLogs" , upload.single('recording')  , verifyToken , create_meeting_schedule );
router.get("/getallLogs" , verifyToken , get_all_logs );
router.get("/getLogs/:id" , verifyToken , getSpecficLogs );
router.put("/updateLogs/:id" , upload.single('recording') , verifyToken , UpdateLogs );
router.delete("/deleteLogs/:id" , verifyToken , DeleteLogs );




module.exports = router;