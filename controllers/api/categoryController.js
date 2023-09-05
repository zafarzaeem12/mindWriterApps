const Category = require("../../models/Category");

const create_Category = async (req, res, next) => {
  try {
    const check_category = await Category.find({ name: req.body.name });
    if (check_category.length > 0) {
      return res.status(404).send({ message: "Category already exists" });
    } else {
      const Data = {
        name: req.body.name,
        status: req.body.status || false,
      };
      const datas = await Category.create(Data);

      res.status(200).send({
        message: "Category created Successfully",
        data: datas,
      });
    }
  } catch (err) {
    res.status(500).send({ message: "No Category found" });
  }
};

const getCategory = async (req,res,next) => { 
  try{
    const getall = await Category.find({ status : false});

    res
    .status(200)
    .send({ 
      total : getall.length,
      message : `Categories Fetched`,
      data : getall
    
    })
  }catch(err){
    res.status(404).send({ message : "no category found"})
  }
}

const SpecficCategory = async (req,res,next) => {
  try{
    const getData = await Category.findOne({ _id : req.params.id});
    res
    .status(200)
    .send({ 
      message : "Data Fetched Successfully" , 
      data : getData
    })
  }catch(err){
    res.status(404).send({ message : "no category found"})
  }
 }

const UpdateCategory = async (req,res,next) => { 
  const cat_id = req.params.id
  try{
    const updateCategory =  await Category.findByIdAndUpdate(
      {_id : cat_id },
      { $set : {
        name : req.body.name,
      }},
      {new : true}
    )

    res
    .status(200)
    .send({ 
      status: 1,
      message : "Category Updated successfully" , 
      data : updateCategory
    })

  }catch(err){
    res
    .status(500)
    .send({ 
      status: 0,
      message : "Category Not Updated"
    })
  }
}

const DeleteCategory = async (req,res,next) => {
  const id = req.params.id
  try{ 

    const check_category = await Category.find({$and : [{ status : true }, {_id : id}] });
 
    if(check_category.length > 0){
      return res.status(404).send({ message : "no category found"})
    } 


   const softdelete =  await Category.updateOne(
      {_id : id},
      { $set : { status : true } },
      {new : true}
    )
    
    res.status(200).send({ message : 'Category Soft Deleted Successfully'})
  }catch(err){
    res.status(404).send({ message : 'Category not deleted'})
  }
 }

module.exports = {
  create_Category,
  getCategory,
  SpecficCategory,
  UpdateCategory,
  DeleteCategory
};
