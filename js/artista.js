
//Globals

var LAST_FM_API_KEY = '5753fd182b9f37bf7156c811e8ee85cc';
var LAST_FM_API_URL = 'http://ws.audioscrobbler.com/2.0/';

//Variable

var $artistInput = $('#artista');
var $button = $('#boton');
var $resultOut = $('#content');

// Listener

$artistInput.on('keyup', onKeyUp);
$button.on('click', onSubmit);


// AJAX functions

function getArtist(artist, callback) {
  $.ajax({
    data: {
      api_key: LAST_FM_API_KEY,
      artist: artist,
      format: 'json',
      lang: 'es',
      method: 'artist.getinfo'  
    },
    url: LAST_FM_API_URL
  })
  .done(callback);
}

function getArtistAlbums(artist, callback) {
  $.ajax({
    data: {
      api_key: LAST_FM_API_KEY,
      artist: artist,
      format: 'json',
      method: 'artist.gettopalbums'  
    },
    url: LAST_FM_API_URL
  })
  .done(callback);
}

function getAlbumInfo(artist, album, callback) {
  $.ajax({
    data: {
      api_key: LAST_FM_API_KEY,
      artist: artist,
      album: album,
      format: 'json',
      method: 'album.getinfo'  
    },
    url: LAST_FM_API_URL
  })
  .done(callback);
}

function getTopArtistsForCountry(country, callback) {
  $.ajax({
    data: {
      api_key: LAST_FM_API_KEY,
      country: country,
      format: 'json',
      method: 'geo.gettopartists'  
    },
    url: LAST_FM_API_URL
  })
  .done(console.log(data));
}

function getTopArtistsForMyCountry(callback) {
  navigator.geolocation.getCurrentPosition( function(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    $.get('http://ws.geonames.org/countryCode', {
      type: 'json',
      lat: latitude,
      lng: longitude
    }, function(data) {
      getTopArtistsForCountry(data.countryName, callback);
    });
  });
}

// Template functions

function artistTemplate(artist) {
  var html = '';

  html += '<h2>' + artist.name + '</h2>';
  html += '<figure><img src="' + artist.image[artist.image.length - 1]['#text'] + '" alt=""><figcaption></figcaption></figure>';
  html += '<p class="bio">' + artist.bio.summary + '</p>';
  html += '<button class="btn btn-info get-albums">Discos</button>';

  return html;
}

function albumTemplate(album) {
  var html = '';

  html += '<div class="album album-onload" data-album="' + album.name + '" data-artist="' + album.artist.name + '">';
  html += '<figure>';
  html += '<h3>' + album.name + '</h3>';
  html += '<img src="' + album.image[album.image.length - 1]['#text'] + '" class="img-rounder">';
  html += '</figure>';
  html += '</div>';

  return html;
}

function albumListTemplate(albums) {
  var html = '';

  for (var i = 0; i < albums.topalbums.album.length; i++) {
    var album = albums.topalbums.album[i];
    html += albumTemplate(album);
  }

  return html;
}

function albumDetailTemplate(album) {
  var html = '';

  html += '<div class="album-detail album-detail-onload">';
  html += '<figure>';
  html += '<h3>' + album.name + '</h3>';
  html += '<h4>' + album.artist + '</h4>';
  html += '<img src="' + album.image[album.image.length - 2]['#text'] + '" class="img-rounder">';
  html += '</figure>';
  html += '<ol>';

  for (var i = 0; i < album.tracks.track.length; i++) {
    var track = album.tracks.track[i];
    html += albumTrackTemplate(track);
  }
  html += '</ol>';
  html += '</div>';

  return html;
}

function albumTrackTemplate(track) {
  var html = '';

  html += '<li>';
  html += '<a href=http://www.youtube.com/results?search_query=';
  html += (track.artist.name + ' ' + track.name).replace(new RegExp('\\s', 'g'), '+');
  html += '"target="_blank>' + track.name + '</a>';
  html += '</li>';

  return html;
}

function onSubmit() {
  getArtist($artistInput.val(), fillArtistInfo);
  $resultOut.html('<p class="loading">Cargando...</p>');
}

function onError() {
  $resultOut.html('<p class="error">Error... </p>');
}
 
function fillArtistInfo(jsonData) {
  if (jsonData.error) {
    return onError();
  }

  var html = artistTemplate(jsonData.artist);
  $resultOut.html(html);

  $('.get-albums').on('click', function() {
    getArtistAlbums(jsonData.artist.name, fillAlbumsInfo);
  });
}

function fillAlbumsInfo(jsonData) {
  if (jsonData.error) {
    return onError();
  }

  var html = albumListTemplate(jsonData);
  $resultOut.html(html);

  $('#content .album').removeClass('album-onload');

  $('.album').on('click', function() {
    var album = $(this).data('album');
    var artist = $(this).data('artist');

    getAlbumInfo(artist, album, fillAlbumDetailInfo);
  });
}

function fillAlbumDetailInfo(jsonData) {
  if (jsonData.error) {
    return onError();
  }

  var html = albumDetailTemplate(jsonData.album);
  $resultOut.html(html);
}

function onKeyUp(evt) {
  if(evt.keyCode == 13) { // Enter
    onSubmit();
  }
}