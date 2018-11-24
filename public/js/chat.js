var socket = io();

function scrollToBottom () {
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child');

  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();


  if(scrollTop + clientHeight + lastMessageHeight + newMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }

}
socket.on('connect', function ()  {
  var params = jQuery.deparam(window.location.search);


  socket.emit('join', params, function(err) {
    if (err){
      alert(err);
      window.location.href ='/'
    }else {

    }
  })

})

socket.on('disconnect', function ()  {
  console.log('disconnected from server');
})

socket.on('updateUserList', function (users) {
   var ol = jQuery('<ol></ol');

   users.forEach(function (user) {
     ol.append(jQuery('<li></li>').text(user));
   });

   jQuery('#users').html(ol);
})



socket.on('newMessage', function (m) {
  var formattedTime = moment(m.createdAt).format('h:mm a');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template, {
    text: m.text,
    from: m.from,
    createdAt: formattedTime
  });
  // console.log('message', m);
  // var li = jQuery('<li></li>');
  // li.text(`${m.from} ${formattedTime}: ${m.text}`);

  jQuery('#messages').append(html);
  scrollToBottom();
})

socket.on('newLocationMessage', function(m) {
  var formattedTime = moment(m.createdAt).format('h:mm a');
  var template = jQuery('#location-message-template').html();
  var html = Mustache.render(template, {
    text: m.text,
    from: m.from,
    createdAt: formattedTime
  });

  // var li = jQuery('<li></li>');
  // var a = jQuery('<a target="_blank">Current Location</a>');
  // li.text(`${m.from} ${formattedTime}: `);
  // a.attr('href', m.url);
  //
  // li.append(a);

  jQuery('#messages').append(html);
  scrollToBottom();

})





jQuery('#message-form').on('submit', function (e) {
  e.preventDefault();

  var messaageTextbox = jQuery('[name=message]')

  socket.emit('createMessage', {
    text: messaageTextbox.val()
  }, function() {
    messaageTextbox.val('');
  })

});


var sendLocation = jQuery('#send-location');
sendLocation.on('click', function () {
  if(!navigator.geolocation){
    alert('your browser does not support geolocation');
  }
   sendLocation.attr('disabled','disabed').text('sending location...')


  navigator.geolocation.getCurrentPosition(function (position) {
    sendLocation.removeAttr('disabled').text('send location');
    socket.emit('createLocationMessage', {
      lat: position.coords.latitude,
      long: position.coords.longitude
    });
  }, function () {
    sendLocation.removeAttr('disabled').text('send location');

    alert('unable to fetch location');
  });

  });
