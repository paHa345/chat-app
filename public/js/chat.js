const socket = io()


//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML

const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options

const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })


// socket.on('countUpdated', (count)=>{
// 	console.log('The count has been updated!', count)
	
// })

// document.querySelector('#increment').addEventListener('click', ()=>{
// 	console.log('Clicked')
// 	socket.emit('increment')
// })


const autoscroll = ()=>{
	// new message element
	const $newMessage = $messages.lastElementChild

	//height of the new message
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
	
	//visible height
	const visibleHeight = $messages.offsetHeight

	//height of messages container
	const containerHeight = $messages.scrollHeight

	//how far can i scrolled
	const scrollOffset = $messages.scrollTop + visibleHeight

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight
	}

}

socket.on('message', (message)=>{

	const html = Mustache.render(messageTemplate,{
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('H:mm')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()

})

socket.on('locationMessage', (message)=>{
	console.log(message)
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('H:mm')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()
})

socket.on('roomData', ({room, users})=>{
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	})
	document.querySelector('#sidebar').innerHTML = html
})


document.querySelector('#message-form').addEventListener('submit', (e)=>{
	e.preventDefault()


	//enable

	const message = e.target.elements.message.value

	socket.emit('sendMessage', message, (error)=>{
		$messageFormButton.removeAttribute('disabled')

		//enable

		if(error){
			return console.log(error)
		}
		console.log('Message deliver')
	})
	$messageFormButton.setAttribute('disabled', 'disable')
	$messageFormInput.value = ''
	$messageFormInput.focus()
})

$sendLocationButton.addEventListener('click', ()=>{
	$sendLocationButton.setAttribute('disabled', 'disable')
	if(!navigator.geolocation){
		return alert('Geolication is not supported by your browser')
	}

	navigator.geolocation.getCurrentPosition((position)=>{
		
		socket.emit('sendLocation', {
			longitude:position.coords.longitude,
			latitude:position.coords.latitude
		}, ()=>{
			$sendLocationButton.removeAttribute('disabled')
			console.log('Location shared!')

		})
	})

})

socket.emit('join', {username, room}, (error)=>{
	if (error) {
		alert(error)
		location.href = '/'
	}
})