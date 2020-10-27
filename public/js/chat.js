const socket = io();
const messages = document.querySelector(".chat__messages")
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#message-location").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
const autoScroll = ()=>{
    const $newMessage = messages.lastElementChild;

    const $newMessageStyles = getComputedStyle($newMessage)
    const $newMessageHeight = $newMessage.offsetHeight + parseInt($newMessageStyles.marginBottom);

    const visibleHeight = messages.offsetHeight;
    const containerHeight = messages.scrollHeight
    const scrollOffset = messages.scrollTop + visibleHeight;

    if(containerHeight - $newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }

}
//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true});

socket.on("welcome_message",(m)=>{
    console.log(m)
})

//sending message 
try {
    socket.on("message",(message)=>{
    
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("h:mm a")
    });
    messages.insertAdjacentHTML("beforeend",html);
    autoScroll()
    
})
} catch (error) {
    console.log(error)
}
const $loaction = document.querySelector(".location");


$loaction.addEventListener("click",()=>{
    if(!navigator.geolocation){
        return alert("Geolocation is not supported")
    }
$loaction.setAttribute("disabled","disabled")
    //if supported
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit("send_location",{lat:position.coords.latitude,log:position.coords.longitude},(m)=>{
            
            $loaction.removeAttribute("disabled")
        })
    });

    
})





const form = document.querySelector("form");
form.addEventListener("submit",(e)=>{
    e.preventDefault();
    const input = form.querySelector("input")
    socket.emit("send_message",input.value,(e)=>{
        if(e){
         return   console.log(e)
        }

        
    });
    input.value = ""
    input.focus()
})


socket.on("locationMessage",(location)=>{
    
    messages.insertAdjacentHTML("beforeend",Mustache.render(locationTemplate,{
        url: location.url,
        createdAt:moment(location.createdAt).format("h:mm a")
    }));

    autoScroll()
})

//Client Joining Room
socket.emit("join",{username,room},(error)=>{
   if(error){
       alert(error)
       history.back()
   }

})


//Getting room data

socket.on("roomData",({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    });

    document.querySelector(".chat__sidebar").innerHTML = html


})