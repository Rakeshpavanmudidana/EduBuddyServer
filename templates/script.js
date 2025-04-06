// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, query } from "firebase/database";
import { ref, get, child , onValue, set} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
// import { formatMarkdownToHTML  } from "./ChatBotscript";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAEYRe6z2Zovdd6joWoUnsjvOzHyX-7JNQ",
  authDomain: "edubuddy-3013d.firebaseapp.com",
  databaseURL: "https://edubuddy-3013d-default-rtdb.firebaseio.com",
  projectId: "edubuddy-3013d",
  storageBucket: "edubuddy-3013d.firebasestorage.app",
  messagingSenderId: "321353809164",
  appId: "1:321353809164:web:9719009ed105a528dfdd29",
  measurementId: "G-PJR8FR1C0Q",
  databaseURL:"https://edubuddy-3013d-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export function getBranchNames(collegeName) {
    return new Promise((resolve, reject) => {
        const DatabaseRef = ref(database, `College/${collegeName}/Branches`);

        onValue(DatabaseRef, (snapshot) => {
            if (snapshot.exists()) {
                const Branches = snapshot.val();
                const BranchNames = Object.keys(Branches); // Ensure it's an array
                resolve(BranchNames);
            } else {
                resolve([]); // Return an empty array instead of rejecting
            }
        }, (error) => {
            reject(error); // Handle Firebase errors
        });
    });
}

export function getSubjectNames(branchName, collegeName) {
    return new Promise((resolve, reject) => {
        const DatabaseRef = ref(database, `College/${collegeName}/Branches/${branchName}/Syllbus`);

        onValue(DatabaseRef, (snapshot) => {
            if (snapshot.exists()) {                
                const Subjects = snapshot.val();                
                const SubjectNames = Object.keys(Subjects); // Ensure it's an array
                resolve(SubjectNames);
            } else {
                resolve([]); // Return an empty array instead of rejecting
            }
        }, (error) => {
            reject(error); // Handle Firebase errors
        });
    });
    }


    export function addSubjects(data, collegeName, teacherName) {
        if (typeof data !== "object" || data === null) {
            console.error("Invalid data format:", data);
            return;
        }
    
        set(ref(database, `College/${collegeName}/Teachers/${teacherName}/Subjects`), Object.assign({}, data))
            .then(() => console.log("Data saved successfully"))
            .catch(error => console.error("Error saving data:", error));
    }
    
    async function checkIfSubjectExists(path) {
        const db = getDatabase();
        const nodeRef = ref(db, path);

        try {
            const snapshot = await get(nodeRef);
            if (snapshot.exists()) {
                console.log("Node exists:", snapshot.val());
                return true; // The node exists
            } else {
                console.log("Node does not exist.");
                return false; // The node does not exist
            }
        } catch (error) {
            console.error("Error checking node:", error);
            return false;
        }
    }


    


    async function getTeachersSubjects(collegeName, teacherName) {
        const nodeRef = ref(database, `College/${collegeName}/Teachers/${teacherName}/Subjects`);
    
        try {
            const snapshot = await get(nodeRef);
            if (snapshot.exists()) {
                const jsonData = snapshot.val(); // Get JSON data
                console.log("JSON Data:", jsonData);
    
                // Convert JSON to Map
                const dataMap = new Map(Object.entries(jsonData));
                console.log("Converted Map:", dataMap);
    
                return dataMap;
            } else {
                console.log("No data found at path:", path);
                return new Map(); // Return an empty Map if no data exists
            }
        } catch (error) {
            console.error("Error retrieving data:", error);
            return new Map();
        }
    }


 

async function getSyllbus(branchName, subjectName) {
    console.log(branchName, subjectName);
    const database = getDatabase();
    const nodeRef = ref(database, `College/Viit/Branches/${branchName}/Syllbus/${subjectName}`);
    

    try {
        const snapshot = await get(nodeRef);
        if (snapshot.exists()) {
            const jsonData = snapshot.val(); // Get JSON data
            console.log("JSON Data: "+ branchName, jsonData);

            // Convert JSON to Map
            const dataMap = new Map(Object.entries(jsonData));
            console.log(dataMap);
            return dataMap;
        } else {
            console.log("No data found at path:", nodeRef.toString()); // Fix undefined path issue
            return ""; // Return empty string instead of an empty Map
        }
    } catch (error) {
        console.error("Error retrieving data:", error);
        return "";
    }
}


async function addRemainingSyllabus(lessonTopicMap, branchName, subjectName) {
    for (const [lesson, topics] of lessonTopicMap) {
        const nodeRef = ref(database, `College/Viit/Branches/${branchName}/Syllbus/${subjectName}/${lesson}`);
        await set(nodeRef, topics);
    }
}

async function addCompleteSyllabus(lesson, topics, branchName, subjectName, FullDate) {
    const nodeRef = ref(database, `College/Viit/Branches/${branchName}/CompleteSyllabus/${subjectName}/${FullDate}/${lesson}`);
    await set(nodeRef, topics);
} 



