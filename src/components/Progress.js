import React, { useEffect, useState } from 'react';
import './Progress.css';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import db from '../firebase';


function Progress() {

    const user = useSelector(selectUser);
    let [weeklyArray, setWeeklyArray] = useState([]);

    // TODO:
    // Fix bug of goal progress not updating
    useEffect(() => {

        var docRef = db.collection("users").doc(user.email);

        // Get live updates of user's document using onSnapshot
        docRef.onSnapshot(function(doc) {
            // If the document exists
            if (doc.exists) {
                let document = doc.data();

                var options = {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

                let today = new Date();
                today.setDate(today.getDate() + 1);
                let todaysDate = today.toLocaleTimeString('en-us', options);
                let dayArray = todaysDate.split(",");
        
                while (dayArray[0] !== "Sunday") {
                    today.setDate(today.getDate() + 1);
                    todaysDate = today.toLocaleTimeString('en-us', options);
                    dayArray = todaysDate.split(",");
                }
        
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);

                let todayValue = today.valueOf()
                let nextSunday = new Date(todayValue);
                let nextSundayValue = nextSunday.valueOf();
                let prevSunday = new Date(nextSundayValue);
                let prevSundayDate = prevSunday.getDate();
                prevSunday.setDate(prevSundayDate - 7);

                // Loop through array, look for subject
                weeklyArray.forEach((subject, idx) => {

                    subject.time = 0;
                });

                document.calendarEvents.forEach(element => {

                    if ((element.end.toDate() < nextSunday) && (element.start.toDate() > prevSunday)) {
                        var index = -1;
                        var result = false;

                        // Loop through array, look for subject
                        weeklyArray.forEach((subject, idx) => {

                            if (element.title === subject.title) {
                                index = idx;
                                result = true;
                                return;
                            } 
                        });

                        // If the subject is already in the db
                        if (result) {
                            weeklyArray[index].time += (element.end.toDate() - element.start.toDate());

                        } else {

                            let subject = document.subjects.find(e => e.subject === element.title);

                            weeklyArray.push({ 
                                title: element.title,
                                time: (element.end.toDate() - element.start.toDate()),
                                goal: 14400000,
                                color: subject.color
                            });
                        }
                    }

                    // console.log(weeklyArray);
                });            
            } 
            // If the document does not exist
            else {
            }
        });
    }, []);

    const changeGoal = (title) => {
        // var newGoal = 36000000;

        var userInput = window.prompt("Enter a new goal in hours: ");

        userInput *= (1000 * 60 * 60);

        // Loop through array, look for subject
        weeklyArray.forEach((subject, idx) => {

            if (subject.title === title) {
                weeklyArray[idx] = {title: subject.title, time: subject.time, goal: userInput, color: subject.color};
                return;
            } 
        });
    }

    return (
        <div className="progress">
            <h1 className="progress_title">Progress</h1>
            {weeklyArray.map((subject, idx) =>
                <div key={idx} className="subject" style={{backgroundColor: subject.color}} onClick={() => changeGoal(subject.title)}>
                    <h2>{subject.title}</h2>
                    <h4>{(subject.time / (1000 * 60 * 60)) + "/" + (subject.goal / (1000 * 60 * 60)) + " hours"}</h4>
                </div>
            )}
        </div> 
    );
}

export default Progress;