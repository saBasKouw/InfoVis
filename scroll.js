$(function(){
    var state = 0;
    var maxState = 10;
    var winWidth = $(window).width();
    $(window).resize(function(){
        winWidth = $(window).width();
        $('.box,.container_element').width(winWidth-100);
    }).trigger('resize');
    $('#lefty').click(function(){
        if (state==0) {
           state = maxState;
        } else {
           state--;
        }
        $('.container_element').animate({scrollLeft:((winWidth-100)*state)+'px'}, 500);
    });
    $('#righty').click(function(){
        if (state==maxState) {
           state = 0;
        } else {
           state++;
        }
        $('.container_element').animate({scrollLeft:((winWidth-100)*state)+'px'}, 500);
    });
});

const boxes = document.getElementsByClassName("box");


//add the click listeners
$(function(){
for(let box of boxes){
    box.addEventListener("click", function(event){        
        $('#currently_displayed').fadeOut(500, function() {
        if (getValue(event) != undefined){
        console.log(`Clicked value is: ${getValue(event)}`);    
        $(this).text(getValue(event).replace(/_/g, " ")).fadeIn(500);
        }
        });
    });
   }
});


//click handler
function getValue(event){
    const value = event.target.dataset.value; //get data-value from the 'dataset'
    //console.log(`Clicked value is: ${value}`);
    return value;
}

