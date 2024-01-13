// Select the button
let button = document.getElementById("button");

// Function to switch CSS
function switchCSS() {
   let styles = document.getElementById("styles");
   console.log(styles.href)
   // If the current stylesheet is the reset CSS, switch back to the original CSS
   if (styles.href == "https://ali-h-anjum.github.io/Tribute_Page/reset.css") {
    
    styles.href = "css_styles.css";
    button.innerText = "Let's see what this webpage would look like without him";
   } 
   // Otherwise, switch to the reset CSS
   else {
       styles.href = "reset.css";
       button.innerText = "Ahhhh go back";
   }
}

// Add an onclick event listener to the button
button.onclick = switchCSS;
