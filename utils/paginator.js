const lodash = require("lodash"); //lodash 임포트 lodash 의 range()함수를 이용해 시작부터 끝페이지 까지의 숫자가 들어있는 리스트를 만든다.
const PAGE_LIST_SIZE = 10; //최대 몇개 페이지 보여줄지


module.exports = ({ totalCount, page,perPage=10}) => {
    const PER_PAGE = perPage;
    const totalPage = Math.ceil(totalCount/ PER_PAGE);

    let quotient = parseInt(page/ PAGE_LIST_SIZE);
    if(page%PAGE_LIST_SIZE ===0) {
        quotient=-1;
    }
    const startPage = quotient*PAGE_LIST_SIZE +1;//시작페이지 구하기


    const endPage = startPage + PAGE_LIST_SIZE-1 < totalPage ? startPage + PAGE_LIST_SIZE -1 : totalPage;

    const isFirstPage = page===1;
    const isLastPage = page===totalPage;
    const hasPrev = page>1;
    const hasNext = page<totalPage;
    

    const paginator = {
        pageList: lodash.range(startPage,endPage+1),
        page,
        prevPage: page-1,
        nextPage: page+1,
        startPage,
        lastPage: totalPage,
        hasPrev,
        hasNext,
        isFirstPage,
        isLastPage,
    };
    return paginator;
};
