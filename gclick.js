window.addEventListener('load', function () {

    const searchParams = new URLSearchParams(window.location.search);

    function findMatches(classes, id, tag, text) {

        console.log("finding");

        let idMatches = [];

        if (id) {
            idMatches = document.querySelectorAll("#"+id);
        }

        const classesMatches = document.querySelectorAll(tag+'[class*="'+classes+'"]');
        const classesWithText = Array.from(classesMatches).find(el => el.innerText === text);
        const tagWithText = Array.from(document.querySelectorAll(tag)).find(el => el.innerText === text);

        // console.log(idMatches, classesMatches, classesWithText, tagWithText);

        if (idMatches.length == 1) {
            // console.log("id match", idMatches[0]);
            return idMatches[0];
        }

        if (classesMatches.length == 1) {
            // console.log("class match", classesMatches[0]);
            return classesMatches[0];
        }

        if (classesWithText) {
            // console.log("class with text match", classesWithText);
            return classesWithText;
        }

        if (tagWithText) {
            // console.log("tag with text match", tagWithText);
            return tagWithText;
        }

    }

    function stringToHash(string) {
             
        let hash = 0;
         
        if (string.length == 0) return hash;
         
        for (i = 0; i < string.length; i++) {
            char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
         
        return hash;
    }

    const localKey = "gclickEvents-"+stringToHash(window.location.href.split('?')[0]);

    if (searchParams.has("gclicksetup")) {

            console.log('in gclick mode');

            window.document.body.insertAdjacentHTML('afterbegin', `<div class="gclick-event-box">
                        <div class="gclick-event-box-inner">
                            <div class="gclick-event-box-top">
                                <div class="glick-event-box-title">Create Event</div>
                                <span class="close-gclick-modal"></span>
                            </div>
                            <div class="gclick-event-box-bottom">
                                <div class="glick-event-input-container">
                                    <input type="text" placeholder="event_name" class="gclick-event-name">
                                    <div class="gclick-add-parameter">Add Event Parameter</div>
                                </div>
                                <div class="gclick-save-event">Save Event</div>
                            </div>
                        </div>
                        </div>`);

            window.document.body.insertAdjacentHTML('afterbegin', `<div class="gclick-setup-modal">
                <div class="gclick-setup-modal-top"><span class="gclick-setup-modal-title">GA4 Easy Events</span> <span class="gclick-finish-setup">Finish setup</span></div>
                <div class="gclick-setup-modal-menu"><div class="gclicks-events-on-page">Events on this page</div></div>
                <div class="gclick-setup-modal-events-on-page">No events found on this page</div>
                <div class="gclick-setup-modal-footer">Give feedback</div>
                <div class="gclick-loading-container"><span class="gclick-loader"></span></div>
                <div class="gclick-success-overlay"><span class="gclick-success-check"></span><div class="gclick-success-text">Setup complete, redirecting in <span class="glick-countdown">3</span>...</div></div>
            </div>`);

            // //disable all anchors
            // const anchors = document.getElementsByTagName('a');

            // for (let anchor of anchors) {
            //     anchor.href="#";
            // }

            const colours = ['#d90000c7', '#d95c00c7', '#d4d900c7'];

            var sheet = window.document.styleSheets[0];
            // sheet.insertRule('.gclickHighlight {position:relative;}', sheet.cssRules.length);

            document.getElementsByTagName('head')[0].insertAdjacentHTML(
                'beforeend',
                '<link rel="stylesheet" href="https://wordpress-629161-3719510.cloudwaysapps.com/wp-content/gclick/gclick.css" />');

            function isDescendant(parent, child) {
                var node = child.parentNode;
                while (node != null) {
                    if (node == parent) {
                        return true;
                    }
                    node = node.parentNode;
                }
                return false;
            }

            function isGClickSetupBox(element) {

                if (element.closest(".gclick-event-box") || element.closest(".gclick-setup-modal")) {
                    return true;
                }

            }

            function addEventParameter() {

                const html = `<div class="glick-event-input-container glick-parameter-container glick-half">
                                <input type="text" placeholder="parameter_name" class="gclick-parameter-name">
                                <input type="text" placeholder="parameter_value" class="gclick-parameter-value">
                                <span class="gclick-remove-parameter"></span>
                            </div>`;

                console.log(document.querySelectorAll('.gclick-save-event')[0]);
                
                document.querySelectorAll('.gclick-save-event')[0].insertAdjacentHTML('beforebegin', html);
            
            }

            function refreshSetupModal() {
                const events = localStorage.getItem(localKey) ? JSON.parse(localStorage.getItem(localKey)) : [];

                if (events.length > 0) {
                    document.querySelectorAll('.gclick-setup-modal-events-on-page')[0].innerHTML = '';
                }

                for (const [key, value] of Object.entries(events)) {

                    let parameterHTML = '';

                    for (const [paramKey, paramValue] of Object.entries(value.parameters)) {
                        const parameter_name = paramValue.parameter_name;
                        const parameter_value = paramValue.parameter_value;
                        parameterHTML += '<div class="gclick-setup-item-param-name">'+parameter_name+'</div>';
                        parameterHTML += '<div class="gclick-setup-item-param-value">'+parameter_value+'</div>';
                    }

                    const html = `<div class="glick-setup-event-item-wrap"><div class="gclick-setup-event-item">
                        <div class="gclick-setup-item-event-name">`+value.event_name+` <span>`+value.parameters.length+` Parameters</span></div>
                        <div class="gclick-setup-item-data">
                            <div class="gclick-setup-item-parameters">
                                <div class="gclick-setup-item-parameters-title">Parameter Name</div>
                                <div class="gclick-setup-item-parameters-title">Parameter Value</div>
                                `+parameterHTML+`
                                <div class="glick-setup-item-all-data">`+JSON.stringify(value)+`</div>
                            </div>
                        </div>
                    </div><div class="delete-events-on-page"></div></div>`;
                    
                    document.querySelectorAll('.gclick-setup-modal-events-on-page')[0].insertAdjacentHTML('beforeend', html);

                    console.log(value);
                }

            }

            refreshSetupModal();

            function gclickSaveEvent() {

                let errors = false;

                document.querySelectorAll('.gclick-event-box input').forEach((element) => {

                    element.classList.remove('glick-input-error');

                    const inputValue = element.value;

                    if (inputValue.length == 0) {
                       element.classList.add('glick-input-error');
                       errors = true;
                    }

                });

                if (errors) {
                    return false;
                }

                //build the event
                const eventName = document.querySelectorAll('.gclick-event-name')[0].value;
                const targetElementClasses = document.querySelectorAll('.gclick-event-box')[0].getAttribute("gclick-classlist");
                const targetElementID = document.querySelectorAll('.gclick-event-box')[0].getAttribute("gclick-id");
                const targetElementTag = document.querySelectorAll('.gclick-event-box')[0].getAttribute("gclick-tag");
                const targetElementText = document.querySelectorAll('.gclick-event-box')[0].getAttribute("gclick-text")

                console.log(targetElementClasses, targetElementID, targetElementTag);

                let events = localStorage.getItem(localKey) ? JSON.parse(localStorage.getItem(localKey)) : [];
                let eventTemp = [];

                document.querySelectorAll('.glick-parameter-container').forEach((element) => {

                    const parameterName = element.querySelectorAll('.gclick-parameter-name')[0].value;
                    const parameterValue = element.querySelectorAll('.gclick-parameter-value')[0].value;

                    eventTemp.push({parameter_name : parameterName, parameter_value: parameterValue});

                });

                if (JSON.stringify(events).includes(eventName)) {

                    for (const [key, value] of Object.entries(events)) {

                        if (value.event_name == eventName) {
                            events[key] = {
                                event_name : eventName,
                                parameters : eventTemp,
                                target_tag: targetElementTag,
                                target_classes: targetElementClasses,
                                target_id: targetElementID,
                                target_text: targetElementText
                            };
                        }
    
                    }

                } else {

                    events.push({
                        event_name : eventName,
                        parameters : eventTemp,
                        target_tag: targetElementTag,
                        target_classes: targetElementClasses,
                        target_id: targetElementID,
                        target_text: targetElementText
                    });

                }

                localStorage.setItem(localKey, JSON.stringify(events));

                closeGClickModal();
                refreshSetupModal();

                // localStorage.setItem(localKey, JSON.stringify(events));
                
                // alert('leggo');


            }

            function loading() {
                document.querySelectorAll('.gclick-setup-modal')[0].classList.add('loading');
            }

            function stopLoading() {
                document.querySelectorAll('.gclick-setup-modal')[0].classList.remove('loading');
            }

            function initiateRedirect() {
                console.log("initiate");
                document.querySelectorAll('.gclick-setup-modal')[0].classList.add('gclick-completed');

                var timeLeft = 3;
                var glickCountdown = setInterval(function(){
                    if (timeLeft <= 0) {
                        clearInterval(glickCountdown);
                        window.location.href = window.location.href.split('?')[0];
                        return false;
                    }
                    timeLeft--;
                    document.querySelectorAll('.glick-countdown')[0].innerText = timeLeft;
                },1000);
                
            }

            function finishSetup() {

                loading();
                
                var xhr = new XMLHttpRequest();
                var url = "https://phpstack-629161-3741258.cloudwaysapps.com/save-events.php";
                xhr.open("POST", url, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        console.log(xhr.responseText);
                        if (xhr.responseText == 'success') {
                            initiateRedirect();
                        }
                    } else if (xhr.readyState === 4 && xhr.status !== 200) {
                        alert('Something went wrong, please try again or contact support.');
                    }
                    stopLoading();
                };

                let events = localStorage.getItem(localKey) ? JSON.parse(localStorage.getItem(localKey)) : [];
                var data = JSON.stringify({
                    url: window.location.href.split('?')[0],
                    events: events
                });
                xhr.send(data);

            }

            function closeGClickModal() {
                
                document.querySelectorAll('.gclick-event-box')[0].classList.remove('show');

                document.querySelectorAll('.gclickHighlight').forEach((element) => {
                    element.classList.remove('gclickHighlight');
                });

                document.querySelectorAll('.gclick-event-box input').forEach((element) => {
                    element.value = '';
                });
                
            }

            

            function clickSetupModalItem(element) {

                const parentItem = element.closest('.gclick-setup-event-item');

                if (parentItem.classList.contains('show')) {
                    parentItem.classList.remove('show');
                } else {
                    parentItem.classList.add('show');
                }

                //lets scroll the element into view
                const itemData = JSON.parse(parentItem.querySelectorAll('.glick-setup-item-all-data')[0].innerHTML);

                const target_classes = itemData.target_classes;
                const target_id = itemData.target_id;
                const target_tag = itemData.target_tag;
                const target_text = itemData.target_text;

                console.log(itemData);

                //try for an id
                const matchingElements = findMatches(target_classes, target_id, target_tag, target_text);
                console.log(matchingElements);
                
            }

            function deleteEvent(element) {

                const eventItem = element.closest('.glick-setup-event-item-wrap');
                const eventData = eventItem.querySelectorAll('.glick-setup-item-all-data')[0].innerText;

                if (confirm("Delete "+JSON.parse(eventData).event_name+"?") == true) {
                    
                    let events = localStorage.getItem(localKey) ? JSON.parse(localStorage.getItem(localKey)) : [];

                    console.log(events);

                    for (const [key, value] of Object.entries(events)) {

                        // let parameterHTML = '';

                        // for (const [paramKey, paramValue] of Object.entries(value.parameters)) {
                        //     const parameter_name = paramValue.parameter_name;
                        //     const parameter_value = paramValue.parameter_value;
                        //     parameterHTML += '<div class="gclick-setup-item-param-name">'+parameter_name+'</div>';
                        //     parameterHTML += '<div class="gclick-setup-item-param-value">'+parameter_value+'</div>';
                        // }

                        const thisEventData = JSON.stringify(value);

                        if (thisEventData == eventData) {

                            delete events[key];
                            events = events.filter(val => val);
                            localStorage.setItem(localKey, JSON.stringify(events));
                            refreshSetupModal();

                        }

                    }


                }

            }


            document.addEventListener("click", function(e){

                const closeModal = e.target.closest(".close-gclick-modal");
                const addEventParameterButton = e.target.closest(".gclick-add-parameter"); 
                const removeParameterButton = e.target.closest(".gclick-remove-parameter");
                const saveEventButton = e.target.closest(".gclick-save-event");
                const finishSetupButton = e.target.closest(".gclick-finish-setup");
                const setupModalitem = e.target.closest(".gclick-setup-event-item");
                const deleteEventButton = e.target.closest(".delete-events-on-page");
                
            
                if (closeModal) {
                    closeGClickModal();
                }

                if (addEventParameterButton) {
                    addEventParameter();
                }

                if (removeParameterButton) {
                    e.target.closest('.glick-parameter-container').remove();
                }

                if (saveEventButton) {
                    gclickSaveEvent();
                }

                if (finishSetupButton) {
                    finishSetup();
                }

                if (setupModalitem) {
                    clickSetupModalItem(e.target);
                }

                if (deleteEventButton) {
                    deleteEvent(e.target);
                }

            })

            //detect clicks
            document.addEventListener('mouseover', function (event) {

                if (isGClickSetupBox(event.target)) {
                    return false;
                }
            
                event.target.classList.add("gclickHover");
            
            }, false);

            //detect clicks
            document.addEventListener('mouseout', function (event) {
            
                event.target.classList.remove("gclickHover");
            
            }, false);

            //detect clicks
            document.addEventListener('click', function (event) {

                if (isGClickSetupBox(event.target)) {
                    return false;
                }
                
                let gclicksNumber = event.target.getAttribute('gclickClicks') ? event.target.getAttribute('gclickClicks') : 0;
                gclicksNumber++;
                event.target.setAttribute('gclickClicks', gclicksNumber);

                //double click mechanism
                if (event.target.getAttribute('gclickClicks') == 4) {

                    //remove highlight
                    event.target.classList.remove("gclickHighlight");
                    event.target.setAttribute('gclickClicks', '0');

                } else if (event.target.getAttribute('gclickClicks') == 2) {

                    //add highlight
                    event.target.classList.add("gclickHighlight");
                    const gClickEventbox =  document.querySelectorAll('.gclick-event-box')[0];
                    gClickEventbox.classList.add('show');

                    let gclickElementClasslist = String(event.target.classList);
                    gclickElementClasslist = gclickElementClasslist.replace('gclickHover', '');
                    gclickElementClasslist = gclickElementClasslist.replace('gclickHighlight', '');

                    gClickEventbox.setAttribute("gclick-classlist", gclickElementClasslist.trimEnd());
                    gClickEventbox.setAttribute("gclick-id", event.target.id);
                    gClickEventbox.setAttribute("gclick-tag", event.target.tagName);
                    gClickEventbox.setAttribute("gclick-text", event.target.innerText);

                    // setTimeout(function(){

                        // let currentConfig = localStorage.getItem('gclickConfig') ? localStorage.getItem('gclickConfig') : [];
                        
                        // if (currentConfig.length > 0) {
                        //     currentConfig = JSON.parse(currentConfig);
                        // }
                        

                        // const eventName = window.prompt("event name");

                        // if (eventName) {
                        //     currentConfig.push({"tag": event.target.tagName, "text" : event.target.innerText.toLowerCase(), "event" : eventName});
                        //     localStorage.setItem("gclickConfig", JSON.stringify(currentConfig));
                        // }

                        // console.log(eventName);


                    // },100);
                    

                }

                // Don't follow the link
                event.preventDefault();
                return false;
            
                // Log the clicked element in the console
                // console.log(event.target);
            
            }, false);

            // Make the DIV element draggable:
            dragElement(document.querySelectorAll('.gclick-setup-modal')[0]);

            function dragElement(elmnt) {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            if (document.getElementById(elmnt.id + "header")) {
                // if present, the header is where you move the DIV from:
                document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
            } else {
                // otherwise, move the DIV from anywhere inside the DIV:
                elmnt.onmousedown = dragMouseDown;
            }

            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            }

            function closeDragElement() {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
            }

        } else if (localStorage.getItem(localKey)) {

            async function loadconfig() {

                //load the config
                // var xhr = new XMLHttpRequest();
                // var url = "https://phpstack-629161-3741258.cloudwaysapps.com/serve-config.php";
                // xhr.open("POST", url, true);
                // xhr.setRequestHeader("Content-Type", "application/json");
                // xhr.onreadystatechange = function () {
                //     console.log(xhr);
                //     if (xhr.readyState === 4 && xhr.status === 200) {
                //         console.log(xhr.responseText);
                //         return xhr.responseText;
                //     } else if (xhr.readyState === 4 && xhr.status !== 200) {
                //         alert('Something went wrong, please try again or contact support.');
                //     }
                // };

                // var data = JSON.stringify({
                //     url: window.location.href.split('?')[0]
                // });
                // xhr.send(data);
                
                 var data = JSON.stringify({
                    url: window.location.href.split('?')[0]
                });

                const response = await fetch('https://phpstack-629161-3741258.cloudwaysapps.com/serve-config.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'}, // this line is important, if this content-type is not set it wont work
                    body: data
                });

                const config = await response.json();
                return config;

            }

            async function assignClickEventsFromConfig() {

                try {

                    let gclickEvents = await loadconfig();

                    console.log("config loaded", gclickEvents);

                    if (gclickEvents.length > 0) {

                        for (let event of gclickEvents) {

                            const targetOnPage = await findMatches(event.target_classes, event.target_id, event.target_tag, event.target_text);

                            console.log(Object.entries(event.parameters));

                            let params = [];
                            let paramsObj = {};

                            for (const [paramKey, paramValue] of Object.entries(event.parameters)) {
                                const parameter_name = paramValue.parameter_name;
                                const parameter_value = paramValue.parameter_value;
                                params.push({[parameter_name] : parameter_value})
                            }

                            for(let i = 0; i < params.length; i++ ) {
                                Object.assign(paramsObj, params[i]);
                            }

                            targetOnPage.addEventListener('click', function (e) {
                                console.log('target clicked, firing event', event.event_name);
                                gtag('event', event.event_name, paramsObj);
                            });

                            
                            
                        }
                        
                    }

                } catch (err) {
                    console.log(err);
                }

            }

            assignClickEventsFromConfig();
            

    }

});