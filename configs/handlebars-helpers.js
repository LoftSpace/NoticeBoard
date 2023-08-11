module.exports = {

    lengthOfList: (list=[])=> list.length,

    eq: (val1,val2)=> val1===val2,  //두값을 비교해 같은지 판단

    dateString: (isoString) => new Date(isoString).toLocaleDateString(),  //iso 날짜 문자열에서 날짜만 반환
};