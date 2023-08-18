const Category = require("../../models/Category");

const create_Category = async (req, res, next) => {
  try {
    const check_category = await Category.find({ name: req.body.name });
    if (check_category.length > 1) {
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

module.exports = {
  create_Category,
};
