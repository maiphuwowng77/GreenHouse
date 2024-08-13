// Vai trò trên phần mềm
const RoleAccount = {
  Admin: 0,
  User: 1,
};

// Giới tính
const Gender = {
  Male: 0,
  Female: 1,
};

// Loại thí nghiệm
const TypeExperiment = {
  CRD: 0,
  RCBD: 1,
};

// vai trò trong dự án
const RoleProject = {
  Owner: 0,
  Member: 1,
  Guest: 2,
};

// Kiểu dữ liệu chỉ tiêu theo dõi
const DataType = {
  Number: 0,
  String: 1,
  Image: 2,
};

// Trạng thái cập nhật của bản ghi
const ModelState = {
  Add: 0,
  Edit: 1,
  Delete: 2,
}


module.exports = { 
  RoleAccount, 
  Gender, 
  TypeExperiment, 
  RoleProject, 
  DataType,
  ModelState
 };
