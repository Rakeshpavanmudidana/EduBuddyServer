import {  getComputedSyllabus, addCompleteSyllabusToStudent, getTodaysTopics, getNotes, UpdateTopics, getCompletedRevision, addCompleteRevisiomToStudent } from "./script.js";
import { formatMarkdownToHTML } from "./ChatBotscript.js";

    const StudentId = "24L35A4306"; // Replace with the actual student ID
    const collegeName = "Viit"; // Replace with the actual college name
    const branchName = "AI"; // Replace with the actual branch name
    let mainDiv = document.getElementById("mainDiv");
    let innerpopup = document.getElementById("popupContent");
    let popup = document.getElementById("popup");
    let popup2 = document.getElementById("popup2");
    let tocancleOptions = document.getElementById("tocancleOptions");
    let TodaysTopics = new Map();
    let Readingcancle = document.getElementById("tocancle");
    const loadingPopup = document.getElementById("loadingPopup");
    const charsPerPage = 500; // Adjust this value to control content per page
    let currentPage = 0;
    let pages = [];
    let topicContent="";
    let CurrentLessonname="";
    let CurrentSubject="";
    let CurrentTopic="";
    let date = "";
    let divToRemove = "";

    const noteContent = document.getElementById('note-content');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');



    function getFullDate() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0"); 
        const year = today.getFullYear();
        return `${day}-${month}-${year}`;
    }

    
    async function loadTadaysTopics(collegeName, branchName, StudentId, day) {
        TodaysTopics = await getTodaysTopics(collegeName, branchName, StudentId, getFullDate());
    }


    function showTopicsToRevision() {   
        loadingPopup.style.display = "none";
        mainDiv.style.display = "block";
        ShowAllTopics(TodaysTopics);
    }

    tocancleOptions.addEventListener("click", function(){
        popup.style.display = "none";
        overlay.style.display = "none";
    })

    function splitContentIntoPages() {
        const trimmedContent = topicContent.trim();
        pages = [];
        let startIndex = 0;

        while (startIndex < trimmedContent.length) {
            let endIndex = startIndex + charsPerPage;
            
            // Find the nearest space or newline to avoid cutting words
            if (endIndex < trimmedContent.length) {
                while (endIndex > startIndex && 
                      trimmedContent[endIndex] !== ' ' && 
                      trimmedContent[endIndex] !== '\n') {
                    endIndex--;
                }
            }
            
            // If no space found, use the original endIndex
            if (endIndex === startIndex) {
                endIndex = startIndex + charsPerPage;
            }

            const pageContent = trimmedContent.substring(startIndex, endIndex).trim();
            pages.push(pageContent);
            startIndex = endIndex + 1;
        }
    }


    function displayPage() {
        noteContent.innerHTML = `<p id="note">${pages[currentPage]}</p>`;
        pageInfo.textContent = `Page ${currentPage + 1} of ${pages.length}`;
        if ( currentPage === 0){
            prevBtn.innerHTML = "Cncl";
            Readingcancle.style.display = "none";
        }
        else
        {
            Readingcancle.style.display = "inline-block";
            prevBtn.innerHTML = "Pre";
        }
        if (currentPage === pages.length - 1) {
            nextBtn.innerHTML = "Test";
        }
        else {
            nextBtn.innerHTML = "Next";
        }
    }

    // Navigation functions
    function previousPage() {
        if (currentPage > 0) {
            currentPage--;
            displayPage();
        }
    }

    function nextPage() {
        if (currentPage < pages.length - 1) {
            currentPage++;
            displayPage();
        }
    }

    // Add event listeners
    prevBtn.addEventListener('click', function() {
        if (prevBtn.innerHTML === "Cncl") {
            popup2.style.display = "none";
            

        } else {
            Readingcancle.style.display = "inline-block";
            previousPage();
        }       
    });
    nextBtn.addEventListener('click', async function () {
        if (nextBtn.textContent.trim() === "Test") {
            console.log("Starting test generation...");
            loadingPopup.style.display = "block";
    
            try {
                let prompt = topicContent + 
                    " Check the above paragraph and generate a 3 multiple choice question in map format only. " +
                    "Each question should have 4 options. The question number will be the key, and other attributes will be: question, options, correct answer *NOTE*: return only the json format. ";
                let mcp = await getNotes(prompt);
                mcp = mcp.replace("```json", '');
                mcp = mcp.replace("```", '');
                mcp = JSON.parse(mcp);
                noteContent.innerHTML = "";
                for (const [key, value] of Object.entries(mcp)) {
                    console.log(key, value);
                
                    const mcqDiv = document.createElement("div");
                    mcqDiv.className = "mcqDiv";  // changed from id to class (id should be unique)
                
                    const p = document.createElement("p");
                    p.textContent = key + ": " + value["question"];
                    p.className = "question";
                    mcqDiv.appendChild(p);
                
                    for (let i = 0; i < value["options"].length; i++) {
                        const optionValue = value["options"][i];
                
                        const label = document.createElement("label");
                        label.style.display = "block";
                
                        const radio = document.createElement("input");
                        radio.type = "radio";
                        radio.value = optionValue;
                        radio.name = `question_${key}`;
                        radio.dataset.key = key;  // store key to find later
                        radio.dataset.index = i;  // store index
                        radio.className = "optionRadio";
                
                        label.appendChild(radio);
                
                        const textNode = document.createTextNode(" " + optionValue);
                        label.appendChild(textNode);
                
                        // Add span for result (tick or cross)
                        const resultSpan = document.createElement("span");
                        resultSpan.className = `resultSpan_${key}_${i}`;
                        resultSpan.style.marginLeft = "10px";
                        label.appendChild(resultSpan);
                
                        mcqDiv.appendChild(label);
                    }
                
                    noteContent.appendChild(mcqDiv);
                }
                
                // Create buttons
                const submitButton = document.createElement("button");
                submitButton.textContent = "Submit";
                
                const completedReading = document.createElement("button");
                completedReading.textContent = "Completed Reading";
                completedReading.style.display = "none";
                
                noteContent.appendChild(submitButton);
                noteContent.appendChild(completedReading);
                
                // Handle Submit
                submitButton.addEventListener("click", function () {
                    for (const key of Object.keys(mcp)) {
                        const correctAnswer = mcp[key]["correct_answer"];
                        const selected = document.querySelector(`input[name="question_${key}"]:checked`);
                
                        const allOptions = document.querySelectorAll(`input[name="question_${key}"]`);
                
                        allOptions.forEach((opt, idx) => {
                            const span = document.querySelector(`.resultSpan_${key}_${idx}`);
                            span.textContent = ""; // clear existing
                
                            // ✅ Show tick for correct answer
                            if (opt.value === correctAnswer) {
                                span.textContent = "✅";
                            }
                
                            // ❌ Show wrong mark for selected wrong answer
                            if (selected && opt.checked && opt.value !== correctAnswer) {
                                span.textContent = "❌";
                            }
                
                            // Disable all options
                            opt.disabled = true;
                        });
                    }
                
                    // Hide Submit, Show Completed Reading
                    submitButton.style.display = "none";
                    completedReading.style.display = "inline-block";
                });
                completedReading.addEventListener("click", async function () {
                    // Get the current subject map
                    const subjectMap = TodaysTopics.get(CurrentSubject);
                
                    // Initialize lesson if not exists
                    if (!subjectMap[CurrentLessonname]) {
                        subjectMap[CurrentLessonname] = "";
                    }
                
                    // Convert topic list to array safely
                    const topicList = subjectMap[CurrentLessonname]
                        ? subjectMap[CurrentLessonname].split(',').map(t => t.trim())
                        : [];
                
                    // Remove current topic
                    console.log(CurrentTopic);
                    const updatedTopicList = topicList.filter(topic => topic !== CurrentTopic);
                    // const 
                    console.log(updatedTopicList);  
                
                    // Update the map
                    subjectMap[CurrentLessonname] = updatedTopicList.join(',');
                    console.log(subjectMap[CurrentLessonname], date);
                    

                
                    // Show loading
                    loadingPopup.style.display = "block";
                
                    // Update Firebase
                    await UpdateTopics(
                        collegeName,
                        branchName,
                        StudentId,
                        CurrentSubject,
                        CurrentLessonname,
                        subjectMap[CurrentLessonname],
                        date
                    );
                    let Completed = await getCompletedRevision(collegeName, branchName, StudentId, date, CurrentSubject, CurrentLessonname);
                    // if (Completed !== "")
                    console.log(Completed);
                    Completed = Completed + ',' + CurrentTopic;
                    console.log(Completed);
                    
                    await addCompleteRevisiomToStudent(collegeName,
                        branchName,
                        StudentId,
                        CurrentSubject,
                        CurrentLessonname,
                        Completed,
                        date);
                
                    // Hide popups and UI elements
                    loadingPopup.style.display = "none";
                    popup2.style.display = "none";
                    divToRemove.style.display = "none";
                });
                
                
                
                
            } catch (error) {
                console.error("Error fetching questions:", error);
            } finally {
                loadingPopup.style.display = "none";
            }
        } else {
            nextPage();
        }
    });
    

    // Initial setup
    // splitContentIntoPages();
    // displayPage();

    function ShowAllTopics(AllTopics) {
        mainDiv.innerHTML = "";
        mainDiv.innerHTML = `<h2></>Select the topic you want to read</h2>`

        for (const [key, value] of AllTopics) {
            
            const innerdiv = document.createElement("div");
            innerdiv.id = "innerDiv";
            const h3 = document.createElement("h3");
            const hr = document.createElement("hr");
            const p = document.createElement("p");
            p.textContent = "Click To get the topics.";
            h3.textContent = key;
            innerdiv.appendChild(h3);
            innerdiv.appendChild(hr);
            innerdiv.appendChild(p);
            mainDiv.appendChild(innerdiv);
            CurrentSubject = key;

            innerdiv.addEventListener("click", function(){
                popup.style.display = "block";
                overlay.style.display = "block";
                innerpopup.innerHTML = "";
                for ( const lesson of Object.keys(value) )
                {
                    const LessonViseDiv = document.createElement("div");
                    LessonViseDiv.id = "LessonViseDiv"
                    const h4 = document.createElement("h4");
                    h4.id = "lessonName"
                    h4.textContent = lesson;
                    const hrInLessonViseDiv = document.createElement("hr");
                    
                    
                    LessonViseDiv.appendChild(h4);
                    LessonViseDiv.appendChild(hrInLessonViseDiv);
                    innerpopup.appendChild(LessonViseDiv);
                    let topics = value[lesson].split(",");

                    
                    showTopics(topics, key, lesson);

                    console.log(topics);
                }
            })


        }
        
    }

    Readingcancle.addEventListener("click", function(){
        currentPage = 0;
        popup2.style.display = "none";
    })


    date = getFullDate();

    function showTopics(topics, key, lesson) {

        for (const topic of topics) {
            if ( topic == "" ) 
                continue;

            const Topicdiv = document.createElement("div");
            Topicdiv.id = "topicDiv"
            const p = document.createElement("p");
            p.id = "topic";
            p.textContent = topic;
            Topicdiv.appendChild(p);
            LessonViseDiv.appendChild(Topicdiv);
            
            Topicdiv.addEventListener("click",  async function(){
                loadingPopup.style.display = "block";
                divToRemove = Topicdiv;
                CurrentTopic = p.textContent;
                console.log(CurrentTopic);
                CurrentLessonname = document.getElementById("lessonName").textContent;
                console.log(CurrentLessonname);
                const notes = await getNotes(" give a note on " + topic + " in " + key + " subject");
                loadingPopup.style.display = "none";
                popup2.style.display = "block";
                document.getElementById("popup2Heading").textContent = topic;
                // const hrInLessonViseDiv = document.createElement("hr");
                topicContent = formatMarkdownToHTML(notes);
                // popup2.appendChild(hrInLessonViseDiv);
                // popup2.appendChild(noteDiv);
                splitContentIntoPages();
                displayPage();
            })
    

        }

        

    }


    await loadTadaysTopics(collegeName, branchName, StudentId, date);
    showTopicsToRevision();
