**Frontend unit tests**  
![](images/image35.png)  
**Backend unit tests**  
![](images/image22.png)  
**API & Endpoint Testing**  
**Ingestion Services**  
POST \- /ingestion/image \- Success  
![](images/image18.png)  
POST \- /ingestion/image \- Fail  
Reason: Not a math question.  
![](images/image17.png)  
POST \- /ingestion/text \- Success  
![](images/image5.png)  
POST \- /ingestion/text \- Fail  
Reason: Not a math question.  
![](images/image24.png)  
**Solver Services**  
POST \- /solver/solve \- Success  
![](images/image9.png)  
POST \- /solver/solve \- Fail  
Reason: Not a math question.  
![](images/image15.png)  
POST \- /solver/solve/ai \- Success  
![](images/image28.png)  
POST \- /solver/solve/ai \- Fail  
Reason: Not a math question.  
![](images/image16.png)  
**Practice Services**  
POST \- /practice/generate \- Success  
![](images/image31.png)  
POST \- /practice/generate \- Fail  
Reason: No questions provided.  
![](images/image2.png)  
POST \- /practice/refresh \- Success  
![](images/image6.png)  
POST \- /practice/refresh \- Fail  
Reason: No generated question provided.  
![](images/image33.png)  
**Explanation Services**  
POST \- /explanation/hint \- Success  
![](images/image32.png)  
POST \- /explanation/hint \-  Fail  
Reason: Invalid input.  
![](images/image10.png)  
POST \- /explanation/steps/ \- Success  
![](images/image21.png)  
POST \- /explanation/steps \- Fail  
Reason: Invalid input.  
![](images/image34.png)  
POST \- /explanation/generate/ \- Success  
![](images/image27.png)  
POST \- /explanation/generate \- Fail  
Reason: Invalid request schema.  
![](images/image14.png)  
POST \- /explanation/follow-up/ \- Success  
![](images/image26.png)  
POST \- /explanation/follow-up/ \- Fail  
Reason: Invalid parameters.  
**Security Testing**  
**POST \- /ingestion/image**  
Reason: File too large (5.36mb \> 5mb).  
![](images/image1.png)  
Reason: No file.  
![](images/image4.png)  
Reason: Invalid file signature.  
![](images/image7.png)  
**POST \- /ingestion/text**  
Reason: XSS injection.  
![](images/image12.png)  
Reason: Prompt injection detected.  
![](images/image13.png)  
Reason: Invalid category.  
![](images/image23.png)  
**POST \- /explanation/generate**  
Reason: Prompt injection.  
![](images/image20.png)  
Reason: XSS injection.  
![](images/image30.png)  
**POST \- /explanation/follow-up**   
Reason: Prompt injection.  
![](images/image3.png)  
Reason: XSS injection.  
![](images/image8.png)  
**POST \- /user/update-username**  
Reason: Name too long.  
![](images/image25.png)  
Reason: XSS injection.  
![](images/image29.png)  
**AI Functionality Testing**  
**AI Testing**  
![](images/image19.png)  
![](images/image11.png)  
