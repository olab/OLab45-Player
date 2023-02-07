// Constants.js
const prod = {
    API_URL: 'https://dev.olab.ca/olab/api/v3'
};

const dev = {
    API_URL: 'https://localhost:5001/olab/api/v3'
};

export const config = process.env.NODE_ENV === 'development' ? dev : prod;

// temporary constant for loading sample user session report, pending API endpoint implementation
export const SAMPLE_REPORT_DATA = {"extended_status_code":null,"message":"success","error_code":200,"diagnostics":[],"data":{"sessionId":"d93dd6bb-5f8c-4370-97fe-e9552d8885c0","start":"2023-02-04T17:46:58","end":"2023-02-04T17:47:42","userName":"11","checkSum":"190ED7A","nodes":[{"nodeId":25785,"timeStamp":"2023-02-04T17:46:58","nodeName":"START:Root Node","responses":[]},{"nodeId":25787,"timeStamp":"2023-02-04T17:46:59","nodeName":"Question examples","responses":[{"timeStamp":"2023-02-04T17:47:07","questionId":2911,"questionName":"TxtBox","questionType":"multi-line text entry","isCorrect":true,"questionStem":"Tell us what you think","responseText":"here is some free text"},{"timeStamp":"2023-02-04T17:47:08","questionId":2912,"questionName":null,"questionType":"multiple choice","isCorrect":false,"questionStem":"Did you like this example case?","responseText":"I liked it"},{"timeStamp":"2023-02-04T17:47:09","questionId":2913,"questionName":null,"questionType":"pick choice","isCorrect":true,"questionStem":"This is a Pick choice question (aka Radio buttons)","responseText":"Good"},{"timeStamp":"2023-02-04T17:47:11","questionId":2914,"questionName":null,"questionType":"slider","isCorrect":true,"questionStem":"This is a slider. The base of 1 will throw off results sometimes.","responseText":"16"},{"timeStamp":"2023-02-04T17:47:13","questionId":2915,"questionName":null,"questionType":"Drag and Drop","isCorrect":true,"questionStem":"Drag these options up/down using the mouse into your preferred order: ","responseText":"top,bottom,middle"},{"timeStamp":"2023-02-04T17:47:14","questionId":2915,"questionName":null,"questionType":"Drag and Drop","isCorrect":true,"questionStem":"Drag these options up/down using the mouse into your preferred order: ","responseText":"top,middle,bottom"},{"timeStamp":"2023-02-04T17:47:16","questionId":2915,"questionName":null,"questionType":"Drag and Drop","isCorrect":true,"questionStem":"Drag these options up/down using the mouse into your preferred order: ","responseText":"top,bottom,middle"},{"timeStamp":"2023-02-04T17:47:17","questionId":2915,"questionName":null,"questionType":"Drag and Drop","isCorrect":true,"questionStem":"Drag these options up/down using the mouse into your preferred order: ","responseText":"bottom,top,middle"},{"timeStamp":"2023-02-04T17:47:20","questionId":2915,"questionName":null,"questionType":"Drag and Drop","isCorrect":true,"questionStem":"Drag these options up/down using the mouse into your preferred order: ","responseText":"bottom,middle,top"},{"timeStamp":"2023-02-04T17:47:23","questionId":2916,"questionName":null,"questionType":"DropDown","isCorrect":true,"questionStem":"Drop-down list (with type-in allowed)","responseText":"excellent"}]},{"nodeId":26350,"timeStamp":"2023-02-04T17:47:26","nodeName":"Other file types","responses":[]},{"nodeId":25787,"timeStamp":"2023-02-04T17:47:29","nodeName":"Question examples","responses":[{"timeStamp":"2023-02-04T17:47:07","questionId":2911,"questionName":"TxtBox","questionType":"multi-line text entry","isCorrect":true,"questionStem":"Tell us what you think","responseText":"here is some free text"},{"timeStamp":"2023-02-04T17:47:08","questionId":2912,"questionName":null,"questionType":"multiple choice","isCorrect":false,"questionStem":"Did you like this example case?","responseText":"I liked it"},{"timeStamp":"2023-02-04T17:47:09","questionId":2913,"questionName":null,"questionType":"pick choice","isCorrect":true,"questionStem":"This is a Pick choice question (aka Radio buttons)","responseText":"Good"},{"timeStamp":"2023-02-04T17:47:11","questionId":2914,"questionName":null,"questionType":"slider","isCorrect":true,"questionStem":"This is a slider. The base of 1 will throw off results sometimes.","responseText":"16"},{"timeStamp":"2023-02-04T17:47:13","questionId":2915,"questionName":null,"questionType":"Drag and Drop","isCorrect":true,"questionStem":"Drag these options up/down using the mouse into your preferred order: ","responseText":"top,bottom,middle"},{"timeStamp":"2023-02-04T17:47:14","questionId":2915,"questionName":null,"questionType":"Drag and Drop","isCorrect":true,"questionStem":"Drag these options up/down using the mouse into your preferred order: ","responseText":"top,middle,bottom"},{"timeStamp":"2023-02-04T17:47:16","questionId":2915,"questionName":null,"questionType":"Drag and Drop","isCorrect":true,"questionStem":"Drag these options up/down using the mouse into your preferred order: ","responseText":"top,bottom,middle"},{"timeStamp":"2023-02-04T17:47:17","questionId":2915,"questionName":null,"questionType":"Drag and Drop","isCorrect":true,"questionStem":"Drag these options up/down using the mouse into your preferred order: ","responseText":"bottom,top,middle"},{"timeStamp":"2023-02-04T17:47:20","questionId":2915,"questionName":null,"questionType":"Drag and Drop","isCorrect":true,"questionStem":"Drag these options up/down using the mouse into your preferred order: ","responseText":"bottom,middle,top"},{"timeStamp":"2023-02-04T17:47:23","questionId":2916,"questionName":null,"questionType":"DropDown","isCorrect":true,"questionStem":"Drop-down list (with type-in allowed)","responseText":"excellent"}]},{"nodeId":25786,"timeStamp":"2023-02-04T17:47:32","nodeName":"Constants examples","responses":[]},{"nodeId":25791,"timeStamp":"2023-02-04T17:47:45","nodeName":"Feedback page","responses":[]}],"counters":[]}}