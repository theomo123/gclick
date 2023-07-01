const searchParams = new URLSearchParams(window.location.search);

if (searchParams.has("gclicksetup")) {

    console.log('in glick mode');

    // //disable all anchors
    // const anchors = document.getElementsByTagName('a');

    // for (let anchor of anchors) {
    //     anchor.href="#";
    // }

    const colours = ['#d90000c7', '#d95c00c7', '#d4d900c7'];

    var sheet = window.document.styleSheets[0];
    sheet.insertRule('.glickHighlight {background: #d90000c7 !important;}', sheet.cssRules.length);
    
    //detect clicks
    document.addEventListener('click', function (event) {
        
        let glicksNumber = event.target.getAttribute('glickClicks') ? event.target.getAttribute('glickClicks') : 0;
        glicksNumber++;
        event.target.setAttribute('glickClicks', glicksNumber);

        //double click mechanism
        if (event.target.getAttribute('glickClicks') == 4) {

            //remove highlight
            event.target.classList.remove("glickHighlight");
            event.target.setAttribute('glickClicks', '0');

        } else if (event.target.getAttribute('glickClicks') == 2) {

            //add highlight
            event.target.classList.add("glickHighlight");

            setTimeout(function(){

                let currentConfig = localStorage.getItem('gclickConfig') ? localStorage.getItem('gclickConfig') : [];
                
                if (currentConfig.length > 0) {
                    currentConfig = JSON.parse(currentConfig);
                }

                const eventName = window.prompt("event name");

                if (eventName) {
                    currentConfig.push({"tag": event.target.tagName, "text" : event.target.innerText.toLowerCase(), "event" : eventName});
                    localStorage.setItem("gclickConfig", JSON.stringify(currentConfig));
                }

                // console.log(eventName);


            },1000);
            

        }

        // Don't follow the link
        event.preventDefault();
        return false;
    
        // Log the clicked element in the console
        // console.log(event.target);
    
    }, false);

} else if (localStorage.getItem('gclickConfig')) {

    let currentConfig = JSON.parse(localStorage.getItem('gclickConfig'));

    document.addEventListener('click', function (event) {

        console.log(event.target);

        const clickedText = event.target.innerText;
        const clickedTag = event.target.tagName;
        
        for (let trigger of currentConfig) {

            console.log(clickedText, trigger.text);

            if (clickedText.toLowerCase().includes(trigger.text)) {
                gtag('event', trigger.event);
            }
            
        }

        event.preventDefault();
        return false;

    });


}
