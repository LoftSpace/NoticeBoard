const {MongoClient} = require("mongodb");

//몽고디비 연결주소
const uri = "mongodb+srv://yongjuni30:endrl0011!@cluster0.iiu4ryv.mongodb.net/test";


module.exports = function (callback) {
    return MongoClient.connect(uri,callback);
};