async function getDataFromFirebase(path) {
    return new Promise((resolve, reject) => {
        const DatabaseRef = ref(database, path);

        onValue(DatabaseRef, (snapshot) => {
            if (snapshot.exists()) {                
                const data = snapshot.val();
                console.log(data); // Debugging: check structure
                resolve(data); // Directly return as an object (dictionary)
            } else {
                resolve({}); // Return an empty object if no data exists
            }
        }, (error) => {
            reject(error); // Handle Firebase errors
        });
    });
}



    async function searchDayInTimeTable(day, subject, branch) {
        return new Promise((resolve, reject) => {
            const nodeRef = ref(database, `College/Viit/Branches/${branch}/TimeTable/${day}`);
            
            onValue(nodeRef, (snapshot) => {
                if (snapshot.exists()) {
                    resolve(snapshot.val()); // ✅ Return the retrieved data
                } else {
                    resolve(null); // ✅ Return null if no data exists
                }
            }, (error) => {
                reject(error); // Handle Firebase errors
            });
        });
    }



    
    async function checkUser(collegeName, username, password) {
        try {
            const nodeRef = ref(database, `College/${collegeName}/Teachers/${username}`);
            const snapshot = await get(nodeRef);
    
            if (snapshot.exists()) {
                const userData = snapshot.val(); 
                console.log("User Data:", userData);
    
                if (userData.password) {
                    return userData.password === password;
                } else {
                    console.error("Password field missing in database");
                    return false;
                }
            } else {
                console.log("User not found");
                return false;
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            return false;
        }
    }

    

    async function getComputedSyllabus(collegeName, branchName) {

        try {
            const nodeRef = ref(database, `College/${collegeName}/Branches/${branchName}/CompleteSyllabus`);
            const snapshot = await get(nodeRef);
            
            if (snapshot.exists()) {
                const jsonData = snapshot.val(); // Get JSON data
                console.log("JSON Data: "+ branchName, jsonData);
    
                // Convert JSON to Map
                const dataMap = new Map(Object.entries(jsonData));
                console.log(dataMap);
                return dataMap;
            } else {
                console.log("No data found at path:", nodeRef.toString()); // Fix undefined path issue
                return ""; // Return empty string instead of an empty Map
            }
        } catch (error) {
            console.error("Error retrieving data:", error);
            return "";
        }
    }
    
    async function addCompleteSyllabusToStudent(key, value, branchName, collegeName, StudentId) {
        const nodeRef = ref(database, `College/${collegeName}/Branches/${branchName}/Students/${StudentId}/SyllabusToComplete/${key}`);

        await set(nodeRef, value);
    }

    async function UpdateTopics(collegeName, branchName, StudentId, CurrentSubject, CurrentLessonname, Topic, date) {
        const nodeRef = ref(database, `College/${collegeName}/Branches/${branchName}/Students/${StudentId}/SyllabusToComplete/${date}/${CurrentSubject}/${CurrentLessonname}`);

        await set(nodeRef, Topic);
    }

    async function getCompletedRevision(collegeName, branchName, StudentId, date, CurrentSubject, CurrentLessonname) {

        try {
            const nodeRef = ref(database, `College/${collegeName}/Branches/${branchName}/Students/${StudentId}/CompletedSyllabus/${date}/${CurrentSubject}/${CurrentLessonname}`);
            const snapshot = await get(nodeRef);
            
            if (snapshot.exists()) {
                const jsonData = snapshot.val(); // Get JSON data    
                return String(jsonData);
            } else {                
                console.log("No data found at path:", nodeRef.toString()); // Fix undefined path issue
                return ""; // Return empty string instead of an empty Map
            }            
        } catch (error) {
            console.error("Error retrieving data:", error);
            return "";      
        }
    }

    async function getTodaysTopics(collegeName, branchName, StudentId, FullDate) {

        try {
            const nodeRef = ref(database, `College/${collegeName}/Branches/${branchName}/Students/${StudentId}/SyllabusToComplete/${FullDate}`);
            const snapshot = await get(nodeRef);
            
            if (snapshot.exists()) {
                const jsonData = snapshot.val(); // Get JSON data
                console.log("JSON Data: "+ branchName, jsonData);
    
                // Convert JSON to Map
                const dataMap = new Map(Object.entries(jsonData));  
                console.log(dataMap);    
                return dataMap;
            } else {                
                console.log("No data found at path:", nodeRef.toString()); // Fix undefined path issue
                return ""; // Return empty string instead of an empty Map
            }            
        } catch (error) {
            console.error("Error retrieving data:", error);
            return "";
        }

    }


    async function getNotes(prompt){
        try {
                const response = await fetch("http://127.0.0.1:5000/generate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ message: prompt })
                });
        
                const data = await response.json();
                if (data.response) {
                    // const formatted = formatMarkdownToHTML(data.response);
                    return data.response;
                } else {
                    return "Something went wrong.";
                }
            } catch (error) {
                return "Oops! Error occurred.";
            }
    }

    async function addCompleteRevisiomToStudent(collegeName,
        branchName,
        StudentId,
        CurrentSubject,
        CurrentLessonname,
        Completed,
        date) {

            const nodeRef = ref(database, `College/${collegeName}/Branches/${branchName}/Students/${StudentId}/CompletedSyllabus/${date}/${CurrentSubject}/${CurrentLessonname}`);
            const snapshot = await get(nodeRef);
            
            if (snapshot.exists()) {
                const jsonData = snapshot.val(); // Get JSON data
                console.log("JSON Data: "+ branchName, jsonData);
                  
                
            } else {                
                console.log("No data found at path:", nodeRef.toString()); // Fix undefined path issue
                // return ""; // Return empty string instead of an empty Map
            }      
            await set(nodeRef, Completed);
                
        }

            


    
    



















    export { checkIfSubjectExists, getTeachersSubjects, getSyllbus, getDataFromFirebase, searchDayInTimeTable, 
        addRemainingSyllabus, addCompleteSyllabus, checkUser, getComputedSyllabus, addCompleteSyllabusToStudent,
        getTodaysTopics, getNotes, UpdateTopics, getCompletedRevision, addCompleteRevisiomToStudent};    