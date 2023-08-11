const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const mongodbConnection = require("./configs/mongodb-connection");
const postService = require("./services/post-service"); //file 생성해야됨
const {ObjectId} = require("mongodb");

//글쓰기 api: HTTP의 POST메서드. post메서드 사용시 데이터를 req body로 넘기므로 이를 사용해야함.
app.use(express.json()); //json미들웨어 활성화. 미들웨어:요청과 응답사이에 로직 추가 함수 제공. express.json미들웨어는 http요청의 body를 사용하게 해줌
app.use(express.urlencoded({ extended: true})); //컨텐츠 타입이 body에 키=깂&키=값... 형태의 데이터일 경우 파싱해줌



app.engine("handlebars",handlebars.engine());
app.set("view engine","handlebars");
app.set("views",__dirname+"/views"); //뷰로 사용할 파일들의 디렉터리

app.get("/", async (req,res)=> { 
    const page = parseInt(req.query.page) || 1;//req.query객체로 url에서 /뒤에 있는 변수의 값을 받아온다. 현재 페이지 데이터
    const search = req.query.search || ""; //검색어 데이터ㄴ 
    try {
        const [posts,paginator] = await postService.list(collection,page,search); //post-service 에서 반환값을 배열로 변환하고 인덱스에 매핑
       // console.log([posts,paginator]);
        res.render("home",{title: `${search} 테스트 게시판`, search: search,paginator: paginator,posts: posts}); //템플릿파일의 이름:home으로 설정=> views/home.handlebars    
    }
    catch (error) {
        console.error(error);
        res.render("home", { title: "검색결과 없음"});
    }
     
});



// 글쓰기 페이지 
app.get("/write",(req,res)=> {
    res.render("write",{title: "테스트 게시판",mode:"create"});
});

//수정페이지로 이동
app.get("/modify/:id", async (req,res)=> {
    const {id} = req.params.id;

    const post = await postService.getPostById(collection,req.params.id); //id로 게시글 데이터를 가져옴
    console.log(post);
    res.render("write", {title: "테스트 게시판", mode: "modify",post});
})



//글쓰기
app.post("/write",async (req,res)=> {
    const post = req.body;

    const result= await postService.writePost(collection,post); //post에 저장된 내용을 몽고디비에 반환
    res.redirect(`/detail/${result.insertedId}`); //inserted id 는 document 식별자. 이값으로 상세페이지로 이동 
    
});

app.post("/modify/", async(req,res)=> {   //창에 입력한것을 req로 받아서 
    const {id,title,writer,password,content}= req.body;
    //정리 하고 post에 담음
    const post = {
        title,
        writer,
        password,
        content,
        createdDt: new Date().toISOString(),
    };
    const result = postService.updatePost(collection,id,post); //업데이트
    res.redirect(`detail/${id}`);
})
//상세페이지로 이동
app.get("/detail/:id",async(req,res)=> {
    const result= await postService.getDetailPost(collection,req.params.id); //id정보를 넘겨서 몽고디비에서 게시글의 데이터를 가져옴
    
    res.render("detail", {
        title: "테스트 게시판",
        post: result.value,
    });
});


//수정버튼 클릭시 패스워드 체크하는 api
app.post("/check-password", async(req,res)=> {
    const {id,password}= req.body; //id,password 가져옴
    const post = await postService.getPostByIdAndPassword(collection, {id, password});
    
    if(!post) {  //데이터가 있으면 isExit는 true 없으면 false
        console.log("data x");
        return res.status(404).json({ isExit: false});
    } else {
        console.log("data o");
        return res.json({isExit: true});
    }

});

app.delete("/delete", async(req,res)=> {
    const {id,password} = req.body;
    console.log({id,password});
    try {
        const result = await collection.deleteOne({_id: ObjectId(id),password: password}); //결과는 DeleteResult객체인데
        // awknowledge(불린 타입), deletedCount(숫자 타입)값을 갖고있음 각각 삭제 승인여부,삭제 도큐먼트 개수 알려줌.
        console.log(result);
        if(result.deletedCount!=1) //삭제처리 잘못됐을때
        {
            console.log("삭제 실패");
            return res.json({ isSuccess: false});
        }
        return res.json({isSuccess:true});
    } 
    catch(error) { //데이터베이스 연결이 안되거나 네트워크 불안정하는 등의 예외상황
        console.error(error);
        return res.json({isSuccess: false});
    }

});


let collection;
//핸들바 커스텀 함수 설정 추가
app.engine(
    "handlebars",
    handlebars.create({ //핸들바 객체 생성
        helpers: require("./configs/handlebars-helpers"), //커스텀함수 추가
    }).engine, //핸들바 객체의 엔진 설정
);

app.listen(3000,async() => {
    console.log("Server started");

   const mongoClient= await mongodbConnection();

    collection = mongoClient.db().collection("post");
    console.log("MongoDB connected");
});
