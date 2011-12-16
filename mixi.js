var GraphApi = function(params) {
	this.consumerKey = params.consumerKey;
	this.consumerSecret = params.consumerSecret;
	this.scope = params.scope;
	this.redirectUrl = params.redirectUrl || "http://mixi.jp/connect_authorize_success.html";
	this.expiresAt = (new Date(0)).getTime();
	this.accessToken = null;
	this.refreshToken = _loadRefreshToken(this.scope);
	this.autoAuthorize = isDefined(params.autoAuthorize) ? params.autoAuthorize : true;
	this.timeout = params.timeout || 30 * 1000;
	
	var self = this;
	
	this.authorize = function(config) {
		if (!self.isAuthorized()) {
			self.createAuthorizeWindow(config);
		} else {
			Ti.API.info(String.format("[mixi] already authorized. scope is '%s'", self.scope.join(" ")));
		}
	};
	
	this.logout = function(){
		_clearRefreshToken();
		self.expiresAt = (new Date(0)).getTime();
		self.accessToken = null;
		self.refreshToken = null;
	};
	
	this.isAuthorized = function(){
		return isDefined(self.refreshToken);
	};
	
	this.people = function(config) {
		config = mixin({
			userId: "@me",
			groupId: "@self"
		}, config, true);
		
		var url = String.format("people/%s/%s", config.userId, config.groupId);
		self.callApi("GET", url, config);
	};
	
	this.groups = function(config) {
		config = mixin({
			userId: "@me"
		}, config, true);
		
		var url = String.format("groups/%s", config.userId);
		self.callApi("GET", url, config);
	};
	
	this.searchPeople = function(config) {
		config = mixin({
			groupId: "@friends",
		}, config, true);
		
		var url = String.format("search/people/%s", config.groupId);
		self.callApi("GET", url, config);
	};
	
	this.updates = function(config) {
		config = mixin({
			userId: "@me",
			groupId: "@self",
			parameters: {}
		}, config, true);
		mixin(config.parameters, {device: "mobile"});
		
		var url = String.format("updates/%s/%s", config.userId, config.groupId);
		self.callApi("GET", url, config);
	};
	
	this.voiceStatusesUserTimeline = function(config) {
		var url = "voice/statuses/@me/user_timeline";
		self.callApi("GET", url, config);
	};
	
	this.voiceStatusesFriendTimeline = function(config) {
		config = mixin({groupId: ""}, config, true);
		var url = String.format("voice/statuses/friends_timeline/%s", config.groupId);
		self.callApi("GET", url, config);
	};
	
	this.voiceStatuses = function(config) {
		var url = String.format("voice/statuses/%s", config.postId);
		self.callApi("GET", url, config);
	};
	
	this.voiceReplies = function(config) {
		var url = String.format("voice/replies/%s", config.postId);
		self.callApi("GET", url, config);
	};
	
	this.voiceFavorites = function(config) {
		var url = String.format("voice/favorites/%s", config.postId);
		self.callApi("GET", url, config);
	};
	
	this.voiceStatusesUpdate = function(config) {
		var url = "voice/statuses";
		self.callApi("POST", url, config);
	};
	
	this.voiceStatusesDestroy = function(config) {
		var url = String.format("voice/statuses/%s", config.postId);
		self.callApi("DELETE", url, config);
	};
	
	this.voiceRepliesCreate = function(config) {
		var url = String.format("voice/replies/%s", config.postId);
		self.callApi("POST", url, config);
	};
	
	this.voiceRepliesDestroy = function(config) {
		var url = String.format("voice/replies/%s/%s", config.postId, config.commentId);
		self.callApi("DELETE", url, config);
	};
	
	this.voiceFavoritesCreate = function(config) {
		var url = String.format("voice/favorites/%s", config.postId);
		self.callApi("POST", url, config);
	};
	
	this.voiceFavoritesDestroy = function(config) {
		config = $.mixin({userId: "@me"}, config, true);
		var url = String.format("voice/favorites/%s/%s", config.postId, config.userId);
		self.callApi("DELETE", url, config);
	};
	
	this.share = function(config) {
		var url = "share";
		self.callApi("POST", url, mixin(config, {type: "json"}));
	};
	
	this.photoAlbums = function(config) {
		config = mixin({userId: "@me", albumId: ""}, config, true);
		var url = String.format("photo/albums/%s/@self/%s", config.userId, config.albumId);
		self.callApi("GET", url, config);
	};
	
	this.photoFriendAlbums = function(config) {
		config = mixin({userId: "@me", groupId: "@friends"}, config, true);
		var url = String.format("photo/albums/%s/%s", config.userId, config.groupId);
		self.callApi("GET", url, config)
	}
	
	this.photoMediaItems = function(config) {
		config = mixin({userId: "@me", albumId: "@default", mediaItemId: ""}, config, true);
		var url = String.format("photo/mediaItems/%s/@self/%s/%s",
			config.userId, config.albumId, config.mediaItemId);
		self.callApi("GET", url, config);
	};
	
	this.photoFriendMediaItems = function(config) {
		config = mixin({userId: "@me", groupId: "@friends"}, config, true);
		var url = String.format("photo/mediaItems/%s/%s", config.userId, config.groupId);
		self.callApi("GET", url, config);
	};
	
	this.photoAlbumComments = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("photo/comments/albums/%s/@self/%s",
			config.userId, config.albumId);
		self.callApi("GET", url, config);
	};
	
	this.photoMediaItemComments = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("photo/comments/mediaItems/%s/@self/%s/%s",
			config.userId, config.albumId, config.mediaItemId);
		self.callApi("GET", url, config);
	};
	
	this.photoMediaItemFavorites = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("photo/favorites/mediaItems/%s/@self/%s/%s",
			config.userId, config.albumId, config.mediaItemId);
		self.callApi("GET", url, config);
	};
	
	this.photoAlbumsCreate = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("photo/albums/%s/@self", config.userId);
		self.callApi("POST", url, config);
	};
	
	this.photoAlbumsDestroy = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("photo/albums/%s/@self/%s", config.userId, config.albumId);
		self.callApi("DELETE", url, config);
	};
	
	this.photoAlbumCommentsCreate = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("photo/comments/albums/%s/@self/%s",
			config.userId, config.albumId);
		self.callApi("POST", url, config);
	};
	
	this.photoAlbumCommentsDestroy = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("photo/comments/albums/%s/@self/%s/%s",
			config.userId, config.albumId, config.commentId);
		self.callApi("DELETE", url, config);
	};
	
	this.photoMediaItemsCreate = function(config) {
		config = mixin({userId: "@me", type: "image"}, config, true);
		var url = String.format("photo/mediaItems/%s/@self/%s",
			config.userId, config.albumId);
		self.callApi("POST", url, config);
	};
	
	this.photoMediaItemsDestroy = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("photo/mediaItems/%s/@self/%s/%s",
			config.userId, config.albumId, config.mediaItemId);
		self.callApi("DELETE", url, config);
	};
	
	this.photoMediaItemCommentsCreate = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("photo/comments/mediaItems/%s/@self/%s/%s",
			config.userId, config.albumId, config.mediaItemId);
		self.callApi("POST", url, config);
	};
	
	this.photoMediaItemCommentsDestroy = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("photo/comments/mediaItems/%s/@self/%s/%s/%s",
			config.userId, config.albumId, config.mediaItemId, config.commentId);
		self.callApi("DELETE", url, config);
	};
	
	this.photoMediaItemFavoritesCreate = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("photo/favorites/mediaItems/%s/@self/%s/%s",
			config.userId, config.albumId, config.mediaItemId);
		self.callApi("POST", url, config);
	};
	
	this.photoMediaItemFavoritesDestroy = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("photo/favorites/mediaItems/%s/@self/%s/%s/%s",
			config.userId, config.albumId, config.mediaItemId, config.favoriteUserId);
		self.callApi("DELETE", url, config);
	};
	
	this.messages = function(config) {
		config = mixin({userId: "@me", boxId: "@inbox", messageId: ""}, config, true);
		var url = String.format("messages/%s/%s/%s", config.userId, config.boxId, config.messageId);
		self.callApi("GET", url, config);
	}
	
	this.messagesSend = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("messages/%s/@self/@outbox", config.userId);
		self.callApi("POST", url, mixin(config, {type: "json"}));
	};
	
	this.messagesUpdate = function(config) {
		config = mixin({userId: "@me", boxId: "@inbox"}, config, true);
		var url = String.format("messages/%s/@self/%s/%s", config.userId, config.boxId, config.messageId);
		self.callApi("PUT", url, mixin(config, {type: "json"}));
	};
	
	this.messagesDestroy = function(config) {
		config = mixin({userId: "@me", boxId: "@inbox"}, config, true);
		var url = String.format("messages/%s/@self/%s/%s", config.userId, config.boxId, config.messageId);
		self.callApi("DELETE", url, config);
	};
	
	this.dialyCreate = function(config) {
		config = mixin({parameters: {}}, config, true);
		
		var photos = config.parameters.photos || [];
		delete config.parameters.photos;
		
		if (photos.length > 0) {
			config.parameters = {
				request: JSON.stringify(config.parameters)
			};
			
			for (var i = 0; i < (photos.length < 3 ? photos.length : 3); i++) {
				config.parameters[String.format("photo%d", i + 1)] = photos[i];
			}
		} else {
			config.type = "json";
		}
		
		var url = "diary/articles/@me/@self";
		self.callApi("POST", url, config);
	};
	
	this.spot = function(config) {
		var url = String.format("spots/%s", config.spotId);
		self.callApi("GET", url, config);
	};
	
	this.searchSpots = function(config) {
		config = mixin({
			accuracy: Ti.Geolocation.ACCURACY_BEST,
			parameters: {}
		}, config, true);
		
		if (!config.parameters.center) {
			return _getCurrentPosition(config, function(event){
				config.parameters.center = [event.coords.latitude, event.coords.longitude];
				self.searchSpots(config);
			});
		}
		
		var url = "search/spots";
		self.callApi("GET", url, config);
	};
	
	this.spots = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("spots/%s/@self", config.userId);
		self.callApi("GET", url, config);
	};
	
	this.spotsCreate = function(config) {
		config = mixin({
			accuracy: Ti.Geolocation.ACCURACY_BEST,
			userId: "@me",
			parameters: {}
		}, config, true);
		
		if (!config.parameters.location) {
			return _getCurrentPosition(config, function(event){
				config.parameters.location = {
					latitude: event.coords.latitude,
					longitude: event.coords.longitude
				};
				self.spotsCreate(config);
			});
		}
		
		var url = String.format("spots/%s/@self", config.userId);
		self.callApi("POST", url, mixin(config, {type: "json"}));
	};
	
	this.spotsDestroy = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("spots/%s/@self/%s", config.userId, config.spotId);
		self.callApi("DELETE", url, config);
	};
	
	this.checkins = function(config) {
		config = mixin({userId: "@me", groupId: "@self"}, config, true);
		var url = String.format("checkins/%s/%s", config.userId, config.groupId);
		self.callApi("GET", url, config);
	};
	
	this.checkin = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("checkins/%s/@self/%s", config.userId, config.checkinId);
		self.callApi("GET", url, config);
	};
	
	this.checkinsCreate = function(config) {
		config = mixin({parameters: {}}, config, true);
		
		var photo = config.parameters.photo;
		delete config.parameters.photo;
		
		if (isDefined(photo)) {
			config.parameters = {
				request: JSON.stringify(config.parameters),
				photo: photo
			};
		} else {
			config.type = "json";
		}
		
		var url = String.format("checkins/%s", config.spotId);
		self.callApi("POST", url, config);
	};
	
	this.checkinsDestroy = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("checkins/%s/@self/%s", config.userId, config.checkinId);
		self.callApi("DELETE", url, config);
	};
	
	this.checkinComments = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("checkins/comments/%s/@self/%s",
			config.userId, config.checkinId);
		self.callApi("GET", url, config);
	};
	
	this.checkinCommentsCreate = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("checkins/comments/%s/@self/%s",
			config.userId, config.checkinId);
		self.callApi("POST", url, mixin({type: "json"}, config));
	};
	
	this.checkinCommentsDestroy = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("checkins/comments/%s/@self/%s/%s",
			config.userId, config.checkinId, config.commentId);
		self.callApi("DELETE", url, config);
	};
	
	this.checkinFavorites = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("checkins/favorites/%s/@self/%s",
			config.userId, config.checkinId);
		self.callApi("GET", url, config);
	};
	
	this.checkinFavoritesCreate = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("checkins/favorites/%s/@self/%s",
			config.userId, config.checkinId);
		self.callApi("POST", url, mixin({type: "json"}, config));
	};
	
	this.checkinFavoritesDestroy = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("checkins/favorites/[User-ID]/@self/[Checkin-ID]/[Favorite-User-ID]",
			config.userId, config.checkinId, config.favoriteUserId);
		self.callApi("DELETE", url, config);
	};
	
	this.peopleImages = function(config) {
		config = mixin({userId: "@me", imageId: ""}, config, true);
		var url = String.format("people/images/%s/@self/%s", config.userId, config.imageId);
		self.callApi("GET", url, config);
	};
	
	this.peopleImagesCreate = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("people/images/%s/@self", config.userId);
		self.callApi("POST", url, mixin(config, {type: 'image'}));
	};
	
	this.peopleImagesUpdate = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("people/images/%s/@self/%s", config.userId, config.imageId);
		self.callApi("PUT", url, mixin(config, {type: "json"}));
	};
	
	this.peopleImagesDestroy = function(config) {
		config = mixin({userId: "@me"}, config, true);
		var url = String.format("people/images/%s/@self/%s", config.userId, config.imageId);
		self.callApi("DELETE", url, config);
	};
	
	this.callApi = function(method, url, config) {
		config = mixin({
			autoAuthorize: self.autoAuthorize,
			method: "GET",
		}, config || {}, true);
		
		if (isDefined(self.refreshToken)) {
			if (self.expiresAt < (new Date).getTime()) {
				_refreshAccessToken({
					success: function(){
						self.callApi(method, url, config);
					},
					error: function(){
						tryCall(config.error);
					}
				})
			} else {
				_callApi(method, url, config);
			}
		} else {
			if (config.autoAuthorize) {
				self.createAuthorizeWindow({
					success: function(){
						self.callApi(method, url, config);
					},
					error: function(){
						tryCall(config.error);
					}
				});
			} else {
				tryCall(config.error);
			}
		}
	};
	
	this.createAuthorizeWindow = function(config) {
		var win = Ti.UI.createWindow();
		
		var web = Ti.UI.createWebView({
			url: _addQueryString("https://mixi.jp/connect_authorize.pl", {
				client_id: self.consumerKey,
				response_type: "code",
				display: "smartphone",
				scope: self.scope.join(" ")
			})
		});
		
		web.addEventListener('load', function(e){
			if(!e.url.match(self.redirectUrl)) return;
			_getAccessToken({
				code: _gup(e.url, "code"),
				success: function(){
					win.close();
					tryCall(config.success);
				},
				error: function(){
					win.close();
					tryCall(config.error);
				}
			});
		});
		
		if (Ti.Platform.osname != "android") {
			var button = Ti.UI.createButton({
				systemButton: Ti.UI.iPhone.SystemButton.CANCEL
			});
			button.addEventListener('click', function(){
				win.close();
			});
			win.rightNavButton = button;
		}
		win.add(web);
		
		win.open({modal: true});
	};
	
	var _gup = function(url, name){
		var results = (new RegExp(String.format("[\\?&]%s=([^&#]*)", name))).exec(url);
		if (isDefined(results)) {
			return results[1];
		} else {
			return "";
		}
	};
	
	function _addQueryString(url, params) {
		params = params || {};
		
		var parameters = [];
		for (var name in params) {
			var value = (typeof params[name] == "object") ? params[name].toString() : params[name]
			
			parameters.push(String.format("%s=%s", name,Ti.Network.encodeURIComponent(value)));
		}
		
		if (parameters.length > 0) {
			url += "?" + parameters.join("&");
		}
		
		return url;
	};
	
	function _getToken(config) {
		var requestTime = (new Date).getTime();
		
		var xhr = Ti.Network.createHTTPClient();
		
		xhr.setTimeout(self.timeout);
		
		xhr.onload = function(){
			var response = JSON.parse(this.responseText);
			
			if (xhr.status != 200) {
				var error = _authenticateHeader(xhr);
				
				if (isDefined(response.error) && response.error == "invalid_grant" && config.autoAuthorize) {
					self.createAuthorizeWindow(config);
				} else {
					Ti.API.warn("[mixi] getting access token failed. " + error);
					tryCall(config.error, error);
				}
			}
			
			Ti.API.debug("[mixi] getting access token succeeded. " + this.responseText);
			
			self.accessToken = response.access_token;
			self.refreshToken = _saveRefreshToken(response.refresh_token, response.scope);
			self.expiresAt = requestTime + response.expires_in * 1000 * 0.9;  // 念のため再取得時間を短めに設定する
			
			tryCall(config.success);
		};
		
		xhr.onerror = function(event){
			Ti.API.error("[mixi] getting access token failed " + event);
			tryCall(config.error, event);
		};
		
		xhr.open("POST", "https://secure.mixi-platform.com/2/token");
		xhr.send(config.parameters);
	};
	
	function _refreshAccessToken(config) {
		_getToken(mixin({
			parameters: {
				grant_type: "refresh_token",
				client_id: self.consumerKey,
				client_secret: self.consumerSecret,
				refresh_token: self.refreshToken
			}
		}, config));
	};
	
	function _getAccessToken(config) {
		_getToken(mixin({
			parameters: {
				grant_type: "authorization_code",
				client_id: self.consumerKey,
				client_secret: self.consumerSecret,
				code: config.code,
				redirect_uri: self.redirectUrl
			}
		}, config));
	};
	
	function _saveRefreshToken(token, scope) {
		Ti.App.Properties.setString("mixiGraphApi:refreshToken", token);
		Ti.App.Properties.setString("mixiGraphApi:scope", scope);
		return token;
	};
	
	function _loadRefreshToken(scope) {
		var availableScope = Ti.App.Properties.getString("mixiGraphApi:scope", "").split(" ");
		
		if (scope.length != availableScope.length) return null;
		for (var i = 0; i < scope.length; i++) {
			if (availableScope.indexOf(scope[i]) < 0) return null;
		}
		
		return Ti.App.Properties.getString("mixiGraphApi:refreshToken", null);
	};
	
	function _clearRefreshToken() {
		Ti.App.Properties.removeProperty("mixiGraphApi:refreshToken");
		Ti.App.Properties.removeProperty("mixiGraphApi:scope");
		return null;
	};
	
	function _getCurrentPosition(config, callback) {
		if (!Ti.Geolocation.locationServicesEnabled) {
			Ti.API.warn("[mixi] your device has geo turned off.");
			tryCall(config.failure, {error: "Your device has geo turned off.", source: self});
			return;
		}
		
		if (Ti.Platform.osname != "android") {
			switch (Ti.Geolocation.locationServicesAuthorization) {
				case Ti.Geolocation.AUTHORIZATION_DENIED:
					Ti.API.warn("[mixi] you have disallowed Titanium from running geolocation services.");
					tryCall(config.failure, {error: "You have disallowed Titanium from running geolocation services.", source: self});
					return;
				case Ti.Geolocation.AUTHORIZATION_RESTRICTED:
					Ti.API.warn("[mixi] your system has disallowed Titanium from running geolocation services.");
					tryCall(config.failure, {error: "Your system has disallowed Titanium from running geolocation services.", source: self});
					return;
			}
		}
		
		Ti.Geolocation.accuracy = config.accuracy;
		Ti.Geolocation.getCurrentPosition(function(event){
			if (!event.success || event.error) {
				tryCall(config,failure, event);
				return;
			}
			
			Ti.API.debug(String.format("[mixi] getting current position succeeded. (%f, %f)",
				event.coords.latitude, event.coords.longitude));
			
			callback(event);
		});
	};
	
	function _callApi(method, url, config) {
		url = "http://api.mixi-platform.com/2/" + url;
		
		var xhr = Ti.Network.createHTTPClient();
		
		xhr.setTimeout(self.timeout);
		
		xhr.onload = function(){
			if (xhr.status != 200 && xhr.status != 201) {
				var error = _parseJSON(this.responseText);
				mixin(error, _authenticateHeader(xhr));
				Ti.API.warn(String.format("[mixi] calling api failed. (%s)", error));
				tryCall(config.error, error);
				return;
			};
			
			var response = _parseJSON(this.responseText);
			response.status = xhr.status;
			
			Ti.API.debug(String.format("[mixi] calling api succeeded. (%s)", response));
			tryCall(config.success, response);
		};
		
		xhr.onerror = function(e){
			Ti.API.error(String.format("[mixi] calling api failed. (%d - %s)", xhr.status, e));
			tryCall(config.error, e);
		};
		
		switch (config.type) {
			case "json":
				config.contentType = "application/json; charset=utf8";
				config.parameters = JSON.stringify(config.parameters);
				break;
			case "image":
				var image = config.parameters.image;
				delete config.parameters;
				
				url = _addQueryString(url, config.parameters);
				
				config.parameters = image;
				break;
		}
		
		if (method.match(/GET/i)) {
			url = _addQueryString(url, config.parameters);
		}
		
		xhr.open(method, url);
		
		if (config.contentType) {
			xhr.setRequestHeader("Content-Type", config.contentType);
		}
		xhr.setRequestHeader("Authorization", "OAuth " + self.accessToken);
		
		if (method.match(/GET/i)) {
			Ti.API.debug(String.format("[mixi] calling api (%s %s)", method, url));
			xhr.send();
		} else {
			Ti.API.debug(String.format("[mixi] calling api (%s %s %s)", method, url, isDefined(config.parameters) ? config.parameters : ""));
			xhr.send(config.parameters);
		}
	};
	
	function _authenticateHeader(xhr) {
		var options = {status: xhr.status};
		
		var content = xhr.getResponseHeader("WWW-Authenticate");
		if (isDefined(content)) {
			var parameters = content.replace("OAuth ", "").split(",");
			for (var i = 0; i < parameters.length; i++) {
				if (parameters[i].match(/(.+)="(.*)"/)) {
					options[RegExp.$1] = RegExp.$2;
				}
			}
		}
		
		return options;
	};
	
	function _parseJSON(string) {
		var json = null;
		try {
			json = JSON.parse(string);
		} catch(ex) {
			Ti.API.debug("[mixi] parsing JSON failed.");
			json = {};
		}
		return json;
	}
};


function isDefined(object) {
	return typeof object !== "undefined" && object != null;
}

function isFunction(proc) {
	return typeof proc === "function"
}

function tryCall(proc, args) {
	if (isFunction(proc)) proc(args);
}

function mixin(target, object, force) {
	if (!isDefined(object)) return target;
	
	for(var name in object) {
		var s = object[name];
		if(force || !(name in target)) {
			target[name] = s;
		}
	}
	return target;
}

GraphApi.version = "0.1.0";

exports.GraphApi = GraphApi;
