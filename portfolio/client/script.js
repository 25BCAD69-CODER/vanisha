// Show welcome message when page loads
window.onload = function () {
    alert("Welcome to Vanisha's Resume!");
};

// Highlight skills when clicked
const skills = document.querySelectorAll("ul li");

skills.forEach(skill => {
    skill.addEventListener("click", () => {
        alert("You clicked on skill: " + skill.innerText);
    });
});

// Change background color button
function changeBackground() {
    document.body.style.background = 
        "linear-gradient(to right, #ff9a9e, #fad0c4)";
}