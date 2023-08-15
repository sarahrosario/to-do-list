function crossOff(index) {
    const label = document.querySelector(`label[for="task${index}"]`);
    // if textDecoration already set to ine-through, returns none, if hasn't set , then set to line-through
    label.style.textDecoration = label.style.textDecoration === 'line-through' ? 'none' : 'line-through';
    const parent = label.parentElement;
    const checkBox = document.getElementById(`task${index}`);
    // detect if checkbox is checked
    if (checkBox.checked) {
        // change bg color to purple
        parent.classList.add("highlight") ;
    }else{
        //remove class highlight , change back to white bg
        parent.classList.remove("highlight") ;
    }
  
}