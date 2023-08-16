const paginator = require("../utils/paginator");
const {ObjectId} = require("mongodb");
const projectionOption = { //데이터베이스에서 필요한 필드들만 선택해서 가져오기
    projection: {
        //프로젝션 결과값에서 패스워드,댓글 패스워드 빼고 가져온다는 뜻
        password: 0,
        "comments.password": 0,
    },
};

//글쓰기
async function writePost(collection, post) { //글쓰기 함수: post를 board collection 에 저장함
    //생성일시, 조회수 삽입
    
    post.hits=0;
    post.createdDt= new Date().toISOString();
    console.log(post);

    return await collection.insertOne(post); //collection 에 post 저장 }
    
}

//글목록
async function list(collection, page,search) {
    const perPage = 10; //한페이지에 노출할 글 개수

    const query = {title : new RegExp(search.trim(),"i")}; //대소문자 구분을 안하고 title이 search와 부분일치 하는지 확인
    
    const cursor = collection.find(query, {limit: perPage, skip: (page-1)* perPage }).sort({ //최대 10개 데이터만 쿼리, 생성일 역순으로 정렬
        createdDt: -1, 
    });
    

    const totalCount = await collection.count(query); //검색어에 걸리는 게시물의 총합
    console.log(search);
    console.log(totalCount);
    const posts =  await cursor.toArray(); //커서로 받아온 데이터를 리스트로 변경
    
    const paginatorObj = paginator({ totalCount, page, perPage: perPage});
    return [posts, paginatorObj];
}
//게시글 가져오기
async function getDetailPost(collection,id) { //하나의 게시글 정보를 가져옴 1.게시글의 정보 2.게시글을 읽을 때마다 hits 1씩 증가
    //몽고디비 collection의 findOneAndUpdate 함수 사용
    //게시글 읽을 때마다 hits 1씩 증가
    return await collection.findOneAndUpdate({ _id: ObjectId(id)}, {$inc: {hits: 1}}, projectionOption);

}
//id,password 로 게시글 데이터 가져오기
async function getPostByIdAndPassword(collection, {id,password}) { //몽고디비 collection의 findOne 함수사용
    
    return await collection.findOne({ _id: ObjectId(id), password: password}, projectionOption);//findOne(필터,옵션) 필터는 id,password
    //옵션은 패스워드를 빼고 데이터가져오기
}

async function getPostById(collection, id) { //위에랑 똑같은데 id로만 게시글 가져옴
    return await collection.findOne({ _id:ObjectId(id)},projectionOption);
}

async function updatePost(collection,id,post) {
    const toUpdatePost= {
        $set: { //갱신할 데이터
            ...post,
        },
    };
    return await collection.updateOne({_id: ObjectId(id)}, toUpdatePost); //하나의 도큐먼트를 id로 필터해서 업데이트
}


module.exports = { //require()로 파일 import시 반환 객체
    list,
    writePost,
    getDetailPost,
    getPostById,
    getPostByIdAndPassword,
    updatePost,
    
};