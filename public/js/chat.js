const socket = io();

function scrollToBottom () {
    // Selectors
    const messages = jQuery(`#messages`);
    const newMessage = messages.children(`li:last-child`);

    // Heights
    const clientHeight = messages.prop(`clientHeight`);
    const scrollTop = messages.prop(`scrollTop`);
    const scrollHeight = messages.prop(`scrollHeight`);
    const newMessageHeight = newMessage.innerHeight();
    const lastMessage = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessage >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
};

socket.on('connect', function () {
    console.log(`Connected to server`);
    var params = jQuery.deparam(window.location.search);
    params.room = params.room.toLowerCase();

    socket.emit(`join`, params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log(`No Error`);
        }
    });
    
});

socket.on('disconnect', function () {
    console.log(`Disconnected from server`);
});

socket.on(`updateUserList`, function (users) {
    var ol = jQuery(`<ol></ol>`);

    users.forEach(function (user) {
        ol.append(jQuery(`<li></li>`).text(user));
    });

    jQuery(`#users`).html(ol);
});

socket.on('newMessage', function (message) {
    var formattedTime = moment(message.createdAt).format(`h:mm a`);
    var template = jQuery(`#message-template`).html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });

    jQuery(`#messages`).append(html);
    scrollToBottom();
});

socket.on('newLocationMessage', function (message) {
    var formattedTime = moment(message.createdAt).format(`h:mm a`);
    var template = jQuery(`#location-message-template`).html();
    var html = Mustache.render(template, {
        from: message.from,
        createdAt: formattedTime,
        url: message.url
    });

    jQuery(`#messages`).append(html);
    scrollToBottom();
});

jQuery(`#message-form`).on(`submit`, function (e) {
    e.preventDefault();

    const messageTextBox = jQuery(`[name=message]`);

    socket.emit(`createMessage`, {
        text: messageTextBox.val()
    }, function () {
        messageTextBox.val(``);
    });
});

const locationButton = jQuery(`#send-location`);
locationButton.on(`click`, function () {
    if (!navigator.geolocation) {
        return alert(`Geolocation not supported by this browser.`);
    }

    locationButton.attr(`disabled`, `disabled`).text(`Sending Location...`);

    navigator.geolocation.getCurrentPosition(function (position) {
        locationButton.removeAttr(`disabled`).text(`Send Location`);
        socket.emit(`createLocationMessage`, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
        
    }, function (err) {
        locationButton.removeAttr(`disabled`).text(`Send Location`);
        alert(`Unable to fetch location`);
    });
});